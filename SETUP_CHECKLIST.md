# ✅ Phase 1 Setup Verification Checklist

Run these commands in PowerShell to complete and verify the setup:

## Step 1: Generate Prisma Client

```powershell
npm run db:generate
```

Expected: "✔ Generated Prisma Client"

## Step 2: Push Schema to Database

```powershell
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema."

## Step 3: Seed the Database

```powershell
npm run db:seed
```

Expected:

- ✅ 4 Users created
- ✅ 3 Departments
- ✅ 3 Programs
- ✅ Test data populated

## Step 4: Test Connection (Optional)

```powershell
npx tsx scripts/test-db.ts
```

Expected: "✅ All tests passed! Database is ready."

## Step 5: Open Prisma Studio (Optional)

```powershell
npm run db:studio
```

Expected: Opens browser at http://localhost:5555 with data viewer

---

## 🎯 What You Should Have Now

### Files Created/Modified:

- ✅ `prisma/schema.prisma` - Complete database schema (19 models, 8 enums)
- ✅ `src/lib/db.ts` - Prisma client singleton
- ✅ `prisma/seed.ts` - Comprehensive seed script
- ✅ `scripts/test-db.ts` - Connection test utility
- ✅ `DATABASE_SETUP.md` - Full documentation
- ✅ `.env` - Updated with DATABASE_URL and DIRECT_URL
- ✅ `package.json` - Added db:\* scripts

### Database Tables (19 total):

**Identity:**

- User, Student, Instructor, Advisor, AdminProfile
- OTPCode

**Organization:**

- Department, Program

**Academics:**

- AcademicSession, Course, CourseOffering, CourseMeeting
- Enrollment

**Features:**

- FeeReceipt
- FeedbackQuestion, CourseFeedbackResponse
- AcademicEvent

### Test Data Ready:

- 👤 Admin: `admin@iitrpr.ac.in` / password123
- 👨‍🏫 Instructor: `instructor@iitrpr.ac.in` / password123
- 🧑‍💼 Advisor: `advisor@iitrpr.ac.in` / password123
- 👨‍🎓 Student 1: `student1@iitrpr.ac.in` / password123
- 👩‍🎓 Student 2: `student2@iitrpr.ac.in` / password123

---

## ❌ If You Encounter Errors

### "Error: P1001: Can't reach database server"

→ Check DATABASE_URL in `.env` and ensure Supabase project is active

### "Prisma Client not found"

→ Run: `npm run db:generate`

### "Schema out of sync"

→ Run: `npx prisma db push`

### Seed fails with unique constraint

→ Run: `npx prisma migrate reset` (⚠️ wipes all data)
→ Then: `npm run db:seed`

---

## 🚀 Next Steps

Once verification is complete, proceed to **Phase 2** from [plan.txt](./plan.txt):

**Phase 2 – Auth, Roles, and OTP**

- Implement NextAuth configuration in src/lib/auth.ts with Prisma integration
- Extend next-auth.d.ts types for role and role-specific IDs
- Implement OTP/Reset flows backed by Prisma

---

## 📚 Quick Reference

**View data in browser:**

```powershell
npm run db:studio
```

**Reset everything:**

```powershell
npx prisma migrate reset
npm run db:seed
```

**Check schema sync:**

```powershell
npx prisma validate
npx prisma format
```

---

**Status: Ready for Phase 2! 🎉**
