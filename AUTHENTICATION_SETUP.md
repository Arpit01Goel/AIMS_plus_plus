# Authentication Setup Guide

## Overview
This guide will help you set up Google OAuth authentication (restricted to @iitrpr.ac.in) and OTP-based password reset functionality.

## Prerequisites
- Node.js and npm installed
- Google Cloud Console account
- Email service (Gmail with App Password or SendGrid account)

## Step 1: Install Dependencies

```bash
npm install
```

This will install:
- `next-auth` - Authentication for Next.js
- `nodemailer` - Email sending
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types
- `@types/nodemailer` - TypeScript types

## Step 2: Configure Google OAuth

### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### 2.2 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "Internal" user type (for G Suite/Workspace domains)
3. Fill in application details:
   - App name: AIMS++
   - User support email: your-email@iitrpr.ac.in
   - Authorized domains: iitrpr.ac.in
   - Developer contact: your-email@iitrpr.ac.in

### 2.3 Create OAuth Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Application type: Web application
4. Name: AIMS++ Web Client
5. Authorized JavaScript origins:
   - http://localhost:3000 (development)
   - https://your-production-domain.com (production)
6. Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google (development)
   - https://your-production-domain.com/api/auth/callback/google (production)
7. Copy Client ID and Client Secret

## Step 3: Configure Email Service

### Option A: Using Gmail SMTP (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Select "Mail" and "Other (Custom name)"
   - Name it "AIMS++"
   - Copy the 16-character password
3. Use these credentials in .env file

### Option B: Using SendGrid (Recommended for Production)

1. Create account at [SendGrid](https://sendgrid.com/)
2. Verify your sender email/domain
3. Create API key with "Mail Send" permissions
4. Copy API key

## Step 4: Create Environment File

Create `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_client_id_from_google_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_google_console
NEXTAUTH_SECRET=generate_random_string_here
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (Choose one)
# Option 1: Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_16_char_app_password

# Option 2: SendGrid (comment out Gmail if using this)
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxx

# Application Settings
ALLOWED_EMAIL_DOMAIN=iitrpr.ac.in
OTP_EXPIRY_MINUTES=10
```

### Generate NEXTAUTH_SECRET

Run this command to generate a secure random string:

```bash
openssl rand -base64 32
```

Or in Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Step 5: Test Authentication

### 5.1 Start Development Server

```bash
npm run dev
```

### 5.2 Test Google Login
1. Go to http://localhost:3000/login
2. Click "Continue with IIT Ropar Account"
3. Sign in with @iitrpr.ac.in account
4. Should redirect to dashboard

### 5.3 Test OTP Password Reset
1. Go to http://localhost:3000/forgot-password
2. Enter @iitrpr.ac.in email
3. Check email for OTP
4. Enter OTP and reset password

## Security Features Implemented

✅ **Google OAuth Domain Restriction**
- `hd` parameter restricts to @iitrpr.ac.in
- Server-side domain validation in callback
- Rejects non-IIT Ropar accounts

✅ **OTP Security**
- 6-digit random OTP
- 10-minute expiration
- Maximum 5 verification attempts
- Rate limiting (1 OTP per minute per email)
- Secure email delivery

✅ **Password Security**
- Minimum 8 characters
- bcrypt hashing (12 rounds)
- Reset token with 15-minute expiration

## Production Deployment Checklist

- [ ] Set up production database (PostgreSQL/MySQL)
- [ ] Replace in-memory OTP storage with database/Redis
- [ ] Configure production OAuth redirect URIs
- [ ] Set up production email service (SendGrid)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS
- [ ] Set secure session cookies
- [ ] Implement rate limiting middleware
- [ ] Add logging and monitoring
- [ ] Set up backup MFA recovery

## Troubleshooting

### Google OAuth Not Working
- Verify redirect URIs match exactly
- Check if domain restriction is properly set
- Ensure OAuth consent screen is configured for Internal users

### OTP Not Received
- Check spam/junk folder
- Verify SMTP credentials
- Check email service logs
- Ensure firewall allows outbound SMTP

### Session Issues
- Clear browser cookies
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain

## Database Integration (Next Steps)

The current implementation uses in-memory storage for OTPs. For production:

1. Set up database (Prisma example):

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String?
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model OTP {
  id        String   @id @default(cuid())
  email     String
  code      String
  expiresAt DateTime
  attempts  Int      @default(0)
  createdAt DateTime @default(now())
  
  @@index([email])
}
```

2. Update API routes to use database queries
3. Implement proper user authentication with password verification

## Support

For issues or questions, contact the development team or refer to:
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
