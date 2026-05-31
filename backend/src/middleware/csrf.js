const crypto = require('crypto');

// Generate a CSRF token (used once per session or per form)
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Middleware that checks the X-CSRF-Token header for state‑changing methods
function csrfProtection(request, reply, done) {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    const token = request.headers['x-csrf-token'];
    // In production you'd compare against a token stored in session or redis.
    // For now we accept any token if present; or you can skip if no token is provided.
    if (!token) {
      return reply.status(403).send({ error: 'CSRF token missing' });
    }
    // In a real implementation you'd verify the token here.
  }
  done();
}

module.exports = { generateToken, csrfProtection };
