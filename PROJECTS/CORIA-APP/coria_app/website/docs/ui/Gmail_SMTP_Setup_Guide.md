# Gmail SMTP Setup Guide - CORIA Foundation Email

**Purpose:** Configure Gmail SMTP for sending Foundation application emails
**Time Required:** 5-10 minutes
**Prerequisites:** Gmail account with 2-Factor Authentication enabled

---

## 📧 Step 1: Enable 2-Factor Authentication (If Not Already Enabled)

1. Go to: https://myaccount.google.com/security
2. Scroll to "2-Step Verification"
3. Click "Get Started" and follow the prompts
4. ⚠️ **You MUST enable 2FA before creating App Passwords**

---

## 🔑 Step 2: Generate Gmail App Password

### Option A: Direct Link (Fastest)
1. Go directly to: **https://myaccount.google.com/apppasswords**
2. You may be asked to sign in again

### Option B: Navigate Manually
1. Go to: https://myaccount.google.com/
2. Click "Security" in left sidebar
3. Scroll down to "How you sign in to Google"
4. Click "2-Step Verification" (must be enabled)
5. Scroll to bottom → Click "App passwords"

### Creating the Password
1. In "Select app" dropdown → Choose **"Mail"**
2. In "Select device" dropdown → Choose **"Other (Custom name)"**
3. Enter name: **"CORIA Foundation"**
4. Click **"Generate"**
5. Gmail shows a 16-character password: **`xxxx xxxx xxxx xxxx`**
6. ⚠️ **COPY THIS NOW - You won't see it again!**

---

## ⚙️ Step 3: Configure .env.local File

1. Open `/website/.env.local` in your editor
2. Find the email configuration section:

```bash
# ========================================
# EMAIL CONFIGURATION (Foundation Applications)
# ========================================
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-gmail@gmail.com              # ← Replace with YOUR Gmail
MAIL_PASS=your-app-specific-password        # ← Replace with 16-char password
MAIL_FROM=foundation@coria.app              # ← Keep or change to your email
MAIL_TO=foundation@coria.app                # ← Where applications go
```

3. **Replace these values:**
   - `MAIL_USER` → Your full Gmail address (e.g., `john.doe@gmail.com`)
   - `MAIL_PASS` → The 16-character App Password (remove spaces: `xxxxxxxxxxxxxxxx`)
   - `MAIL_FROM` → Email address shown as sender (can be different from MAIL_USER)
   - `MAIL_TO` → Where application notifications should go (operations team)

### Example Configuration:
```bash
MAIL_USER=john.doe@gmail.com
MAIL_PASS=abcdEFGH1234ijkl                   # Real format (no spaces)
MAIL_FROM=foundation@coria.app
MAIL_TO=operations@coria.app
```

---

## ✅ Step 4: Test Email Configuration

### Quick Test Script

Create a test file: `/website/test-email.js`

```javascript
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('📧 Testing email configuration...\n');

  console.log('Configuration:');
  console.log(`  Host: ${process.env.MAIL_HOST}`);
  console.log(`  Port: ${process.env.MAIL_PORT}`);
  console.log(`  User: ${process.env.MAIL_USER}`);
  console.log(`  From: ${process.env.MAIL_FROM}`);
  console.log(`  To: ${process.env.MAIL_TO}\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  try {
    console.log('Verifying connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');

    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: '🧪 CORIA Foundation - Email Test',
      text: 'This is a test email from CORIA Foundation application system.',
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #2C5530;">✅ Email Configuration Successful</h2>
          <p>This is a test email from the CORIA Foundation application system.</p>
          <p>If you're seeing this, your Gmail SMTP configuration is working correctly!</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toISOString()}<br>
            From: ${process.env.MAIL_FROM}<br>
            To: ${process.env.MAIL_TO}
          </p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}\n`);
    console.log('Check your inbox at:', process.env.MAIL_TO);

  } catch (error) {
    console.error('❌ Email test failed:', error.message);

    if (error.code === 'EAUTH') {
      console.error('\n⚠️  Authentication failed. Check:');
      console.error('   1. MAIL_USER is correct Gmail address');
      console.error('   2. MAIL_PASS is the 16-char App Password (not your Gmail password)');
      console.error('   3. 2FA is enabled on your Gmail account');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  Cannot reach SMTP server. Check:');
      console.error('   1. Internet connection');
      console.error('   2. MAIL_HOST is correct (smtp.gmail.com)');
    }
  }
}

testEmail();
```

### Run the Test:
```bash
cd website
node test-email.js
```

### Expected Output (Success):
```
📧 Testing email configuration...

Configuration:
  Host: smtp.gmail.com
  Port: 587
  User: john.doe@gmail.com
  From: foundation@coria.app
  To: operations@coria.app

Verifying connection...
✅ SMTP connection successful!

Sending test email...
✅ Test email sent successfully!
📬 Message ID: <abc123@gmail.com>

Check your inbox at: operations@coria.app
```

---

## 🐛 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause:** Wrong credentials or 2FA not enabled

**Solution:**
1. Double-check MAIL_USER is your full Gmail (include @gmail.com)
2. Verify MAIL_PASS is the 16-char App Password (not your Gmail password)
3. Make sure no spaces in the password
4. Confirm 2FA is enabled: https://myaccount.google.com/security

---

### Error: "Less secure app access"

**Cause:** Trying to use regular Gmail password instead of App Password

**Solution:**
- **Don't** enable "Less secure app access" (deprecated by Google)
- **Do** use App Password as described in Step 2

---

### Error: "ECONNREFUSED" or "ETIMEDOUT"

**Cause:** Cannot reach Gmail SMTP server

**Solution:**
1. Check internet connection
2. Verify MAIL_HOST=smtp.gmail.com
3. Verify MAIL_PORT=587
4. Check if firewall is blocking port 587
5. Try from different network (corporate firewalls may block SMTP)

---

### Error: "Daily sending quota exceeded"

**Cause:** Gmail has daily sending limits

**Gmail Sending Limits:**
- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2,000 emails/day

**Solution:**
- For production, consider using a dedicated email service (SendGrid, AWS SES, Mailgun)
- For development, 500/day is usually sufficient

---

## 🔒 Security Best Practices

### ✅ DO:
- Use App Password (16-char), not your Gmail password
- Keep `.env.local` in `.gitignore` (it should be there already)
- Use different Gmail for production vs development
- Revoke App Password if compromised: https://myaccount.google.com/apppasswords
- Monitor Gmail "Security" page for suspicious activity

### ❌ DON'T:
- Commit `.env.local` to git
- Share your App Password
- Use same Gmail for multiple services (create service-specific accounts)
- Enable "Less secure app access"
- Use your personal Gmail password in MAIL_PASS

---

## 📊 Production Deployment Considerations

### For Production, Consider:

**Option 1: Dedicated Gmail Account**
- Create: `foundation@yourdomain.com` (via Google Workspace)
- Benefit: Professional, branded email address
- Cost: $6/user/month
- Limit: 2,000 emails/day

**Option 2: Transactional Email Service**
- **SendGrid:** 100 emails/day free, then $19.95/month (40k emails)
- **AWS SES:** $0.10 per 1,000 emails (cheapest for high volume)
- **Mailgun:** 5,000 emails/month free, then pay-as-you-go
- **Postmark:** $10/month for 10k emails (best deliverability)

**Benefit:** Better deliverability, tracking, templates, no daily limits

---

## 📧 Email Template Customization

Once email is working, customize templates in:
- `/website/docs/ui/Foundation_Apply_Email_Templates.md`

Templates use variable substitution:
```javascript
const emailHtml = template
  .replace('{contactName}', applicant.name)
  .replace('{applicationId}', application.id)
  .replace('{projectName}', application.projectName);
```

---

## ✅ Verification Checklist

Before going live:

- [ ] Gmail App Password created
- [ ] `.env.local` configured with correct credentials
- [ ] Test email sent successfully (`node test-email.js`)
- [ ] Received test email in inbox (check spam folder if not)
- [ ] `.env.local` is in `.gitignore` (verify: `git status` should NOT show it)
- [ ] Applicant confirmation email template reviewed
- [ ] Operations notification email template reviewed
- [ ] MAIL_FROM address is appropriate for branding
- [ ] MAIL_TO address goes to correct team inbox

---

## 🎯 Next Steps

1. **Test the full application flow:**
   ```bash
   cd website
   npm run dev
   # Navigate to: http://localhost:3000/en/foundation/apply
   # Fill and submit test application
   # Check email inbox
   ```

2. **Run E2E tests:**
   ```bash
   npx playwright test foundation-apply.spec.ts
   ```

3. **Monitor email delivery:**
   - Check Gmail "Sent" folder
   - Verify both emails sent (applicant + operations)
   - Check spam folders if missing

---

**Setup Date:** 2025-01-14
**Next Review:** Before production deployment

*For support, contact: dpo@coria.app*
