const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorMiddleware = require('./middleware/error');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — in dev, accept any localhost/127.0.0.1 origin so swapping ports
// (5173 → 5174 fallback) or hostnames doesn't break the app. In production
// pin it to the explicit CLIENT_URL.
const isProd = process.env.NODE_ENV === 'production';
const clientUrl = process.env.CLIENT_URL;
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);                 // curl, server-to-server
    if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    if (!clientUrl) return cb(null, true);              // same-origin single service mode
    if (origin === clientUrl) return cb(null, true);
    return cb(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'workpulse-api', time: new Date().toISOString() });
});

app.use('/api', routes);

// Serve frontend static files in production if they are built
if (isProd) {
  const fs = require('fs');
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      // Direct non-API / non-upload routes to React Router index.html
      if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
      } else {
        next();
      }
    });
  }
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;
