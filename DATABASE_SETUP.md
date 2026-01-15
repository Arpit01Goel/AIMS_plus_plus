# Database Setup Documentation

## ✅ Phase 1 Complete: Foundation Setup

This document explains the database foundation that has been set up for AIMS++.

---

## 🏗️ What Was Built

### 1. **Prisma Schema** (`prisma/schema.prisma`)

A complete, production-ready database schema with:

#### **Identity & Authentication**

- `User` - Base user model with role field (STUDENT/INSTRUCTOR/ADVISOR/ADMIN)
- `OTPCode` - Database-backed OTP storage for password resets
- Role-specific profiles:
  - `Student` - Entry number, batch, program, department, advisor
  - `Instructor` - Title, department, official email
  - `Advisor` - Primary cohort, department, program
  - `AdminProfile` - Admin metadata and permissions

#### **Organizational Structure**

- `Department` - CSE, EE, ME, etc. with unique codes
- `Program` - B.Tech, M.Tech programs linked to departments

#### **Academic Models**

- `AcademicSession` - Semester tracking (2025-II, etc.)
- `Course` - Course master data (code, title, credits, LTPSC)
- `CourseOffering` - Specific instance of a course in a session
- `CourseMeeting` - Time slots and locations for course meetings
- `Enrollment` - Student enrollments with status, grades, attendance

#### **Supporting Features**

- `FeeReceipt` - Fee payments and receipt storage
- `FeedbackQuestion` & `CourseFeedbackResponse` - Course feedback system
- `AcademicEvent` - Calendar events (exams, holidays, deadlines)

**Key Features:**

- ✅ Full referential integrity with cascading deletes
- ✅ Proper indexing for common queries
- ✅ Audit fields (createdBy, updatedBy) for sensitive operations
- ✅ Enums for status fields (no magic strings)
- ✅ Support for connection pooling (DATABASE_URL vs DIRECT_URL)

---

### 2. **Prisma Client Helper** (`src/lib/db.ts`)

A singleton Prisma Client instance that:

- Prevents multiple connections in development (hot-reload safe)
- Enables query logging in development
- Provides a single import point for all DB operations

**Usage:**

```typescript
import { prisma } from '@/lib/db';

// Query users
const users = await prisma.user.findMany();

// Create a student
const student = await prisma.student.create({
  data: { ... }
});
```

---

### 3. **Seed Script** (`prisma/seed.ts`)

Comprehensive seed data for testing and development:

**Creates:**

- ✅ 4 test users (1 per role)
- ✅ 3 departments (CSE, EE, ME)
- ✅ 3 programs (BTECH-CSE, BTECH-EE, MTECH-DS)
- ✅ 1 academic session (2025-II)
- ✅ 3 courses with offerings and meeting schedules
- ✅ 4 enrollments across 2 students
- ✅ 2 fee receipts
- ✅ 3 academic events
- ✅ 2 feedback questions

**Test Credentials** (all use password: `password123`):

- 👤 **Admin:** `admin@iitrpr.ac.in`
- 👨‍🏫 **Instructor:** `instructor@iitrpr.ac.in`
- 🧑‍💼 **Advisor:** `advisor@iitrpr.ac.in`
- 👨‍🎓 **Student 1:** `student1@iitrpr.ac.in` (Amit Verma, 2023CSB1001)
- 👩‍🎓 **Student 2:** `student2@iitrpr.ac.in` (Sneha Patel, 2023CSB1002)

---

### 4. **Environment Configuration**

**Updated `.env`:**

```env
# Connection pooler URL (for application queries)
DATABASE_URL="postgresql://postgres.wpiuspwwsovpjskeftxo:...@pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection URL (for migrations)
DIRECT_URL="postgresql://postgres.wpiuspwwsovpjskeftxo:...@pooler.supabase.com:5432/postgres"
```

**Why two URLs?**

- `DATABASE_URL` → Uses PgBouncer (port 6543) for connection pooling in app
- `DIRECT_URL` → Direct connection (port 5432) for migrations (PgBouncer doesn't support all migration operations)

---

### 5. **NPM Scripts** (added to `package.json`)

```json
{
  "scripts": {
    "db:generate": "prisma generate", // Generate Prisma Client
    "db:migrate": "prisma migrate dev", // Create & apply migration
    "db:push": "prisma db push", // Push schema without migration
    "db:seed": "tsx prisma/seed.ts", // Run seed script
    "db:studio": "prisma studio" // Open Prisma Studio GUI
  }
}
```

---

## 🚀 How to Use

### Initial Setup (Done!)

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema to Supabase
npx prisma db push

# 3. Seed the database
npm run db:seed
```

### During Development

**View your data:**

```bash
npm run db:studio
# Opens browser at http://localhost:5555
```

**Add a new model or field:**

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (for quick prototyping)
   OR `npm run db:migrate` (for production-ready migrations)
3. Run `npm run db:generate` to update Prisma Client

**Reset and re-seed:**

```bash
npx prisma migrate reset  # ⚠️ Wipes all data!
npm run db:seed           # Repopulates test data
```

---

## 📊 Schema Overview

### Entity Relationships

```
User (1:1) → Student → (M:1) → Program → (M:1) → Department
                   ↓
                   (1:M) → Enrollment → (M:1) → CourseOffering
                                                      ↓
                                                Course ← (M:1) → AcademicSession
                                                      ↓
                                                CourseMeeting
```

### Key Indexes

- `User.email` - Fast login lookups
- `Student.entryNumber` - Student ID lookups
- `Enrollment.[studentId, offeringId]` - Enrollment queries
- `CourseOffering.academicSessionId` - Current semester courses
- `AcademicEvent.[startDate, visibility]` - Calendar queries

---

## 🔐 Security Notes

1. **Passwords**: All test users use bcrypt-hashed passwords
2. **OTP Storage**: OTPs are stored in DB (not in-memory), with expiry tracking
3. **Audit Fields**: `createdBy` and `updatedBy` track who made changes
4. **Cascading Deletes**: Deleting a User cascades to their profile and related data
5. **Connection Pooling**: PgBouncer prevents connection exhaustion

---

## 🎯 Next Steps (Per Plan)

✅ **Phase 1 - Foundation** (COMPLETE)

- [x] Prisma schema
- [x] Prisma client helper
- [x] Seed script
- [x] Database connection

⬜ **Phase 2 - Auth Integration**

- [ ] Update NextAuth to use Prisma User model
- [ ] Extend next-auth.d.ts types for roles
- [ ] Replace in-memory OTP with Prisma OTPCode
- [ ] Wire role into JWT/session callbacks

⬜ **Phase 3 - Middleware & Layouts**

- [ ] Create middleware.ts for route protection
- [ ] Update portal layouts with role checks

⬜ **Phase 4 - Student APIs**

- [ ] Implement /api/profile, /api/records, etc.
- [ ] Replace hard-coded data in student portal pages

⬜ **Phase 5 - Faculty/Admin Scaffolding**

- [ ] Implement /api/instructor/_, /api/advisor/_, /api/admin/\*

⬜ **Phase 6 - Hardening**

- [ ] Add validation rules
- [ ] Tighten error handling

---

## 🐛 Troubleshooting

**Issue: "Can't reach database server"**

```bash
# Check your DATABASE_URL in .env
# Verify Supabase project is active
# Try: npx prisma db pull  (to test connection)
```

**Issue: "Seed script fails"**

```bash
# Clear database first
npx prisma migrate reset
npm run db:seed
```

**Issue: "Prisma Client not found"**

```bash
npm run db:generate
```

**Issue: "Migration conflicts"**

```bash
# During development, use:
npx prisma db push  # Skips migration history
```

---

## 📚 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Supabase Postgres](https://supabase.com/docs/guides/database)
- [NextAuth + Prisma](https://next-auth.js.org/adapters/prisma)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

## ✨ Summary

You now have a **complete, production-ready database foundation** with:

- ✅ Multi-role user system (Student, Instructor, Advisor, Admin)
- ✅ Full academic domain model (courses, enrollments, timetable)
- ✅ Supporting features (fees, feedback, calendar, OTP)
- ✅ Test data for all roles
- ✅ Type-safe Prisma Client
- ✅ Proper indexing and relationships

**The database is ready!** Next: wire it into NextAuth and build the APIs. 🚀
