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

    const { title, description, priority, dueDate, parentId } = req.body;

    // Crear nuevo TODO
    const todo = new Todo({
      title,
      description,
      priority: priority || 'medium',
      dueDate,
      parentId: parentId || null,
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

    // Construir filtros base
    const filters = { user: req.user.id };
    
    if (status) {
      // Convertir status string a completed boolean para el filtro
      filters.completed = status === 'completed';
    }
    
    if (priority) {
      filters.priority = priority;
    }

    // Obtener TODOS los TODOs del usuario (sin paginación para construir jerarquía)
    const allTodos = await Todo.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    // Separar tareas principales y subtareas
    const mainTasks = allTodos.filter(todo => !todo.parentId);
    const subtasks = allTodos.filter(todo => todo.parentId);

    // Construir jerarquía: agregar subtareas a sus tareas padre
    const todosWithSubtasks = mainTasks.map(mainTask => {
      const taskSubtasks = subtasks.filter(subtask => 
        subtask.parentId && subtask.parentId.toString() === mainTask._id.toString()
      );
      
      return {
        ...mainTask.toObject(),
        subtasks: taskSubtasks
      };
    });

    // Aplicar filtros a las tareas con jerarquía
    let filteredTodos = todosWithSubtasks;
    
    if (status) {
      filteredTodos = filteredTodos.filter(todo => 
        todo.completed === (status === 'completed')
      );
    }
    
    if (priority) {
      filteredTodos = filteredTodos.filter(todo => todo.priority === priority);
    }

    // Aplicar paginación a las tareas filtradas
    const skip = (page - 1) * limit;
    const paginatedTodos = filteredTodos.slice(skip, skip + parseInt(limit));

    // Contar total de tareas principales (para paginación)
    const total = filteredTodos.length;

    res.status(200).json({
      success: true,
      message: 'TODOs obtenidos exitosamente',
      data: {
        todos: paginatedTodos,
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

    // Validaciones especiales para cambios de estado
    if (status !== undefined) {
      const newCompleted = status === 'completed';
      
      // Si es una subtarea y se intenta desmarcar
      if (todo.parentId && !newCompleted && todo.completed) {
        // Verificar si la tarea padre está completada
        const parentTask = await Todo.findOne({ _id: todo.parentId, user: req.user.id });
        if (parentTask && parentTask.completed) {
          return res.status(400).json({
            success: false,
            message: 'No puedes desmarcar una subtarea mientras la tarea principal esté completada. Primero desmarca la tarea principal.'
          });
        }
      }
      
      // Si es una tarea principal y se intenta marcar como completada
      if (!todo.parentId && newCompleted && !todo.completed) {
        // Verificar que todas las subtareas estén completadas
        const pendingSubtasks = await Todo.find({ 
          parentId: id, 
          user: req.user.id, 
          completed: false 
        });
        
        if (pendingSubtasks.length > 0) {
          return res.status(400).json({
            success: false,
            message: `No puedes completar esta tarea. Tiene ${pendingSubtasks.length} subtarea${pendingSubtasks.length > 1 ? 's' : ''} pendiente${pendingSubtasks.length > 1 ? 's' : ''}. Completa todas las subtareas primero.`
          });
        }
      }
    }

    // Actualizar campos
    if (title !== undefined) todo.title = title;
    if (description !== undefined) todo.description = description;
    if (status !== undefined) {
      // Convertir status string a completed boolean
      todo.completed = status === 'completed';
    }
    if (priority !== undefined) todo.priority = priority;
    if (dueDate !== undefined) todo.dueDate = dueDate;

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

    // Buscar TODO
    const todo = await Todo.findOne({ _id: id, user: req.user.id });
    
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: 'TODO no encontrado'
      });
    }

    // Si es una tarea principal, eliminar también todas sus subtareas
    if (!todo.parentId) {
      await Todo.deleteMany({ parentId: id, user: req.user.id });
    }

    // Eliminar la tarea principal o subtarea
    await Todo.findOneAndDelete({ _id: id, user: req.user.id });

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
