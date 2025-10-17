# Foundation Application Standard Operating Procedure (SOP)

**Version:** 1.0
**Last Updated:** 2025-01-14
**Owner:** CORIA Foundation Operations Team

## 📋 Overview

This SOP defines the complete process for handling foundation project applications from submission to decision notification.

## 🎯 Objectives

- Ensure fair and transparent application review process
- Maintain KVKK/GDPR compliance throughout the application lifecycle
- Provide timely responses to all applicants
- Document decisions with clear rationale

## 🔄 Application Lifecycle

```
Submission → Initial Review → Detailed Evaluation → Committee Decision → Notification → Onboarding/Rejection
```

### Timeline Commitments

| Stage | Timeline | Responsible |
|-------|----------|-------------|
| Automated Confirmation | Immediate | System |
| Initial Review | 3 business days | Operations Team |
| Detailed Evaluation | 10 business days | Evaluation Committee |
| Committee Decision | 7 business days | Foundation Board |
| Decision Notification | Within 24 hours of decision | Operations Team |
| **Total Process** | **≤ 20 business days (4 weeks)** | - |

## 📥 1. Application Submission

### Automated Processing

When an application is submitted through `/foundation/apply`:

1. **Rate Limiting Check**
   - IP-based: 5 requests/minute, 50 requests/day
   - Blocked IPs receive 429 response with `Retry-After` header

2. **Spam Detection**
   - Honeypot field (`website_url`) must be empty
   - If spam detected: Log as `spam_detected`, return fake success response

3. **Validation**
   - Zod schema validates all required fields
   - File attachments: max 3 files, 10MB each, PDF/PNG/JPG only
   - Budget checks: requested ≤ total budget
   - Timeline validation: end date > start date

4. **Email Notifications**
   - **Applicant**: Confirmation email with application ID
   - **Operations Team**: Detailed notification with all form data + attachments

5. **Audit Logging**
   - JSONL format in `audit-logs/foundation-applications.jsonl`
   - PII hashed (SHA-256 with salt): IP addresses and emails
   - Retention: 24 months, then automatic cleanup

### Manual Checks Required

- [ ] **Within 2 hours**: Check `foundation@coria.app` inbox for new applications
- [ ] **Within 4 hours**: Download and review attachments
- [ ] **Within 24 hours**: Acknowledge receipt if automated email failed

## 🔍 2. Initial Review (Days 1-3)

### Eligibility Screening

Review application against **mandatory criteria**:

#### ✅ Must Have (Disqualifying if absent)

- **Category Alignment**: Project must focus on Veganism, Green Energy, or Sustainability
- **Contact Information**: Valid email, verifiable contact person
- **Budget Reasonableness**: Requested amount ≤ Total budget, both within realistic ranges
- **Timeline Feasibility**: Project duration 3-24 months (exceptions require justification)
- **Description Completeness**: Detailed description ≥ 200 characters with clear objectives

#### 🚩 Red Flags (Flag for closer review)

- **Vague Objectives**: Unclear goals or outcomes
- **Excessive Budget**: Requested amount >> project scope
- **No Track Record**: New organization with no proven experience (not disqualifying, but requires extra diligence)
- **Unrealistic Timeline**: Complex project with very short timeline
- **Missing Impact Metrics**: No measurable outcomes defined

### Initial Review Decision Tree

```
Application Received
├─ Spam/Duplicate? → Mark as spam, no notification
├─ Incomplete? → Request additional information (email template)
├─ Out of Scope? → Polite rejection (email template)
└─ Eligible? → Forward to Detailed Evaluation
```

### Email Templates

**Request Additional Information**:
```
Subject: CORIA Foundation Application #{applicationId} - Additional Information Needed

Dear {contactName},

Thank you for your application to CORIA Foundation. We are reviewing your project
"{projectName}" and need the following additional information:

[List specific information needed]

Please reply with the requested information within 5 business days. If we don't
hear back, we'll proceed with the available information.

Best regards,
CORIA Foundation Operations Team
```

**Out of Scope Rejection**:
```
Subject: CORIA Foundation Application #{applicationId} - Status Update

Dear {contactName},

Thank you for submitting your application for "{projectName}" to CORIA Foundation.

After careful review, we've determined that your project falls outside our current
focus areas (Veganism, Green Energy, Sustainability) or doesn't align with our
funding criteria at this time.

We encourage you to:
- Review our updated focus areas at coria.app/foundation
- Consider reapplying if your project evolves to align with our mission
- Explore our community programs that might be a better fit

We appreciate your commitment to positive change and wish you success with your project.

Best regards,
CORIA Foundation Operations Team
```

## 📊 3. Detailed Evaluation (Days 4-13)

### Evaluation Criteria (Scoring System)

Each application is scored 0-10 in five categories:

#### 1. Mission Alignment (Weight: 30%)

| Score | Criteria |
|-------|----------|
| 10 | Perfect alignment with CORIA's core mission and values |
| 7-9 | Strong alignment with one primary focus area |
| 4-6 | Moderate alignment, some mission overlap |
| 1-3 | Weak alignment, tangential connection |
| 0 | No discernible mission alignment |

#### 2. Impact Potential (Weight: 25%)

| Score | Criteria |
|-------|----------|
| 10 | Scalable, measurable, transformative impact |
| 7-9 | Significant impact, clear metrics, good scalability |
| 4-6 | Moderate impact, some metrics defined |
| 1-3 | Limited impact, vague outcomes |
| 0 | No measurable impact |

#### 3. Feasibility (Weight: 20%)

| Score | Criteria |
|-------|----------|
| 10 | Realistic timeline, experienced team, proven track record |
| 7-9 | Feasible plan, capable team, some experience |
| 4-6 | Ambitious but possible, team needs support |
| 1-3 | Overly ambitious, inexperienced team |
| 0 | Unrealistic or impossible to execute |

#### 4. Budget Efficiency (Weight: 15%)

| Score | Criteria |
|-------|----------|
| 10 | Excellent value for money, detailed budget |
| 7-9 | Good budget efficiency, clear cost breakdown |
| 4-6 | Adequate budget justification |
| 1-3 | Poor budget efficiency or justification |
| 0 | Unrealistic or unjustified budget |

#### 5. Sustainability & Continuity (Weight: 10%)

| Score | Criteria |
|-------|----------|
| 10 | Self-sustaining after funding, clear continuity plan |
| 7-9 | Path to sustainability identified |
| 4-6 | Some sustainability planning |
| 1-3 | Dependent on ongoing funding |
| 0 | No sustainability plan |

### Composite Score Calculation

```
Total Score = (Mission × 0.30) + (Impact × 0.25) + (Feasibility × 0.20) +
              (Budget × 0.15) + (Sustainability × 0.10)
```

### Score Interpretation

| Total Score | Recommendation | Action |
|-------------|----------------|--------|
| 8.5 - 10.0 | **Strong Recommend** | Fast-track to committee |
| 7.0 - 8.4 | **Recommend** | Standard committee review |
| 5.0 - 6.9 | **Consider** | Requires committee discussion |
| 3.0 - 4.9 | **Do Not Recommend** | Polite rejection unless special circumstances |
| 0.0 - 2.9 | **Reject** | Standard rejection email |

### Due Diligence Checklist

- [ ] **Background Check**: Verify organization/individual legitimacy
  - [ ] Check website and social media presence
  - [ ] Search for news articles or mentions
  - [ ] Verify contact information (phone, address if provided)
  - [ ] Check for any red flags or controversies

- [ ] **Financial Review**: Assess budget reasonableness
  - [ ] Compare to similar projects
  - [ ] Verify cost estimates make sense
  - [ ] Check for financial transparency

- [ ] **Reference Check** (for scores ≥ 7.0):
  - [ ] Contact provided references (if any)
  - [ ] Request additional references if needed
  - [ ] Verify past project outcomes

- [ ] **Impact Verification**:
  - [ ] Review claimed metrics and methodology
  - [ ] Assess measurement feasibility
  - [ ] Verify data sources if provided

## 🏛️ 4. Committee Decision (Days 14-20)

### Committee Composition

- **Minimum 3 members** required for quorum
- **Roles**: Chair, Technical Advisor, Financial Advisor, Mission Advisor
- **Conflict of Interest**: Members must recuse themselves if conflict exists

### Decision Options

1. **Approve Full Funding**
   - Award full requested amount
   - Standard terms and conditions

2. **Approve Partial Funding**
   - Award reduced amount with justification
   - Modified scope or timeline

3. **Conditional Approval**
   - Approval pending specific requirements
   - Timeline for meeting conditions (usually 30 days)

4. **Defer Decision**
   - Request more information
   - Schedule follow-up review (14 days)

5. **Reject Application**
   - Provide clear, constructive feedback
   - Invite reapplication after addressing concerns

### Decision Documentation

For EACH decision, document:

```yaml
application_id: CORIA-XXXXXXXX-XXXXXX
decision_date: YYYY-MM-DD
decision: [Approve Full / Approve Partial / Conditional / Defer / Reject]
amount_awarded: ₺XX,XXX (if approved)
committee_members: [Names]
voting_result: [Unanimous / X for, Y against]
rationale: |
  [Detailed explanation of decision reasoning]
key_strengths:
  - [Strength 1]
  - [Strength 2]
key_concerns:
  - [Concern 1]
  - [Concern 2]
conditions: |
  [If conditional approval, list specific requirements]
next_steps: |
  [Actions required from applicant or operations team]
```

## 📧 5. Decision Notification (Within 24 hours of decision)

### Approval Notification

```
Subject: CORIA Foundation Application Approved - #{applicationId}

Dear {contactName},

Congratulations! We are pleased to inform you that your application for "{projectName}"
has been approved.

**Funding Details:**
- Approved Amount: ₺{amount}
- Project Duration: {timelineStart} to {timelineEnd}
- Payment Schedule: [Details]

**Next Steps:**
1. Review and sign the attached Grant Agreement within 10 business days
2. Provide bank account details for fund transfer
3. Schedule kickoff meeting with Foundation liaison
4. Submit initial project report within 30 days of funding receipt

**Your Responsibilities:**
- Quarterly progress reports
- Financial reporting as specified in Grant Agreement
- Impact metrics tracking
- Final project report within 30 days of completion

Your Foundation liaison {liaisonName} ({liaisonEmail}) will contact you within
48 hours to schedule a kickoff meeting.

We're excited to support your impactful work!

Best regards,
CORIA Foundation
```

### Partial Approval Notification

```
[Similar to above, but include]

**Funding Modification:**
Original Requested: ₺{requestedAmount}
Approved Amount: ₺{approvedAmount}

**Scope Adjustments:**
[Explain what aspects of the project should be modified given reduced funding]
```

### Conditional Approval Notification

```
[Include all approval details plus]

**Conditions for Final Approval:**
[List each condition clearly]

**Deadline:** {conditionDeadline}

Please address these conditions and resubmit documentation by the deadline. Final
approval will be granted upon satisfactory completion.
```

### Rejection Notification

```
Subject: CORIA Foundation Application Status - #{applicationId}

Dear {contactName},

Thank you for submitting your application for "{projectName}" to CORIA Foundation.

After careful review by our evaluation committee, we have decided not to move
forward with funding at this time.

**Feedback:**
{constructiveFeedback}

**We Encourage You To:**
- Consider the feedback above for future applications
- Reapply in the next funding cycle (opens {nextCycleDate}) if you address the concerns
- Explore our community programs that might be a better fit: coria.app/community

We appreciate your commitment to {category} and wish you success in finding the
right support for your important work.

Best regards,
CORIA Foundation
```

## 🎓 6. Onboarding (Approved Applications Only)

### Timeline: 30 days from approval notification

1. **Day 1-3: Legal Documentation**
   - Send Grant Agreement
   - Collect signed agreement
   - Process banking information

2. **Day 4-7: Kickoff Meeting**
   - Introduce foundation liaison
   - Review reporting requirements
   - Establish communication cadence
   - Clarify success metrics

3. **Day 8-15: Initial Fund Transfer**
   - Transfer first installment (typically 40% of total)
   - Confirm receipt
   - Provide financial reporting templates

4. **Day 16-30: Project Launch Support**
   - Technical assistance if needed
   - Connect with CORIA community resources
   - Schedule first quarterly check-in

## 📑 KVKK/GDPR Compliance

### Data Collection & Storage

**Data Collected:**
- Personal: Name, email, country
- Organizational: Project name, organization type, website, social media
- Project: Descriptions, budget, timeline, attachments
- Technical: IP address (hashed), submission timestamp

**Legal Basis:** Legitimate interest (evaluation of funding applications)

**Storage Duration:**
- Active Applications: Until decision + 1 year
- Funded Projects: Project end + 7 years (financial compliance)
- Rejected Applications: 2 years (for trend analysis and reapplication comparison)

**Data Access:**
- Operations Team: Full access
- Evaluation Committee: Anonymized personal data during evaluation
- External Auditors: As required by law

### Applicant Rights

Applicants have the right to:

1. **Access**: Request copy of their application data
2. **Rectification**: Correct inaccurate information
3. **Erasure**: Request deletion (exceptions: funded projects, legal obligations)
4. **Portability**: Receive data in machine-readable format
5. **Objection**: Object to processing (will result in application rejection)

**Response Timeline:** 30 days from request

### Data Breach Protocol

If application data is compromised:

1. **Within 4 hours**: Assess breach scope and impact
2. **Within 24 hours**: Notify Data Protection Officer
3. **Within 72 hours**: Report to supervisory authority if high risk
4. **Within 72 hours**: Notify affected applicants if high risk to rights and freedoms

## 🔧 System Administration

### Audit Log Maintenance

**Location:** `/audit-logs/foundation-applications.jsonl`

**Format:** JSON Lines (JSONL) - one JSON object per line

**Retention:** 24 months, then automatic cleanup via cron job

**Manual Cleanup** (if needed):
```bash
cd /path/to/audit-logs
node cleanup-old-logs.js --older-than=24months --dry-run  # Preview
node cleanup-old-logs.js --older-than=24months  # Execute
```

### Email Delivery Monitoring

**Check for failed deliveries:**
```bash
# Check email service logs
pm2 logs email-service --lines 100 | grep "FAILED"

# Check SMTP server logs
sudo tail -f /var/log/mail.log | grep "foundation@coria.app"
```

**Common Issues:**
- **Bounced Emails**: Invalid email address - verify and request correction
- **Spam Folder**: Ask applicant to whitelist `foundation@coria.app`
- **SMTP Timeout**: Check network connectivity and SMTP credentials

### Rate Limiting Adjustments

If legitimate users are being rate-limited:

1. **Check Current Limits:**
   ```bash
   echo "REQUESTS_PER_MINUTE: 5"
   echo "REQUESTS_PER_DAY: 50"
   echo "BLOCK_DURATION: 900 seconds (15 min)"
   ```

2. **Whitelist Specific IP** (emergency only):
   ```bash
   # Add to .env
   RATE_LIMIT_WHITELIST=1.2.3.4,5.6.7.8
   ```

3. **Temporarily Increase Limits** (requires code change + deploy):
   ```typescript
   // src/lib/security/rate-limiter.ts
   const REQUESTS_PER_MINUTE = 10;  // Was 5
   const REQUESTS_PER_DAY = 100;     // Was 50
   ```

## 📊 Reporting & Analytics

### Weekly Operations Report

**Every Monday**, generate and review:

```sql
-- Application volume (last 7 days)
SELECT
  DATE(timestamp) as date,
  COUNT(*) as applications,
  COUNT(CASE WHEN status = 'spam_detected' THEN 1 END) as spam,
  COUNT(CASE WHEN status = 'submitted' THEN 1 END) as legitimate
FROM audit_log
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(timestamp);

-- Category breakdown
SELECT
  category,
  COUNT(*) as count,
  AVG(budgetRequested) as avg_budget
FROM audit_log
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND status = 'submitted'
GROUP BY category;

-- Top countries
SELECT
  country,
  COUNT(*) as applications
FROM audit_log
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  AND status = 'submitted'
GROUP BY country
ORDER BY applications DESC
LIMIT 10;
```

### Monthly Board Report

**Include:**
- Total applications received
- Applications by category and country
- Approval rate and average funding amount
- Notable projects funded
- Challenges and recommendations

## ⚠️ Escalation Procedures

### When to Escalate

| Situation | Escalate To | Timeline |
|-----------|-------------|----------|
| Suspected fraud | Legal + Security | Immediately |
| Media inquiry about applicant | PR + Legal | Within 2 hours |
| Political/controversial project | Foundation Board | Within 24 hours |
| Budget request > ₺1M | CFO + Board | Before evaluation |
| Data breach or security incident | DPO + CTO | Immediately |
| Applicant complaint | Operations Manager | Within 4 hours |
| Unclear policy interpretation | Legal | Within 48 hours |

## 📝 Continuous Improvement

### Quarterly SOP Review

**Review Triggers:**
- Every 3 months (scheduled)
- After 50 applications processed
- Significant policy or regulatory change
- Security incident
- Multiple similar operational issues

**Review Process:**
1. Collect feedback from operations team
2. Analyze application processing metrics
3. Review applicant satisfaction (if surveys sent)
4. Identify bottlenecks and improvement opportunities
5. Update SOP and communicate changes

## 📞 Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Operations Manager | ops@coria.app | Day-to-day application processing |
| Data Protection Officer | dpo@coria.app | KVKK/GDPR compliance |
| Legal Counsel | legal@coria.app | Legal questions, fraud, contracts |
| CTO | cto@coria.app | Technical issues, system downtime |
| Foundation Board Chair | board@coria.app | Strategic decisions, escalations |

## 📚 Related Documents

- [Foundation Application API Documentation](Foundation_Apply_API.md)
- [Foundation Application Runbook](Foundation_Apply_Runbook.md)
- [CORIA Foundation Grant Agreement Template](Foundation_Grant_Agreement.pdf)
- [Data Protection Policy](Data_Protection_Policy.md)

---

**Document Control:**
- **Created:** 2025-01-14
- **Version:** 1.0
- **Next Review:** 2025-04-14
- **Owner:** CORIA Foundation Operations Team
- **Approved By:** Foundation Board (Date: YYYY-MM-DD)
