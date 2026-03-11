const usuarioRepository = require('../models/usuarioRepository');

const projecaoPublica = ({ id, nome, email, perfil, criadoEm }) => ({ id, nome, email, perfil, criadoEm });

/**
 * GET /usuarios/:id  — Detalhe de um usuário (requer auth)
 */
const buscarPorId = (req, res) => {
  const usuario = usuarioRepository.findById(req.params.id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
  res.json(projecaoPublica(usuario));
};

/**
 * GET /usuarios  — Lista todos os usuários (somente ADMIN)
 */
const listar = (req, res) => {
  const usuarios = usuarioRepository.findAll().map(projecaoPublica);
  res.json({ content: usuarios, totalElements: usuarios.length });
};

/**
 * POST /usuarios  — Cadastro de novo usuário (público)
 */
const cadastrar = (req, res) => {
  const { nome, email, senha, perfil } = req.body;

  if (usuarioRepository.existsByEmail(email)) {
    return res.status(409).json({ erro: 'E-mail já cadastrado' });
  }

  const salvo = usuarioRepository.create({ nome, email, senha, perfil });
  res.status(201).json(projecaoPublica(salvo));
};

/**
 * PUT /usuarios/:id  — Atualiza dados do próprio usuário (ou ADMIN)
 */
const atualizar = (req, res) => {
  const { id } = req.params;
  const { usuarioLogado } = req;

  // Só pode editar a si mesmo, a não ser que seja ADMIN
  if (usuarioLogado.id !== id && usuarioLogado.perfil !== 'ADMIN') {
    return res.status(403).json({ erro: 'Você não tem permissão para editar este usuário' });
  }

  const usuario = usuarioRepository.findById(id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const { nome, email, senha } = req.body;

  if (email && email !== usuario.email && usuarioRepository.existsByEmail(email, id)) {
    return res.status(409).json({ erro: 'E-mail já em uso por outro usuário' });
  }

  const atualizado = usuarioRepository.update(id, { nome, email, senha });
  res.json(projecaoPublica(atualizado));
};

module.exports = { buscarPorId, listar, cadastrar, atualizar };
