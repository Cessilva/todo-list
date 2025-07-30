const User = require('../models/User');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwt');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, autorización denegada'
      });
    }

    // Verificar y decodificar el token
    const decoded = verifyToken(token);
    
    // Verificar que sea un token de acceso
    if (decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Tipo de token inválido'
      });
    }

    // Buscar el usuario
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    // Agregar usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    
    let message = 'Token no válido';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token malformado';
    }
    
    res.status(401).json({
      success: false,
      message
    });
  }
};

module.exports = auth;
