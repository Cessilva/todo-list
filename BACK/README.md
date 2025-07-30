# Todo List API Backend

API REST para una aplicación de lista de tareas (TODO) construida con Node.js, Express y MongoDB.

## 🚀 Características

- **Autenticación JWT**: Login, registro y gestión de tokens
- **Gestión de TODOs**: CRUD completo para tareas
- **Gestión de usuarios**: Perfiles y configuración
- **Recuperación de contraseña**: Sistema completo de reset de contraseña
- **Validaciones**: Validación robusta de datos de entrada
- **Seguridad**: Middleware de autenticación y autorización
- **Base de datos**: MongoDB con Mongoose ODM

## 📋 Requisitos

- Node.js >= 14.0.0
- MongoDB Atlas o instancia local de MongoDB
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd BACK
```

2. Instala las dependencias:
```bash
npm install
```

3. Si quieres probar con tu propia base , edita el archivo `.env` con tus configuraciones:


5. Inicia el servidor:
```bash
# Desarrollo
npm run dev

## 📊 Scripts disponibles

```bash
# Desarrollo con nodemon
npm run dev

# Producción
npm start

# Limpiar base de datos
npm run clean-db

# Poblar base de datos con datos de prueba
npm run seed-db

# Limpiar y poblar base de datos
npm run reset-db
```

## 🧪 Datos de prueba

El sistema incluye usuarios de prueba:

- **Admin**: admin@todolist.com / password123
- **Usuario**: user@todolist.com / password123

Para cargar datos de prueba:
```bash
npm run reset-db
```

## 📝 Notas adicionales

- Los tokens JWT expiran en 7 días por defecto
- Las contraseñas deben tener al menos 6 caracteres
- Los emails deben ser únicos en el sistema
- Los TODOs solo pueden ser accedidos por su propietario
- Las fechas se manejan en formato ISO 8601

