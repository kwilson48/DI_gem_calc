# Deployment Guide

This guide covers deploying the Diablo Immortal Gem Calculator to AWS with automated CI/CD for easy mobile testing.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [AWS Account Setup](#aws-account-setup)
3. [Initial Infrastructure Setup](#initial-infrastructure-setup)
4. [CI/CD Pipeline Configuration](#cicd-pipeline-configuration)
5. [Mobile Testing Workflow](#mobile-testing-workflow)
6. [Environment Management](#environment-management)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Tools
- AWS CLI (v2.x)
- Node.js 18+
- Docker Desktop
- Terraform (v1.0+) or AWS CDK
- Git

### Required Accounts
- AWS Account (with billing enabled)
- GitHub Account
- Stripe Account (for payments)
- Domain name (optional but recommended)

## AWS Account Setup

### 1. Create AWS Account
```bash
# Sign up at https://aws.amazon.com
# Enable MFA on root account
# Create IAM user for deployments
```

### 2. Configure AWS CLI
```bash
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region: us-east-1 (or your preferred region)
# Default output format: json
```

### 3. Set Billing Alerts
```bash
# Go to AWS Billing Dashboard
# Create budget alert at $50/month threshold
# Create another alert at $100/month threshold
```

## Initial Infrastructure Setup

### Option A: Using Terraform (Recommended)

#### 1. Initialize Terraform
```bash
cd infrastructure/terraform/environments/dev
terraform init
```

#### 2. Review Infrastructure Plan
```bash
terraform plan
```

#### 3. Deploy Infrastructure
```bash
terraform apply
# Review changes
# Type 'yes' to confirm

# This creates:
# - VPC and networking
# - RDS PostgreSQL instance
# - ElastiCache Redis cluster
# - ECS cluster and task definitions
# - Application Load Balancer
# - S3 buckets for frontend and storage
# - CloudFront distribution
# - IAM roles and security groups
```

#### 4. Save Outputs
```bash
terraform output > ../../../.env.dev
# Outputs include:
# - Database connection string
# - Redis endpoint
# - S3 bucket names
# - CloudFront domain
# - Load balancer DNS
```

### Option B: Using AWS Console (Manual)

See [manual-setup.md](./docs/deployment/manual-setup.md) for step-by-step console instructions.

## CI/CD Pipeline Configuration

### 1. GitHub Repository Setup

```bash
# Create repository secrets (Settings → Secrets and variables → Actions)
```

Required secrets:
- `AWS_ACCESS_KEY_ID`: IAM user access key
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key
- `AWS_REGION`: AWS region (e.g., us-east-1)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Random 32+ character string
- `STRIPE_SECRET_KEY`: From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET`: From Stripe webhook setup

### 2. Configure GitHub Actions

The `.github/workflows/deploy.yml` file is already configured. Here's how it works:

```yaml
# Triggers on push to these branches:
- main (production)
- develop (staging)
- claude/* (dev environment)

# Each push:
1. Runs linting and tests
2. Builds Docker image
3. Pushes to AWS ECR
4. Updates ECS service
5. Builds and deploys frontend to S3
6. Invalidates CloudFront cache
7. Runs smoke tests
8. Posts deployment URL to Slack/Discord (optional)
```

### 3. First Deployment

```bash
# Create and push initial branch
git checkout -b claude/initial-setup
git add .
git commit -m "Initial project setup"
git push -u origin claude/initial-setup

# GitHub Actions will automatically:
# - Build the application
# - Run tests
# - Deploy to dev environment
# - Generate deployment URL
```

### 4. Monitor Deployment

```bash
# Watch GitHub Actions
# Go to: https://github.com/your-username/DI_gem_calc/actions

# Or via CLI
gh run list
gh run view [run-id] --log
```

## Mobile Testing Workflow

### Automatic Mobile Testing

Every push to a `claude/*` branch automatically deploys to dev environment and creates a mobile-accessible URL.

#### 1. Make Changes Locally
```bash
# Edit code
git add .
git commit -m "Update gem calculations"
git push
```

#### 2. Wait for Deployment (2-5 minutes)
- GitHub Actions builds and deploys
- Deployment URL posted to workflow summary

#### 3. Access on Mobile
- Open GitHub Actions on mobile browser
- Click deployment URL from workflow summary
- Or use bookmarked dev URL: `https://dev.di-gem-calc.com`

### QR Code Generation

For easier mobile access, the deployment generates a QR code:

```bash
# After deployment completes
# Check deployment artifacts
gh run view [run-id] --log | grep "QR Code"
# Displays QR code URL
```

### Progressive Web App (PWA)

Once deployed, you can install the app on your phone:

1. Open site in mobile browser
2. Tap "Share" or menu
3. Select "Add to Home Screen"
4. App installs like native app
5. Works offline with cached data

## Environment Management

### Development Environment
- **Branch**: `claude/*`
- **URL**: `https://dev.di-gem-calc.com`
- **Database**: Separate dev database
- **Purpose**: Testing new features, rapid iteration

### Staging Environment
- **Branch**: `develop`
- **URL**: `https://staging.di-gem-calc.com`
- **Database**: Staging database (copy of production schema)
- **Purpose**: Pre-production testing, QA

### Production Environment
- **Branch**: `main`
- **URL**: `https://di-gem-calc.com`
- **Database**: Production database
- **Purpose**: Live user traffic

### Promotion Workflow

```bash
# Dev → Staging
git checkout develop
git merge claude/feature-branch
git push origin develop
# Auto-deploys to staging

# Staging → Production
git checkout main
git merge develop
git push origin main
# Auto-deploys to production
```

## Database Migrations

### Running Migrations

```bash
# Development
npm run migrate:dev

# Staging
npm run migrate:staging

# Production (requires approval)
npm run migrate:prod
```

### Creating Migrations

```bash
# Generate migration file
npm run migration:create add_user_preferences

# Edit migration file in backend/src/migrations/
# Run migration
npm run migrate:dev
```

## Monitoring and Logs

### CloudWatch Logs

```bash
# View backend logs
aws logs tail /ecs/gem-calculator-backend --follow

# View specific error
aws logs filter-pattern "ERROR" --log-group-name /ecs/gem-calculator-backend
```

### Application Metrics

Access CloudWatch Dashboard:
```bash
# Open browser to
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=gem-calculator
```

Metrics include:
- Request rate
- Error rate
- Response time
- Database connections
- Cache hit rate
- Active users

### Error Tracking with Sentry

```bash
# Sentry is automatically configured
# View errors at: https://sentry.io/your-project
```

## Cost Monitoring

### View Current Costs

```bash
# AWS Cost Explorer
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity DAILY \
  --metrics "UnblendedCost"
```

### Cost Optimization Tips

1. **Use RDS Reserved Instances** (save 30-40% after initial validation)
2. **Enable S3 Intelligent Tiering** for user uploads
3. **Set CloudFront cache TTL** appropriately
4. **Use Fargate Spot** for non-critical background tasks
5. **Enable auto-scaling** to scale down during low traffic

## Backup and Recovery

### Automated Backups

```bash
# RDS automatic backups enabled (7-day retention)
# Configure in Terraform:
backup_retention_period = 7
backup_window = "03:00-04:00"
```

### Manual Backup

```bash
# Create database snapshot
aws rds create-db-snapshot \
  --db-instance-identifier gem-calculator-prod \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# List available snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier gem-calculator-prod

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier gem-calculator-restored \
  --db-snapshot-identifier snapshot-name
```

## Security Best Practices

### 1. Secrets Management

Never commit secrets to Git. Use AWS Secrets Manager:

```bash
# Store secret
aws secretsmanager create-secret \
  --name gem-calculator/jwt-secret \
  --secret-string "your-secret-here"

# Access in application (automatically handled)
```

### 2. SSL/TLS Configuration

```bash
# SSL certificates automatically provisioned via AWS Certificate Manager
# HTTPS enforced on CloudFront
# HSTS headers enabled
```

### 3. Security Groups

```bash
# Database accessible only from ECS tasks
# Redis accessible only from ECS tasks
# Load balancer accepts traffic from CloudFront only
```

### 4. IAM Roles

```bash
# ECS tasks have minimal required permissions
# No long-lived credentials in application code
# Separate IAM roles for dev/staging/prod
```

## Troubleshooting

### Deployment Failed

```bash
# Check GitHub Actions logs
gh run view --log

# Common issues:
# - Docker build failure: Check Dockerfile syntax
# - ECS task won't start: Check task logs in CloudWatch
# - Frontend not updating: CloudFront cache not invalidated
```

### Application Not Accessible

```bash
# Check ECS service status
aws ecs describe-services \
  --cluster gem-calculator-cluster \
  --services gem-calculator-service

# Check target group health
aws elbv2 describe-target-health \
  --target-group-arn [your-target-group-arn]
```

### Database Connection Issues

```bash
# Test database connectivity from ECS task
aws ecs execute-command \
  --cluster gem-calculator-cluster \
  --task [task-id] \
  --command "pg_isready -h [db-endpoint]"
```

### High Costs

```bash
# Identify cost drivers
aws ce get-cost-and-usage \
  --time-period Start=2026-01-01,End=2026-01-31 \
  --granularity DAILY \
  --metrics "UnblendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Common culprits:
# - RDS instance too large (downgrade if not needed)
# - CloudFront data transfer (check cache hit ratio)
# - ECS tasks running when not needed (check auto-scaling)
```

## Rollback Procedures

### Rollback Deployment

```bash
# Option 1: Revert Git commit
git revert [commit-hash]
git push

# Option 2: Rollback ECS service to previous task definition
aws ecs update-service \
  --cluster gem-calculator-cluster \
  --service gem-calculator-service \
  --task-definition gem-calculator-backend:[previous-version]

# Option 3: Rollback frontend via S3 versioning
aws s3 sync s3://gem-calculator-frontend/previous-version/ s3://gem-calculator-frontend/ --delete
aws cloudfront create-invalidation --distribution-id [dist-id] --paths "/*"
```

## Performance Optimization

### Frontend Optimization

```bash
# Build with optimizations
npm run build

# Analyze bundle size
npm run analyze

# Lighthouse audit
lighthouse https://di-gem-calc.com --view
```

### Backend Optimization

```bash
# Enable Redis caching for frequent queries
# Add database indexes
# Use connection pooling
# Enable compression middleware
```

### Database Optimization

```bash
# Identify slow queries
aws rds describe-db-log-files \
  --db-instance-identifier gem-calculator-prod

# Download slow query log
aws rds download-db-log-file-portion \
  --db-instance-identifier gem-calculator-prod \
  --log-file-name slowquery/postgresql.log.2026-01-11
```

## Support

For deployment issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review CloudWatch logs
3. Open GitHub issue with deployment logs
4. Contact AWS Support (if using support plan)

## Additional Resources

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS Cost Optimization](https://aws.amazon.com/pricing/cost-optimization/)
