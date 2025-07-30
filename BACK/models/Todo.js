const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [100, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'La categoría no puede exceder 50 caracteres'],
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Cada tag no puede exceder 30 caracteres']
  }],
  comments: [commentSchema],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Todo',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
todoSchema.index({ user: 1, completed: 1 });
todoSchema.index({ user: 1, createdAt: -1 });
todoSchema.index({ user: 1, dueDate: 1 });

// Middleware para actualizar completedAt cuando se marca como completado
todoSchema.pre('save', function(next) {
  if (this.isModified('completed')) {
    if (this.completed) {
      this.completedAt = new Date();
    } else {
      this.completedAt = null;
    }
  }
  next();
});

// Método para agregar comentario
todoSchema.methods.addComment = function(commentText) {
  this.comments.push({ text: commentText });
  return this.save();
};

// Método virtual para obtener el número de comentarios
todoSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Asegurar que los virtuals se incluyan en JSON
todoSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Todo', todoSchema);
