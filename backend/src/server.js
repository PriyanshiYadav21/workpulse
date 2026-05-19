require('dotenv').config();
const app = require('./app');
const { initDatabase } = require('./db/init');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initDatabase();
    const server = app.listen(PORT, () => {
      console.log(`[server] WorkPulse API listening on http://localhost:${PORT}`);
      console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[server] Port ${PORT} is already in use. Change PORT in backend/.env or stop the occupying process.`);
      } else {
        console.error('[server] Error starting server:', err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error('[server] Startup failed:', err);
    process.exit(1);
  }
})();
