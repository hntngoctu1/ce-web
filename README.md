# Creative Engineering Website

A modern, production-ready B2B industrial company website built with Next.js 14, featuring a comprehensive product catalog, blog/CMS, and admin panel.

## ✅ CURRENT STATUS (12/12/2025)

**🎉 100% COMPLETE & READY TO TEST!**

- ✅ All code implemented
- ✅ CSS syntax fixed
- ✅ Dev server running at `http://localhost:3000`
- ✅ Database seeded with sample data
- ✅ Admin, Editor, and Customer accounts ready

**📖 Quick Start Guides:**

- **START_NOW.md** - 3-step quick test guide
- **READY_TO_TEST.md** - Comprehensive testing instructions
- **TEST_INSTRUCTIONS.md** - Feature-by-feature testing
- **FIX_SUMMARY.md** - Latest fix details

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (App Router, React Server Components)
- **Language**: TypeScript
- **Styling**: TailwindCSS, shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with role-based access control
- **Internationalization**: next-intl (English + Vietnamese)
- **Form Handling**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query

## 📁 Project Structure

```
ce-website/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed data
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── admin/         # Admin dashboard & CRUD (Products, Blog)
│   │   ├── api/           # API routes (Auth, Upload, Checkout)
│   │   ├── dashboard/     # Customer dashboard
│   │   ├── envision/      # Envision page
│   │   ├── engage/        # Engage page
│   │   ├── entrench/      # Entrench page
│   │   ├── menu/          # Industrial & Product pages
│   │   ├── product/       # Product detail pages
│   │   ├── blog/          # Blog listing & detail
│   │   ├── checkout/      # Order checkout
│   │   ├── contact/       # Contact page
│   │   └── login/         # Authentication
│   ├── components/        # React components
│   │   ├── admin/         # Admin forms
│   │   ├── cart/          # Shopping cart UI
│   │   ├── layout/        # Header, Footer, etc.
│   │   ├── product/       # Product cards & filters
│   │   ├── sections/      # Landing page sections
│   │   └── ui/            # shadcn/ui components
│   ├── i18n/              # Internationalization
│   ├── lib/               # Utilities & configurations
│   └── styles/            # Global styles & design tokens
├── public/                # Static assets & uploads
└── ...config files
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies:**

   ```bash
   cd ce-website
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Set up the database:**

   ```bash
   npm run db:push      # Push schema to database
   npm run db:seed      # Seed initial data
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Demo Credentials

- **Admin**: admin@ce.com.vn / admin123
- **Customer**: customer@example.com / customer123

## 📄 Key Features

### Public Pages

- **Home**: Hero, services carousel, case studies, partners
- **ENVISION**: Company vision and innovation
- **ENGAGE**: Collaboration process
- **ENTRENCH**: Long-term partnership & support
- **Industrial**: Industry category slider (7 categories)
- **Products**: Filterable product catalog with pagination
- **Product Detail**: Full specs, images, related products
- **Blog**: News and insights with rich text content
- **Contact**: Contact form with office locations

### E-commerce Features

- **Shopping Cart**: Real-time cart management
- **Checkout**: Order placement with COD/Bank Transfer
- **Order Tracking**: Customer dashboard for order status

### Customer Features

- User registration and authentication
- Personal dashboard with order history
- Loyalty points system
- Profile management

### Admin CMS

- **Dashboard**: Stats and recent activity
- **Products**: Full CRUD with images, specs, pricing, status
- **Blog**: Create and edit posts with cover images
- **Uploads**: Local file upload handler for images
- **Messages**: View contact form submissions

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push schema to database
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## 📊 Database Schema

Key models:

- **User**: Authentication & roles (Admin, Editor, Customer)
- **Product**: Full product catalog with images & specs
- **Order**: E-commerce orders with line items
- **BlogPost**: Blog content with categories & tags
- **ContactMessage**: Contact form submissions

## 🌐 Internationalization

The site supports English and Vietnamese:

- Language files in `src/i18n/messages/`
- Locale detection via cookies and headers
- All public content is bilingual

## 🚀 Deployment

The app is ready for deployment on Vercel, Docker, or any Node.js hosting.

### Production Environment Variables

```env
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="https://your-domain.com"
```

## 📄 License

Proprietary - Creative Engineering © 2024
