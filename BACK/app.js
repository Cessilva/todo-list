require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

// Conectar a la base de datos
connectDB();

// Configurar CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Rutas principales
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Todo List - Servidor funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      todos: '/api/todos'
    }
  });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

// Middleware para rutas no encontradas
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Configurar el puerto
const PORT = process.env.PORT || 5000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log('Error no manejado:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('Excepción no capturada:', err.message);
  process.exit(1);
});
