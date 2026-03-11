const { verificarToken, extrairToken } = require('../services/tokenService');
const usuarioRepository = require('../models/usuarioRepository');

/**
 * Middleware de autenticação via JWT.
 * Injeta req.usuarioLogado com os dados do token.
 */
const autenticar = (req, res, next) => {
  const token = extrairToken(req);

  if (!token) {
    return res.status(401).json({
      erro: 'Token JWT não fornecido',
      dica: 'Inclua o header: Authorization: Bearer <token>'
    });
  }

  try {
    const payload = verificarToken(token);
    req.usuarioLogado = {
      id: payload.sub,
      nome: payload.nome,
      email: payload.email,
      perfil: payload.perfil
    };
    next();
  } catch (err) {
    return res.status(401).json({ erro: err.message });
  }
};

/**
 * Middleware de autorização por perfil (ADMIN, USUARIO)
 */
const autorizar = (...perfisPermitidos) => (req, res, next) => {
  if (!req.usuarioLogado) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }
  if (!perfisPermitidos.includes(req.usuarioLogado.perfil)) {
    return res.status(403).json({
      erro: 'Acesso negado: permissão insuficiente',
      perfilNecessario: perfisPermitidos
    });
  }
  next();
};

module.exports = { autenticar, autorizar };
