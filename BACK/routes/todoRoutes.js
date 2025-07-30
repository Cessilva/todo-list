const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  addComment
} = require('../controllers/todoController');
const {
  createTodoValidator,
  updateTodoValidator,
  addCommentValidator
} = require('../validators/todoValidators');

// @route   POST /api/todos
// @desc    Crear un nuevo TODO
// @access  Private
router.post('/', protect, createTodoValidator, createTodo);

// @route   GET /api/todos
// @desc    Obtener todos los TODOs del usuario
// @access  Private
router.get('/', protect, getTodos);

// @route   PUT /api/todos/:id
// @desc    Actualizar un TODO
// @access  Private
router.put('/:id', protect, updateTodoValidator, updateTodo);

// @route   DELETE /api/todos/:id
// @desc    Eliminar un TODO
// @access  Private
router.delete('/:id', protect, deleteTodo);

// @route   POST /api/todos/:id/comments
// @desc    Agregar comentario a un TODO
// @access  Private
router.post('/:id/comments', protect, addCommentValidator, addComment);

module.exports = router;
