# 📋 TODO-LIST - Aplicación Completa de Gestión de Tareas

Una aplicación moderna de gestión de tareas construida con **Next.js 15** (frontend) y **Node.js + Express + MongoDB** (backend). Incluye autenticación JWT, sistema de roles, subtareas jerárquicas y funcionalidades avanzadas.

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** (versión 18.0 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene con Node.js) o **yarn**
- **Git** - [Descargar aquí](https://git-scm.com/)
- **Make** (opcional, para usar comandos automatizados)

### ⚙️ Configuración del Archivo .env

Antes de ejecutar la aplicación, debes crear un archivo `.env` en la carpeta `BACK/` con la siguiente configuración:

```bash
# Crear el archivo .env en la carpeta BACK
cd BACK
touch .env
```

**Contenido del archivo `BACK/.env`:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://ceciliaproteco:qwerty1234567@cluster0.5uuaeie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=todolist

# Server Configuration
PORT=5002
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-for-todo-app-2025-very-long-and-secure
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-for-todo-app-2025-even-more-secure
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

> **⚠️ Importante:** Este archivo `.env` es necesario para que el backend pueda conectarse a la base de datos MongoDB y funcionar correctamente.

### Instalación Automática con Makefile

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Cessilva/todo-list.git
   cd todo-list
   ```

2. **Setup completo automático:**
   ```bash
   make setup
   ```
   Este comando:
   - Verifica los requisitos del sistema
   - Instala dependencias del backend y frontend
   - Configura la base de datos con datos de prueba

3. **Iniciar en modo desarrollo:**
   ```bash
   make dev
   ```

¡Listo! La aplicación estará disponible en:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5002

### Instalación Manual

Si prefieres no usar Make:

1. **Instalar dependencias del backend:**
   ```bash
   cd BACK
   npm install
   ```

2. **Instalar dependencias del frontend:**
   ```bash
   cd FRONT
   npm install
   ```

3. **Configurar base de datos:**
   ```bash
   cd BACK
   npm run reset-db
   ```

4. **Iniciar servicios:**
   ```bash
   # Terminal 1 - Backend
   cd BACK
   npm run dev

   # Terminal 2 - Frontend
   cd FRONT
   npm run dev
   ```

## 🛠️ Comandos del Makefile

### 📦 Instalación
```bash
make install          # Instala dependencias del backend y frontend
make install-backend  # Instala solo dependencias del backend
make install-frontend # Instala solo dependencias del frontend
```

### 🚀 Desarrollo
```bash
make dev              # Ejecuta backend y frontend en modo desarrollo
make dev-backend      # Ejecuta solo el backend en modo desarrollo
make dev-frontend     # Ejecuta solo el frontend en modo desarrollo
```

### 🗄️ Base de Datos
```bash
make reset-db         # Limpia y carga datos de prueba en la BD
make seed-db          # Carga datos de prueba en la BD
make clean-db         # Limpia la base de datos
```

### 🧹 Limpieza y Utilidades
```bash
make clean            # Limpia node_modules y archivos de build
make stop             # Detiene todos los procesos en desarrollo
make help             # Muestra ayuda con todos los comandos
make info             # Muestra información del proyecto
```

### 🔧 Setup Inicial Completo
```bash
make setup            # Verifica requisitos, instala dependencias y configura BD
```

## 👤 Usuarios de Prueba

El sistema incluye usuarios predefinidos para testing:

- **Administrador:** 
  - Email: `admin@todolist.com`
  - Contraseña: `password123`

- **Usuario Regular:**
  - Email: `user@todolist.com`
  - Contraseña: `password123`
