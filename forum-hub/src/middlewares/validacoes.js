const { body } = require('express-validator');
const { CATEGORIAS } = require('../models/cursoRepository');
const { STATUS } = require('../models/topicoRepository');

// ── Autenticação ───────────────────────────────────────────────
const validarLogin = [
  body('email').isEmail().withMessage('E-mail inválido'),
  body('senha').notEmpty().withMessage('Senha é obrigatória')
];

// ── Usuários ───────────────────────────────────────────────────
const validarCadastroUsuario = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('senha')
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Senha deve conter ao menos uma letra maiúscula')
    .matches(/[0-9]/).withMessage('Senha deve conter ao menos um número'),
  body('perfil')
    .optional()
    .isIn(['ADMIN', 'USUARIO']).withMessage('Perfil deve ser ADMIN ou USUARIO')
];

const validarAtualizacaoUsuario = [
  body('nome').optional().notEmpty().withMessage('Nome não pode ser vazio'),
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('senha')
    .optional()
    .isLength({ min: 8 }).withMessage('Senha deve ter no mínimo 8 caracteres')
];

// ── Cursos ─────────────────────────────────────────────────────
const validarCurso = [
  body('nome').notEmpty().withMessage('Nome do curso é obrigatório'),
  body('categoria')
    .notEmpty().withMessage('Categoria é obrigatória')
    .custom(v => CATEGORIAS.includes(v?.toUpperCase()))
    .withMessage(`Categoria deve ser: ${CATEGORIAS.join(', ')}`)
];

// ── Tópicos ────────────────────────────────────────────────────
const validarCadastroTopico = [
  body('titulo').notEmpty().withMessage('Título é obrigatório'),
  body('mensagem').notEmpty().withMessage('Mensagem é obrigatória'),
  body('cursoId').notEmpty().withMessage('ID do curso é obrigatório')
];

const validarAtualizacaoTopico = [
  body('titulo').optional().notEmpty().withMessage('Título não pode ser vazio'),
  body('mensagem').optional().notEmpty().withMessage('Mensagem não pode ser vazia'),
  body('status')
    .optional()
    .custom(v => STATUS.includes(v?.toUpperCase()))
    .withMessage(`Status deve ser: ${STATUS.join(', ')}`)
];

// ── Respostas ──────────────────────────────────────────────────
const validarResposta = [
  body('mensagem').notEmpty().withMessage('Mensagem da resposta é obrigatória'),
  body('topicoId').notEmpty().withMessage('ID do tópico é obrigatório')
];

const validarAtualizacaoResposta = [
  body('mensagem').optional().notEmpty().withMessage('Mensagem não pode ser vazia')
];

module.exports = {
  validarLogin,
  validarCadastroUsuario,
  validarAtualizacaoUsuario,
  validarCurso,
  validarCadastroTopico,
  validarAtualizacaoTopico,
  validarResposta,
  validarAtualizacaoResposta
};
