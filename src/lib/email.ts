import nodemailer from 'nodemailer';

// Create transporter based on environment variables
const createTransporter = () => {
  // Option 1: Using Gmail SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Option 2: Using SendGrid
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  throw new Error('Email configuration is missing. Please set up SMTP or SendGrid credentials.');
};

export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@iitrpr.ac.in',
      to: email,
      subject: 'AIMS++ Password Reset - OTP Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #312e81 0%, #4338ca 50%, #4f46e5 100%);
              border-radius: 16px;
              padding: 40px;
              text-align: center;
            }
            .logo {
              background: linear-gradient(135deg, #4f46e5, #6366f1, #312e81);
              width: 80px;
              height: 80px;
              margin: 0 auto 24px;
              border-radius: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 32px;
              font-weight: 900;
              color: white;
              box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 32px;
              margin-top: 24px;
            }
            h1 {
              color: white;
              font-size: 28px;
              margin: 0 0 16px;
            }
            .subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              margin-bottom: 0;
            }
            .otp-box {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border: 2px solid #4f46e5;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              letter-spacing: 8px;
              color: #4f46e5;
              margin: 12px 0;
            }
            .expiry {
              color: #6b7280;
              font-size: 14px;
              margin-top: 16px;
            }
            .warning {
              background: #fef2f2;
              border-left: 4px solid #ef4444;
              padding: 16px;
              margin-top: 24px;
              text-align: left;
              border-radius: 8px;
            }
            .footer {
              color: rgba(255, 255, 255, 0.8);
              font-size: 14px;
              margin-top: 24px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            
            <h1>Password Reset Request</h1>
            <p class="subtitle">IIT Ropar Academic Portal</p>
            
            <div class="content">
              <p>Hello,</p>
              <p>You have requested to reset your password for your AIMS++ account. Please use the following OTP to complete the verification process:</p>
              
              <div class="otp-box">
                <div>Your One-Time Password is:</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">⏱ This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes</div>
              </div>
              
              <p>Enter this code on the verification page to proceed with resetting your password.</p>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>Never share this OTP with anyone</li>
                  <li>AIMS++ staff will never ask for your OTP</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>This is an automated email from AIMS++ (Academic Information Management System++)</p>
              <p>IIT Ropar | Rupnagar, Punjab 140001</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        AIMS++ Password Reset - OTP Verification
        
        Hello,
        
        You have requested to reset your password for your AIMS++ account.
        
        Your One-Time Password (OTP) is: ${otp}
        
        This code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.
        
        Enter this code on the verification page to proceed with resetting your password.
        
        Security Notice:
        - Never share this OTP with anyone
        - AIMS++ staff will never ask for your OTP
        - If you didn't request this, please ignore this email
        
        This is an automated email from AIMS++ (Academic Information Management System++)
        IIT Ropar | Rupnagar, Punjab 140001
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};
