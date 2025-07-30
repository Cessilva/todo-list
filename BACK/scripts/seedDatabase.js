const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

// Importar los modelos directamente
const User = require('../models/User');
const Todo = require('../models/Todo');

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Verificar si ya existen usuarios
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('⚠️ Ya existen usuarios en la base de datos');
      console.log('Ejecuta primero el script de limpieza: npm run clean-db');
      return;
    }

    // Crear usuarios de prueba
    const users = [
      {
        name: 'Cecilia Silva Sandoval',
        email: 'admin@todolist.com',
        password: 'password123',
        role: 'admin'
      },
      {
        name: 'Pedro Páramo',
        email: 'user@todolist.com',
        password: 'password123',
        role: 'user'
      }
    ];

    console.log('👥 Creando usuarios de prueba...');
    const createdUsers = [];
    
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
    }
    
    console.log(`✅ ${createdUsers.length} usuarios creados exitosamente`);

    // Crear TODOs de ejemplo para cada usuario
    const todos = [
      // TODOs para Cecilia (admin)
      {
        title: 'Revisar reportes mensuales',
        description: 'Analizar los reportes de ventas y productividad del mes anterior',
        priority: 'high',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
        user: createdUsers[0]._id
      },
      {
        title: 'Reunión con el equipo',
        description: 'Planificar las actividades de la próxima semana',
        priority: 'medium',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día
        user: createdUsers[0]._id
      },
      {
        title: 'Actualizar documentación',
        description: 'Revisar y actualizar la documentación del proyecto',
        priority: 'low',
        completed: true,
        user: createdUsers[0]._id
      },
      
      // TODOs para Pedro (user)
      {
        title: 'Completar curso de React',
        description: 'Terminar los últimos módulos del curso de React en línea',
        priority: 'medium',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
        user: createdUsers[1]._id
      },
      {
        title: 'Ejercicio matutino',
        description: 'Hacer 30 minutos de ejercicio antes del trabajo',
        priority: 'high',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día
        user: createdUsers[1]._id
      },
      {
        title: 'Leer libro de JavaScript',
        description: 'Leer el capítulo sobre promesas y async/await',
        priority: 'low',
        completed: true,
        user: createdUsers[1]._id
      }
    ];

    console.log('📝 Creando TODOs de ejemplo...');
    const createdTodos = await Todo.insertMany(todos);
    console.log(`✅ ${createdTodos.length} TODOs creados exitosamente`);

    // Mostrar resumen
    console.log('\n📊 Resumen de datos creados:');
    console.log('👥 Usuarios:');
    createdUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - Rol: ${user.role}`);
    });
    
    console.log('\n📝 TODOs por usuario:');
    for (const user of createdUsers) {
      const userTodos = await Todo.find({ user: user._id });
      console.log(`  ${user.name}: ${userTodos.length} TODOs`);
    }

    console.log('\n🔑 Credenciales de acceso:');
    console.log('  Email: admin@todolist.com | user@todolist.com');
    console.log('  Contraseña: password123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
const main = async () => {
  await connectDB();
  await seedDatabase();
};

main();
