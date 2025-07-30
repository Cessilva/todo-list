const mongoose = require('mongoose');
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

// Esquema de Usuario (simplificado para el script)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Esquema de Todo (simplificado para el script)
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  completed: { type: Boolean, default: false },
  priority: String,
  dueDate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Todo = mongoose.model('Todo', todoSchema);

const cleanDatabase = async () => {
  try {
    console.log('🧹 Iniciando limpieza de base de datos...');
    
    // Mostrar usuarios actuales
    const users = await User.find({});
    console.log('\n📋 Usuarios actuales en la base de datos:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Creado: ${user.createdAt}`);
    });

    // Mostrar todos actuales
    const todos = await Todo.find({});
    console.log(`\n📝 Total de TODOs en la base de datos: ${todos.length}`);

    // Preguntar qué hacer
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise((resolve) => rl.question(query, resolve));

    console.log('\n¿Qué deseas hacer?');
    console.log('1. Eliminar TODOS los usuarios y TODOs');
    console.log('2. Eliminar solo usuarios de prueba (admin@todolist.com, user@todolist.com)');
    console.log('3. Eliminar un usuario específico por email');
    console.log('4. Solo mostrar información (no eliminar nada)');
    console.log('5. Salir');

    const choice = await question('\nElige una opción (1-5): ');

    switch (choice) {
      case '1':
        await Todo.deleteMany({});
        await User.deleteMany({});
        console.log('✅ Todos los usuarios y TODOs han sido eliminados');
        break;

      case '2':
        const testEmails = ['admin@todolist.com', 'user@todolist.com'];
        const deletedUsers = await User.deleteMany({ email: { $in: testEmails } });
        await Todo.deleteMany({ user: { $in: deletedUsers.deletedCount > 0 ? [] : [] } });
        console.log(`✅ ${deletedUsers.deletedCount} usuarios de prueba eliminados`);
        break;

      case '3':
        const email = await question('Ingresa el email del usuario a eliminar: ');
        const userToDelete = await User.findOne({ email });
        if (userToDelete) {
          await Todo.deleteMany({ user: userToDelete._id });
          await User.deleteOne({ email });
          console.log(`✅ Usuario ${email} y sus TODOs han sido eliminados`);
        } else {
          console.log(`❌ No se encontró usuario con email: ${email}`);
        }
        break;

      case '4':
        console.log('ℹ️ Solo mostrando información, no se eliminó nada');
        break;

      case '5':
        console.log('👋 Saliendo...');
        break;

      default:
        console.log('❌ Opción no válida');
    }

    rl.close();

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
};

// Ejecutar el script
const main = async () => {
  await connectDB();
  await cleanDatabase();
};

main();
