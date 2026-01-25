# Advisor Portal Backend Implementation

## Overview
Complete backend implementation for the advisor portal with database integration and dynamic frontend pages.

## API Routes Created

### 1. `/api/instructor/advisor/students` (GET)
**Purpose**: Fetch all students assigned to the logged-in advisor

**Features**:
- Retrieves all students with `advisorId` matching the current advisor
- Calculates CGPA based on grades in enrolled courses
- Calculates total credits earned
- Returns current enrollment count
- Includes student profile information (email, name, program, department)

**Response**:
```json
{
  "students": [
    {
      "id": "student_id",
      "orgId": "2021CS001",
      "name": "Student Name",
      "email": "student@iitrpr.ac.in",
      "batch": 2021,
      "program": "B.Tech CSE",
      "department": "Computer Science",
      "cgpa": 8.5,
      "creditsEarned": 48,
      "currentEnrollments": 5
    }
  ]
}
```

### 2. `/api/instructor/advisor/approvals` (GET)
**Purpose**: Get all pending enrollment requests requiring advisor approval

**Features**:
- Fetches enrollments with status `PENDING_ADVISOR_APPROVAL`
- Only shows enrollments for students under the advisor
- Includes course details, session information
- Calculates current enrolled credits for the session
- Shows instructor approval information

**Response**:
```json
{
  "enrollments": [
    {
      "id": "enrollment_id",
      "studentId": "student_id",
      "studentName": "Student Name",
      "studentEmail": "email@iitrpr.ac.in",
      "orgId": "2021CS001",
      "courseCode": "CS502",
      "courseTitle": "Advanced Algorithms",
      "credits": 4,
      "session": "2025-II",
      "enrollType": "CREDIT",
      "status": "PENDING_ADVISOR_APPROVAL",
      "submittedDate": "2026-01-10T10:30:00Z",
      "instructorName": "Dr. Smith",
      "currentCredits": 16,
      "slot": "A1"
    }
  ]
}
```

### 3. `/api/instructor/advisor/approvals/[id]` (POST)
**Purpose**: Approve or reject a specific enrollment request

**Request Body**:
```json
{
  "action": "approve" | "reject",
  "remarks": "Optional rejection remarks"
}
```

**Features**:
- Validates advisor owns the student
- Checks enrollment status is `PENDING_ADVISOR_APPROVAL`
- For approvals:
  - Validates credit limits (max 26 credits per session)
  - Updates status to `ENROLLED`
- For rejections:
  - Updates status to `REJECTED_BY_ADVISOR`
  - Stores remarks for student notification
- Updates audit fields (`updatedById`)

**Response**:
```json
{
  "message": "Enrollment approved successfully",
  "enrollment": {
    "id": "enrollment_id",
    "status": "ENROLLED",
    "studentName": "Student Name",
    "courseCode": "CS502",
    "courseTitle": "Advanced Algorithms"
  }
}
```

### 4. `/api/advisor/dashboard` (GET)
**Purpose**: Get dashboard statistics and recent activity

**Features**:
- Count of pending approvals
- Total students assigned
- Credit violations (students exceeding 26 credits)
- Average CGPA calculation
- Recent pending enrollments (last 5)
- Recent activity history (last 10 approvals/rejections)

**Response**:
```json
{
  "stats": {
    "pendingApprovals": 8,
    "totalStudents": 45,
    "creditViolations": 3,
    "avgGPA": 8.5
  },
  "pendingEnrollments": [...],
  "recentActivity": [
    {
      "id": "activity_id",
      "message": "Approved enrollment for John Doe in CS502",
      "time": "2 hours ago",
      "type": "approval"
    }
  ]
}
```

## Frontend Pages Updated

### 1. `/advisor/approvals/page.tsx`
**Changes**:
- Removed hardcoded data
- Added `useEffect` to fetch data from `/api/instructor/advisor/approvals`
- Added loading and error states
- Updated approve/reject handlers to call API
- Added real-time credit limit validation display
- Updated enrollment type badges (CREDIT, AUDIT, etc.)
- Added processing indicators during API calls

**Key Features**:
- Search and filter functionality
- Credit analysis display
- Session filtering
- Type filtering (Credit, Audit, Minor, Concentration)
- Rejection modal with remarks

### 2. `/advisor/students/page.tsx`
**Changes**:
- Removed hardcoded student data
- Fetches from `/api/instructor/advisor/students`
- Added loading and error states
- Dynamic status calculation based on CGPA
  - Active: CGPA >= 7.0
  - Warning: CGPA >= 6.0 and < 7.0
  - Critical: CGPA < 6.0
- CSV export functionality
- Real statistics calculation

**Key Features**:
- Student search by name, ID, or email
- Status filtering
- Sorting by name, CGPA, or credits
- Statistics dashboard (total, active, warning, critical, avg CGPA)
- Export to CSV
- Batch email functionality

### 3. `/advisor/dashboard/page.tsx`
**Changes**:
- Removed hardcoded statistics
- Fetches from `/api/advisor/dashboard`
- Added loading and error states
- Dynamic statistics display
- Real recent activity feed

**Key Features**:
- Quick statistics cards with navigation
- Pending approvals preview (first 3)
- Recent activity timeline
- Links to detail pages

## Database Schema Integration

All routes properly integrate with the Prisma schema:

**Key Models Used**:
- `Advisor` - Advisor profile and student assignments
- `Student` - Student profiles with `advisorId` relation
- `Enrollment` - Course enrollments with status tracking
- `CourseOffering` - Course offerings with instructor info
- `Course` - Course details (code, title, credits)
- `AcademicSession` - Session information

## Security & Authorization

All API routes include:
- Session validation using NextAuth
- Role verification (ADVISOR role required)
- Advisor ownership validation (can only act on own students)
- Status validation (ensures correct enrollment workflow)

## Business Logic

### Credit Limit Validation
- Maximum: 26 credits per session
- Validates during approval
- Returns error if limit exceeded

### Enrollment Workflow
1. Student requests enrollment
2. Instructor approves → `PENDING_ADVISOR_APPROVAL`
3. Advisor approves → `ENROLLED`
4. Advisor rejects → `REJECTED_BY_ADVISOR`

### CGPA Calculation
- Uses grade points mapping (A=10, A_MINUS=9, B=8, etc.)
- Calculates weighted average based on credits
- Only includes completed courses with grades

## Error Handling

All routes include comprehensive error handling:
- 401 Unauthorized - Not logged in
- 403 Forbidden - Wrong role or not authorized for specific student
- 404 Not Found - Resource doesn't exist
- 400 Bad Request - Invalid input or business logic violation
- 500 Internal Server Error - Database or server errors

## Next Steps for Full Implementation

To make this fully functional, you need to:

1. **Database Setup**: Ensure Prisma schema is synced and database has sample data
2. **Authentication**: Ensure NextAuth is properly configured
3. **Sample Data**: Create test students, courses, and enrollments in the database
4. **Email Notifications**: Implement email sending for approvals/rejections
5. **Additional Features**:
   - Bulk approve/reject
   - Comments/notes on enrollments
   - Violation monitoring page
   - Student detail view with full academic history

## Testing the Implementation

1. Ensure you have an advisor user in the database
2. Assign some students to this advisor (`advisorId` field)
3. Create some course offerings and enrollments with `PENDING_ADVISOR_APPROVAL` status
4. Login as the advisor
5. Navigate to advisor portal pages to see live data
