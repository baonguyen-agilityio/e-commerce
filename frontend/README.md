# LUXE - Premium E-commerce Frontend

A premium Next.js 14 e-commerce frontend with Clerk authentication, featuring a luxury-styled customer storefront and a full-featured admin panel.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Auth**: Clerk
- **UI**: shadcn/ui (customized luxury theme)
- **Styling**: Tailwind CSS 4
- **Data Fetching**: TanStack Query v5
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Icons**: Lucide React

## Features

### Customer Storefront
- Product catalog with search, filters, and pagination
- Product detail pages
- Shopping cart (slide-over sheet)
- Checkout with Stripe
- Order history

### Admin Panel
- Dashboard with sales analytics and charts
- Product management (CRUD)
- Category management (CRUD)
- Order management
- User management with admin promotion

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running on `http://localhost:3000`
- A Clerk account for authentication

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3001`.

### Clerk Setup

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy the publishable and secret keys to your `.env.local`
4. In Clerk Dashboard, configure the following:
   - Enable Email/Password authentication
   - Add custom claims for user metadata (for admin role)

### Admin Access

To access the admin panel:
1. Sign in with a user account
2. The backend must set the user's role to "admin" via the `/api/users/set-admin/:clerkId` endpoint
3. Navigate to `/admin`

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Sign in/up pages
│   │   ├── (store)/         # Customer-facing pages
│   │   └── (admin)/         # Admin panel pages
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   ├── store/           # Store components
│   │   └── admin/           # Admin components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and API client
│   └── types/               # TypeScript types
├── middleware.ts            # Auth middleware
└── tailwind.config.ts
```

## Design System

### Color Palette (Luxury Theme)
- **Primary**: Stone-900 (#1C1917)
- **Accent**: Gold (#CA8A04)
- **Background**: Stone-50 (#FAFAF9)

### Typography
- **Headings**: Poppins
- **Body**: Open Sans
- **Monospace**: JetBrains Mono (for prices)

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```
