const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'workpulse-insecure-dev-secret';
if (!process.env.JWT_SECRET) {
  console.warn('[auth] JWT_SECRET is not set. Using a development fallback secret. Set JWT_SECRET in backend/.env for production.');
}

function getJwtSecret() {
  return JWT_SECRET;
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

module.exports = { signToken, getJwtSecret };
