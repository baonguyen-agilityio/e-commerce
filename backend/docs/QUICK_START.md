# Quick Start Guide

Get your e-commerce backend up and running in 5 minutes! ⚡

---

## 📦 Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ running
- Accounts: Clerk, Stripe, Resend

---

## 🚀 Setup (3 steps)

### 1️⃣ Install
```bash
cd backend
npm install
```

### 2️⃣ Configure
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3️⃣ Database
```bash
# Create database
createdb e_commerce

# Run migrations
npm run migration:run

# Seed data (optional)
npm run seed
```

---

## 🏃 Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build
npm start
```

Server: **http://localhost:5001**

---

## 🔑 Essential API Endpoints

```bash
# Products (Public)
GET /api/v1/products

# Product Details (Public)
GET /api/v1/products/:publicId

# Cart (Auth Required)
GET /api/v1/cart
POST /api/v1/cart/items

# Checkout (Auth Required)
POST /api/v1/orders

# My Orders (Auth Required)
GET /api/v1/orders/me
```

**Auth Header:**
```
Authorization: Bearer <clerk-jwt-token>
```

---

## 🧪 Test

```bash
# Run tests
npm test

# Coverage
npm run test:coverage
```

---

## 📚 Full Docs

- [README.md](../README.md) - Complete documentation
- [API Documentation](./api-documentation.md) - All endpoints
- [Architecture](../ARCHITECTURE_IDS.md) - System design

---

## 🆘 Troubleshooting

**Database connection failed?**
```bash
# Check PostgreSQL
pg_isready

# Verify credentials in .env
```

**Port already in use?**
```bash
# Change port in .env
PORT=5002
```

**Environment variables not loading?**
```bash
# Ensure .env exists
ls -la .env

# Restart dev server
npm run dev
```

---

## 🎯 Common Tasks

### Create Migration
```bash
npm run migration:create -- src/migrations/YourMigration
```

### Revert Migration
```bash
npm run migration:revert
```

### Reset Database
```bash
# Revert all
npm run migration:revert
# (repeat until no more migrations)

# Re-run
npm run migration:run

# Re-seed
npm run seed
```

---

**Happy coding! 🚀**

For detailed documentation, see [README.md](../README.md)
