# AIMS++ – Academic Information Management System

<div align="center">

![AIMS++ Banner](https://via.placeholder.com/1200x300/4F46E5/FFFFFF?text=AIMS%2B%2B+Academic+Information+Management+System)

**A comprehensive role-based academic management platform for IIT Ropar**

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-316192?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)

[Features](#-features) •
[Installation](#-installation) •
[Documentation](#-documentation) •
[Usage](#-usage) •
[Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Usage](#-usage)
- [Test Accounts](#-test-accounts)
- [Project Structure](#-project-structure)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎓 About

**AIMS++** (Academic Information Management System) is a modern, full-stack web application designed for **IIT Ropar** to streamline academic workflows across multiple user roles. Built with cutting-edge technologies, AIMS++ provides a unified platform for students, instructors, advisors, and administrators to manage courses, enrollments, grades, and academic records efficiently.

### 🎯 Key Highlights

- **Multi-role authentication** with secure session management
- **Real-time academic record tracking** with automated CGPA calculations
- **Course enrollment workflow** with advisor approval system
- **OTP-based email verification** for secure student signup
- **Comprehensive admin dashboard** for user and academic management
- **Responsive design** optimized for desktop and mobile devices

---

## ✨ Features

### 👨‍🎓 Student Portal
- **Course Enrollment**: Browse available courses and submit enrollment requests
- **Academic Records**: View semester-wise grades, CGPA, and credit history
- **Timetable Management**: Access personalized class schedules
- **Profile Management**: Update personal information and contact details

### 👨‍🏫 Instructor Portal
- **Course Management**: Create and manage course offerings
- **Grade Submission**: Enter and update student grades efficiently
- **Student Roster**: View enrolled students and their academic performance
- **Analytics Dashboard**: Track course statistics and student progress

### 👔 Advisor Portal
- **Advisee Management**: Monitor assigned students' academic progress
- **Enrollment Approvals**: Review and approve/reject course enrollment requests
- **Credit Limit Validation**: Automatic checks for credit overload violations
- **Performance Tracking**: View advisee CGPA trends and status bands
- **Activity Feed**: Stay updated with recent enrollments and grade changes

### 🔧 Admin Portal
- **User Management**: Create, update, and manage all user accounts
- **Department & Program Management**: Configure academic structures
- **Course Catalog**: Maintain course database and prerequisites
- **Academic Session Control**: Manage semesters and session settings
- **Signup Approvals**: Review and approve student signup requests
- **System Configuration**: Control application-wide settings

### 🔐 Authentication & Security
- **NextAuth Integration**: Secure session-based authentication
- **OTP Email Verification**: Domain-restricted signup (iitrpr.ac.in)
- **Role-Based Access Control**: Granular permissions per user type
- **Bcrypt Password Hashing**: Industry-standard password security

---

## 🛠 Tech Stack

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with Server Components
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Modern utility-first styling
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library

### Backend
- **[Prisma ORM](https://www.prisma.io/)** - Type-safe database client
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database (Supabase)
- **[NextAuth.js](https://next-auth.js.org/)** - Authentication solution
- **[Nodemailer](https://nodemailer.com/)** - Email delivery for OTP

### Developer Tools
- **[ESLint 9](https://eslint.org/)** - Code quality and consistency
- **[Prisma Studio](https://www.prisma.io/studio)** - Visual database browser
- **[TSX](https://github.com/esbuild-kit/tsx)** - TypeScript execution engine

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.18 or newer ([Download](https://nodejs.org/))
- **npm** 10 or newer (comes with Node.js)
- **PostgreSQL** database (we recommend [Supabase](https://supabase.com/) for easy setup)
- **Git** for version control

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/AIMS_plus_plus.git
cd AIMS_plus_plus
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root (see [Environment Configuration](#-environment-configuration) below).

### 4. Set Up Database Client

```bash
# Generate Prisma client
npm run db:generate
```

### 5. Start Development Server

```bash
npm run dev
```

🎉 Your application should now be running at **http://localhost:3000**

---

## ⚙️ Environment Configuration

Create a `.env` (or `.env.local`) file in the project root with the following variables:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Pooled connection URL (used by Prisma Client)
DATABASE_URL="postgresql://user:password@host:port/database?pgbouncer=true"

# Direct connection URL (used for migrations)
DIRECT_URL="postgresql://user:password@host:port/database"

# ============================================
# NEXTAUTH CONFIGURATION
# ============================================
# Base URL of your application
NEXTAUTH_URL=http://localhost:3000

# Secret key for JWT encryption (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret_key_here

# ============================================
# EMAIL / SMTP CONFIGURATION
# ============================================
# SMTP server settings (example uses Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password

# ============================================
# APPLICATION SETTINGS
# ============================================
# Allowed email domain for student signup
ALLOWED_EMAIL_DOMAIN=iitrpr.ac.in

# OTP expiration time in minutes
OTP_EXPIRY_MINUTES=10
```

### 📝 Configuration Notes

- **Database URLs**: Get these from your [Supabase](https://supabase.com/) project settings
- **NEXTAUTH_SECRET**: Generate using `openssl rand -base64 32` in your terminal
- **Gmail App Password**: Create one at [Google Account Security](https://myaccount.google.com/security)

For detailed setup instructions, see:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration guide
- [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) - Authentication setup guide

---

## 🗄️ Database Setup

### Available Database Commands

```bash
# Generate Prisma Client (after schema changes)
npm run db:generate

# Push schema to database (development)
npm run db:push

# Create and run migrations (production)
npm run db:migrate

# Seed database with test data
npm run db:seed

# Open Prisma Studio (visual database browser)
npm run db:studio
```

### Database Schema Overview

The AIMS++ database includes **19+ interconnected models**:

- **User Management**: User, UserProfile, SignupRequest
- **Academic Structure**: Department, Program, Batch
- **Courses**: Course, CourseOffering, Enrollment, Grade
- **Sessions**: AcademicSession
- **Student Records**: StudentRecord (cached CGPA/credits)
- **Events & Feedback**: Event, Feedback
- **Finance**: Fee, FeePayment

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete schema documentation.

---

## 💻 Usage

### Development

```bash
# Start development server with hot-reload
npm run dev
```

Visit **http://localhost:3000** to view the application.

### Linting

```bash
# Run ESLint to check code quality
npm run lint
```

### Production Build

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

---

## 👥 Test Accounts

After running `npm run db:seed`, the following test accounts are available:

| Role       | Email                      | Portal Access            |
|------------|----------------------------|--------------------------|
| Admin      | admin@iitrpr.ac.in         | Full system control      |
| Instructor | instructor@iitrpr.ac.in    | Course & grade management|
| Advisor    | advisor@iitrpr.ac.in       | Advisee management       |
| Student 1  | student1@iitrpr.ac.in      | Student portal           |
| Student 2  | student2@iitrpr.ac.in      | Student portal           |

**Login Flow**: Use the email above → Enter any password → Follow the OTP email verification (check your SMTP settings).

---

## 📁 Project Structure

```
AIMS++/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── signin/          # Login page
│   │   │   └── signup/          # Student signup with OTP
│   │   ├── admin/               # Admin portal
│   │   │   └── (portal)/        # Admin dashboard & management
│   │   ├── instructor/          # Instructor portal
│   │   │   └── (portal)/        # Course & grade management
│   │   ├── advisor/             # Advisor portal
│   │   │   └── (portal)/        # Advisee & enrollment management
│   │   ├── student/             # Student portal
│   │   │   └── (portal)/        # Courses, records, timetable
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # NextAuth endpoints
│   │   │   ├── admin/           # Admin APIs
│   │   │   ├── instructor/      # Instructor APIs
│   │   │   ├── advisor/         # Advisor APIs
│   │   │   └── student/         # Student APIs
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── globals.css          # Global styles
│   ├── components/              # Reusable UI components
│   ├── lib/                     # Shared utilities
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── db.ts                # Prisma client instance
│   │   ├── email.ts             # Email sending utilities
│   │   └── otp.ts               # OTP generation/validation
│   └── services/                # Business logic services
│       └── studentRecordService.ts  # Student record caching
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Database seeder
├── public/                      # Static assets
├── .env                         # Environment variables (not in Git)
├── package.json                 # Dependencies and scripts
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

---

## 📚 Documentation

Comprehensive documentation is available in the following files:

| Document | Description |
|----------|-------------|
| [DATABASE_SETUP.md](./DATABASE_SETUP.md) | Complete database schema and migration guide |
| [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) | Authentication configuration and email setup |
| [ADVISOR_IMPLEMENTATION.md](./ADVISOR_IMPLEMENTATION.md) | Advisor portal features and APIs |
| [STUDENT_RECORD_IMPLEMENTATION.md](./STUDENT_RECORD_IMPLEMENTATION.md) | Student record caching system |
| [SIGNUP_IMPLEMENTATION.md](./SIGNUP_IMPLEMENTATION.md) | OTP-based signup workflow |

---

## 🚢 Deployment

### Deployment Checklist

- [ ] Configure production `DATABASE_URL` and `DIRECT_URL` (Supabase or other PostgreSQL host)
- [ ] Set production `NEXTAUTH_URL` to your deployed domain
- [ ] Generate new `NEXTAUTH_SECRET` for production
- [ ] Configure production SMTP provider (SendGrid, AWS SES, etc.)
- [ ] Update `ALLOWED_EMAIL_DOMAIN` if needed
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Build the application: `npm run build`
- [ ] Deploy to your hosting platform

### Recommended Hosting Platforms

- **[Vercel](https://vercel.com/)** - Optimal for Next.js applications (one-click deploy)
- **[Railway](https://railway.app/)** - Easy full-stack deployment with PostgreSQL
- **[AWS](https://aws.amazon.com/)** - Enterprise-grade scalability with EC2/RDS
- **[DigitalOcean](https://www.digitalocean.com/)** - App Platform with managed databases

### Vercel Deployment (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

Add environment variables in the Vercel dashboard under **Settings > Environment Variables**.

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and commit: `git commit -m 'Add amazing feature'`
4. **Push to your fork**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and TypeScript conventions
- Write clear, descriptive commit messages
- Update documentation for any new features
- Test your changes thoroughly before submitting
- Ensure `npm run lint` passes without errors

### Reporting Issues

If you find a bug or have a feature request, please [open an issue](https://github.com/your-username/AIMS_plus_plus/issues) with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Screenshots if applicable

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **IIT Ropar** - Project sponsor and primary use case
- **Next.js Team** - For the amazing framework
- **Prisma Team** - For the excellent ORM
- **Vercel** - For hosting and deployment platform
- All contributors who have helped improve AIMS++

---

## 📞 Support & Contact

For questions, suggestions, or support:

- **Issues**: [GitHub Issues](https://github.com/your-username/AIMS_plus_plus/issues)
- **Email**: support@iitrpr.ac.in
- **Documentation**: [Wiki](https://github.com/your-username/AIMS_plus_plus/wiki)

---

<div align="center">

**Made with ❤️ for IIT Ropar**

[⬆ back to top](#aims--academic-information-management-system)

</div>
