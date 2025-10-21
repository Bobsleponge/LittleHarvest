# 📧 Email Service Configuration - Harviz & Co

This document provides comprehensive information about the email service setup for Harviz & Co.

## 🚀 Overview

The email service is built with **Nodemailer** and provides automated email notifications for various user actions including:

- **Welcome emails** for new user registrations
- **Password reset emails** for account recovery
- **Account verification emails** for email confirmation
- **Order confirmation emails** when orders are placed
- **Payment confirmation emails** when payments are received
- **Order cancellation emails** when orders are cancelled

## ⚙️ Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Email Service Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@littleharvest.co.za"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Harviz & Co"
```

### Email Provider Setup

#### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `EMAIL_SERVER_PASSWORD`

#### Production Email Providers

For production, consider these providers:

- **SendGrid** - Reliable, good deliverability
- **AWS SES** - Cost-effective, scalable
- **Mailgun** - Developer-friendly
- **Postmark** - Great for transactional emails

## 📁 File Structure

```
src/lib/
├── email.ts                 # Main email service with templates
pages/api/
├── email/
│   └── send.ts             # Generic email sending API
└── auth/
    └── password-reset.ts   # Password reset API
```

## 🔧 Usage

### Sending Emails Programmatically

```typescript
import { 
  sendWelcomeEmail, 
  sendPasswordResetEmail, 
  sendOrderNotification 
} from '@/lib/email'

// Send welcome email
await sendWelcomeEmail({
  customerName: 'John Doe',
  customerEmail: 'john@example.com'
})

// Send password reset email
await sendPasswordResetEmail({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  resetLink: 'https://app.com/reset?token=abc123',
  expiresIn: '24 hours'
})

// Send order confirmation
await sendOrderNotification({
  orderNumber: 'LH-123456',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  orderStatus: 'PENDING',
  paymentStatus: 'PENDING',
  totalAmount: 150.00,
  items: [/* order items */],
  address: {/* delivery address */}
}, 'confirmation')
```

### Using the Email API

```typescript
// Send any email type via API
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'welcome',
    data: {
      customerName: 'John Doe',
      customerEmail: 'john@example.com'
    }
  })
})
```

## 📧 Email Templates

### Welcome Email
- **Trigger**: New user registration
- **Content**: Welcome message, account features, call-to-action
- **Template**: `generateWelcomeEmail()`

### Password Reset Email
- **Trigger**: Password reset request
- **Content**: Reset link, security notice, expiration info
- **Template**: `generatePasswordResetEmail()`

### Account Verification Email
- **Trigger**: Email verification required
- **Content**: Verification link, account benefits
- **Template**: `generateAccountVerificationEmail()`

### Order Confirmation Email
- **Trigger**: Order placement
- **Content**: Order details, payment info, delivery address
- **Template**: `generateOrderConfirmationEmail()`

### Payment Confirmation Email
- **Trigger**: Payment received
- **Content**: Payment confirmation, order status update
- **Template**: `generatePaymentConfirmationEmail()`

### Order Cancellation Email
- **Trigger**: Order cancellation
- **Content**: Cancellation notice, reason, refund info
- **Template**: `generateOrderCancellationEmail()`

## 🔄 Integration Points

### Authentication Flow
- **Location**: `src/lib/auth.ts`
- **Trigger**: `signIn` callback
- **Action**: Sends welcome email for new users

### Order Management
- **Location**: `pages/api/orders/index.ts`
- **Trigger**: Order creation
- **Action**: Sends order confirmation email

### Password Reset
- **Location**: `pages/api/auth/password-reset.ts`
- **Trigger**: Password reset request
- **Action**: Sends password reset email

## 🛡️ Security Features

### Rate Limiting
- All email APIs are protected with rate limiting
- Prevents email spam and abuse

### Input Validation
- All email data is validated with Zod schemas
- Prevents injection attacks and malformed data

### Error Handling
- Comprehensive error logging
- Graceful failure (emails don't break core functionality)
- Security-conscious error messages

## 📊 Monitoring & Logging

### Email Logging
All email operations are logged with:
- Email type and recipient
- Success/failure status
- Error details (if any)
- Timestamps

### Health Checks
The email service includes:
- Connection verification on startup
- Configuration validation
- Error tracking and reporting

## 🚨 Troubleshooting

### Common Issues

#### "Email service not configured"
- **Cause**: Missing environment variables
- **Solution**: Ensure all email environment variables are set

#### "Authentication failed"
- **Cause**: Invalid email credentials
- **Solution**: Check username/password, use app passwords for Gmail

#### "Connection timeout"
- **Cause**: Network issues or wrong SMTP settings
- **Solution**: Verify SMTP host/port settings

#### Emails not being sent
- **Cause**: Various (check logs)
- **Solution**: 
  1. Check email service logs
  2. Verify environment variables
  3. Test SMTP connection
  4. Check spam folders

### Testing Email Service

```typescript
// Test email configuration
import { transporter } from '@/lib/email'

transporter.verify((error, success) => {
  if (error) {
    console.log('Email service error:', error)
  } else {
    console.log('Email service ready!')
  }
})
```

## 🔧 Customization

### Adding New Email Types

1. **Define interface** in `src/lib/email.ts`:
```typescript
export interface NewEmailData {
  customerName: string
  customerEmail: string
  // ... other fields
}
```

2. **Create template function**:
```typescript
export function generateNewEmail(data: NewEmailData): EmailTemplate {
  // Template implementation
}
```

3. **Add sending function**:
```typescript
export async function sendNewEmail(data: NewEmailData): Promise<boolean> {
  const template = generateNewEmail(data)
  return await sendEmailNotification(data.customerEmail, template)
}
```

4. **Update API endpoint** in `pages/api/email/send.ts`

### Customizing Templates

All email templates use inline CSS and can be customized by:
- Modifying the HTML structure
- Updating CSS styles
- Changing colors, fonts, and layout
- Adding/removing sections

## 📈 Performance Considerations

### Email Queuing
For high-volume applications, consider implementing:
- Email queuing with Redis/Bull
- Background job processing
- Batch email sending

### Template Caching
Templates are generated on-demand. For high traffic:
- Consider template caching
- Pre-compile templates
- Use template engines like Handlebars

## 🔒 Production Checklist

- [ ] Configure production email provider
- [ ] Set up proper DNS records (SPF, DKIM, DMARC)
- [ ] Test all email types
- [ ] Configure monitoring and alerts
- [ ] Set up email bounce handling
- [ ] Implement email analytics
- [ ] Configure backup email provider
- [ ] Test email deliverability

## 📞 Support

For email service issues:
1. Check the application logs
2. Verify environment configuration
3. Test SMTP connection
4. Contact the development team

---

**Built with ❤️ for Little Harvest**
