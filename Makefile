# Makefile para TODO-LIST Project
# Automatiza la instalación y ejecución del frontend y backend

.PHONY: help install install-backend install-frontend dev dev-backend dev-frontend build start clean reset-db seed-db clean-db-only stop

# Variables
BACKEND_DIR = BACK
FRONTEND_DIR = FRONT

# Colores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Comando por defecto
help:
	@echo "$(GREEN)TODO-LIST Project - Comandos disponibles:$(NC)"
	@echo ""
	@echo "$(YELLOW)📦 Instalación:$(NC)"
	@echo "  make install          - Instala dependencias del backend y frontend"
	@echo "  make install-backend  - Instala solo dependencias del backend"
	@echo "  make install-frontend - Instala solo dependencias del frontend"
	@echo ""
	@echo "$(YELLOW)🚀 Desarrollo:$(NC)"
	@echo "  make dev              - Ejecuta backend y frontend en modo desarrollo"
	@echo "  make dev-backend      - Ejecuta solo el backend en modo desarrollo"
	@echo "  make dev-frontend     - Ejecuta solo el frontend en modo desarrollo"
	@echo ""
	@echo "$(YELLOW)🗄️  Base de Datos:$(NC)"
	@echo "  make reset-db         - Limpia y carga datos de prueba en la BD"
	@echo "  make seed-db          - Carga datos de prueba en la BD"
	@echo "  make clean-db         - Limpia la base de datos"
	@echo ""
	@echo "$(YELLOW)🧹 Limpieza:$(NC)"
	@echo "  make clean            - Limpia node_modules y archivos de build"
	@echo "  make stop             - Detiene todos los procesos en desarrollo"
	@echo ""
	@echo "$(YELLOW)📋 Información:$(NC)"
	@echo "  make help             - Muestra esta ayuda"
	@echo ""
	@echo "$(GREEN)🔗 URLs de desarrollo:$(NC)"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:5002"
	@echo ""
	@echo "$(GREEN)👤 Usuarios de prueba:$(NC)"
	@echo "  Admin: admin@todolist.com / password123"
	@echo "  User:  user@todolist.com / password123"

# Instalación de dependencias
install: install-backend install-frontend
	@echo "$(GREEN)✅ Instalación completa finalizada$(NC)"

install-backend:
	@echo "$(YELLOW)📦 Instalando dependencias del backend...$(NC)"
	@cd $(BACKEND_DIR) && npm install
	@echo "$(GREEN)✅ Dependencias del backend instaladas$(NC)"

install-frontend:
	@echo "$(YELLOW)📦 Instalando dependencias del frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm install
	@echo "$(GREEN)✅ Dependencias del frontend instaladas$(NC)"

# Desarrollo
dev:
	@echo "$(YELLOW)🚀 Iniciando backend y frontend en modo desarrollo...$(NC)"
	@echo "$(GREEN)Backend estará disponible en: http://localhost:5002$(NC)"
	@echo "$(GREEN)Frontend estará disponible en: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Presiona Ctrl+C para detener ambos servicios$(NC)"
	@echo ""
	@make -j2 dev-backend dev-frontend

dev-backend:
	@echo "$(YELLOW)🔧 Iniciando backend en modo desarrollo...$(NC)"
	@cd $(BACKEND_DIR) && npm run dev

dev-frontend:
	@echo "$(YELLOW)⚛️  Iniciando frontend en modo desarrollo...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev


# Base de datos
reset-db:
	@echo "$(YELLOW)🗄️  Reseteando base de datos...$(NC)"
	@cd $(BACKEND_DIR) && npm run reset-db
	@echo "$(GREEN)✅ Base de datos reseteada con datos de prueba$(NC)"

seed-db:
	@echo "$(YELLOW)🌱 Cargando datos de prueba...$(NC)"
	@cd $(BACKEND_DIR) && npm run seed-db
	@echo "$(GREEN)✅ Datos de prueba cargados$(NC)"

clean-db:
	@echo "$(YELLOW)🧹 Limpiando base de datos...$(NC)"
	@cd $(BACKEND_DIR) && npm run clean-db
	@echo "$(GREEN)✅ Base de datos limpiada$(NC)"

# Limpieza
clean:
	@echo "$(YELLOW)🧹 Limpiando archivos de build y dependencias...$(NC)"
	@echo "$(RED)⚠️  Esto eliminará node_modules y archivos de build$(NC)"
	@read -p "¿Estás seguro? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@rm -rf $(BACKEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/node_modules
	@rm -rf $(FRONTEND_DIR)/.next
	@rm -rf $(FRONTEND_DIR)/out
	@echo "$(GREEN)✅ Limpieza completada$(NC)"

# Detener procesos
stop:
	@echo "$(YELLOW)🛑 Deteniendo procesos de desarrollo...$(NC)"
	@pkill -f "npm run dev" || true
	@pkill -f "next dev" || true
	@pkill -f "nodemon" || true
	@echo "$(GREEN)✅ Procesos detenidos$(NC)"

# Verificar requisitos
check-requirements:
	@echo "$(YELLOW)🔍 Verificando requisitos del sistema...$(NC)"
	@command -v node >/dev/null 2>&1 || { echo "$(RED)❌ Node.js no está instalado$(NC)"; exit 1; }
	@command -v npm >/dev/null 2>&1 || { echo "$(RED)❌ npm no está instalado$(NC)"; exit 1; }
	@echo "$(GREEN)✅ Node.js versión: $$(node --version)$(NC)"
	@echo "$(GREEN)✅ npm versión: $$(npm --version)$(NC)"
	@echo "$(GREEN)✅ Todos los requisitos están instalados$(NC)"

# Setup inicial completo
setup: check-requirements install reset-db
	@echo ""
	@echo "$(GREEN)🎉 ¡Setup inicial completado!$(NC)"
	@echo ""
	@echo "$(YELLOW)📋 Próximos pasos:$(NC)"
	@echo "1. Ejecuta 'make dev' para iniciar en modo desarrollo"
	@echo "2. Abre http://localhost:3000 en tu navegador"
	@echo "3. Usa las credenciales de prueba para hacer login"
	@echo ""
	@echo "$(GREEN)👤 Usuarios de prueba:$(NC)"
	@echo "  Admin: admin@todolist.com / password123"
	@echo "  User:  user@todolist.com / password123"

# Logs
logs-backend:
	@echo "$(YELLOW)📋 Mostrando logs del backend...$(NC)"
	@cd $(BACKEND_DIR) && npm run dev 2>&1 | tail -f

logs-frontend:
	@echo "$(YELLOW)📋 Mostrando logs del frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev 2>&1 | tail -f

# Información del proyecto
info:
	@echo "$(GREEN)📊 Información del proyecto TODO-LIST$(NC)"
	@echo ""
	@echo "$(YELLOW)📁 Estructura:$(NC)"
	@echo "  BACK/  - Backend (Node.js + Express + MongoDB)"
	@echo "  FRONT/ - Frontend (Next.js + TypeScript + Tailwind)"
	@echo ""
	@echo "$(YELLOW)🔧 Tecnologías:$(NC)"
	@echo "  Backend:  Node.js, Express, MongoDB, JWT, bcryptjs"
	@echo "  Frontend: Next.js 15, React 18, TypeScript, Tailwind CSS"
	@echo ""
	@echo "$(YELLOW)🌐 Puertos:$(NC)"
	@echo "  Backend:  5002"
	@echo "  Frontend: 3000"
	@echo ""
	@echo "$(YELLOW)📖 Documentación:$(NC)"
	@echo "  README.md   - Documentación general"

