const { validationResult } = require('express-validator');
const Todo = require('../models/Todo');

// @desc    Crear un nuevo TODO
// @route   POST /api/todos
// @access  Private
const createTodo = async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { title, description, priority, dueDate } = req.body;

    // Crear nuevo TODO
    const todo = new Todo({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      user: req.user.id
    });

    await todo.save();

    res.status(201).json({
      success: true,
      message: 'TODO creado exitosamente',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener todos los TODOs del usuario
// @route   GET /api/todos
// @access  Private
const getTodos = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;

    // Construir filtros
    const filters = { user: req.user.id };
    
    if (status) {
      filters.status = status;
    }
    
    if (priority) {
      filters.priority = priority;
    }

    // Calcular paginación
    const skip = (page - 1) * limit;

    // Obtener TODOs con paginación
    const todos = await Todo.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Contar total de documentos
    const total = await Todo.countDocuments(filters);

    res.status(200).json({
      success: true,
      message: 'TODOs obtenidos exitosamente',
      data: {
        todos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un TODO
// @route   PUT /api/todos/:id
// @access  Private
const updateTodo = async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    // Buscar TODO
    const todo = await Todo.findOne({ _id: id, user: req.user.id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'TODO no encontrado'
      });
    }

    // Actualizar campos
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (status !== undefined) todo.status = status;
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

    // Si se marca como completado, agregar fecha de completado
    if (status === 'completed' && todo.status !== 'completed') {
      todo.completedAt = new Date();
    }

    await todo.save();

    res.status(200).json({
      success: true,
      message: 'TODO actualizado exitosamente',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un TODO
// @route   DELETE /api/todos/:id
// @access  Private
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Buscar y eliminar TODO
    const todo = await Todo.findOneAndDelete({ _id: id, user: req.user.id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'TODO no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'TODO eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Agregar comentario a un TODO
// @route   POST /api/todos/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { text } = req.body;

    // Buscar TODO
    const todo = await Todo.findOne({ _id: id, user: req.user.id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'TODO no encontrado'
      });
    }

    // Agregar comentario
    const comment = {
      text,
      createdAt: new Date()
    };

    todo.comments.push(comment);
    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Editar comentario de un TODO
// @route   PUT /api/todos/:id/comments/:commentId
// @access  Private
const editComment = async (req, res, next) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id, commentId } = req.params;
    const { text } = req.body;

    // Buscar TODO
    const todo = await Todo.findOne({ _id: id, user: req.user.id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'TODO no encontrado'
      });
    }

    // Buscar comentario
    const comment = todo.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Actualizar comentario
    comment.text = text;
    comment.updatedAt = new Date();

    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar comentario de un TODO
// @route   DELETE /api/todos/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const { id, commentId } = req.params;

    // Buscar TODO
    const todo = await Todo.findOne({ _id: id, user: req.user.id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'TODO no encontrado'
      });
    }

    // Buscar comentario
    const comment = todo.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Eliminar comentario
    todo.comments.pull(commentId);
    await todo.save();

    res.status(200).json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      data: todo
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
  addComment,
  editComment,
  deleteComment
};
