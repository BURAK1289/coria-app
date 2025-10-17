const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('📧 Testing CORIA Foundation Email Configuration...\n');

  // Display configuration (hide password)
  console.log('Configuration:');
  console.log(`  Host: ${process.env.MAIL_HOST}`);
  console.log(`  Port: ${process.env.MAIL_PORT}`);
  console.log(`  Secure: ${process.env.MAIL_SECURE}`);
  console.log(`  User: ${process.env.MAIL_USER}`);
  console.log(`  Pass: ${process.env.MAIL_PASS ? '****' + process.env.MAIL_PASS.slice(-4) : 'NOT SET'}`);
  console.log(`  From: ${process.env.MAIL_FROM}`);
  console.log(`  To: ${process.env.MAIL_TO}\n`);

  // Check if credentials are set
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    console.error('❌ ERROR: Email credentials not configured!');
    console.error('\n⚠️  Please update .env.local file with:');
    console.error('   MAIL_USER=your-gmail@gmail.com');
    console.error('   MAIL_PASS=your-16-char-app-password\n');
    console.error('📖 See: docs/ui/Gmail_SMTP_Setup_Guide.md for instructions');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587'),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    console.log('🔌 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    console.log('📨 Sending test email...');
    const info = await transporter.sendMail({
      from: `"CORIA Foundation" <${process.env.MAIL_FROM}>`,
      to: process.env.MAIL_TO,
      subject: '🧪 CORIA Foundation - Email Configuration Test',
      text: `This is a test email from CORIA Foundation application system.

Sent at: ${new Date().toISOString()}
From: ${process.env.MAIL_FROM}
To: ${process.env.MAIL_TO}

If you're seeing this, your email configuration is working correctly!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2C5530 0%, #4A7C4E 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 28px; }
            .content { background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; }
            .success { background: #d4edda; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #c3e6cb; }
            .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2C5530; }
            .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CORIA Foundation</h1>
              <p style="color: #e0e0e0; margin: 10px 0 0 0;">Email Configuration Test</p>
            </div>

            <div class="content">
              <div class="success">
                <h2 style="margin-top: 0;">✅ Email Configuration Successful!</h2>
                <p>If you're seeing this, your Gmail SMTP configuration is working correctly.</p>
              </div>

              <h3 style="color: #2C5530;">Test Details</h3>

              <div class="info-box">
                <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
                <p><strong>From:</strong> ${process.env.MAIL_FROM}</p>
                <p><strong>To:</strong> ${process.env.MAIL_TO}</p>
                <p><strong>SMTP Host:</strong> ${process.env.MAIL_HOST}</p>
                <p><strong>SMTP Port:</strong> ${process.env.MAIL_PORT}</p>
              </div>

              <h3 style="color: #2C5530;">Next Steps</h3>
              <ol>
                <li>Test the Foundation application form at: <a href="http://localhost:3000/en/foundation/apply" style="color: #2C5530;">localhost:3000/en/foundation/apply</a></li>
                <li>Submit a test application and verify both emails are sent:
                  <ul>
                    <li>Applicant confirmation email</li>
                    <li>Operations team notification email</li>
                  </ul>
                </li>
                <li>Run E2E tests: <code>npx playwright test foundation-apply.spec.ts</code></li>
              </ol>

              <p>Your Foundation application email system is ready! 🎉</p>
            </div>

            <div class="footer">
              <p><strong>CORIA Foundation</strong></p>
              <p>Email Configuration Test - Development Environment</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`\n📬 Message ID: ${info.messageId}`);
    console.log(`📧 Check your inbox at: ${process.env.MAIL_TO}\n`);
    console.log('💡 If you don\'t see it in a few seconds, check your spam folder.');
    console.log('\n🎯 Next: Test the full application flow at http://localhost:3000/en/foundation/apply\n');

  } catch (error) {
    console.error('\n❌ Email test failed!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code);

    if (error.code === 'EAUTH') {
      console.error('\n⚠️  AUTHENTICATION FAILED');
      console.error('\nPossible causes:');
      console.error('   1. MAIL_USER is not your full Gmail address (must include @gmail.com)');
      console.error('   2. MAIL_PASS is not the 16-character App Password');
      console.error('   3. You\'re using your Gmail password instead of App Password');
      console.error('   4. 2-Factor Authentication is not enabled on your Gmail account');
      console.error('\n✅ Solution:');
      console.error('   1. Enable 2FA: https://myaccount.google.com/security');
      console.error('   2. Create App Password: https://myaccount.google.com/apppasswords');
      console.error('   3. Update .env.local with the 16-char password (remove spaces)');
      console.error('\n📖 See: docs/ui/Gmail_SMTP_Setup_Guide.md for detailed instructions');

    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  CANNOT REACH SMTP SERVER');
      console.error('\nPossible causes:');
      console.error('   1. No internet connection');
      console.error('   2. MAIL_HOST is incorrect (should be smtp.gmail.com)');
      console.error('   3. MAIL_PORT is incorrect (should be 587)');
      console.error('   4. Firewall is blocking port 587');
      console.error('\n✅ Solution:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify .env.local has: MAIL_HOST=smtp.gmail.com and MAIL_PORT=587');
      console.error('   3. Try from a different network if corporate firewall is blocking');

    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  CONNECTION TIMEOUT');
      console.error('\nPossible causes:');
      console.error('   1. Slow or unstable internet connection');
      console.error('   2. Firewall blocking SMTP traffic');
      console.error('   3. Gmail SMTP temporarily unavailable');
      console.error('\n✅ Solution:');
      console.error('   1. Check your internet speed');
      console.error('   2. Try again in a few minutes');
      console.error('   3. Try from a different network');

    } else {
      console.error('\n⚠️  UNEXPECTED ERROR');
      console.error('\nFull error details:');
      console.error(error);
      console.error('\n📖 See: docs/ui/Gmail_SMTP_Setup_Guide.md for troubleshooting');
    }

    console.error('\n');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled error:', error);
  process.exit(1);
});

// Run the test
testEmail();
