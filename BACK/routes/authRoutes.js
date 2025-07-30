const express = require('express');
const router = express.Router();

// Importar controladores
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  verifyToken,
  refreshToken
} = require('../controllers/authController');

// Importar middleware de autenticación
const { protect } = require('../middleware/auth');

// Importar validaciones
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../validators/authValidators');

// @route   POST /api/auth/register
// @desc    Registrar nuevo usuario
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Iniciar sesión
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/auth/profile
// @desc    Obtener perfil del usuario autenticado
// @access  Private
router.get('/profile', protect, getProfile);

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', protect, updateProfileValidation, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Cambiar contraseña del usuario
// @access  Private
router.put('/change-password', protect, changePasswordValidation, changePassword);

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/verify
// @desc    Verificar token de autenticación
// @access  Private
router.get('/verify', protect, verifyToken);

// @route   POST /api/auth/refresh
// @desc    Renovar token de acceso
// @access  Public
router.post('/refresh', refreshToken);

module.exports = router;
