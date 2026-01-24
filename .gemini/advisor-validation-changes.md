# Advisor Field Validation Changes

## Summary
Implemented mandatory advisor field validation for student bulk uploads with email-based identification to avoid name clashes.

## Changes Made

### 1. Backend API Changes

#### File: `src/app/api/admin/bulk-upload/route.ts`
- **Modified `findAdvisorId()` function**:
  - Added `isRequired` parameter (defaults to `false`)
  - Made advisor mandatory for STUDENT role
  - Prioritized email-based lookup over name-based lookup
  - Added validation to check if instructor has `isAdvisor` flag set to `true`
  - Improved error messages to guide users:
    - If advisor not provided for student: "Advisor is required for students. Please provide advisor email (recommended) or name."
    - If instructor exists but not marked as advisor: "Instructor exists but is not marked as an advisor. Please contact admin to update their advisor status."
    - If multiple advisors found by name: "Multiple advisors found matching [name]. Please use email instead. Found: [emails]"
    - If advisor not found: "Advisor not found. Please use the advisor's email address to avoid ambiguity."

- **Updated validation logic**:
  - Line 227: Added `isStudent` check to determine if advisor is required
  - Line 228: Pass `isRequired=true` for students when calling `findAdvisorId()`

#### File: `src/app/api/admin/bulk-upload/validate/route.ts`
- **Applied same changes as route.ts**:
  - Updated `findAdvisorId()` function with same logic
  - Fixed role check from `'ADVISOR'` to `'INSTRUCTOR'` (ADVISOR role doesn't exist in schema)
  - Made advisor validation mandatory for students
  - Added proper error handling for student vs non-student roles

### 2. Frontend Documentation Changes

#### File: `src/app/admin/(portal)/users/page.tsx`
- **Updated CSV Help Modal**:
  - Changed advisor field from "Optional" to "Required for STUDENT" (orange badge)
  - Updated description: "Advisor's email (RECOMMENDED) or name. Must be an instructor with advisor role. Leave empty for instructors."
  - Updated example to show email preference: "advisor@iitrpr.ac.in (preferred)"
  
- **Updated Important Notes section**:
  - Changed from "CRITICAL" to "MANDATORY" for advisor field
  - Added clear guidance: "The advisor field is REQUIRED for STUDENTS. Use advisor's email address (recommended) to avoid name clashes."
  - Added new note: "The advisor must exist in the system as an instructor with advisor role. Check the instructors list to verify."

## How Advisor Identification Works

### Priority Order:
1. **Email lookup (RECOMMENDED)** - Most reliable, unique identifier
   - Searches for instructor with matching email (case-insensitive)
   - Checks if instructor has `isAdvisor = true`
   
2. **Name lookup (Fallback)** - Less reliable due to potential duplicates
   - Searches for instructors with names containing the input (case-insensitive)
   - Filters to only those with `isAdvisor = true`
   - If multiple matches found, returns error with list of emails
   - If single match found, uses that advisor

### Validation Rules:
- **For STUDENT role**: Advisor field is MANDATORY
- **For INSTRUCTOR/ADMIN roles**: Advisor field is optional (should be left empty)
- **Advisor must**:
  - Exist in the system as a User with role='INSTRUCTOR'
  - Have an Instructor profile with `isAdvisor = true`

## Database Schema Reference

```prisma
model Instructor {
  id            String   @id @default(cuid())
  userId        String   @unique
  title         String?
  officialEmail String?
  
  // Advisor-related fields
  isAdvisor     Boolean  @default(false)  // ← This must be true
  primaryCohort Int?
  advisorNotes  String?
  
  // Relations
  advisees Student[] @relation("InstructorAdvisingStudents")
  ...
}

model Student {
  id          String   @id @default(cuid())
  ...
  advisor     Instructor? @relation("InstructorAdvisingStudents", fields: [advisorId], references: [id])
  advisorId   String?  // ← This gets populated from CSV
  ...
}
```

## CSV Format Example

### Correct Format (Student with Email):
```csv
name,email,password,role,entryNumber,batch,phone,address,department,program,advisor,title,officialEmail
John Doe,student@iitrpr.ac.in,password123,STUDENT,2024CSB1001,2024,+91-9876543210,Hostel A,CSE,BTECH-CSE,advisor@iitrpr.ac.in,,
```

### Correct Format (Instructor - no advisor):
```csv
name,email,password,role,entryNumber,batch,phone,address,department,program,advisor,title,officialEmail
Dr. Jane Smith,instructor@iitrpr.ac.in,password123,INSTRUCTOR,,,,,CSE,,,Dr.,instructor@iitrpr.ac.in
```

## Important Notes for Users

1. **Always use email for advisor field** when uploading students to avoid ambiguity
2. **Verify advisor exists** in the instructor list before uploading
3. **Ensure advisor has advisor role** - not all instructors are advisors
4. **Leave advisor field empty** for instructors and admins
5. **Check validation preview** before confirming upload to catch errors early

## Known Issues & Next Steps

### TypeScript Lint Errors (Expected)
The following TypeScript errors are currently showing:
- `Property 'isAdvisor' does not exist on type 'Instructor'`

**Cause**: The Prisma client needs to be regenerated after schema changes.

**Resolution**: 
1. Stop the development server
2. Run: `npx prisma generate`
3. Restart the development server

The errors will disappear once the Prisma client is regenerated with the updated schema that includes the `isAdvisor` field.

## Testing Checklist

- [ ] Upload CSV with student having valid advisor email
- [ ] Upload CSV with student having valid advisor name (unique)
- [ ] Upload CSV with student having ambiguous advisor name (should fail with helpful error)
- [ ] Upload CSV with student missing advisor (should fail)
- [ ] Upload CSV with student having non-existent advisor (should fail)
- [ ] Upload CSV with student having instructor who is not an advisor (should fail)
- [ ] Upload CSV with instructor having advisor field (should succeed, advisor ignored)
- [ ] Verify validation preview shows correct errors
- [ ] Verify error messages are helpful and actionable
