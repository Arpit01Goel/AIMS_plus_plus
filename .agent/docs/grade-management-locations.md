# Where Enrollment Grades Can Be Set

Based on the AIMS++ codebase analysis, here's a comprehensive overview of where enrollment grades can be set across all portals:

---

## 🎯 Summary

Grades can be set/modified in **2 main locations**:

1. **Instructor Portal** - Primary grade entry point
2. **Admin Portal** - Grade verification and management

Students can only **view** their grades, not modify them.

---

## 📍 Detailed Breakdown

### 1. **INSTRUCTOR PORTAL** 👨‍🏫

**Location:** `/instructor/grades`

**File:** `src/app/instructor/(portal)/grades/page.tsx`

**Capabilities:**
- ✅ View all students enrolled in their courses
- ✅ Set individual student grades
- ✅ Bulk update grades via CSV upload
- ✅ Save grades as draft (without submitting)
- ✅ Submit final grades for verification
- ✅ Download grade templates and export grades

**API Endpoints Used:**

#### a) **Get Grades** - `GET /api/grades?offeringId={id}`
- Fetches list of students and their current grades for a specific course offering
- Returns: `{ course, students: [{ enrollmentId, studentId, entryNumber, name, grade }] }`

#### b) **Update Single Grade** - `POST /api/grades`
```json
{
  "enrollmentId": "string",
  "grade": "A|A-|B|B-|C|C-|D|E|F|I|W|S|U"
}
```
- Updates grade for one student
- Instructor must own the course offering
- Automatically sets `updatedById` to instructor's user ID

#### c) **Bulk Update Grades** - `PUT /api/grades`
```json
{
  "offeringId": "string",
  "grades": [
    { "enrollmentId": "string", "grade": "string" },
    ...
  ]
}
```
- Updates multiple grades at once
- Useful for CSV imports
- Doesn't require all students to have grades

#### d) **Submit Grades for Verification** - `PATCH /api/grades`
```json
{
  "offeringId": "string",
  "grades": [
    { "enrollmentId": "string", "grade": "string" },
    ...
  ]
}
```
- Final submission of grades
- **Validates that ALL enrolled students have grades**
- Uses transaction to ensure atomicity
- Returns error if any student is missing a grade

**Grade Options Available:**
- A+, A, A-, B+, B, B-, C+, C, C-, D, E, F
- I (Incomplete), W (Withdrawn), S (Satisfactory), U (Unsatisfactory)

---

### 2. **ADMIN PORTAL** 🔐

**Location:** `/admin/grades`

**File:** `src/app/admin/(portal)/grades/page.tsx`

**Capabilities:**
- ✅ View all submitted grades across all courses
- ✅ Verify grades submitted by instructors
- ✅ Freeze grades (make them final)
- ✅ Generate transcripts
- ✅ Bulk upload grade corrections
- ✅ Export grade reports

**Status Workflow:**
1. **PND (Pending)** - Submitted by instructor, awaiting verification
2. **VER (Verified)** - Approved by admin
3. **FRZ (Frozen)** - Finalized, cannot be changed

**API Endpoints:**
Currently uses the same `/api/grades` endpoints, but with admin permissions.

**Note:** The admin page appears to be mostly UI-complete but may need additional backend APIs for verification/freezing functionality.

---

### 3. **STUDENT PORTAL** 👨‍🎓

**Location:** `/student/records`

**File:** `src/app/student/(portal)/records/page.tsx`

**Capabilities:**
- ✅ **View only** - Students can see their grades
- ❌ **Cannot modify** - No grade editing capabilities
- ⚠️ Displays disclaimer: "Some grades may be pending approval by the senate"

**API Endpoint:** `GET /api/student/records`
- Returns complete academic record with CGPA, SGPA, and course grades
- Automatically calculates grade points and credits

---

## 🔐 Access Control

### Instructor (`INSTRUCTOR` role)
- Can only set grades for courses they teach
- Verification: `offering.instructorId === user.instructor.id`
- Cannot modify grades for other instructors' courses

### Admin (`ADMIN` role)
- Can view and verify all grades
- Can freeze grades (pending implementation)
- System-wide access

### Student (`STUDENT` role)
- **Read-only access** to their own grades
- No modification capabilities

---

## 📊 Database Schema

**Enrollment Table** (relevant fields):
```prisma
model Enrollment {
  id                   String    
  grade                String?         // The actual grade (nullable)
  status               EnrollmentStatus
  updatedById          String?         // Who last updated
  updatedBy            User?           
  // ... other fields
}
```

**Grade Enum:**
```prisma
enum Grade {
  A, A_MINUS, B, B_MINUS, C, C_MINUS,
  D, E, F, I, W, S, U
}
```

---

## 🔄 Grade Setting Workflow

### Typical Flow:

1. **Instructor** enters grades at `/instructor/grades`
   - Uses `POST /api/grades` for individual updates
   - Uses `PUT /api/grades` for bulk updates
   - Can save as draft (partial completion)

2. **Instructor** submits final grades
   - Uses `PATCH /api/grades`
   - System validates ALL students have grades
   - Marks as ready for admin verification

3. **Admin** verifies grades at `/admin/grades`
   - Reviews submitted grades
   - Verifies accuracy
   - Freezes grades (makes them final)

4. **Student** views grades at `/student/records`
   - Sees verified grades
   - CGPA/SGPA automatically calculated
   - Can see grade points and credits

---

## 📝 Important Notes

1. **Audit Trail**: All grade updates track `updatedById` to maintain accountability

2. **Grade Points Calculation**:
   - A = 10, A- = 9, B = 8, B- = 7, C = 6, C- = 5
   - D = 4, E = 2, F = 0
   - I, W, S, U = 0 (special cases)

3. **Validation**:
   - Grade submission requires ALL enrolled students to have grades
   - Instructors can only modify grades for their own courses
   - Grades can be updated multiple times before submission

4. **CSV Support**:
   - Template download available
   - Bulk upload via CSV
   - Format: `enrollmentId,studentId,entryNumber,name,grade`

---

## 🚀 API Routes Summary

| Endpoint | Method | Purpose | Role Required |
|----------|--------|---------|---------------|
| `/api/grades?offeringId=X` | GET | Get grades for offering | INSTRUCTOR |
| `/api/grades` | POST | Update single grade | INSTRUCTOR |
| `/api/grades` | PUT | Bulk update grades | INSTRUCTOR |
| `/api/grades` | PATCH | Submit grades | INSTRUCTOR |
| `/api/student/records` | GET | Get student's grades | STUDENT |

---

## 📂 File Locations

### Frontend Pages:
- **Instructor Grades**: `src/app/instructor/(portal)/grades/page.tsx`
- **Admin Grades**: `src/app/admin/(portal)/grades/page.tsx`
- **Student Records**: `src/app/student/(portal)/records/page.tsx`

### API Routes:
- **Grades API**: `src/app/api/grades/route.ts`
- **Student Records API**: `src/app/api/student/records/route.ts`

### Services:
- **Grade Calculation**: `src/services/student-record.service.ts`

---

**Last Updated:** 2026-01-21
