const { validationResult } = require('express-validator');

/**
 * Middleware: verifica erros de validação do express-validator
 */
const checarErros = (req, res, next) => {
  const erros = validationResult(req);
  if (!erros.isEmpty()) {
    return res.status(400).json({
      erro: 'Dados inválidos',
      campos: erros.array().map(e => ({ campo: e.path, mensagem: e.msg }))
    });
  }
  next();
};

/**
 * Handler global de erros
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERRO:`, err.stack || err.message);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }

  res.status(500).json({
    erro: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { detalhe: err.message })
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    erro: `Rota não encontrada: ${req.method} ${req.path}`,
    dica: 'Consulte a documentação em /docs'
  });
};

module.exports = { checarErros, errorHandler, notFound };
