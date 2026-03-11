const bcrypt = require('bcryptjs');
const usuarioRepository = require('../models/usuarioRepository');
const { gerarToken } = require('../services/tokenService');

/**
 * POST /login
 * Autentica o usuário e retorna token JWT
 */
const login = (req, res) => {
  const { email, senha } = req.body;

  const usuario = usuarioRepository.findByEmail(email);

  if (!usuario || !usuario.ativo) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const senhaValida = bcrypt.compareSync(senha, usuario.senha);
  if (!senhaValida) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }

  const token = gerarToken(usuario);

  res.json({
    token,
    tipo: 'Bearer',
    expiresIn: process.env.JWT_EXPIRATION || '2h',
    usuario: {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    }
  });
};

module.exports = { login };
