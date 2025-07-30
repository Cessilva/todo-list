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
  verifyToken
} = require('../controllers/authController');

// Importar middleware de autenticación
const auth = require('../middleware/auth');

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
router.get('/profile', auth, getProfile);

// @route   PUT /api/auth/profile
// @desc    Actualizar perfil del usuario
// @access  Private
router.put('/profile', auth, updateProfileValidation, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Cambiar contraseña del usuario
// @access  Private
router.put('/change-password', auth, changePasswordValidation, changePassword);

// @route   POST /api/auth/logout
// @desc    Cerrar sesión
// @access  Private
router.post('/logout', auth, logout);

// @route   GET /api/auth/verify
// @desc    Verificar token de autenticación
// @access  Private
router.get('/verify', auth, verifyToken);

module.exports = router;
