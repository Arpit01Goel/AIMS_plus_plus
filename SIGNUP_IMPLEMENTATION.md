# Student Signup Implementation

This document describes the complete signup implementation with OTP-based email verification and admin approval workflow.

## Overview

The signup flow consists of three main steps:
1. **Email Verification** - Student enters their institutional email and receives an OTP
2. **OTP Verification** - Student verifies their email by entering the OTP
3. **Profile Submission** - Student completes their profile and submits a request to admin
4. **Admin Approval** - Admin reviews and approves/rejects the signup request

## Database Schema

### SignupRequest Model

Added a new `SignupRequest` model to track pending student registration requests:

```prisma
model SignupRequest {
  id              String    @id @default(cuid())
  email           String    @unique
  name            String
  entryNumber     String?   // Optional for initial request
  phone           String?
  status          String    @default("PENDING") // PENDING, APPROVED, REJECTED
  rejectionReason String?
  emailVerified   Boolean   @default(false)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  processedAt     DateTime?
  processedBy     String?   // Admin userId who processed this request

  @@index([email])
  @@index([status])
  @@index([createdAt])
}
```

## API Endpoints

### 1. Send OTP for Signup
**Endpoint:** `POST /api/auth/signup/send-otp`

**Request Body:**
```json
{
  "email": "student@iitrpr.ac.in"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to your email"
}
```

**Features:**
- Validates email domain (@iitrpr.ac.in)
- Checks if user already exists
- Checks if signup request already exists
- Rate limiting (1 minute between requests)
- Sends OTP via email

### 2. Verify OTP
**Endpoint:** `POST /api/auth/signup/verify-otp`

**Request Body:**
```json
{
  "email": "student@iitrpr.ac.in",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. Please complete your signup."
}
```

**Features:**
- Validates OTP format (6-digit number)
- Verifies OTP from database
- Marks OTP as consumed
- Checks expiration

### 3. Submit Signup Request
**Endpoint:** `POST /api/auth/signup/request`

**Request Body:**
```json
{
  "email": "student@iitrpr.ac.in",
  "name": "John Doe",
  "entryNumber": "2024CSB1234",
  "phone": "+91 9876543210"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Your signup request has been submitted successfully. Please wait for admin approval.",
  "requestId": "clx123456789"
}
```

**Features:**
- Validates required fields (email, name)
- Verifies email was verified via OTP (within 30 minutes)
- Creates or updates signup request
- Sets status to PENDING

### 4. Admin - Get Signup Requests
**Endpoint:** `GET /api/admin/signup-requests?status=PENDING`

**Authorization:** Admin only

**Response:**
```json
{
  "success": true,
  "requests": [
    {
      "id": "clx123456789",
      "email": "student@iitrpr.ac.in",
      "name": "John Doe",
      "entryNumber": "2024CSB1234",
      "phone": "+91 9876543210",
      "status": "PENDING",
      "emailVerified": true,
      "createdAt": "2024-01-23T12:00:00Z"
    }
  ],
  "count": 1
}
```

**Features:**
- Requires admin authentication
- Filters by status (PENDING, APPROVED, REJECTED)
- Returns list of signup requests

### 5. Admin - Approve/Reject Signup Request
**Endpoint:** `PUT /api/admin/signup-requests`

**Authorization:** Admin only

**Request Body (Approve):**
```json
{
  "requestId": "clx123456789",
  "action": "APPROVE"
}
```

**Request Body (Reject):**
```json
{
  "requestId": "clx123456789",
  "action": "REJECT",
  "rejectionReason": "Invalid entry number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signup request approved successfully",
  "request": { ... }
}
```

**Features:**
- Requires admin authentication
- Validates action (APPROVE or REJECT)
- Requires rejection reason for REJECT action
- Updates request status and tracking fields
- **Note:** This only marks the request as approved. You still need to manually create the user account (see below).

## Frontend (Signup Page)

**Route:** `/signup`

**Features:**
- Beautiful multi-step form matching login page design
- Step 1: Enter email
- Step 2: Verify OTP with countdown timer
- Step 3: Complete profile details
- Step 4: Success message
- Toast notifications for errors and success
- Responsive design with glassmorphism effects
- Step indicator showing progress

## Next Steps for Complete Integration

### 1. Create User Account After Admin Approval

After admin approves a signup request, you need to create the actual user account. You can either:

**Option A: Automatic user creation** - Modify the admin approval endpoint to automatically create the user:

```typescript
if (action.toUpperCase() === 'APPROVE') {
  // Update the signup request
  const updatedRequest = await prisma.signupRequest.update({
    where: { id: requestId },
    data: {
      status: 'APPROVED',
      processedAt: new Date(),
      processedBy: adminUser.id,
    },
  });

  // Create the user account
  const newUser = await prisma.user.create({
    data: {
      email: updatedRequest.email,
      name: updatedRequest.name,
      role: 'STUDENT',
      student: {
        create: {
          entryNumber: updatedRequest.entryNumber || `TEMP_${Date.now()}`,
          phone: updatedRequest.phone,
        },
      },
    },
  });

  return NextResponse.json({
    success: true,
    message: 'User account created successfully',
    user: newUser,
  });
}
```

**Option B: Send notification email** - Send an email to the student to set their password:
- Create a password reset token
- Send email with link to set password
- Student clicks link and sets their password
- Account is fully activated

### 2. Admin Dashboard (Optional)

Create an admin dashboard page to manage signup requests:

**Route:** `/admin/signup-requests`

Features:
- List all pending requests
- Search and filter functionality
- Approve/reject buttons
- View request details
- Bulk actions

### 3. Email Integration

Make sure email sending is properly configured in your `.env`:

```env
# Email Configuration (using Gmail as example)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=noreply@iitrpr.ac.in
```

### 4. Testing the Flow

1. **Stop the development server** (to release the Prisma client lock)
2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Test the signup flow:**
   - Go to `/signup`
   - Enter an @iitrpr.ac.in email
   - Check email for OTP
   - Verify OTP
   - Complete profile
   - Login as admin
   - Approve the request
   - Create user account (manually or automatically)

## Files Created/Modified

### New Files:
- `src/app/api/auth/signup/send-otp/route.ts`
- `src/app/api/auth/signup/verify-otp/route.ts`
- `src/app/api/auth/signup/request/route.ts`
- `src/app/api/admin/signup-requests/route.ts`
- `src/app/(auth)/signup/page.tsx`

### Modified Files:
- `prisma/schema.prisma` - Added SignupRequest model
- `src/app/(auth)/login/page.tsx` - Added signup link

## Security Considerations

1. **Email Domain Validation** - Only @iitrpr.ac.in emails are allowed
2. **OTP Expiration** - OTPs expire after 10 minutes
3. **Rate Limiting** - 1 minute cooldown between OTP requests
4. **Email Verification Required** - Users must verify email before submitting request
5. **Verification Time Window** - Email verification valid for 30 minutes
6. **Admin-Only Approval** - Only admins can approve/reject requests
7. **One-Time OTP Use** - OTPs are marked as consumed after use

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden (domain/role restriction)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

## Future Enhancements

1. **SMS OTP** - Add phone verification via SMS
2. **Document Upload** - Allow students to upload ID documents
3. **Batch Import** - Allow admin to import multiple users from CSV
4. **Email Templates** - Create branded email templates
5. **Notification System** - Notify students when request is approved/rejected
6. **Auto-expire Requests** - Automatically expire old pending requests
7. **Analytics** - Track signup conversion rates and bottlenecks
