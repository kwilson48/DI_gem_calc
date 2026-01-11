# Diablo Immortal Gem Calculator - Production Architecture

## Overview
Transform the current single-file HTML gem calculator into a production-ready web application with backend, authentication, paywall features, forums, and cloud deployment.

## Technology Stack

### Frontend
- **Framework**: React.js with TypeScript
  - Component-based architecture for maintainability
  - Type safety for complex calculations
  - Easy to test and extend
- **State Management**: Zustand (lightweight) or Redux Toolkit
- **UI Framework**: Tailwind CSS + shadcn/ui components
  - Maintains the dark theme aesthetic
  - Responsive design for mobile testing
- **Build Tool**: Vite (fast development, optimized production builds)

### Backend
- **Framework**: Node.js with Express.js (or Fastify for better performance)
- **Language**: TypeScript
- **API Design**: RESTful API + GraphQL (for complex queries)
- **Authentication**:
  - JWT tokens for session management
  - OAuth 2.0 (Google, Discord, Battle.net login)
  - Email/password with verification

### Database
- **Primary Database**: PostgreSQL
  - User accounts, subscriptions, forum posts
  - Saved builds and calculations
- **Cache Layer**: Redis
  - Session storage
  - Rate limiting
  - Cached calculation results
- **File Storage**: AWS S3 or Google Cloud Storage
  - User avatars
  - Forum attachments

### Forums
- **Option 1**: Discourse (self-hosted or managed)
  - Full-featured forum software
  - SSO integration
- **Option 2**: Custom-built with:
  - Rich text editor (TipTap or Slate)
  - Nested comments/threads
  - Markdown support

### Payment/Paywall
- **Stripe** for payment processing
  - Subscription management
  - One-time purchases
  - Usage-based billing
- **Tiers**:
  - **Free**: Basic calculator, 1 saved build
  - **Premium** ($4.99/month): Unlimited saves, optimal finder, advanced analytics
  - **Pro** ($9.99/month): Everything + priority support, beta features, ad-free forums

### Deployment & Hosting

#### Recommended: AWS (Most Cost-Effective for Your Needs)
- **Frontend**: AWS Amplify or S3 + CloudFront CDN
- **Backend**: AWS ECS (Fargate) or App Runner
- **Database**: AWS RDS (PostgreSQL)
- **Cache**: AWS ElastiCache (Redis)
- **Storage**: S3
- **CI/CD**: AWS CodePipeline + CodeBuild
- **Domain**: Route 53
- **SSL**: AWS Certificate Manager (free)
- **Estimated Cost**: $30-50/month starting out

#### Alternative: Google Cloud Platform
- **Frontend**: Firebase Hosting or Cloud Storage + Cloud CDN
- **Backend**: Cloud Run (serverless containers)
- **Database**: Cloud SQL (PostgreSQL)
- **Cache**: Memorystore (Redis)
- **CI/CD**: Cloud Build + Cloud Deploy
- **Estimated Cost**: $40-60/month starting out

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                       │
│                    (Static Asset Delivery)                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (S3)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Calculator  │  │   Profile    │  │    Forums    │      │
│  │  Components  │  │  Management  │  │   Interface  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Load Balancer                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API (ECS/Fargate)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │  Calculator  │  │    Forums    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Payment    │  │    User      │                        │
│  │   Service    │  │   Service    │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │    Redis     │    │      S3      │
│     (RDS)    │    │(ElastiCache) │    │   Storage    │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  oauth_provider VARCHAR,
  oauth_id VARCHAR,
  subscription_tier VARCHAR DEFAULT 'free',
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Builds Table
```sql
builds (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR NOT NULL,
  description TEXT,
  gem_configuration JSONB NOT NULL,
  character_stats JSONB NOT NULL,
  calculated_dps DECIMAL,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Forum Tables
```sql
forum_categories (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  order_index INTEGER
)

forum_threads (
  id UUID PRIMARY KEY,
  category_id UUID REFERENCES forum_categories(id),
  user_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

forum_posts (
  id UUID PRIMARY KEY,
  thread_id UUID REFERENCES forum_threads(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  edited_at TIMESTAMP,
  created_at TIMESTAMP
)
```

## Feature Breakdown

### Free Tier
- ✅ Basic gem calculator with all current features
- ✅ Single-target DPS calculations
- ✅ 1 saved build (requires account)
- ✅ View public builds
- ✅ Read-only forum access

### Premium Tier ($4.99/month)
- ✅ Unlimited saved builds
- ✅ Optimal 8-gem finder
- ✅ Multi-target DPS scaling
- ✅ Build sharing with private links
- ✅ Forum posting and commenting
- ✅ Export builds to JSON/image

### Pro Tier ($9.99/month)
- ✅ Everything in Premium
- ✅ Historical DPS tracking and analytics
- ✅ Build comparison tool (compare 2+ builds side-by-side)
- ✅ Early access to new features
- ✅ Ad-free experience
- ✅ Custom build templates
- ✅ Priority email support

## CI/CD Pipeline

### Development Workflow
```
1. Developer pushes to branch `claude/feature-xyz`
2. GitHub Actions triggered
3. Automated tests run (unit, integration, e2e)
4. If tests pass, deploy to DEV environment
5. Dev URL: https://dev.di-gem-calc.com
6. Test on phone via dev URL
7. Merge to main → Deploy to STAGING
8. Staging URL: https://staging.di-gem-calc.com
9. Final approval → Deploy to PRODUCTION
10. Production URL: https://di-gem-calc.com
```

### GitHub Actions Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, develop, 'claude/**']

jobs:
  test:
    - Run linting
    - Run unit tests
    - Run integration tests

  build:
    - Build frontend (React)
    - Build backend (Docker image)

  deploy-dev:
    if: branch starts with 'claude/'
    - Deploy to AWS Dev environment
    - Run smoke tests

  deploy-staging:
    if: branch == 'develop'
    - Deploy to AWS Staging environment

  deploy-production:
    if: branch == 'main'
    - Deploy to AWS Production environment
    - Run health checks
```

## Mobile Testing Setup

### QR Code Access
- Each deployment generates a QR code
- Scan with phone to access the deployed version
- Saved in deployment artifacts
- Posted to Slack/Discord webhook (optional)

### Progressive Web App (PWA)
- Install on phone home screen
- Works offline (cached calculator)
- Push notifications for forum replies

## Project Structure

```
di-gem-calc/
├── .github/
│   └── workflows/
│       ├── deploy.yml
│       └── test.yml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calculator/
│   │   │   ├── Auth/
│   │   │   ├── Profile/
│   │   │   ├── Forums/
│   │   │   └── Shared/
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── calculator.ts
│   │   ├── hooks/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.ts
│   ├── tests/
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── infrastructure/
│   ├── terraform/ (or CloudFormation)
│   │   ├── modules/
│   │   ├── environments/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── production/
│   │   └── main.tf
│   └── docker-compose.yml (local development)
├── docs/
│   ├── api/
│   ├── deployment/
│   └── user-guide/
├── scripts/
│   ├── deploy.sh
│   ├── setup-db.sh
│   └── seed-data.sh
├── ARCHITECTURE.md
├── README.md
└── package.json (root workspace)
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up monorepo structure
- Initialize React frontend with basic calculator
- Set up Express backend skeleton
- Configure PostgreSQL database
- Basic authentication (email/password)
- Deploy to AWS dev environment

### Phase 2: Core Features (Week 2-4)
- Port all calculator logic to React components
- Implement save/load builds
- Create user profile pages
- Set up Stripe integration
- Implement subscription tiers and paywall

### Phase 3: Forums (Week 4-6)
- Design and implement forum schema
- Create forum UI components
- Thread creation and replies
- Moderation tools

### Phase 4: Advanced Features (Week 6-8)
- Optimal finder with background processing
- Build comparison tools
- Analytics dashboard
- Public build sharing

### Phase 5: Polish & Launch (Week 8-10)
- Performance optimization
- SEO optimization
- Security audit
- Load testing
- Documentation
- Marketing site

## Security Considerations

- HTTPS only (forced redirect)
- Rate limiting on all API endpoints
- SQL injection prevention (parameterized queries)
- XSS protection (CSP headers, sanitized inputs)
- CSRF tokens
- Password hashing (bcrypt)
- JWT token rotation
- API key management (AWS Secrets Manager)
- Regular dependency updates
- DDoS protection (CloudFront)

## Monitoring & Analytics

- **Application Monitoring**: AWS CloudWatch or DataDog
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics 4 + custom events
- **Uptime Monitoring**: UptimeRobot or Pingdom
- **Log Aggregation**: CloudWatch Logs or ELK Stack

## Cost Estimation (Monthly)

### Initial Launch (Low Traffic)
- AWS Amplify/S3 + CloudFront: $5-10
- ECS Fargate (2 tasks): $15-20
- RDS PostgreSQL (db.t3.micro): $15
- ElastiCache Redis (cache.t3.micro): $12
- Domain + SSL: $1-2
- **Total: ~$50-60/month**

### Growth Phase (10k MAU)
- CloudFront CDN: $20-30
- ECS Fargate (auto-scaling): $50-100
- RDS PostgreSQL (db.t3.small): $30
- ElastiCache Redis (cache.t3.small): $25
- S3 Storage: $5-10
- **Total: ~$130-195/month**

### Revenue Projections
- 10k MAU with 2% conversion to Premium ($4.99) = $998/month
- Additional 0.5% to Pro ($9.99) = $499/month
- **Potential Monthly Revenue: ~$1,500**

## Next Steps

1. **Choose cloud provider** (AWS recommended for cost)
2. **Set up AWS account** and configure billing alerts
3. **Create GitHub repository** structure
4. **Initialize frontend** (React + TypeScript + Tailwind)
5. **Initialize backend** (Express + TypeScript + PostgreSQL)
6. **Set up local development environment** with Docker
7. **Configure CI/CD pipeline** with GitHub Actions
8. **Deploy initial version** to dev environment
9. **Begin Phase 1 implementation**

Would you like me to proceed with setting up the project structure and beginning implementation?
