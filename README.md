# AIMS++ Next.js Boilerplate

This repository contains a ready-to-extend Next.js 16 project configured with the App Router, TypeScript, Tailwind CSS v4, ESLint, and the default import alias `@/*`.

## Prerequisites

## Getting Started

1. Install dependencies: `npm install`
2. Launch the dev server: `npm run dev`
3. Visit http://localhost:3000 to inspect the starter page

# AIMS++ – Academic Information Management System

This repository contains the AIMS++ web application for IIT Ropar – a role‑based academic information system with student, instructor, advisor, and admin workflows built on Next.js and Prisma.

## 1. Tech Stack

- Next.js 16 App Router (TypeScript, React 19)
- Prisma ORM with PostgreSQL (Supabase)
- Tailwind CSS v4
- NextAuth for authentication
- Nodemailer for email/OTP delivery

## 2. Prerequisites

- Node.js 18.18 or newer
- npm 10 or newer
- PostgreSQL database (Supabase recommended)

## 3. Environment Configuration

Create a `.env` (or `.env.local`) file in the project root and configure at least:

```env
# Database
DATABASE_URL="postgres://..."      # pooled connection (app)
DIRECT_URL="postgres://..."        # direct connection (migrations)

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret

# Email / SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# App settings
ALLOWED_EMAIL_DOMAIN=iitrpr.ac.in
OTP_EXPIRY_MINUTES=10
```

See DATABASE_SETUP.md and AUTHENTICATION_SETUP.md for full details.

## 4. Installation & Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# Seed test data (users, departments, programs, courses, etc.)
- `npm run lint` – run ESLint across the project
```

Optional utilities:

```bash
# Open Prisma Studio (data browser)
- `npm run build` – create an optimized production build

# Reset database (development only)
- `npm run start` – serve the production build locally
npm run db:seed
```

## 5. Running the App

```bash
# Development
npm run dev

# Lint
npm run lint

# Production build
npm run build
npm run start
```

The app runs at http://localhost:3000.

## 6. Test Accounts (Seed Data)

After `npm run db:seed`, the following users are available (password: `password123`):

- Admin: admin@iitrpr.ac.in
- Instructor: instructor@iitrpr.ac.in
- Advisor: advisor@iitrpr.ac.in
- Student 1: student1@iitrpr.ac.in
- Student 2: student2@iitrpr.ac.in

Use these to explore the different portals.

## 7. Major Features

- **Multi‑role access**: Student, Instructor, Advisor, Admin with NextAuth‑based sessions.
- **Advisor portal**:
  - View advisee list with CGPA, credits, and status bands.
  - Review and approve/reject enrollments with credit‑limit checks.
  - Dashboard with pending approvals, credit violations, and recent activity.
- **Student records**:
  - Cached StudentRecord model storing CGPA, credits, and semester‑wise data.
  - Automatic recalculation on grade/enrollment updates for fast records pages.
- **Student signup**:
  - OTP‑based email verification restricted to iitrpr.ac.in.
  - SignupRequest workflow with admin review and approval APIs.
- **Database foundation**:
  - 19+ models covering users, academics (courses, offerings, enrollments, sessions), feedback, fees, and events.

For deeper technical details, see:

- DATABASE_SETUP.md – schema and DB workflows
- AUTHENTICATION_SETUP.md – auth and email configuration
- ADVISOR_IMPLEMENTATION.md – advisor APIs and pages
- STUDENT_RECORD_IMPLEMENTATION.md – student record caching
- SIGNUP_IMPLEMENTATION.md – signup + OTP + admin approval

## 8. Project Layout

- src/app – Next.js App Router routes (auth, portals, APIs)
- src/lib – shared helpers (auth, db, email, otp, tokens)
- src/services – domain services (student record, etc.)
- prisma/schema.prisma – database schema
- prisma/seed.ts – database seed script

## 9. Deployment Checklist (High‑Level)

- Configure production DATABASE_URL and DIRECT_URL.
- Set production NEXTAUTH_URL and NEXTAUTH_SECRET.
- Configure a production‑grade SMTP provider (e.g., SendGrid).
- Run `npm run build` and `npm run start` behind HTTPS.

## Tech Stack

- Next.js 16 App Router + TypeScript
- React 19 with the default Server Components setup
- Tailwind CSS v4 with the new `@tailwindcss/postcss` pipeline
- ESLint 9 + `eslint-config-next` for zero-config linting

## Project Structure Highlights

- `src/app/layout.tsx` – global metadata, font loading, and shared layout shell
- `src/app/page.tsx` – default landing page with hero/content sections
- `src/app/globals.css` – Tailwind layer declarations and base styles
- `tailwind.config.ts` – shared design tokens and content paths
- `tsconfig.json` – path alias `@/*` for cleaner imports

## Next Steps

1. Replace the placeholder copy and sections in `src/app/page.tsx`
2. Add API routes under `src/app/api` if server-side endpoints are needed
3. Integrate CI to run `npm run lint` and `npm run build` before deployment
