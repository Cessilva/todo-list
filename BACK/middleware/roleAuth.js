// Middleware para verificar roles de usuario
const checkRole = (requiredRole) => {
  return (req, res, next) => {
    try {
      // Verificar que el usuario esté autenticado (debe pasar por el middleware auth primero)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que el usuario tenga el rol requerido
      if (req.user.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Acceso denegado. Se requiere rol de ${requiredRole}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error en la verificación de roles'
      });
    }
  };
};

// Middleware específico para administradores
const requireAdmin = checkRole('admin');

// Middleware específico para usuarios
const requireUser = checkRole('user');

// Middleware para verificar que el usuario sea admin o el propietario del recurso
const requireAdminOrOwner = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    // Si es admin, permitir acceso
    if (req.user.role === 'admin') {
      return next();
    }

    // Si no es admin, verificar que sea el propietario del recurso
    // El ID del propietario debe estar en req.params.userId o req.body.userId
    const resourceUserId = req.params.userId || req.body.userId || req.params.id;
    
    if (req.user.id !== resourceUserId) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado. Solo puedes acceder a tus propios recursos'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en la verificación de permisos'
    });
  }
};

module.exports = {
  checkRole,
  requireAdmin,
  requireUser,
  requireAdminOrOwner
};
