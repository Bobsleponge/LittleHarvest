#!/usr/bin/env node

/**
 * Send Sample Email Templates
 * 
 * This script sends samples of all email templates to showcase the new designs.
 */

require('dotenv').config()

const nodemailer = require('nodemailer')

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Welcome Email Template
function generateWelcomeEmail() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Little Harvest</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          line-height: 1.6; 
          color: #1f2937; 
          background-color: #f3f4f6;
          margin: 0;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); 
          color: white; 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .header-content { position: relative; z-index: 1; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .welcome-card { 
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
          border: 1px solid #a7f3d0; 
          padding: 30px; 
          border-radius: 12px; 
          margin-bottom: 30px;
          text-align: center;
        }
        .welcome-card h2 { color: #047857; font-size: 24px; margin-bottom: 15px; }
        .welcome-card p { color: #065f46; font-size: 16px; }
        .features-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
          gap: 20px; 
          margin-bottom: 30px; 
        }
        .feature-item { 
          background: white; 
          padding: 20px; 
          border-radius: 12px; 
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
        }
        .feature-item:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); 
        }
        .feature-icon { font-size: 24px; margin-bottom: 10px; }
        .feature-title { font-weight: 600; color: #1f2937; margin-bottom: 8px; }
        .feature-desc { color: #6b7280; font-size: 14px; }
        .cta-section { 
          text-align: center; 
          margin: 40px 0; 
        }
        .cta-button { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 12px; 
          display: inline-block; 
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          transition: all 0.3s ease;
        }
        .cta-button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); 
        }
        .footer { 
          background: #f9fafb; 
          padding: 30px; 
          text-align: center; 
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p { margin-bottom: 8px; }
        .social-links { margin-top: 20px; }
        .social-links a { 
          color: #10b981; 
          text-decoration: none; 
          margin: 0 10px; 
          font-weight: 500; 
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .header h1 { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-content">
            <div class="logo">🌱</div>
            <h1>Welcome to Little Harvest!</h1>
            <p>Hello John Doe, we're excited to have you join our family!</p>
          </div>
        </div>
        
        <div class="content">
          <div class="welcome-card">
            <h2>🎉 You're All Set!</h2>
            <p>Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones with our fresh, organic baby food delivery service.</p>
          </div>

          <div class="features-grid">
            <div class="feature-item">
              <div class="feature-icon">🍼</div>
              <div class="feature-title">Fresh Products</div>
              <div class="feature-desc">Browse our carefully curated selection of organic baby foods</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛒</div>
              <div class="feature-title">Easy Shopping</div>
              <div class="feature-desc">Create and manage your shopping cart with ease</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">👶</div>
              <div class="feature-title">Child Profiles</div>
              <div class="feature-desc">Set up profiles with dietary preferences and allergies</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📦</div>
              <div class="feature-title">Order Tracking</div>
              <div class="feature-desc">Track your orders from preparation to delivery</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💳</div>
              <div class="feature-title">Secure Payments</div>
              <div class="feature-desc">Save payment methods for quick and secure checkout</div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📱</div>
              <div class="feature-title">Delivery Management</div>
              <div class="feature-desc">Manage multiple delivery addresses easily</div>
            </div>
          </div>

          <div class="cta-section">
            <a href="http://localhost:3000/products" class="cta-button">Start Shopping Now</a>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Little Harvest!</strong></p>
          <p>Questions? Contact us at support@littleharvest.co.za</p>
          <div class="social-links">
            <a href="#">Website</a> • 
            <a href="#">Support</a> • 
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Order Confirmation Email Template
function generateOrderConfirmationEmail() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          line-height: 1.6; 
          color: #1f2937; 
          background-color: #f3f4f6;
          margin: 0;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); 
          color: white; 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .header-content { position: relative; z-index: 1; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .order-summary { 
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); 
          border: 1px solid #a7f3d0; 
          padding: 30px; 
          border-radius: 12px; 
          margin-bottom: 30px;
          text-align: center;
        }
        .order-summary h2 { color: #047857; font-size: 24px; margin-bottom: 15px; }
        .order-number { 
          background: white; 
          padding: 15px; 
          border-radius: 8px; 
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          font-size: 18px;
          font-weight: bold;
          color: #059669;
        }
        .order-details { 
          background: white; 
          padding: 25px; 
          border-radius: 12px; 
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
        }
        .order-details h3 { 
          color: #1f2937; 
          font-size: 18px; 
          margin-bottom: 15px; 
          padding-bottom: 10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          padding: 8px 0; 
          border-bottom: 1px solid #f3f4f6; 
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #374151; }
        .detail-value { color: #6b7280; }
        .items-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-top: 15px; 
        }
        .items-table th, .items-table td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid #e5e7eb; 
        }
        .items-table th { 
          background: #f9fafb; 
          font-weight: 600; 
          color: #374151; 
        }
        .items-table tr:hover { background: #f9fafb; }
        .total-section { 
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
          border: 1px solid #f59e0b; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0;
          text-align: center;
        }
        .total-amount { 
          font-size: 24px; 
          font-weight: bold; 
          color: #92400e; 
          margin-top: 10px;
        }
        .payment-info { 
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
          border: 1px solid #fca5a5; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 20px 0;
        }
        .payment-info h3 { color: #dc2626; margin-bottom: 15px; }
        .bank-details { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          margin: 15px 0;
          border: 1px solid #e5e7eb;
        }
        .bank-details p { margin: 5px 0; }
        .address-card { 
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); 
          border: 1px solid #7dd3fc; 
          padding: 20px; 
          border-radius: 12px; 
          margin: 20px 0;
        }
        .address-card h3 { color: #0369a1; margin-bottom: 10px; }
        .footer { 
          background: #f9fafb; 
          padding: 30px; 
          text-align: center; 
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p { margin-bottom: 8px; }
        .social-links { margin-top: 20px; }
        .social-links a { 
          color: #10b981; 
          text-decoration: none; 
          margin: 0 10px; 
          font-weight: 500; 
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .items-table { font-size: 14px; }
          .items-table th, .items-table td { padding: 8px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-content">
            <div class="logo">🌱</div>
            <h1>Order Confirmation</h1>
            <p>Thank you for your order, Sarah Johnson!</p>
          </div>
        </div>
        
        <div class="content">
          <div class="order-summary">
            <h2>🎉 Order Received!</h2>
            <p>We've received your order and are preparing it for you.</p>
            <div class="order-number">LH-ABC123-DEF456</div>
          </div>

          <div class="order-details">
            <h3>📋 Order Information</h3>
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">LH-ABC123-DEF456</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value">PENDING</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Status:</span>
              <span class="detail-value">PENDING</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Delivery Date:</span>
              <span class="detail-value">${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Due:</span>
              <span class="detail-value">${new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
            </div>
          </div>

          <div class="order-details">
            <h3>🛒 Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Organic Sweet Potato Puree</strong></td>
                  <td>120g</td>
                  <td>2</td>
                  <td>R45.00</td>
                  <td><strong>R90.00</strong></td>
                </tr>
                <tr>
                  <td><strong>Apple & Cinnamon Baby Food</strong></td>
                  <td>100g</td>
                  <td>3</td>
                  <td>R38.50</td>
                  <td><strong>R115.50</strong></td>
                </tr>
                <tr>
                  <td><strong>Mixed Vegetable Blend</strong></td>
                  <td>150g</td>
                  <td>1</td>
                  <td>R40.00</td>
                  <td><strong>R40.00</strong></td>
                </tr>
              </tbody>
            </table>
            <div class="total-section">
              <div class="total-amount">Total: R245.50</div>
            </div>
          </div>

          <div class="payment-info">
            <h3>💳 Payment Required</h3>
            <p>Please make payment within 24 hours to confirm your order.</p>
            <div class="bank-details">
              <p><strong>Bank Details:</strong></p>
              <p><strong>Bank:</strong> Standard Bank</p>
              <p><strong>Account:</strong> Little Harvest (Pty) Ltd</p>
              <p><strong>Account Number:</strong> 1234567890</p>
              <p><strong>Branch Code:</strong> 051001</p>
              <p><strong>Reference:</strong> LH-ABC123-DEF456</p>
              <p><strong>Amount:</strong> R245.50</p>
            </div>
          </div>

          <div class="address-card">
            <h3>📍 Delivery Address</h3>
            <p>123 Oak Street<br>
            Cape Town, Western Cape 8001</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Little Harvest!</strong></p>
          <p>Questions? Contact us at orders@littleharvest.co.za</p>
          <div class="social-links">
            <a href="#">Track Order</a> • 
            <a href="#">Support</a> • 
            <a href="#">Website</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Password Reset Email Template
function generatePasswordResetEmail() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
          line-height: 1.6; 
          color: #1f2937; 
          background-color: #f3f4f6;
          margin: 0;
          padding: 20px;
        }
        .email-container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); 
          color: white; 
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
          opacity: 0.3;
        }
        .header-content { position: relative; z-index: 1; }
        .logo { font-size: 32px; margin-bottom: 10px; }
        .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .reset-card { 
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
          border: 1px solid #f59e0b; 
          padding: 30px; 
          border-radius: 12px; 
          margin-bottom: 30px;
          text-align: center;
        }
        .reset-card h2 { color: #92400e; font-size: 24px; margin-bottom: 15px; }
        .reset-card p { color: #78350f; font-size: 16px; }
        .cta-section { 
          text-align: center; 
          margin: 40px 0; 
        }
        .cta-button { 
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
          color: white; 
          padding: 16px 32px; 
          text-decoration: none; 
          border-radius: 12px; 
          display: inline-block; 
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
          transition: all 0.3s ease;
        }
        .cta-button:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4); 
        }
        .security-notice { 
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); 
          border: 1px solid #fca5a5; 
          padding: 25px; 
          border-radius: 12px; 
          margin: 20px 0;
        }
        .security-notice h3 { color: #dc2626; margin-bottom: 15px; }
        .footer { 
          background: #f9fafb; 
          padding: 30px; 
          text-align: center; 
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        }
        .footer p { margin-bottom: 8px; }
        .social-links { margin-top: 20px; }
        .social-links a { 
          color: #10b981; 
          text-decoration: none; 
          margin: 0 10px; 
          font-weight: 500; 
        }
        @media (max-width: 600px) {
          body { padding: 10px; }
          .header { padding: 30px 20px; }
          .content { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="header-content">
            <div class="logo">🔐</div>
            <h1>Password Reset Request</h1>
            <p>Hello John Doe, we received a request to reset your password.</p>
          </div>
        </div>
        
        <div class="content">
          <div class="reset-card">
            <h2>Reset Your Password</h2>
            <p>Click the button below to reset your password. This link will expire in 24 hours.</p>
          </div>

          <div class="cta-section">
            <a href="https://littleharvest.co.za/reset-password?token=abc123def456" class="cta-button">Reset My Password</a>
          </div>

          <div class="security-notice">
            <h3>🔒 Security Notice</h3>
            <p>If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
            <p>For security reasons, this link will expire in 24 hours.</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>Thank you for choosing Little Harvest!</strong></p>
          <p>Questions? Contact us at support@littleharvest.co.za</p>
          <div class="social-links">
            <a href="#">Website</a> • 
            <a href="#">Support</a> • 
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendSampleEmails() {
  console.log('📧 Sending sample email templates...\n')

  const emails = [
    {
      subject: '🌱 Welcome to Little Harvest - Sample Template',
      html: generateWelcomeEmail(),
      description: 'Welcome Email Template'
    },
    {
      subject: '📦 Order Confirmation - Sample Template',
      html: generateOrderConfirmationEmail(),
      description: 'Order Confirmation Email Template'
    },
    {
      subject: '🔐 Password Reset - Sample Template',
      html: generatePasswordResetEmail(),
      description: 'Password Reset Email Template'
    }
  ]

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i]
    
    try {
      console.log(`📤 Sending ${email.description}...`)
      
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: 'littleharvest9@gmail.com',
        subject: email.subject,
        html: email.html,
      }

      const info = await transporter.sendMail(mailOptions)
      console.log(`✅ ${email.description} sent successfully!`)
      console.log(`   Message ID: ${info.messageId}\n`)
      
      // Wait 2 seconds between emails
      if (i < emails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
    } catch (error) {
      console.error(`❌ Failed to send ${email.description}:`, error.message)
    }
  }

  console.log('🎉 All sample email templates sent!')
  console.log('📬 Check your inbox to see the new designs!')
}

sendSampleEmails().catch(error => {
  console.error('❌ Error sending sample emails:', error.message)
})
