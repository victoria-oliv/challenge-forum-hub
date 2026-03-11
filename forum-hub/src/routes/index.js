const { Router } = require('express');
const { autenticar, autorizar } = require('../middlewares/auth');
const { checarErros } = require('../middlewares/errorHandler');
const v = require('../middlewares/validacoes');

const authController = require('../controllers/authController');
const usuarioController = require('../controllers/usuarioController');
const cursoController = require('../controllers/cursoController');
const topicoController = require('../controllers/topicoController');
const respostaController = require('../controllers/respostaController');

const router = Router();

// ─────────────────────────────────────────────────────────────
// 🔓  AUTENTICAÇÃO (público)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autentica usuário e retorna token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Token JWT gerado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', v.validarLogin, checarErros, authController.login);

// ─────────────────────────────────────────────────────────────
// 👤  USUÁRIOS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Cadastra novo usuário (público)
 *     tags: [Usuários]
 */
router.post('/usuarios', v.validarCadastroUsuario, checarErros, usuarioController.cadastrar);

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários (somente ADMIN)
 *     tags: [Usuários]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/usuarios', autenticar, autorizar('ADMIN'), usuarioController.listar);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Detalhe de um usuário
 *     tags: [Usuários]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/usuarios/:id', autenticar, usuarioController.buscarPorId);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Atualiza dados do usuário (próprio ou ADMIN)
 *     tags: [Usuários]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/usuarios/:id', autenticar, v.validarAtualizacaoUsuario, checarErros, usuarioController.atualizar);

// ─────────────────────────────────────────────────────────────
// 📚  CURSOS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /cursos:
 *   get:
 *     summary: Lista todos os cursos
 *     tags: [Cursos]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/cursos', autenticar, cursoController.listar);

/**
 * @swagger
 * /cursos/{id}:
 *   get:
 *     summary: Detalhe de um curso
 *     tags: [Cursos]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/cursos/:id', autenticar, cursoController.buscarPorId);

/**
 * @swagger
 * /cursos:
 *   post:
 *     summary: Cria novo curso (somente ADMIN)
 *     tags: [Cursos]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/cursos', autenticar, autorizar('ADMIN'), v.validarCurso, checarErros, cursoController.criar);

// ─────────────────────────────────────────────────────────────
// 💬  TÓPICOS  (core do challenge)
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /topicos:
 *   get:
 *     summary: Lista todos os tópicos ativos (paginado, com filtros)
 *     tags: [Tópicos]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: size
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: cursoId
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ABERTO, RESPONDIDO, FECHADO, NAO_RESPONDIDO] }
 *     responses:
 *       200:
 *         description: Lista paginada de tópicos
 */
router.get('/topicos', autenticar, topicoController.listar);

/**
 * @swagger
 * /topicos/{id}:
 *   get:
 *     summary: Detalha um tópico com suas respostas
 *     tags: [Tópicos]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/topicos/:id', autenticar, topicoController.buscarPorId);

/**
 * @swagger
 * /topicos:
 *   post:
 *     summary: Cria novo tópico
 *     tags: [Tópicos]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CadastroTopico'
 *     responses:
 *       201:
 *         description: Tópico criado com sucesso
 *       409:
 *         description: Tópico duplicado (mesmo título e mensagem)
 */
router.post('/topicos', autenticar, v.validarCadastroTopico, checarErros, topicoController.criar);

/**
 * @swagger
 * /topicos/{id}:
 *   put:
 *     summary: Atualiza tópico (somente autor ou ADMIN)
 *     tags: [Tópicos]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/topicos/:id', autenticar, v.validarAtualizacaoTopico, checarErros, topicoController.atualizar);

/**
 * @swagger
 * /topicos/{id}:
 *   delete:
 *     summary: Exclui tópico (somente autor ou ADMIN)
 *     tags: [Tópicos]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204:
 *         description: Tópico excluído com sucesso
 */
router.delete('/topicos/:id', autenticar, topicoController.excluir);

// ─────────────────────────────────────────────────────────────
// 💡  RESPOSTAS
// ─────────────────────────────────────────────────────────────

/**
 * @swagger
 * /respostas:
 *   post:
 *     summary: Cria nova resposta a um tópico
 *     tags: [Respostas]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/respostas', autenticar, v.validarResposta, checarErros, respostaController.criar);

/**
 * @swagger
 * /respostas/topicos/{topicoId}:
 *   get:
 *     summary: Lista respostas de um tópico
 *     tags: [Respostas]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/respostas/topicos/:topicoId', autenticar, respostaController.listarPorTopico);

/**
 * @swagger
 * /respostas/usuarios/{usuarioId}:
 *   get:
 *     summary: Lista respostas de um usuário específico
 *     tags: [Respostas]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/respostas/usuarios/:usuarioId', autenticar, respostaController.listarPorUsuario);

/**
 * @swagger
 * /respostas/{id}:
 *   put:
 *     summary: Atualiza resposta (somente autor ou ADMIN)
 *     tags: [Respostas]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/respostas/:id', autenticar, v.validarAtualizacaoResposta, checarErros, respostaController.atualizar);

/**
 * @swagger
 * /respostas/{id}/solucao:
 *   put:
 *     summary: Marca resposta como solução e fecha o tópico
 *     tags: [Respostas]
 *     security: [{ bearerAuth: [] }]
 */
router.put('/respostas/:id/solucao', autenticar, respostaController.marcarSolucao);

/**
 * @swagger
 * /respostas/{id}:
 *   delete:
 *     summary: Exclui resposta (somente autor ou ADMIN)
 *     tags: [Respostas]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/respostas/:id', autenticar, respostaController.excluir);

module.exports = router;
