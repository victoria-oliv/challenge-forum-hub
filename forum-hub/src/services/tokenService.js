const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'forum_hub_secret_dev_2024';
const EXPIRATION = process.env.JWT_EXPIRATION || '2h';
const ISSUER = 'Forum Hub API';

/**
 * Gera um token JWT para o usuário autenticado
 */
const gerarToken = (usuario) => {
  return jwt.sign(
    {
      sub: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    },
    SECRET,
    {
      issuer: ISSUER,
      expiresIn: EXPIRATION
    }
  );
};

/**
 * Valida e decodifica um token JWT
 * @returns {object} payload decodificado
 * @throws {Error} se inválido ou expirado
 */
const verificarToken = (token) => {
  try {
    return jwt.verify(token, SECRET, { issuer: ISSUER });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new Error('Token JWT expirado');
    }
    throw new Error('Token JWT inválido ou expirado');
  }
};

/**
 * Extrai o token do header Authorization
 */
const extrairToken = (req) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const [tipo, token] = authHeader.split(' ');
  if (tipo !== 'Bearer' || !token) return null;
  return token;
};

module.exports = { gerarToken, verificarToken, extrairToken };
