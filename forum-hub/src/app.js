require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const router = require('./routes/index');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// ── Middlewares globais ───────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Logger ────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ── Documentação Swagger ──────────────────────────────────────
const swaggerOptions = {
  customSiteTitle: 'Forum Hub API Docs',
  customCss: `
    .topbar { background: linear-gradient(135deg, #0f3460, #16213e); }
    .topbar-wrapper img { display: none; }
    .topbar-wrapper::before { content: '🗣️ Forum Hub API'; color: white; font-size: 1.4rem; font-weight: bold; }
    .swagger-ui .info h2 { color: #0f3460; }
    .swagger-ui .scheme-container { background: #f8f9ff; }
  `
};
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));
app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      docs: '/docs',
      login: 'POST /login',
      topicos: '/topicos'
    }
  });
});

// ── Rotas da API ──────────────────────────────────────────────
app.use('/', router);

// ── Tratamento de erros ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
