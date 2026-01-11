# Diablo Immortal Gem Calculator

A comprehensive web application for optimizing legendary gem loadouts in Diablo Immortal.

## Current Status

**Version**: 7.1 (Fated Trail Update)
**Status**: Proof of Concept → Production Transformation

## Features

### Current (v7.1)
- Complete gem calculator with 22 legendary gems
- Multi-target DPS scaling
- Strife (PVP) mode calculations
- Advanced hit frequency settings
- Build optimization algorithm

### Planned
- User accounts and authentication
- Save and share builds
- Premium features with subscription tiers
- Community forums
- Build comparison tools
- Historical analytics
- Mobile-optimized PWA

## Architecture

This application is being transformed from a single-page HTML calculator into a full-stack web application:

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Deployment**: AWS (Amplify + ECS + RDS)
- **CI/CD**: GitHub Actions

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture and implementation plan.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- AWS CLI (for deployment)
- PostgreSQL (or use Docker)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd DI_gem_calc

# Install dependencies
npm install

# Start development environment with Docker
docker-compose up -d

# Start frontend development server
cd frontend
npm run dev

# Start backend development server (in another terminal)
cd backend
npm run dev

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000
# Database: postgresql://localhost:5432/gem_calculator
```

## Project Structure

```
di-gem-calc/
├── frontend/          # React application
├── backend/           # Express API server
├── infrastructure/    # Terraform/CloudFormation for AWS
├── docs/             # Documentation
├── scripts/          # Deployment and utility scripts
└── calculator_v7_1_fated_trail.html  # Original proof of concept
```

## Deployment

The application uses a multi-environment deployment strategy:

- **Development**: Auto-deploys from `claude/*` branches
- **Staging**: Auto-deploys from `develop` branch
- **Production**: Auto-deploys from `main` branch

Each deployment is accessible via mobile-friendly URL:
- Dev: https://dev.di-gem-calc.com
- Staging: https://staging.di-gem-calc.com
- Production: https://di-gem-calc.com

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Subscription Tiers

### Free
- Basic calculator
- 1 saved build
- Read-only forum access

### Premium ($4.99/month)
- Unlimited saved builds
- Optimal finder
- Multi-target scaling
- Forum posting

### Pro ($9.99/month)
- Everything in Premium
- Build comparison
- Historical analytics
- Early access features
- Ad-free experience

## Contributing

This is a personal project, but suggestions and bug reports are welcome!

1. Create an issue describing the bug or feature
2. Fork the repository
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Router
- Axios (API client)

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL (primary database)
- Redis (caching and sessions)
- Stripe (payments)
- JWT (authentication)

### Infrastructure
- AWS Amplify (frontend hosting)
- AWS ECS Fargate (backend containers)
- AWS RDS (PostgreSQL)
- AWS ElastiCache (Redis)
- AWS S3 (file storage)
- CloudFront (CDN)
- GitHub Actions (CI/CD)

## Development Roadmap

### Phase 1: Foundation ✓
- [x] Architecture design
- [ ] Project structure setup
- [ ] Basic React frontend
- [ ] Express backend skeleton
- [ ] Database schema
- [ ] Authentication

### Phase 2: Core Features
- [ ] Calculator UI migration
- [ ] Save/load builds
- [ ] User profiles
- [ ] Stripe integration
- [ ] Paywall implementation

### Phase 3: Forums
- [ ] Forum database schema
- [ ] Thread/post UI
- [ ] Moderation tools

### Phase 4: Advanced Features
- [ ] Optimal finder background processing
- [ ] Build comparison
- [ ] Analytics dashboard
- [ ] Public build sharing

### Phase 5: Launch
- [ ] Performance optimization
- [ ] Security audit
- [ ] SEO optimization
- [ ] Documentation
- [ ] Marketing site

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please open an issue on GitHub.

## Acknowledgments

- Diablo Immortal community for game mechanics research
- Calculator logic based on extensive testing and community feedback
