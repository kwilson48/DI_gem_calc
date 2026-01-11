# Getting Started

Quick start guide to begin implementing the production gem calculator.

## Prerequisites

Before starting, ensure you have:

- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed and configured
- [ ] Docker Desktop installed and running
- [ ] Code editor (VS Code recommended)
- [ ] AWS account created (for deployment later)
- [ ] GitHub account with repository access

## Next Steps

### 1. Review Documentation

Read through these key documents:
1. **README.md** - Project overview
2. **ARCHITECTURE.md** - Technical architecture and technology choices
3. **ROADMAP.md** - Detailed implementation plan (70-day timeline)
4. **DEPLOYMENT.md** - Deployment and CI/CD guide

### 2. Choose Your Path

#### Option A: Start from Scratch (Recommended for Learning)
Follow the roadmap in order, building each component step by step.

**Start with Phase 1: Foundation**
- Set up project structure
- Initialize frontend (React + TypeScript)
- Initialize backend (Express + TypeScript)
- Configure local development environment

#### Option B: Rapid Prototype (Recommended for Speed)
Use the provided setup commands to quickly scaffold the project.

```bash
# Run the setup script (we'll create this)
npm run setup:project

# This will:
# - Create folder structure
# - Initialize frontend and backend
# - Set up Docker environment
# - Install all dependencies
```

### 3. Set Up Local Development

#### Clone and Initialize

```bash
# If not already cloned
git clone <repository-url>
cd DI_gem_calc

# Create the project structure
mkdir -p frontend backend infrastructure scripts docs

# Initialize npm workspace
cat > package.json << 'EOF'
{
  "name": "di-gem-calc",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
EOF

# Install root dependencies
npm install
```

#### Set Up Frontend

```bash
cd frontend

# Initialize Vite + React + TypeScript
npm create vite@latest . -- --template react-ts

# Install dependencies
npm install

# Install UI libraries
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install react-router-dom zustand axios
npm install lucide-react  # for icons

# Initialize Tailwind
npx tailwindcss init -p

# Development dependencies
npm install -D @types/node

# Start dev server
npm run dev
# Access at http://localhost:5173
```

#### Set Up Backend

```bash
cd backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express cors helmet dotenv
npm install pg redis jsonwebtoken bcrypt
npm install express-validator express-rate-limit

# Install TypeScript dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/bcrypt @types/jsonwebtoken
npm install -D ts-node nodemon

# Initialize TypeScript
npx tsc --init

# Create initial structure
mkdir -p src/{controllers,models,routes,services,middleware,utils}

# Start dev server
npm run dev
# Access at http://localhost:3000
```

#### Set Up Docker Environment

```bash
cd ..  # back to root

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: gem_calculator_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: devpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# Start services
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 4. Verify Setup

```bash
# Check Node.js version
node --version  # should be 18+

# Check npm version
npm --version

# Check Docker
docker --version
docker-compose --version

# Check PostgreSQL connection
docker exec -it di_gem_calc-postgres-1 psql -U dev -d gem_calculator_dev -c "SELECT version();"

# Check Redis connection
docker exec -it di_gem_calc-redis-1 redis-cli ping
# Should return: PONG
```

### 5. Create Environment Files

```bash
# Backend .env
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL=postgresql://dev:devpassword@localhost:5432/gem_calculator_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Stripe (get from Stripe dashboard)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF

# Frontend .env
cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
EOF
```

### 6. First Feature: Hello World

#### Backend API

```bash
cd backend/src

# Create server.ts
cat > server.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
EOF

# Update package.json scripts
```

#### Frontend App

```bash
cd ../../frontend/src

# Update App.tsx
cat > App.tsx << 'EOF'
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/health')
      .then(res => res.json())
      .then(data => setHealth(data));
  }, []);

  return (
    <div className="App">
      <h1>Diablo Immortal Gem Calculator</h1>
      <p>Backend Status: {health ? health.status : 'Loading...'}</p>
    </div>
  )
}

export default App
EOF
```

### 7. Test the Setup

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Test API
curl http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"..."}

# Open browser to http://localhost:5173
# Should see "Backend Status: ok"
```

## Development Workflow

### Daily Workflow

1. **Start services**
   ```bash
   docker-compose up -d
   npm run dev
   ```

2. **Make changes**
   - Edit code
   - Save (auto-reload enabled)
   - Test in browser

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

4. **Review deployment**
   - GitHub Actions runs automatically
   - Check deployment status
   - Test on dev URL from phone

### Testing Workflow

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- path/to/test.spec.ts

# Check test coverage
npm test -- --coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Docker Issues

```bash
# Restart Docker services
docker-compose restart

# Remove all containers and volumes (clean slate)
docker-compose down -v
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Connect to database manually
docker exec -it di_gem_calc-postgres-1 psql -U dev -d gem_calculator_dev
```

### npm Install Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitLens
- Docker
- REST Client
- Thunder Client (API testing)

## Useful Commands

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Access database
docker exec -it di_gem_calc-postgres-1 psql -U dev -d gem_calculator_dev

# Access Redis CLI
docker exec -it di_gem_calc-redis-1 redis-cli

# Run database migrations
cd backend
npm run migrate
```

## Next Steps After Setup

Once your local environment is running:

1. **Implement Authentication** (Phase 1, Week 2)
   - JWT token generation
   - User registration/login
   - Protected routes

2. **Migrate Calculator Logic** (Phase 2, Week 3)
   - Extract gem data to JSON
   - Port calculations to TypeScript
   - Create React components

3. **Set Up AWS** (Phase 1, Week 2)
   - Create AWS account
   - Configure Terraform
   - Deploy to dev environment

4. **Follow the Roadmap**
   - Reference ROADMAP.md for detailed tasks
   - Check off items as you complete them
   - Adjust timeline as needed

## Getting Help

- **Documentation**: Check docs/ folder
- **Issues**: Create GitHub issue with details
- **Architecture Questions**: Review ARCHITECTURE.md
- **Deployment Questions**: Review DEPLOYMENT.md

## Resources

### Learning Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [AWS Documentation](https://docs.aws.amazon.com/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [TablePlus](https://tableplus.com/) - Database GUI
- [Redis Commander](http://joeferner.github.io/redis-commander/) - Redis GUI

### Communities
- [r/reactjs](https://www.reddit.com/r/reactjs/)
- [r/node](https://www.reddit.com/r/node/)
- [r/DiabloImmortal](https://www.reddit.com/r/DiabloImmortal/)

## Ready to Start?

You're all set! Follow the roadmap in ROADMAP.md to begin implementation.

**First milestone**: Complete Phase 1 (Foundation) within 2 weeks.

Good luck! 🚀
