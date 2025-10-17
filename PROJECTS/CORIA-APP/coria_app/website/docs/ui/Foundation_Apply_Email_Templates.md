# CORIA Foundation - Email Templates Library
## Comprehensive Communication Templates for Foundation Application System

**Version:** 1.0
**Last Updated:** 2025-01-14
**Template Owner:** Operations Team
**Language Support:** Turkish (TR), English (EN)

---

## 📋 Table of Contents

1. [Application Confirmation Templates](#1-application-confirmation-templates)
2. [Operations Notification Templates](#2-operations-notification-templates)
3. [Decision Notification Templates](#3-decision-notification-templates)
4. [Data Rights Request Templates](#4-data-rights-request-templates)
5. [Data Breach Notification Templates](#5-data-breach-notification-templates)
6. [Follow-up & Reminder Templates](#6-follow-up--reminder-templates)
7. [Template Usage Guidelines](#7-template-usage-guidelines)
8. [Variable Reference](#8-variable-reference)

---

## 1. Application Confirmation Templates

### 1.1 Applicant Confirmation (EN)

**Subject:** CORIA Foundation Application Received - {applicationId}

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2C5530 0%, #4A7C4E 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; }
    .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2C5530; }
    .info-box p { margin: 8px 0; }
    .info-box strong { color: #2C5530; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; padding: 14px 28px; background: #2C5530; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
    .timeline { margin: 24px 0; }
    .timeline-item { padding: 12px 0; border-left: 2px solid #2C5530; padding-left: 20px; margin-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CORIA Foundation</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0;">Application Received Successfully</p>
    </div>

    <div class="content">
      <h2 style="color: #2C5530;">Thank You for Your Application!</h2>

      <p>Dear {contactName},</p>

      <p>We have successfully received your grant application for "<strong>{projectName}</strong>" and are grateful for your commitment to {categoryDisplay}.</p>

      <div class="info-box">
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Project:</strong> {projectName}</p>
        <p><strong>Category:</strong> {categoryDisplay}</p>
        <p><strong>Requested Amount:</strong> ₺{requestedAmount}</p>
        <p><strong>Submitted:</strong> {submissionDate}</p>
      </p>
      </div>

      <h3 style="color: #2C5530;">What Happens Next?</h3>

      <div class="timeline">
        <div class="timeline-item">
          <strong>Days 1-3: Initial Review</strong>
          <p>Our operations team will verify your application completeness and eligibility.</p>
        </div>
        <div class="timeline-item">
          <strong>Days 4-13: Detailed Evaluation</strong>
          <p>Our evaluation committee will assess your project against our mission alignment, impact potential, feasibility, and budget efficiency criteria.</p>
        </div>
        <div class="timeline-item">
          <strong>Days 14-20: Committee Decision</strong>
          <p>The Foundation Board will make the final funding decision.</p>
        </div>
        <div class="timeline-item">
          <strong>Within 24 hours of decision:</strong>
          <p>You will receive notification of the outcome.</p>
        </div>
      </div>

      <p><strong>Expected Decision Timeline:</strong> Within 20 business days (approximately 4 weeks)</p>

      <h3 style="color: #2C5530;">Your Application Data</h3>

      <p>We take your privacy seriously. Your application data is:</p>
      <ul>
        <li>Encrypted and stored securely</li>
        <li>Accessible only to authorized evaluation team members</li>
        <li>Retained for 24 months (rejected applications) or 7 years (funded projects for compliance)</li>
        <li>Protected under KVKK and GDPR standards</li>
      </ul>

      <p>You have the right to access, correct, or request deletion of your data at any time. Learn more in our <a href="https://coria.app/foundation/privacy" style="color: #2C5530;">Privacy Policy</a>.</p>

      <h3 style="color: #2C5530;">Questions?</h3>

      <p>If you have any questions about your application or the review process, please don't hesitate to contact us:</p>
      <ul>
        <li><strong>Email:</strong> foundation@coria.app</li>
        <li><strong>Application Portal:</strong> <a href="https://coria.app/foundation/apply" style="color: #2C5530;">coria.app/foundation/apply</a></li>
      </ul>

      <p>We appreciate your patience during the evaluation process and look forward to reviewing your impactful project.</p>

      <p>Best regards,<br>
      <strong>CORIA Foundation Operations Team</strong></p>
    </div>

    <div class="footer">
      <p><strong>CORIA Foundation</strong></p>
      <p>Empowering sustainable impact through strategic funding</p>
      <p style="font-size: 12px; color: #999; margin-top: 16px;">
        This is an automated confirmation. Please do not reply directly to this email.<br>
        For inquiries, contact <a href="mailto:foundation@coria.app" style="color: #2C5530;">foundation@coria.app</a>
      </p>
    </div>
  </div>
</body>
</html>
```

**Plain Text Body:**
```
CORIA Foundation - Application Received

Dear {contactName},

We have successfully received your grant application for "{projectName}" and are
grateful for your commitment to {categoryDisplay}.

Application Details:
- Application ID: {applicationId}
- Project: {projectName}
- Category: {categoryDisplay}
- Requested Amount: ₺{requestedAmount}
- Submitted: {submissionDate}

What Happens Next?

Days 1-3: Initial Review
Our operations team will verify your application completeness and eligibility.

Days 4-13: Detailed Evaluation
Our evaluation committee will assess your project.

Days 14-20: Committee Decision
The Foundation Board will make the final funding decision.

Within 24 hours of decision: You will receive notification of the outcome.

Expected Decision Timeline: Within 20 business days (approximately 4 weeks)

Your Application Data:
Your data is encrypted, secure, and protected under KVKK and GDPR standards.
You have the right to access, correct, or request deletion at any time.

Privacy Policy: https://coria.app/foundation/privacy

Questions?
Email: foundation@coria.app
Application Portal: https://coria.app/foundation/apply

Best regards,
CORIA Foundation Operations Team
```

### 1.2 Applicant Confirmation (TR)

**Subject:** CORIA Foundation Başvurunuz Alındı - {applicationId}

**HTML Body:**
```html
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2C5530 0%, #4A7C4E 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; }
    .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2C5530; }
    .info-box p { margin: 8px 0; }
    .info-box strong { color: #2C5530; }
    .footer { background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
    .timeline { margin: 24px 0; }
    .timeline-item { padding: 12px 0; border-left: 2px solid #2C5530; padding-left: 20px; margin-left: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CORIA Foundation</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0;">Başvurunuz Başarıyla Alındı</p>
    </div>

    <div class="content">
      <h2 style="color: #2C5530;">Başvurunuz İçin Teşekkür Ederiz!</h2>

      <p>Sayın {contactName},</p>

      <p>"{projectName}" projeniz için yaptığınız hibe başvurusunu başarıyla aldık ve {categoryDisplay} alanındaki bağlılığınız için minnettar</p>
      <p>"{projectName}" projeniz için yaptığınız hibe başvurusunu başarıyla aldık ve {categoryDisplay} alanındaki bağlılığınız için minnettarız.</p>

      <div class="info-box">
        <p><strong>Başvuru No:</strong> {applicationId}</p>
        <p><strong>Proje:</strong> {projectName}</p>
        <p><strong>Kategori:</strong> {categoryDisplay}</p>
        <p><strong>Talep Edilen Tutar:</strong> ₺{requestedAmount}</p>
        <p><strong>Gönderim Tarihi:</strong> {submissionDate}</p>
      </div>

      <h3 style="color: #2C5530;">Süreç Nasıl İlerleyecek?</h3>

      <div class="timeline">
        <div class="timeline-item">
          <strong>1-3. Günler: Ön İnceleme</strong>
          <p>Operasyon ekibimiz başvurunuzun eksiksizliğini ve uygunluğunu doğrulayacak.</p>
        </div>
        <div class="timeline-item">
          <strong>4-13. Günler: Detaylı Değerlendirme</strong>
          <p>Değerlendirme komitemiz projenizi misyon uyumu, etki potansiyeli, fizibilite ve bütçe verimliliği kriterlerine göre değerlendirecek.</p>
        </div>
        <div class="timeline-item">
          <strong>14-20. Günler: Kurul Kararı</strong>
          <p>Vakıf Yönetim Kurulu nihai fon kararını verecek.</p>
        </div>
        <div class="timeline-item">
          <strong>Karar sonrası 24 saat içinde:</strong>
          <p>Sonuç bildirimi alacaksınız.</p>
        </div>
      </div>

      <p><strong>Tahmini Karar Süresi:</strong> 20 iş günü içinde (yaklaşık 4 hafta)</p>

      <h3 style="color: #2C5530;">Başvuru Verileriniz</h3>

      <p>Gizliliğinizi ciddiye alıyoruz. Başvuru verileriniz:</p>
      <ul>
        <li>Şifreli ve güvenli şekilde saklanıyor</li>
        <li>Yalnızca yetkili değerlendirme ekibi üyeleri tarafından erişilebilir</li>
        <li>24 ay (reddedilen başvurular) veya 7 yıl (fonlanan projeler, yasal uyumluluk için) süreyle saklanıyor</li>
        <li>KVKK ve GDPR standartları altında korunuyor</li>
      </ul>

      <p>Verilerinize erişim, düzeltme veya silme talebinde bulunma hakkına her zaman sahipsiniz. Daha fazla bilgi için <a href="https://coria.app/foundation/privacy" style="color: #2C5530;">Gizlilik Politikamıza</a> bakın.</p>

      <h3 style="color: #2C5530;">Sorularınız mı Var?</h3>

      <p>Başvurunuz veya değerlendirme süreci hakkında sorularınız varsa lütfen bizimle iletişime geçmekten çekinmeyin:</p>
      <ul>
        <li><strong>E-posta:</strong> foundation@coria.app</li>
        <li><strong>Başvuru Portalı:</strong> <a href="https://coria.app/foundation/apply" style="color: #2C5530;">coria.app/foundation/apply</a></li>
      </ul>

      <p>Değerlendirme sürecindeki sabrınız için teşekkür eder, etkili projenizi incelemek için sabırsızlanıyoruz.</p>

      <p>Saygılarımızla,<br>
      <strong>CORIA Foundation Operasyon Ekibi</strong></p>
    </div>

    <div class="footer">
      <p><strong>CORIA Foundation</strong></p>
      <p>Stratejik fonlama yoluyla sürdürülebilir etkiyi güçlendiriyoruz</p>
      <p style="font-size: 12px; color: #999; margin-top: 16px;">
        Bu otomatik bir onay e-postasıdır. Lütfen doğrudan yanıtlamayın.<br>
        Sorularınız için <a href="mailto:foundation@coria.app" style="color: #2C5530;">foundation@coria.app</a> ile iletişime geçin
      </p>
    </div>
  </div>
</body>
</html>
```

**Plain Text Body:** (Similar structure, Turkish)

---

## 2. Operations Notification Templates

### 2.1 New Application Notification (Internal)

**Subject:** [NEW APPLICATION] {projectName} - {categoryDisplay} - {applicationId}

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: monospace; font-size: 13px; }
    .header { background: #2C5530; color: white; padding: 15px; font-weight: bold; }
    .section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #2C5530; }
    .field { margin: 8px 0; }
    .label { font-weight: bold; color: #2C5530; display: inline-block; width: 200px; }
    .priority { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0; }
    .attachments { background: #e7f3ff; padding: 10px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    🆕 NEW FOUNDATION APPLICATION RECEIVED
  </div>

  <div class="section">
    <h3>📋 Application Summary</h3>
    <div class="field"><span class="label">Application ID:</span> {applicationId}</div>
    <div class="field"><span class="label">Project Name:</span> {projectName}</div>
    <div class="field"><span class="label">Category:</span> {categoryDisplay}</div>
    <div class="field"><span class="label">Organization Type:</span> {orgTypeDisplay}</div>
    <div class="field"><span class="label">Submitted:</span> {submissionTimestamp}</div>
  </div>

  <div class="section">
    <h3>👤 Contact Information</h3>
    <div class="field"><span class="label">Name:</span> {contactName}</div>
    <div class="field"><span class="label">Email:</span> {contactEmail}</div>
    <div class="field"><span class="label">Country:</span> {country}</div>
    <div class="field"><span class="label">Website:</span> {website}</div>
    <div class="field"><span class="label">Social Media:</span>
      Twitter: {socialMediaTwitter} |
      Instagram: {socialMediaInstagram} |
      LinkedIn: {socialMediaLinkedIn}
    </div>
  </div>

  <div class="section">
    <h3>💰 Financial Information</h3>
    <div class="field"><span class="label">Total Budget:</span> ₺{budget:toLocaleString()}</div>
    <div class="field"><span class="label">Requested Amount:</span> ₺{requestedAmount:toLocaleString()}</div>
    <div class="field"><span class="label">Percentage Requested:</span> {percentageRequested}%</div>
    <div class="field"><span class="label">Timeline:</span> {timelineStart} to {timelineEnd} ({projectDurationMonths} months)</div>
  </div>

  <div class="section">
    <h3>📝 Project Description</h3>
    <p><strong>Short Summary ({shortSummaryLength}/280 chars):</strong></p>
    <p>{shortSummary}</p>
    <p><strong>Detailed Description ({detailedDescriptionLength} chars):</strong></p>
    <p style="white-space: pre-wrap;">{detailedDescription}</p>
  </div>

  {if impactMetrics}
  <div class="section">
    <h3>📊 Impact Metrics</h3>
    <p style="white-space: pre-wrap;">{impactMetrics}</p>
  </div>
  {/if}

  {if attachments.length > 0}
  <div class="attachments">
    <h3>📎 Attachments ({attachments.length} files)</h3>
    <ul>
      {attachments.map(file => `
        <li>{file.name} ({file.size} bytes, {file.type})</li>
      `).join('')}
    </ul>
    <p><em>Files are attached to this email for review.</em></p>
  </div>
  {/if}

  {if flagsDetected.length > 0}
  <div class="priority">
    <h3>⚠️ Flags Detected - Requires Attention</h3>
    <ul>
      {flagsDetected.map(flag => `<li>${flag}</li>`).join('')}
    </ul>
  </div>
  {/if}

  <div class="section">
    <h3>🎯 Next Steps</h3>
    <ol>
      <li><strong>Within 2 hours:</strong> Acknowledge receipt in dashboard</li>
      <li><strong>Within 4 hours:</strong> Download and review attachments</li>
      <li><strong>Within 24 hours:</strong> Complete initial eligibility screening</li>
      <li><strong>Within 3 days:</strong> Forward to evaluation committee or request additional information</li>
    </ol>
  </div>

  <div class="section">
    <h3>🔗 Quick Actions</h3>
    <p>
      <a href="https://coria.app/admin/applications/{applicationId}" style="padding: 10px 20px; background: #2C5530; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px;">View in Dashboard</a>
      <a href="mailto:{contactEmail}?subject=Re: CORIA Foundation Application {applicationId}" style="padding: 10px 20px; background: #0066cc; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin: 5px;">Email Applicant</a>
    </p>
  </div>

  <hr style="margin: 30px 0;">
  <p style="font-size: 11px; color: #666;">
    <strong>Application ID:</strong> {applicationId}<br>
    <strong>Received:</strong> {submissionTimestamp}<br>
    <strong>IP (Hashed):</strong> {ipHash}<br>
    <strong>Email (Hashed):</strong> {emailHash}<br>
    <em>This email contains sensitive personal information. Handle according to KVKK/GDPR data protection policies.</em>
  </p>
</body>
</html>
```

---

## 3. Decision Notification Templates

### 3.1 Full Approval Notification (EN)

**Subject:** CORIA Foundation - Application Approved! 🎉 - {applicationId}

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2C5530 0%, #4A7C4E 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: white; margin: 0; font-size: 32px; }
    .content { background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; }
    .success-badge { background: #d4edda; color: #155724; padding: 15px 25px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; border: 2px solid #c3e6cb; }
    .info-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #28a745; }
    .next-steps { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ffc107; }
    .button { display: inline-block; padding: 14px 28px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0; font-size: 18px;">Your Application Has Been Approved</p>
    </div>

    <div class="content">
      <div class="success-badge">
        ✅ APPROVED FOR FULL FUNDING
      </div>

      <p>Dear {contactName},</p>

      <p>We are thrilled to inform you that your grant application for "<strong>{projectName}</strong>" has been <strong>approved for full funding</strong> by the CORIA Foundation Board.</p>

      <p>Your commitment to {categoryDisplay} deeply aligns with our mission, and we are excited to support your impactful work.</p>

      <div class="info-box">
        <h3 style="color: #28a745; margin-top: 0;">Funding Details</h3>
        <p><strong>Application ID:</strong> {applicationId}</p>
        <p><strong>Approved Amount:</strong> ₺{approvedAmount:toLocaleString()}</p>
        <p><strong>Project Duration:</strong> {timelineStart} to {timelineEnd}</p>
        <p><strong>Decision Date:</strong> {decisionDate}</p>
        <p><strong>Expected First Disbursement:</strong> {expectedFirstDisbursement}</p>
      </div>

      <div class="next-steps">
        <h3 style="color: #856404; margin-top: 0;">📋 Next Steps (Action Required)</h3>
        <ol>
          <li><strong>Review Grant Agreement (Within 10 business days):</strong>
            <br>You will receive the grant agreement document within 48 hours. Please review, sign, and return it by {grantAgreementDeadline}.
          </li>
          <li><strong>Provide Banking Information (Within 5 business days):</strong>
            <br>Submit your organization's bank account details using our secure portal: <a href="https://coria.app/foundation/banking" style="color: #2C5530;">coria.app/foundation/banking</a>
          </li>
          <li><strong>Attend Kickoff Meeting (Within 2 weeks):</strong>
            <br>Your Foundation liaison, {liaisonName}, will contact you at {liaisonEmail} within 48 hours to schedule a kickoff meeting.
          </li>
          <li><strong>Submit Project Start Report (Within 30 days of funding receipt):</strong>
            <br>Provide a baseline report outlining your starting conditions and planned milestones.
          </li>
        </ol>
      </div>

      <h3 style="color: #2C5530;">Your Responsibilities</h3>
      <p>As a funded project, you agree to:</p>
      <ul>
        <li><strong>Quarterly Progress Reports:</strong> Submit reports every 3 months detailing project activities, outcomes, and financial spending.</li>
        <li><strong>Financial Transparency:</strong> Maintain accurate financial records and provide documentation as specified in the Grant Agreement.</li>
        <li><strong>Impact Tracking:</strong> Measure and report on the impact metrics outlined in your application.</li>
        <li><strong>Final Report:</strong> Submit a comprehensive final report within 30 days of project completion.</li>
        <li><strong>Acknowledgment:</strong> Credit CORIA Foundation in public communications about the project (logo and mention).</li>
      </ul>

      <h3 style="color: #2C5530;">Payment Schedule</h3>
      <p>Funds will be disbursed in the following schedule:</p>
      <ul>
        <li><strong>First Installment (40%):</strong> ₺{firstInstallment:toLocaleString()} - Upon signed agreement and banking info submission</li>
        <li><strong>Second Installment (30%):</strong> ₺{secondInstallment:toLocaleString()} - After 6-month progress report approval</li>
        <li><strong>Final Installment (30%):</strong> ₺{thirdInstallment:toLocaleString()} - Upon project completion and final report approval</li>
      </ul>

      <h3 style="color: #2C5530;">Support & Resources</h3>
      <p>Throughout your project, you will have access to:</p>
      <ul>
        <li><strong>Dedicated Liaison:</strong> {liaisonName} ({liaisonEmail})</li>
        <li><strong>CORIA Community Network:</strong> Connect with other funded projects</li>
        <li><strong>Technical Assistance:</strong> Request support for specific challenges</li>
        <li><strong>Impact Measurement Tools:</strong> Access to our impact tracking platform</li>
      </ul>

      <a href="https://coria.app/foundation/funded-projects/{applicationId}" class="button">Access Your Project Dashboard</a>

      <p>Once again, congratulations on this achievement! We look forward to partnering with you to create lasting positive impact.</p>

      <p>If you have any questions, please don't hesitate to reach out to {liaisonName} at {liaisonEmail} or our general inbox at foundation@coria.app.</p>

      <p>Best regards,<br>
      <strong>{boardChairName}</strong><br>
      CORIA Foundation Board Chair</p>
    </div>

    <div style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px;">
      <p><strong>CORIA Foundation</strong></p>
      <p>Empowering sustainable impact through strategic funding</p>
    </div>
  </div>
</body>
</html>
```

### 3.2 Rejection Notification (EN)

**Subject:** CORIA Foundation Application Update - {applicationId}

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #2C5530 0%, #4A7C4E 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 40px; border: 1px solid #e0e0e0; border-top: none; }
    .feedback-box { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ffc107; }
    .encouragement { background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #17a2b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="color: white; margin: 0;">CORIA Foundation</h1>
      <p style="color: #e0e0e0; margin: 10px 0 0 0;">Application Status Update</p>
    </div>

    <div class="content">
      <p>Dear {contactName},</p>

      <p>Thank you for submitting your grant application for "<strong>{projectName}</strong>" to CORIA Foundation. We sincerely appreciate the time and effort you invested in preparing your application.</p>

      <p>After careful review by our evaluation committee, we have made the difficult decision <strong>not to move forward with funding</strong> for this project at this time.</p>

      <p><strong>Application ID:</strong> {applicationId}<br>
      <strong>Decision Date:</strong> {decisionDate}</p>

      <div class="feedback-box">
        <h3 style="color: #856404; margin-top: 0;">Feedback from Our Evaluation</h3>
        <p><strong>Key Strengths:</strong></p>
        <ul>
          {strengths.map(strength => `<li>${strength}</li>`).join('')}
        </ul>

        <p><strong>Areas for Development:</strong></p>
        <ul>
          {areasForDevelopment.map(area => `<li>${area}</li>`).join('')}
        </ul>

        <p><em>This feedback is provided to support your future application efforts.</em></p>
      </div>

      <div class="encouragement">
        <h3 style="color: #0c5460; margin-top: 0;">We Encourage You To:</h3>
        <ul>
          <li><strong>Consider the feedback above</strong> and strengthen these areas in future applications</li>
          <li><strong>Reapply in our next funding cycle</strong> (opens {nextCycleDate}) - we welcome revised applications</li>
          <li><strong>Explore our community programs</strong> that might be a better fit: <a href="https://coria.app/foundation/programs" style="color: #2C5530;">coria.app/foundation/programs</a></li>
          <li><strong>Connect with us</strong> for guidance on strengthening your proposal: foundation@coria.app</li>
        </ul>
      </div>

      <h3 style="color: #2C5530;">Your Application Data</h3>
      <p>Your application data will be retained for 24 months to allow for reapplication comparison and trend analysis. You have the right to:</p>
      <ul>
        <li>Request a copy of your application data</li>
        <li>Request correction of any inaccurate information</li>
        <li>Request deletion of your data (subject to legal retention requirements)</li>
      </ul>
      <p>To exercise these rights, email dpo@coria.app with your Application ID: {applicationId}</p>

      <h3 style="color: #2C5530;">Stay Connected</h3>
      <p>While we cannot fund this specific project, we value your commitment to {categoryDisplay} and encourage you to:</p>
      <ul>
        <li>Subscribe to our newsletter for funding opportunities and resources: <a href="https://coria.app/newsletter" style="color: #2C5530;">coria.app/newsletter</a></li>
        <li>Follow us on social media for updates and community stories</li>
        <li>Attend our webinars and workshops on effective grant proposal writing</li>
      </ul>

      <p>We appreciate your commitment to creating positive change and wish you success in finding the right support for your important work.</p>

      <p>Best regards,<br>
      <strong>CORIA Foundation Evaluation Committee</strong></p>
    </div>

    <div style="background: #f8f9fa; padding: 24px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px;">
      <p><strong>CORIA Foundation</strong></p>
      <p>Supporting sustainable impact initiatives worldwide</p>
    </div>
  </div>
</body>
</html>
```

---

## 4. Data Rights Request Templates

### 4.1 Data Access Request Response

**Subject:** Your Data Access Request - CORIA Foundation

**Body:**
```
Dear {name},

We have received your request to access your personal data held by CORIA Foundation
regarding your grant application (ID: {applicationId}).

Attached to this email, you will find:

1. **Application_Data_{applicationId}.pdf** - A comprehensive report of all personal
   and project data we hold about you.

2. **Data_Processing_Summary_{applicationId}.pdf** - Details about how your data has
   been processed, including:
   - Purposes of processing
   - Categories of data held
   - Recipients (if shared)
   - Storage periods
   - Your rights

Data Included:
- Personal information (name, email, country)
- Project information (descriptions, budget, timeline)
- Submission metadata (date, application ID)
- Processing history (evaluation status, decision)

Data NOT Included (as permitted by law):
- Internal evaluation notes and scores (proprietary business information)
- Correspondence between committee members (deliberative privilege)

If you believe any information is inaccurate, you have the right to request
rectification by emailing dpo@coria.app with the specific corrections needed.

If you have questions about this data or wish to exercise other rights (rectification,
erasure, restriction, objection), please contact:

Data Protection Officer
Email: dpo@coria.app
Reference: {applicationId}

Best regards,
CORIA Foundation Data Protection Team
```

### 4.2 Data Deletion Confirmation

**Subject:** Data Deletion Completed - CORIA Foundation

**Body:**
```
Dear {name},

We confirm that we have processed your request to delete your personal data related
to your grant application (ID: {applicationId}).

Actions Completed:
✅ Application record deleted from primary database
✅ Personal identifiers removed from audit logs (anonymized)
✅ Attached files deleted from storage
✅ Email records marked for deletion (completed within 7 days)
✅ Backup systems purged (completed within 30 days)

Data Retention Exceptions:
The following data has been retained in accordance with legal obligations:
- Anonymized audit log entry (application ID, date, category) - required for compliance
- Financial records (if your project was funded) - required by law for 7 years

Your Rights:
You have the right to file a complaint with the supervisory authority if you are
dissatisfied with how we handled your request:

Turkey: KVKK (https://www.kvkk.gov.tr)
EU: Your national data protection authority

If you have any questions, please contact dpo@coria.app.

Best regards,
CORIA Foundation Data Protection Team
```

---

## 5. Data Breach Notification Templates

### 5.1 Breach Notification to Applicants (High Risk)

**Subject:** URGENT: Important Security Notice - CORIA Foundation

**Body:**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .alert { background: #f8d7da; color: #721c24; padding: 20px; border-left: 4px solid #dc3545; border-radius: 4px; margin: 20px 0; }
    .action-box { background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .info-box { background: #d1ecf1; padding: 20px; border-left: 4px solid #17a2b8; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="alert">
      <h2 style="margin-top: 0;">⚠️ IMPORTANT SECURITY NOTICE</h2>
      <p><strong>A data security incident may have affected your grant application.</strong></p>
    </div>

    <p>Dear {contactName},</p>

    <p>We are writing to inform you of a data security incident that occurred on {breachDate} and may have affected your grant application submitted on {submissionDate} (Application ID: {applicationId}).</p>

    <h3>What Happened</h3>
    <p>{breachDescription}</p>

    <p><strong>Incident Timeline:</strong></p>
    <ul>
      <li><strong>Detected:</strong> {detectionDate}</li>
      <li><strong>Contained:</strong> {containmentDate}</li>
      <li><strong>Resolved:</strong> {resolutionDate}</li>
    </ul>

    <h3>What Information Was Involved</h3>
    <p>The following types of information may have been accessed:</p>
    <ul>
      {affectedDataTypes.map(type => `<li>${type}</li>`).join('')}
    </ul>

    <p><strong>What Was NOT Affected:</strong></p>
    <ul>
      <li>Financial account information (we do not store this)</li>
      <li>Government-issued ID numbers (not collected)</li>
      <li>Payment card information (not applicable)</li>
    </ul>

    <h3>What We Are Doing</h3>
    <ul>
      <li><strong>Immediate action:</strong> {immediateAction}</li>
      <li><strong>Enhanced security:</strong> {securityEnhancements}</li>
      <li><strong>Investigation:</strong> {investigationStatus}</li>
      <li><strong>Notification:</strong> We have notified the Personal Data Protection Authority (KVKK) as required by law.</li>
    </ul>

    <div class="action-box">
      <h3 style="margin-top: 0;">What You Can Do</h3>
      <p><strong>Recommended Actions:</strong></p>
      <ul>
        {recommendedActions.map(action => `<li>${action}</li>`).join('')}
      </ul>
    </div>

    <div class="info-box">
      <h3 style="margin-top: 0;">Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Request more detailed information about this incident</li>
        <li>Request deletion of your application data</li>
        <li>File a complaint with the Personal Data Protection Authority (KVKK): https://www.kvkk.gov.tr</li>
      </ul>
    </div>

    <h3>Contact Us</h3>
    <p>If you have any questions or concerns about this incident, please contact:</p>
    <ul>
      <li><strong>Data Protection Officer:</strong> dpo@coria.app</li>
      <li><strong>Phone:</strong> {contactPhone}</li>
      <li><strong>Reference Number:</strong> {incidentReferenceNumber}</li>
    </ul>

    <p>We sincerely apologize for this incident and any concern it may cause. Your trust is important to us, and we are taking every measure to prevent similar incidents in the future.</p>

    <p>Best regards,<br>
    <strong>CORIA Foundation Data Protection Team</strong></p>

    <hr style="margin: 30px 0;">
    <p style="font-size: 12px; color: #666;">
      <strong>Incident Reference:</strong> {incidentReferenceNumber}<br>
      <strong>Notification Date:</strong> {notificationDate}<br>
      <strong>Application ID:</strong> {applicationId}
    </p>
  </div>
</body>
</html>
```

---

## 6. Follow-up & Reminder Templates

### 6.1 Missing Information Request

**Subject:** Additional Information Needed - CORIA Foundation Application {applicationId}

**Body:**
```
Dear {contactName},

Thank you for your application to CORIA Foundation for "{projectName}" (Application ID: {applicationId}).

We are currently reviewing your application and need the following additional information to complete our evaluation:

{missingInformationList}

Please provide this information by replying to this email or through our application portal by {deadline}.

If we do not receive this information by the deadline, we will proceed with the evaluation based on the available information, which may affect the outcome.

If you need more time or have questions about what we're requesting, please let us know.

Application Portal: https://coria.app/foundation/apply/{applicationId}

Best regards,
CORIA Foundation Operations Team
```

### 6.2 Decision Pending Reminder

**Subject:** Your CORIA Foundation Application Status - {applicationId}

**Body:**
```
Dear {contactName},

This is a brief update on your grant application for "{projectName}" (ID: {applicationId}).

Current Status: Under Evaluation

Your application is currently in the detailed evaluation phase. Our committee is carefully reviewing all submissions to ensure fair and thorough assessment.

Expected Decision Timeline: Within {daysRemaining} days

We appreciate your patience during this process. You will receive a decision notification as soon as the evaluation is complete.

If you have questions, feel free to contact us at foundation@coria.app.

Best regards,
CORIA Foundation
```

---

## 7. Template Usage Guidelines

### 7.1 Variable Substitution

All templates use `{variableName}` placeholders. Replace with actual data before sending.

**Required Variables:**
- `{applicationId}` - Application ID (e.g., CORIA-ABC123-xyz)
- `{contactName}` - Applicant's name
- `{contactEmail}` - Applicant's email
- `{projectName}` - Project name
- `{categoryDisplay}` - Human-readable category
- `{submissionDate}` - Date submitted
- `{requestedAmount}` - Amount requested (formatted with commas)

**Optional Variables:** Check template for specific needs

### 7.2 Personalization Best Practices

- Always use applicant's name (avoid "Dear Applicant")
- Reference specific project details when possible
- Adjust tone based on decision (celebratory for approval, respectful for rejection)
- Include actionable next steps
- Provide clear contact information

### 7.3 Language Selection

- Default: English (EN)
- Turkish (TR): Use if applicant's country is Turkey OR if requested
- Auto-detect based on application locale if available

### 7.4 Email Deliverability

**Sender Configuration:**
- **From:** CORIA Foundation <foundation@coria.app>
- **Reply-To:** foundation@coria.app (monitored inbox)
- **BCC:** operations@coria.app (for record-keeping)

**Technical Requirements:**
- SPF record configured
- DKIM signing enabled
- DMARC policy set
- Unsubscribe link (for marketing emails only, not transactional)

---

## 8. Variable Reference

### Core Application Variables

```javascript
{
  // Identifiers
  applicationId: "CORIA-ABC123-xyz",
  submissionTimestamp: "2025-01-14T10:30:00Z",
  submissionDate: "January 14, 2025",

  // Contact Information
  contactName: "Jane Doe",
  contactEmail: "jane@example.com",
  country: "Turkey",
  website: "https://example.org",
  socialMediaTwitter: "https://twitter.com/example",
  socialMediaInstagram: "https://instagram.com/example",
  socialMediaLinkedIn: "https://linkedin.com/company/example",

  // Project Information
  projectName: "Vegan Community Garden",
  category: "veganism", // Raw value
  categoryDisplay: "Veganism & Plant-Based Living", // Translated
  orgType: "nonprofit",
  orgTypeDisplay: "Non-Profit Organization",

  // Descriptions
  shortSummary: "Creating accessible vegan education...",
  shortSummaryLength: 245,
  detailedDescription: "Our project aims to...",
  detailedDescriptionLength: 1250,
  impactMetrics: "Target: 500+ participants annually",

  // Financial
  budget: 250000,
  requestedAmount: 180000,
  percentageRequested: 72,

  // Timeline
  timelineStart: "2025-03-01",
  timelineEnd: "2026-02-28",
  projectDurationMonths: 12,

  // Attachments
  attachments: [
    { name: "project-plan.pdf", size: 524288, type: "application/pdf" },
    { name: "budget-details.xlsx", size: 102400, type: "application/vnd.ms-excel" }
  ],

  // Decision Variables
  decisionDate: "2025-02-05",
  approvedAmount: 180000,
  liaisonName: "Ahmet Yılmaz",
  liaisonEmail: "ahmet@coria.app",
  boardChairName: "Dr. Ayşe Kaya",

  // Feedback (for rejections)
  strengths: [
    "Clear project objectives and measurable outcomes",
    "Strong community engagement plan"
  ],
  areasForDevelopment: [
    "Budget justification could be more detailed",
    "Timeline may be too ambitious for scope"
  ],

  // Technical
  ipHash: "a3f7d8e9...",
  emailHash: "b5c2f1a3...",
  flagsDetected: ["High budget request", "New organization"]
}
```

---

**Template Version:** 1.0
**Last Updated:** 2025-01-14
**Next Review:** 2025-07-14

*These templates are production-ready and KVKK/GDPR compliant.*
