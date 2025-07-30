# Todo List API Backend

API REST para aplicación de lista de tareas con autenticación JWT y MongoDB.

## 🚀 Configuración

### Requisitos
- Node.js 16+
- MongoDB Atlas o MongoDB local
- npm o yarn

### Instalación
```bash
cd BACK
npm install
```

### Variables de Entorno
Copia `.env.example` a `.env` y configura las variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority&appName=AppName
DB_NAME=todolist

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Ejecutar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 Endpoints de la API

### Base URL
```
http://localhost:5001
```

### Autenticación

#### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Usuario Test",
  "email": "test@example.com",
  "password": "Test123456",
  "confirmPassword": "Test123456"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "...",
      "name": "Usuario Test",
      "email": "test@example.com",
      "avatar": null,
      "isActive": true,
      "createdAt": "2025-07-29T23:43:56.328Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

#### Iniciar Sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123456"
}
```

#### Obtener Perfil (Protegido)
```http
GET /api/auth/profile
Authorization: Bearer {accessToken}
```

#### Actualizar Perfil (Protegido)
```http
PUT /api/auth/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Nuevo Nombre",
  "email": "nuevo@email.com"
}
```

#### Cambiar Contraseña (Protegido)
```http
PUT /api/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "contraseñaActual",
  "newPassword": "nuevaContraseña123",
  "confirmNewPassword": "nuevaContraseña123"
}
```

#### Verificar Token (Protegido)
```http
GET /api/auth/verify
Authorization: Bearer {accessToken}
```

#### Cerrar Sesión (Protegido)
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

## 🔒 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Cada usuario recibe:

- **Access Token**: Para acceder a endpoints protegidos (expira en 7 días)
- **Refresh Token**: Para renovar el access token (expira en 7 días)

### Uso del Token
Incluye el token en el header Authorization:
```
Authorization: Bearer {accessToken}
```

## 📝 Validaciones

### Registro de Usuario
- **name**: Requerido, 2-50 caracteres, solo letras y espacios
- **email**: Requerido, formato de email válido, único
- **password**: Requerido, mínimo 6 caracteres, debe contener mayúscula, minúscula y número
- **confirmPassword**: Debe coincidir con password

### Login
- **email**: Requerido, formato de email válido
- **password**: Requerido

## 🗄️ Base de Datos

### Modelo de Usuario
```javascript
{
  name: String,        // Nombre del usuario
  email: String,       // Email único
  password: String,    // Contraseña encriptada
  avatar: String,      // URL del avatar (opcional)
  isActive: Boolean,   // Estado del usuario
  createdAt: Date,     // Fecha de creación
  updatedAt: Date      // Fecha de actualización
}
```

### Modelo de Todo (Pendiente de implementar)
```javascript
{
  title: String,           // Título de la tarea
  description: String,     // Descripción (opcional)
  completed: Boolean,      // Estado de completado
  priority: String,        // low, medium, high
  dueDate: Date,          // Fecha de vencimiento (opcional)
  category: String,        // Categoría (opcional)
  tags: [String],         // Tags (opcional)
  comments: [Comment],     // Comentarios
  user: ObjectId,         // Referencia al usuario
  completedAt: Date,      // Fecha de completado
  createdAt: Date,        // Fecha de creación
  updatedAt: Date         // Fecha de actualización
}
```

## 🛡️ Seguridad

- Contraseñas encriptadas con bcryptjs (salt rounds: 12)
- JWT con secret configurable
- Validación de entrada con express-validator
- CORS configurado
- Manejo de errores centralizado
- Variables de entorno para datos sensibles

## 🧪 Testing

### Ejemplos con curl

**Registrar usuario:**
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Test",
    "email": "test@example.com",
    "password": "Test123456",
    "confirmPassword": "Test123456"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Obtener perfil:**
```bash
curl -X GET http://localhost:5001/api/auth/profile \
  -H "Authorization: Bearer {tu_access_token}"
```

## 📁 Estructura del Proyecto

```
BACK/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   └── authController.js    # Controladores de autenticación
├── middleware/
│   ├── auth.js             # Middleware de autenticación
│   └── errorHandler.js     # Manejo de errores
├── models/
│   ├── User.js             # Modelo de usuario
│   └── Todo.js             # Modelo de todo
├── routes/
│   └── authRoutes.js       # Rutas de autenticación
├── utils/
│   └── jwt.js              # Utilidades JWT
├── validators/
│   ├── authValidators.js   # Validaciones de autenticación
│   └── todoValidators.js   # Validaciones de todos
├── .env                    # Variables de entorno (no subir a git)
├── .env.example           # Ejemplo de variables de entorno
├── .gitignore             # Archivos ignorados por git
├── app.js                 # Archivo principal
├── package.json           # Dependencias y scripts
└── README.md              # Documentación
```

## 🚧 Próximas Funcionalidades

- [ ] CRUD completo de Todos
- [ ] Filtros y búsqueda de todos
- [ ] Comentarios en todos
- [ ] Estadísticas de usuario
- [ ] Paginación
- [ ] Rate limiting
- [ ] Tests unitarios
- [ ] Documentación con Swagger

## 🤝 Estado del Proyecto

✅ **Completado:**
- Configuración de Express y MongoDB
- Sistema de autenticación JWT completo
- Registro y login de usuarios
- Middleware de autenticación
- Validaciones de entrada
- Manejo de errores
- Documentación básica

🔄 **En desarrollo:**
- CRUD de Todos
- Endpoints de todos con filtros
- Sistema de comentarios

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades, crea un issue en el repositorio.
