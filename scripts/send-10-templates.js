/**
 * Generate 10 different email template designs for the user to choose from
 * Each template will be numbered 1-10 for easy selection
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

// Template 1: Minimal Clean
function generateTemplate1(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: ${colors.primary}; color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; }
        .content { padding: 40px 30px; }
        .feature { margin: 20px 0; padding: 15px; background: #f8fafc; border-left: 4px solid ${colors.primary}; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { background: ${colors.primary}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Little Harvest</h1>
          <p>Hello Matty Test, we're excited to have you join our family!</p>
        </div>
        <div class="content">
          <div class="feature">
            <h3>🍼 Fresh Products</h3>
            <p>Browse our carefully curated selection of organic baby foods</p>
          </div>
          <div class="feature">
            <h3>🛒 Easy Shopping</h3>
            <p>Create and manage your shopping cart with ease</p>
          </div>
          <div class="feature">
            <h3>👶 Child Profiles</h3>
            <p>Set up profiles with dietary preferences and allergies</p>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 2: Card-Based
function generateTemplate2(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f1f5f9; }
        .container { max-width: 600px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header h1 { color: ${colors.primary}; margin: 0; font-size: 32px; }
        .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border: 2px solid transparent; }
        .card:hover { border-color: ${colors.primary}; }
        .card h3 { margin: 0 0 10px 0; color: ${colors.text}; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌱 Little Harvest</h1>
          <p>Welcome Matty Test!</p>
        </div>
        <div class="content">
          <div class="cards">
            <div class="card">
              <h3>🍼 Fresh Products</h3>
              <p>Organic baby foods</p>
            </div>
            <div class="card">
              <h3>🛒 Easy Shopping</h3>
              <p>Simple cart management</p>
            </div>
            <div class="card">
              <h3>👶 Child Profiles</h3>
              <p>Dietary preferences</p>
            </div>
            <div class="card">
              <h3>📦 Order Tracking</h3>
              <p>Track your orders</p>
            </div>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 3: Modern Gradient
function generateTemplate3(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 50px 30px; text-align: center; position: relative; }
        .header::before { content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="white" opacity="0.1"/><circle cx="80" cy="80" r="2" fill="white" opacity="0.1"/><circle cx="40" cy="60" r="1" fill="white" opacity="0.1"/></svg>'); }
        .header-content { position: relative; z-index: 1; }
        .header h1 { margin: 0; font-size: 36px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 15px 0; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
        .feature-list li:last-child { border-bottom: none; }
        .feature-icon { font-size: 24px; margin-right: 15px; }
        .cta { text-align: center; margin: 40px 0; }
        .cta a { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 18px 36px; text-decoration: none; border-radius: 50px; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
        .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <h1>Welcome to Little Harvest!</h1>
            <p>Hello Matty Test, we're excited to have you join our family!</p>
          </div>
        </div>
        <div class="content">
          <ul class="feature-list">
            <li><span class="feature-icon">🍼</span><div><strong>Fresh Products</strong><br>Browse our organic baby foods</div></li>
            <li><span class="feature-icon">🛒</span><div><strong>Easy Shopping</strong><br>Simple cart management</div></li>
            <li><span class="feature-icon">👶</span><div><strong>Child Profiles</strong><br>Dietary preferences & allergies</div></li>
            <li><span class="feature-icon">📦</span><div><strong>Order Tracking</strong><br>Track from preparation to delivery</div></li>
          </ul>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 4: Newsletter Style
function generateTemplate4(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: Georgia, serif; margin: 0; padding: 0; background: #fafafa; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: ${colors.primary}; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: normal; }
        .content { padding: 30px; }
        .intro { font-size: 18px; line-height: 1.6; margin-bottom: 30px; color: #333; }
        .features { margin: 30px 0; }
        .feature { margin: 20px 0; padding: 20px; background: #f8f9fa; border-left: 5px solid ${colors.primary}; }
        .feature h3 { margin: 0 0 10px 0; color: ${colors.text}; }
        .cta { text-align: center; margin: 40px 0; }
        .cta a { background: ${colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Little Harvest Newsletter</h1>
          <p>Welcome Matty Test!</p>
        </div>
        <div class="content">
          <div class="intro">
            Thank you for joining Little Harvest! We're thrilled to help you provide the best nutrition for your little ones with our fresh, organic baby food delivery service.
          </div>
          <div class="features">
            <div class="feature">
              <h3>🍼 Fresh Products</h3>
              <p>Browse our carefully curated selection of organic baby foods made with the finest ingredients.</p>
            </div>
            <div class="feature">
              <h3>🛒 Easy Shopping</h3>
              <p>Create and manage your shopping cart with ease. Save your favorites for quick reordering.</p>
            </div>
            <div class="feature">
              <h3>👶 Child Profiles</h3>
              <p>Set up profiles with dietary preferences and allergies to get personalized recommendations.</p>
            </div>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest! Questions? Contact us at support@littleharvest.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 5: Split Layout
function generateTemplate5(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #f1f5f9; }
        .container { max-width: 700px; margin: 0 auto; background: white; }
        .header { background: ${colors.primary}; color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .main-content { display: flex; }
        .left-column { flex: 1; padding: 30px; }
        .right-column { flex: 1; padding: 30px; background: #f8fafc; }
        .welcome-text { font-size: 16px; line-height: 1.6; margin-bottom: 30px; }
        .feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .feature-item { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .feature-item h4 { margin: 0 0 8px 0; color: ${colors.primary}; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { background: ${colors.primary}; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Little Harvest!</h1>
          <p>Hello Matty Test, we're excited to have you join our family!</p>
        </div>
        <div class="main-content">
          <div class="left-column">
            <div class="welcome-text">
              Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones with our fresh, organic baby food delivery service.
            </div>
            <div class="cta">
              <a href="#">Start Shopping Now</a>
            </div>
          </div>
          <div class="right-column">
            <h3>What you can do:</h3>
            <div class="feature-grid">
              <div class="feature-item">
                <h4>🍼 Fresh Products</h4>
                <p>Organic baby foods</p>
              </div>
              <div class="feature-item">
                <h4>🛒 Easy Shopping</h4>
                <p>Cart management</p>
              </div>
              <div class="feature-item">
                <h4>👶 Child Profiles</h4>
                <p>Dietary preferences</p>
              </div>
              <div class="feature-item">
                <h4>📦 Order Tracking</h4>
                <p>Track deliveries</p>
              </div>
            </div>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 6: Bold & Bright
function generateTemplate6(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #fef3c7; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .header { background: linear-gradient(45deg, ${colors.primary}, ${colors.accent}); color: white; padding: 50px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; }
        .content { padding: 40px 30px; }
        .highlight-box { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 30px; border-radius: 15px; margin: 20px 0; text-align: center; border: 3px solid ${colors.primary}; }
        .features { display: flex; flex-wrap: wrap; gap: 15px; margin: 30px 0; }
        .feature { flex: 1; min-width: 150px; background: ${colors.primary}; color: white; padding: 20px; border-radius: 10px; text-align: center; }
        .feature h3 { margin: 0 0 10px 0; font-size: 18px; }
        .cta { text-align: center; margin: 40px 0; }
        .cta a { background: linear-gradient(45deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 20px 40px; text-decoration: none; border-radius: 50px; font-weight: 700; font-size: 18px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
        .footer { background: #1f2937; color: white; padding: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome!</h1>
          <p style="font-size: 18px; margin: 10px 0 0 0;">Hello Matty Test!</p>
        </div>
        <div class="content">
          <div class="highlight-box">
            <h2 style="margin: 0 0 15px 0; color: ${colors.text};">🎉 You're All Set!</h2>
            <p style="margin: 0; font-size: 16px;">Thank you for joining Little Harvest! We're excited to help you provide the best nutrition for your little ones.</p>
          </div>
          <div class="features">
            <div class="feature">
              <h3>🍼 Fresh Products</h3>
              <p>Organic baby foods</p>
            </div>
            <div class="feature">
              <h3>🛒 Easy Shopping</h3>
              <p>Simple cart management</p>
            </div>
            <div class="feature">
              <h3>👶 Child Profiles</h3>
              <p>Dietary preferences</p>
            </div>
            <div class="feature">
              <h3>📦 Order Tracking</h3>
              <p>Track deliveries</p>
            </div>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0; font-size: 16px;">Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 7: Elegant & Simple
function generateTemplate7(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background: #ffffff; }
        .container { max-width: 500px; margin: 0 auto; background: white; }
        .header { background: white; padding: 60px 40px 40px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 300; color: ${colors.text}; }
        .header p { margin: 10px 0 0 0; color: #6b7280; font-size: 14px; }
        .content { padding: 40px; }
        .welcome-text { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 40px; }
        .feature { margin: 25px 0; padding: 0; border-left: 2px solid ${colors.primary}; padding-left: 20px; }
        .feature h3 { margin: 0 0 8px 0; font-size: 16px; font-weight: 500; color: ${colors.text}; }
        .feature p { margin: 0; font-size: 14px; color: #6b7280; }
        .cta { text-align: center; margin: 50px 0; }
        .cta a { background: ${colors.primary}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500; }
        .footer { background: #f9fafb; padding: 30px 40px; text-align: center; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Little Harvest</h1>
          <p>Hello Matty Test</p>
        </div>
        <div class="content">
          <div class="welcome-text">
            Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones with our fresh, organic baby food delivery service.
          </div>
          <div class="feature">
            <h3>Fresh Products</h3>
            <p>Browse our carefully curated selection of organic baby foods</p>
          </div>
          <div class="feature">
            <h3>Easy Shopping</h3>
            <p>Create and manage your shopping cart with ease</p>
          </div>
          <div class="feature">
            <h3>Child Profiles</h3>
            <p>Set up profiles with dietary preferences and allergies</p>
          </div>
          <div class="feature">
            <h3>Order Tracking</h3>
            <p>Track your orders from preparation to delivery</p>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 8: Colorful & Fun
function generateTemplate8(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 25px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
        .header { background: linear-gradient(135deg, ${colors.primary}, ${colors.accent}); color: white; padding: 40px 30px; text-align: center; position: relative; }
        .header::after { content: '🌱'; position: absolute; top: 20px; right: 30px; font-size: 30px; opacity: 0.3; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 30px; }
        .welcome-box { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 15px; margin: 20px 0; text-align: center; }
        .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
        .feature { background: linear-gradient(135deg, #ddd6fe, #c4b5fd); padding: 20px; border-radius: 12px; text-align: center; }
        .feature:nth-child(odd) { background: linear-gradient(135deg, #bfdbfe, #93c5fd); }
        .feature h3 { margin: 0 0 10px 0; color: ${colors.text}; }
        .cta { text-align: center; margin: 30px 0; }
        .cta a { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 16px 32px; text-decoration: none; border-radius: 25px; font-weight: 600; box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
        .footer { background: #f8fafc; padding: 25px; text-align: center; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Little Harvest!</h1>
          <p>Hello Matty Test, we're excited to have you join our family!</p>
        </div>
        <div class="content">
          <div class="welcome-box">
            <h2 style="margin: 0 0 10px 0; color: ${colors.text};">🎉 You're All Set!</h2>
            <p style="margin: 0;">Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones.</p>
          </div>
          <div class="features">
            <div class="feature">
              <h3>🍼 Fresh Products</h3>
              <p>Organic baby foods</p>
            </div>
            <div class="feature">
              <h3>🛒 Easy Shopping</h3>
              <p>Cart management</p>
            </div>
            <div class="feature">
              <h3>👶 Child Profiles</h3>
              <p>Dietary preferences</p>
            </div>
            <div class="feature">
              <h3>📦 Order Tracking</h3>
              <p>Track deliveries</p>
            </div>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 9: Professional Business
function generateTemplate9(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { background: ${colors.primary}; color: white; padding: 35px 40px; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
        .header p { margin: 8px 0 0 0; opacity: 0.9; }
        .content { padding: 40px; }
        .intro { font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 30px; }
        .benefits { margin: 30px 0; }
        .benefit { display: flex; align-items: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
        .benefit-icon { font-size: 24px; margin-right: 15px; }
        .benefit-content h3 { margin: 0 0 5px 0; color: ${colors.text}; font-size: 16px; }
        .benefit-content p { margin: 0; color: #666; font-size: 14px; }
        .cta { text-align: center; margin: 40px 0; }
        .cta a { background: ${colors.primary}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; }
        .footer { background: #f8f9fa; padding: 25px 40px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Little Harvest</h1>
          <p>Dear Matty Test,</p>
        </div>
        <div class="content">
          <div class="intro">
            Thank you for joining Little Harvest! We're excited to partner with you in providing the best nutrition for your little ones through our premium organic baby food delivery service.
          </div>
          <div class="benefits">
            <div class="benefit">
              <div class="benefit-icon">🍼</div>
              <div class="benefit-content">
                <h3>Premium Fresh Products</h3>
                <p>Carefully curated selection of organic baby foods made with the finest ingredients</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">🛒</div>
              <div class="benefit-content">
                <h3>Streamlined Shopping Experience</h3>
                <p>Intuitive cart management and easy reordering for your convenience</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">👶</div>
              <div class="benefit-content">
                <h3>Personalized Child Profiles</h3>
                <p>Customize dietary preferences and allergies for tailored recommendations</p>
              </div>
            </div>
            <div class="benefit">
              <div class="benefit-icon">📦</div>
              <div class="benefit-content">
                <h3>Complete Order Tracking</h3>
                <p>Monitor your orders from preparation to doorstep delivery</p>
              </div>
            </div>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p>Thank you for choosing Little Harvest! Questions? Contact us at support@littleharvest.co.za</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template 10: Creative & Artistic
function generateTemplate10(colors) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Little Harvest</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 0; background: #f0f4f8; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 35px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 50%, ${colors.secondary} 100%); color: white; padding: 50px 30px; text-align: center; position: relative; }
        .header::before { content: ''; position: absolute; top: -50px; left: -50px; right: -50px; bottom: -50px; background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 20px 20px; animation: float 20s infinite linear; }
        @keyframes float { 0% { transform: translateX(0); } 100% { transform: translateX(-20px); } }
        .header-content { position: relative; z-index: 1; }
        .header h1 { margin: 0; font-size: 32px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .artistic-box { background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 30px; border-radius: 20px; margin: 25px 0; text-align: center; position: relative; }
        .artistic-box::before { content: '✨'; position: absolute; top: -10px; left: 20px; font-size: 20px; }
        .artistic-box::after { content: '✨'; position: absolute; top: -10px; right: 20px; font-size: 20px; }
        .features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
        .feature { background: linear-gradient(135deg, #e0f2fe, #b3e5fc); padding: 25px; border-radius: 15px; text-align: center; transform: rotate(-1deg); transition: transform 0.3s ease; }
        .feature:nth-child(even) { transform: rotate(1deg); background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
        .feature:hover { transform: rotate(0deg) scale(1.05); }
        .feature h3 { margin: 0 0 10px 0; color: ${colors.text}; font-size: 16px; }
        .cta { text-align: center; margin: 40px 0; }
        .cta a { background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary}); color: white; padding: 18px 36px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .footer { background: linear-gradient(135deg, #1f2937, #374151); color: white; padding: 30px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <h1>Welcome to Little Harvest!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Hello Matty Test, we're excited to have you join our family!</p>
          </div>
        </div>
        <div class="content">
          <div class="artistic-box">
            <h2 style="margin: 0 0 15px 0; color: ${colors.text};">🎉 You're All Set!</h2>
            <p style="margin: 0; font-size: 16px;">Thank you for signing up! We're thrilled to help you provide the best nutrition for your little ones with our fresh, organic baby food delivery service.</p>
          </div>
          <div class="features">
            <div class="feature">
              <h3>🍼 Fresh Products</h3>
              <p>Organic baby foods</p>
            </div>
            <div class="feature">
              <h3>🛒 Easy Shopping</h3>
              <p>Cart management</p>
            </div>
            <div class="feature">
              <h3>👶 Child Profiles</h3>
              <p>Dietary preferences</p>
            </div>
            <div class="feature">
              <h3>📦 Order Tracking</h3>
              <p>Track deliveries</p>
            </div>
          </div>
          <div class="cta">
            <a href="#">Start Shopping Now</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0; font-size: 16px;">Thank you for choosing Little Harvest!</p>
        </div>
      </div>
    </body>
    </html>
  `
}

async function sendAllTemplates() {
  console.log('📧 Sending 10 different email template designs...\n')

  const customerEmail = process.env.EMAIL_SERVER_USER || 'littleharvest9@gmail.com'
  
  // Default colors
  const colors = {
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    background: '#ffffff',
    text: '#111827',
    muted: '#6b7280'
  }

  const templates = [
    { name: 'Template 1: Minimal Clean', generator: generateTemplate1 },
    { name: 'Template 2: Card-Based', generator: generateTemplate2 },
    { name: 'Template 3: Modern Gradient', generator: generateTemplate3 },
    { name: 'Template 4: Newsletter Style', generator: generateTemplate4 },
    { name: 'Template 5: Split Layout', generator: generateTemplate5 },
    { name: 'Template 6: Bold & Bright', generator: generateTemplate6 },
    { name: 'Template 7: Elegant & Simple', generator: generateTemplate7 },
    { name: 'Template 8: Colorful & Fun', generator: generateTemplate8 },
    { name: 'Template 9: Professional Business', generator: generateTemplate9 },
    { name: 'Template 10: Creative & Artistic', generator: generateTemplate10 },
  ]

  for (let i = 0; i < templates.length; i++) {
    const template = templates[i]
    console.log(`📤 Sending ${template.name}...`)
    
    try {
      const html = template.generator(colors)
      
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: customerEmail,
        subject: `${template.name} - Welcome to Little Harvest`,
        html: html,
        text: `Welcome to Little Harvest! This is ${template.name}.`
      })
      
      console.log(`✅ ${template.name} sent successfully!`)
    } catch (error) {
      console.error(`❌ Error sending ${template.name}:`, error.message)
    }
    
    console.log('') // Newline for readability
  }

  console.log('🎉 All 10 email templates sent!')
  console.log('📬 Check your inbox to review all designs!')
  console.log('🔢 Each email is numbered 1-10 for easy selection')
  console.log('💬 Let me know which template number you prefer!')
}

sendAllTemplates()
