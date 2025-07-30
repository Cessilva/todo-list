const jwt = require('jsonwebtoken');

// Generar JWT
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Verificar JWT
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generar token de acceso
const generateAccessToken = (userId) => {
  return generateToken({ 
    id: userId,
    type: 'access'
  });
};

// Generar token de refresh
const generateRefreshToken = (userId) => {
  return generateToken({ 
    id: userId,
    type: 'refresh'
  });
};

// Extraer token del header Authorization
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
  generateRefreshToken,
  extractTokenFromHeader
};
