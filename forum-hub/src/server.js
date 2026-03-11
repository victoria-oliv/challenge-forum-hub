const app = require('./app');

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║         🗣️   FORUM HUB API   🗣️                  ║
╠══════════════════════════════════════════════════╣
║  Servidor   → http://localhost:${PORT}              ║
║  Docs       → http://localhost:${PORT}/docs         ║
║  Health     → http://localhost:${PORT}/health       ║
╠══════════════════════════════════════════════════╣
║  👤  admin@forumhub.com   / Forum@123            ║
║  👤  estudante@forumhub.com / password           ║
╚══════════════════════════════════════════════════╝
  `);
});
