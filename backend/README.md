# E-Commerce Backend API

A modern, production-ready e-commerce backend built with Express.js, TypeORM, PostgreSQL, Clerk Auth, and Stripe Payments.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running the Application](#-running-the-application)
- [Database Migrations](#-database-migrations)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Performance Optimization](#-performance-optimization)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Features
- 🛍️ **Product Catalog Management**: Create, read, update, delete products with categories
- 🛒 **Shopping Cart**: Session-based cart management with real-time updates
- 💳 **Payment Processing**: Integrated Stripe payment gateway with webhook support
- 📦 **Order Management**: Complete order lifecycle from checkout to fulfillment
- 👥 **User Management**: Role-based access control (Customer, Staff, Admin, Super Admin)
- 📧 **Email Notifications**: Order confirmation emails via Resend

### Security Features
- 🔐 **Authentication**: Clerk-based JWT authentication
- 🛡️ **Authorization**: Role-based permissions with hierarchical access control
- 🚨 **Rate Limiting**: API rate limiting to prevent abuse
- 🔒 **Input Validation**: Zod schema validation for all endpoints
- 🧹 **CORS Protection**: Configurable CORS with origin whitelisting
- 🪖 **HTTP Security Headers**: Helmet.js integration

### Technical Features
- 🏗️ **Hybrid ID Architecture**: Public UUIDs + Internal integer IDs for security and performance
- 🔄 **Database Transactions**: ACID compliance with pessimistic locking
- 📊 **Soft Deletes**: Reversible data deletion for User, Product, and Category entities
- 🔍 **Advanced Filtering**: Search, sort, and filter across all resources
- 📄 **Pagination**: Cursor-based pagination for large datasets
- ⚡ **Database Indexing**: Optimized queries with strategic indexes
- 🧪 **Unit Testing**: Vitest test suite with mocking

---

## 🛠️ Tech Stack

### Core
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3.x

### Authentication & Payments
- **Auth Provider**: Clerk
- **Payment Gateway**: Stripe
- **Email Service**: Resend

### Development Tools
- **Package Manager**: npm
- **Testing**: Vitest
- **Type Checking**: TypeScript strict mode
- **Validation**: Zod

### Security & Middleware
- **Security Headers**: Helmet.js
- **Rate Limiting**: express-rate-limit
- **CORS**: cors
- **Environment Config**: dotenv

---

## 🏛️ Architecture

### Design Patterns
- **Dependency Injection**: Container-based DI for loose coupling
- **Repository Pattern**: Abstraction layer for data access
- **Service Layer Pattern**: Business logic separation
- **Interface Segregation**: Payment and Email service abstractions

### ID Management Strategy (Hybrid Model)
The system uses a **dual-identifier approach** for optimal security and performance:

| Entity | Internal ID (DB) | Public ID (API) | Purpose |
|--------|------------------|-----------------|---------|
| User | `id` (integer) | `clerkId` (string) | Clerk integration |
| Product | `id` (integer) | `publicId` (UUID) | Public references |
| Category | `id` (integer) | `publicId` (UUID) | Public references |
| Order | `id` (integer) | `publicId` (UUID) | Public references |
| CartItem | `id` (integer) | `publicId` (UUID) | Public references |

**Benefits**:
- ⚡ Fast database JOINs with integer foreign keys
- 🔐 Prevents enumeration attacks (cannot guess IDs)
- 🎭 Hides business metrics from competitors
- 📈 Better index performance

See [ARCHITECTURE_IDS.md](./ARCHITECTURE_IDS.md) for detailed documentation.

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **PostgreSQL**: v15 or higher ([Download](https://www.postgresql.org/download/))
- **Git**: For version control

### External Services
You'll need accounts and API keys for:
- [Clerk](https://clerk.com/) - Authentication
- [Stripe](https://stripe.com/) - Payment processing
- [Resend](https://resend.com/) - Email delivery

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd e-commerce/backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Create a PostgreSQL database:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE e_commerce;

# Create user (optional)
CREATE USER ecommerce_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE e_commerce TO ecommerce_user;

# Exit
\q
```

---

## 🔧 Environment Setup

### 1. Create Environment File
```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your actual values:

```env
# Application
NODE_ENV=development
PORT=5001
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_NAME=e_commerce

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Stripe Payment
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Environment Variable Details

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `3000` |
| `API_VERSION` | API version prefix | No | `v1` |
| `DB_HOST` | PostgreSQL host | Yes | - |
| `DB_PORT` | PostgreSQL port | Yes | - |
| `DB_USERNAME` | Database username | Yes | - |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_NAME` | Database name | Yes | - |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key | Yes | - |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | - |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Yes | - |
| `RESEND_API_KEY` | Resend API key | Yes | - |
| `EMAIL_FROM` | Email sender address | No | `onboarding@resend.dev` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | Yes | - |

---

## 🏃 Running the Application

### Development Mode (with hot reload)
```bash
npm run dev
```
Server will start at `http://localhost:5001`

### Production Build
```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

### Verify Server is Running
```bash
curl http://localhost:5001/api/v1/products
```

---

## 🗄️ Database Migrations

### Run Migrations
```bash
npm run migration:run
```

### Create New Migration
```bash
npm run migration:create -- src/migrations/YourMigrationName
```

### Generate Migration from Entity Changes
```bash
npm run migration:generate -- src/migrations/YourMigrationName
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Seed Database
Populate database with sample data:
```bash
npm run seed
```

This will create:
- Sample categories (Plants/Seeds, Gardening Tools, etc.)
- Sample products with realistic data
- A Super Admin user

---

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests Once (CI mode)
```bash
npm run test:run
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage reports will be generated in the `coverage/` directory.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5001/api/v1
```

### Authentication
All protected endpoints require a Clerk JWT token in the Authorization header:
```http
Authorization: Bearer <clerk-jwt-token>
```

### Available Endpoints

#### Products
- `GET /api/v1/products` - List all products (with filtering)
- `GET /api/v1/products/:publicId` - Get product details
- `POST /api/v1/products` - Create product (Staff+)
- `PUT /api/v1/products/:publicId` - Update product (Staff+)
- `DELETE /api/v1/products/:publicId` - Delete product (Staff+)

#### Categories
- `GET /api/v1/categories` - List all categories
- `GET /api/v1/categories/:publicId` - Get category details
- `POST /api/v1/categories` - Create category (Staff+)
- `PUT /api/v1/categories/:publicId` - Update category (Staff+)
- `DELETE /api/v1/categories/:publicId` - Delete category (Staff+)

#### Cart
- `GET /api/v1/cart` - Get current user's cart
- `POST /api/v1/cart/items` - Add/update item in cart
- `PUT /api/v1/cart/items/:itemPublicId` - Update item quantity
- `DELETE /api/v1/cart/items/:itemPublicId` - Remove item from cart
- `DELETE /api/v1/cart` - Clear entire cart

#### Orders
- `POST /api/v1/orders` - Create order (checkout)
- `GET /api/v1/orders/me` - Get current user's orders
- `GET /api/v1/orders/:publicId` - Get order details
- `GET /api/v1/orders` - Get all orders (Admin+)

#### Users (Admin only)
- `GET /api/v1/users/me` - Get current user profile
- `GET /api/v1/users` - List all users (Staff+)
- `POST /api/v1/users/change-role/:clerkId` - Change user role (Admin+)
- `POST /api/v1/users/ban/:clerkId` - Toggle ban status (Admin+)
- `POST /api/v1/users/lock/:clerkId` - Toggle lock status (Admin+)
- `POST /api/v1/users/restore/:clerkId` - Restore deleted user (Admin+)
- `DELETE /api/v1/users/:clerkId` - Delete user (Admin+)

For detailed API documentation, see [docs/api-documentation.md](./docs/api-documentation.md)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # TypeORM DataSource
│   │   └── environment.ts   # Zod environment validation
│   ├── container.ts         # Dependency injection container
│   ├── index.ts            # Application entry point
│   ├── migrations/         # Database migrations
│   ├── modules/            # Feature modules
│   │   ├── cart/
│   │   │   ├── entities/   # TypeORM entities
│   │   │   ├── cart.controller.ts
│   │   │   ├── cart.service.ts
│   │   │   ├── cart.interface.ts
│   │   │   ├── cart.routes.ts
│   │   │   ├── cart.validation.ts
│   │   │   └── index.ts
│   │   ├── category/
│   │   ├── order/
│   │   ├── product/
│   │   └── user/
│   ├── seeds/              # Database seeders
│   ├── shared/             # Shared utilities
│   │   ├── dtos/          # Data Transfer Objects
│   │   ├── errors/        # Custom error classes
│   │   ├── interfaces/    # TypeScript interfaces
│   │   ├── middleware/    # Express middleware
│   │   ├── services/      # Shared services (email, payment)
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utility functions
│   │   └── validation/    # Shared validation schemas
│   ├── test/              # Test utilities
│   └── types/             # Global type definitions
├── docs/                   # Documentation
├── .env.example           # Environment template
├── .gitignore
├── package.json
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Vitest configuration
└── README.md
```

### Module Structure
Each module follows a consistent structure:
- **entities/**: TypeORM entity definitions
- **controller.ts**: HTTP request handlers
- **service.ts**: Business logic layer
- **interface.ts**: TypeScript interfaces and types
- **routes.ts**: Express route definitions
- **validation.ts**: Zod validation schemas
- **index.ts**: Public exports

---

## 🔐 Security

### Implemented Security Measures

1. **Authentication & Authorization**
   - Clerk JWT token validation
   - Role-based access control (RBAC)
   - Protected routes with `requireAuth` middleware

2. **Input Validation**
   - Zod schema validation for all inputs
   - Type-safe request bodies and params

3. **Rate Limiting**
   - API rate limit: 100 requests per 15 minutes
   - Auth rate limit: 5 attempts per hour
   - Checkout rate limit: 3 attempts per minute

4. **HTTP Security Headers** (via Helmet.js)
   - Content Security Policy
   - X-Frame-Options
   - X-Content-Type-Options
   - Strict-Transport-Security

5. **CORS Protection**
   - Whitelisted origins only
   - Credentials support with specific origins

6. **Database Security**
   - Parameterized queries (SQL injection prevention)
   - Soft deletes for sensitive data
   - Transaction isolation

7. **Payment Security**
   - Stripe PCI compliance
   - Webhook signature verification
   - Idempotency keys for payments

---

## ⚡ Performance Optimization

### Database Optimizations
- **Indexes**: Strategic indexes on frequently queried fields
  - `publicId` (unique)
  - `name`, `price`, `categoryId`, `isActive`
  - `clerkId`, `createdAt`, `userId`
- **Connection Pooling**: PostgreSQL connection pool
- **Query Optimization**: Using QueryBuilder for complex queries
- **Pessimistic Locking**: For inventory management during checkout

### Application Optimizations
- **Lazy Loading**: Relations loaded on-demand
- **Pagination**: All list endpoints support pagination
- **DTO Pattern**: Minimal data transfer
- **Graceful Shutdown**: Proper cleanup of connections

---

## 🚢 Deployment

### Environment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use production database credentials
- [ ] Configure production CORS origins
- [ ] Set up production Clerk instance
- [ ] Configure Stripe webhooks for production
- [ ] Use production Resend API key
- [ ] Enable database SSL connection
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Recommended Hosting Platforms
- **Render** - Easy deployment with PostgreSQL
- **Railway** - Simple setup with database
- **Heroku** - Classic platform
- **AWS EC2** - Full control
- **DigitalOcean** - App Platform or Droplet

### Database Hosting
- **Render PostgreSQL**
- **Supabase**
- **Railway PostgreSQL**
- **AWS RDS**
- **Neon** (Serverless Postgres)

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: Database connection failed
```
**Solution**: 
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -l`

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5001
```
**Solution**:
```bash
# Find process using port 5001
lsof -i :5001

# Kill the process
kill -9 <PID>

# Or use different port in .env
PORT=5002
```

#### Environment Variables Not Loading
```
Error: DB_HOST is required
```
**Solution**:
- Ensure `.env` file exists in backend root
- Check `.env` file syntax (no quotes needed)
- Restart development server

#### Migration Errors
```
Error: relation "users" already exists
```
**Solution**:
```bash
# Revert all migrations
npm run migration:revert

# Re-run migrations
npm run migration:run
```

#### Clerk Authentication Fails
```
Error: Unauthorized
```
**Solution**:
- Verify Clerk keys in `.env`
- Check token is in Authorization header
- Ensure Clerk instance is active

#### Stripe Payment Webhook Issues
```
Error: No signatures found matching the expected signature
```
**Solution**:
- Use Stripe CLI for local testing
- Verify webhook secret matches
- Check webhook endpoint is accessible

---

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Run tests: `npm test`
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style
- Follow TypeScript strict mode
- Use ESLint and Prettier configurations
- Write descriptive commit messages
- Add tests for new features
- Update documentation

### Testing Requirements
- Unit tests for services
- Integration tests for controllers
- Minimum 80% code coverage

---

## 📄 License

This project is licensed under the ISC License.

---

## 👥 Authors

**Your Name** - Initial work

---

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript
- [Clerk](https://clerk.com/) - Authentication platform
- [Stripe](https://stripe.com/) - Payment processing
- [Resend](https://resend.com/) - Email service

---

## 📞 Support

For support, email support@yourdomain.com or open an issue in the repository.

---

**Happy Coding! 🚀**
