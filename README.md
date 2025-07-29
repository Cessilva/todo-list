# Todo List - Next.js SPA

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prerequisites

Before running this project, make sure you have the following installed on your system:

- **Node.js** (version 18.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** - [Download here](https://git-scm.com/)

## Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Cessilva/todo-list.git
   cd todo-list
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Git hooks (for development):**
   ```bash
   npx husky install
   ```

## Getting Started

**Run the development server:**

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Available Scripts

- `npm run dev` - Starts the development server
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs ESLint to check for code issues
- `npm run docs` - Generates TypeDoc documentation

## Development Guidelines

This project uses **commitlint** to enforce conventional commit messages. When making commits, please follow this format:

```
type(scope): description

Examples:
feat: add new todo functionality
fix: resolve issue with todo deletion
docs: update README instructions
```

### Allowed commit types:
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `perf` - Performance improvements
- `build` - Build system changes


## Technologies Used

- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit message linting
- **TypeDoc** - Documentation generation

## License

This project is open source and available under the [MIT License](LICENSE).
