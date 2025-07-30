const { body } = require('express-validator');

// Validaciones para crear todo
const createTodoValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('El título es requerido')
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('La prioridad debe ser: low, medium o high'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601')
    .custom((value) => {
      if (value && new Date(value) < new Date()) {
        throw new Error('La fecha de vencimiento no puede ser en el pasado');
      }
      return true;
    }),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('No se pueden agregar más de 10 tags');
      }
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.length > 30)) {
        throw new Error('Cada tag debe ser una cadena de máximo 30 caracteres');
      }
      return true;
    })
];

// Validaciones para actualizar todo
const updateTodoValidation = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('El título no puede estar vacío')
    .isLength({ min: 1, max: 100 })
    .withMessage('El título debe tener entre 1 y 100 caracteres'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La descripción no puede exceder 500 caracteres'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('El campo completed debe ser un booleano'),

  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('La prioridad debe ser: low, medium o high'),

  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null || value === '') {
        return true; // Permitir null o string vacío para remover fecha
      }
      if (!Date.parse(value)) {
        throw new Error('La fecha debe estar en formato válido');
      }
      return true;
    }),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La categoría no puede exceder 50 caracteres'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Los tags deben ser un array')
    .custom((tags) => {
      if (tags && tags.length > 10) {
        throw new Error('No se pueden agregar más de 10 tags');
      }
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.length > 30)) {
        throw new Error('Cada tag debe ser una cadena de máximo 30 caracteres');
      }
      return true;
    })
];

// Validación para agregar comentario
const addCommentValidation = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('El texto del comentario es requerido')
    .isLength({ min: 1, max: 500 })
    .withMessage('El comentario debe tener entre 1 y 500 caracteres')
];

module.exports = {
  createTodoValidator: createTodoValidation,
  updateTodoValidator: updateTodoValidation,
  addCommentValidator: addCommentValidation
};
