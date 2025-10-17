# CORIA Foundation - Data Management Policy
## Application Data Protection and Privacy Framework

**Version:** 1.0
**Effective Date:** 2025-01-14
**Last Updated:** 2025-01-14
**Policy Owner:** Data Protection Officer
**Review Cycle:** Annual (or upon regulatory change)

---

## 1. Executive Summary

This policy establishes the data management framework for CORIA Foundation's grant application system, ensuring compliance with:
- **KVKK** (Turkish Personal Data Protection Law No. 6698)
- **GDPR** (EU General Data Protection Regulation)
- **Foundation/NGO best practices**
- **Audit and transparency requirements**

**Core Principles:**
- **Lawfulness, Fairness, Transparency**: Clear communication about data processing
- **Purpose Limitation**: Data used only for stated purposes
- **Data Minimization**: Collect only necessary information
- **Accuracy**: Maintain accurate and up-to-date records
- **Storage Limitation**: Retain data only as long as necessary
- **Integrity & Confidentiality**: Protect against unauthorized access
- **Accountability**: Document compliance and demonstrate responsibility

---

## 2. Data Inventory & Classification

### 2.1 Personal Data Collected

| Data Field | Type | Sensitivity | Legal Basis | Mandatory | Purpose |
|------------|------|-------------|-------------|-----------|---------|
| **Contact Name** | Personal Identity | Medium | Legitimate Interest | Yes | Identification & Communication |
| **Contact Email** | Contact Info | Medium | Legitimate Interest | Yes | Primary Communication Channel |
| **Country** | Geographic | Low | Legitimate Interest | Yes | Regional Impact Assessment |
| **IP Address** | Technical | Medium | Legitimate Interest | Auto | Security & Fraud Prevention |
| **Project Name** | Organizational | Low | Legitimate Interest | Yes | Application Identification |
| **Organization Type** | Organizational | Low | Legitimate Interest | Yes | Eligibility Assessment |
| **Website** | Contact Info | Low | Legitimate Interest | No | Verification & Due Diligence |
| **Social Media** | Contact Info | Low | Legitimate Interest | No | Verification & Outreach |

### 2.2 Project Data Collected

| Data Field | Type | Sensitivity | Retention | Purpose |
|------------|------|-------------|-----------|---------|
| **Category** | Classification | Low | 24 months | Mission Alignment |
| **Short Summary** | Descriptive | Low | 24 months | Quick Review |
| **Detailed Description** | Descriptive | Low | 24 months | Evaluation |
| **Budget** | Financial | Medium | 24 months + 7 years (if funded) | Financial Assessment |
| **Requested Amount** | Financial | Medium | 24 months + 7 years (if funded) | Funding Decision |
| **Timeline (Start/End)** | Temporal | Low | 24 months | Feasibility Assessment |
| **Impact Metrics** | Performance | Low | 24 months | Evaluation & Reporting |
| **Attachments** | Supporting Docs | Medium | 24 months | Due Diligence |

### 2.3 Technical & Audit Data

| Data Field | Type | Purpose | Hashing | Retention |
|------------|------|---------|---------|-----------|
| **Application ID** | Identifier | Tracking | No | Permanent |
| **Submission Timestamp** | Temporal | Audit Trail | No | 24 months |
| **IP Address (Hashed)** | Technical | Security | SHA-256 | 24 months |
| **Email (Hashed)** | Identifier | Audit | SHA-256 | 24 months |
| **Status** | Workflow | Processing | No | 24 months |
| **Files Count** | Metadata | Audit | No | 24 months |

### 2.4 Data Sensitivity Classification

**🔴 High Sensitivity**
- Bank account details (if funded)
- Government-issued IDs (if requested for verification)
- Confidential project details (if marked as such)

**🟡 Medium Sensitivity**
- Contact email and name
- Financial information (budget, requested amount)
- IP addresses (hashed)
- Organizational information

**🟢 Low Sensitivity**
- Country
- Project category
- Public project descriptions
- Timeline information

---

## 3. Legal Basis for Processing

### 3.1 Primary Legal Basis

**Legitimate Interest (KVKK Article 5, GDPR Article 6(1)(f))**

CORIA Foundation has a legitimate interest in processing application data for:
- Evaluating grant applications
- Selecting projects aligned with our mission
- Preventing fraud and abuse
- Maintaining transparency and accountability
- Complying with financial regulations

**Balancing Test:**
- ✅ Foundation's interest: Responsible grant allocation
- ✅ Applicant's interest: Receive funding for impactful projects
- ✅ Proportionality: Minimal data collection
- ✅ Safeguards: Encryption, hashing, access controls
- ✅ Rights respected: Access, rectification, erasure

### 3.2 Secondary Legal Bases

**Consent (for marketing communications)**
- Optional marketing consent checkbox
- Clear, specific, informed, freely given
- Withdrawable at any time

**Legal Obligation (for funded projects)**
- Turkish Foundations Law requirements
- Financial reporting and audit compliance
- Tax documentation (7-year retention)

**Contract (for funded projects)**
- Grant agreement execution
- Payment processing
- Project monitoring and reporting

---

## 4. Data Retention Schedule

### 4.1 Standard Retention: 24 Months

**Applies To:**
- Rejected applications
- Withdrawn applications
- Applications pending decision (after decision made)

**Rationale:**
- Allow reapplication with context
- Trend analysis and reporting
- Legitimate interest in maintaining historical records

### 4.2 Extended Retention: 7 Years (Funded Projects Only)

**Applies To:**
- Approved applications
- Grant agreements and amendments
- Financial disbursement records
- Project reports and outcomes

**Rationale:**
- Legal obligation (Turkish Foundations Law)
- Financial audit requirements
- Tax compliance

### 4.3 Permanent Retention (Anonymized)

**Applies To:**
- Aggregated statistics (e.g., "50 applications in 2025")
- Impact metrics (anonymized)
- System performance data

**Conditions:**
- All personal identifiers removed
- Cannot be re-identified
- Used for reporting and improvement only

### 4.4 Retention Timeline

```
Application Submitted
    │
    ├─ Decision: REJECT
    │   └─ Retain: 24 months from decision
    │       └─ Auto-delete after 24 months
    │
    ├─ Decision: APPROVE
    │   └─ Retain: 7 years from project completion
    │       ├─ Grant agreement: 7 years
    │       ├─ Financial records: 7 years
    │       └─ Auto-archive after 7 years
    │
    └─ No Decision (withdrawn/incomplete)
        └─ Retain: 24 months from last activity
            └─ Auto-delete after 24 months
```

---

## 5. Access Control Matrix

### 5.1 Role-Based Access Control (RBAC)

| Role | Personal Data | Financial Data | Attachments | Audit Logs | Delete Data |
|------|---------------|----------------|-------------|------------|-------------|
| **Applicant** | Own only (read) | Own only (read) | Own only (view) | No | Request only |
| **Operations Team** | All (read/write) | All (read) | All (view/download) | Read | No |
| **Evaluation Committee** | Anonymized | All (read) | All (view) | No | No |
| **Financial Officer** | Contact only | All (read/write) | Financial only | Read | No |
| **Data Protection Officer** | All (read) | Audit view | Audit view | All (read/write) | Yes |
| **System Administrator** | Technical only | No | No | All (read) | No |
| **External Auditor** | Anonymized | All (read) | All (view) | All (read) | No |

### 5.2 Access Justification Requirements

All access to application data must have:
1. **Business Need**: Clear operational or legal requirement
2. **Role Authorization**: Appropriate role assignment
3. **Time Limitation**: Access reviewed quarterly
4. **Audit Trail**: All access logged with timestamp and user ID

### 5.3 Anonymization for Evaluation

During committee evaluation:
- **Anonymized**: Contact name, email, location details
- **Visible**: Project description, budget, impact metrics
- **Rationale**: Reduce bias in evaluation process
- **De-anonymization**: Only after preliminary scoring

---

## 6. Data Security Measures

### 6.1 Technical Safeguards

**Encryption**
- ✅ TLS 1.3 for data in transit
- ✅ AES-256 for data at rest (if using cloud storage)
- ✅ Hashed PII in audit logs (SHA-256 with salt)

**Access Controls**
- ✅ Multi-factor authentication (MFA) for all staff
- ✅ Role-based access control (RBAC)
- ✅ IP allowlisting for administrative access
- ✅ Session timeouts (30 minutes inactivity)

**Network Security**
- ✅ Firewall protection
- ✅ DDoS mitigation (Cloudflare)
- ✅ Regular security updates
- ✅ Vulnerability scanning (quarterly)

**Application Security**
- ✅ Rate limiting (5 requests/min, 50/day)
- ✅ Honeypot anti-spam
- ✅ Input validation (Zod schemas)
- ✅ File upload restrictions (type, size)

### 6.2 Organizational Safeguards

**Staff Training**
- Annual data protection training (mandatory)
- KVKK/GDPR awareness modules
- Incident response drills (bi-annual)

**Policies & Procedures**
- Clear desk policy
- Password management guidelines
- Secure file sharing protocols
- Device encryption requirements

**Vendor Management**
- Data Processing Agreements (DPA) with all processors
- Regular vendor security assessments
- Right to audit clause in contracts

### 6.3 Audit Logging

All access and modifications logged:
```json
{
  "timestamp": "2025-01-14T10:30:00Z",
  "user": "ops-team-member@coria.app",
  "action": "view_application",
  "application_id": "CORIA-ABC123-xyz",
  "ip_hash": "a3f7d8...",
  "result": "success"
}
```

**Log Retention:** 24 months (same as application data)

---

## 7. Data Breach Response Protocol

### 7.1 Breach Definition

A data breach is any incident that results in:
- Unauthorized access to personal data
- Accidental loss or destruction of data
- Unauthorized disclosure of data
- Unauthorized alteration of data

### 7.2 Response Timeline

| Phase | Timeline | Responsible | Actions |
|-------|----------|-------------|---------|
| **Detection** | Immediate | Any staff member | Report to DPO immediately |
| **Containment** | Within 1 hour | DPO + IT | Stop the breach, secure systems |
| **Assessment** | Within 4 hours | DPO | Determine scope, severity, affected data |
| **Notification (Authority)** | Within 72 hours | DPO | Report to KVKK/supervisory authority if high risk |
| **Notification (Individuals)** | Within 72 hours | DPO + Operations | Notify affected applicants if high risk |
| **Remediation** | Within 7 days | DPO + IT | Fix vulnerability, implement controls |
| **Post-Incident Review** | Within 14 days | DPO + Management | Document lessons learned, update procedures |

### 7.3 Severity Classification

**🔴 Critical (Notify immediately)**
- Exposed: Unencrypted financial data, government IDs
- Impact: Identity theft, financial fraud risk
- Action: Notify authority and individuals within 24 hours

**🟡 High (Notify within 72 hours)**
- Exposed: Contact details, project descriptions
- Impact: Spam, unwanted contact, reputational harm
- Action: Notify authority and individuals within 72 hours

**🟢 Low (Internal documentation only)**
- Exposed: Anonymized statistics, public information
- Impact: Minimal or no risk to individuals
- Action: Internal incident report, no external notification required

### 7.4 Breach Notification Template

**To Applicants:**
```
Subject: CORIA Foundation - Important Security Notice

Dear [Contact Name],

We are writing to inform you of a data security incident that may have affected your
grant application submitted on [Date].

What Happened:
[Brief description of the incident]

What Information Was Involved:
[List of data types affected - be specific but not overly technical]

What We Are Doing:
- Immediate action taken: [e.g., "Secured the vulnerability within 1 hour"]
- Ongoing measures: [e.g., "Enhanced monitoring, additional security controls"]
- Notification to authorities: [If applicable]

What You Can Do:
[Specific recommendations based on data exposed]
- Example: "Monitor your email for suspicious activity"
- Example: "We do not recommend any immediate action as no financial data was exposed"

Your Rights:
You have the right to:
- Request more information about this incident
- File a complaint with the Personal Data Protection Authority (KVKK)
- Request deletion of your application data

Contact Us:
Data Protection Officer: dpo@coria.app
Phone: [Contact number]

We sincerely apologize for this incident and any concern it may cause.

CORIA Foundation Data Protection Team
```

---

## 8. Applicant Rights & Procedures

### 8.1 Right of Access (KVKK Article 11, GDPR Article 15)

**Request:** "What data do you have about me?"

**Response Timeline:** 30 days (extendable to 60 days if complex)

**Provided Information:**
- All personal data held
- Purposes of processing
- Categories of data
- Recipients of data (if shared)
- Storage period
- Rights (rectification, erasure, restriction)

**Process:**
1. Verify identity (email confirmation or additional verification)
2. Generate data export (PDF or JSON format)
3. Send securely (encrypted email or secure portal)

### 8.2 Right to Rectification (KVKK Article 11, GDPR Article 16)

**Request:** "My contact email is wrong, please correct it"

**Response Timeline:** 7 days for simple corrections

**Process:**
1. Verify identity
2. Validate new information
3. Update records
4. Confirm correction to applicant
5. Notify any third parties if data was shared

### 8.3 Right to Erasure / "Right to be Forgotten" (KVKK Article 7, GDPR Article 17)

**Request:** "Please delete my application"

**Response Timeline:** 30 days

**Conditions for Erasure:**
- ✅ Application rejected or withdrawn
- ✅ No legal obligation to retain (e.g., funded project)
- ✅ No pending evaluation or audit
- ❌ Cannot delete if: funded project (7-year retention), ongoing legal proceeding

**Process:**
1. Verify identity
2. Check deletion eligibility
3. If eligible: Delete from database, backup, and logs
4. If not eligible: Explain reason and alternative (e.g., anonymization)
5. Confirm deletion or provide justification

**Exceptions:**
- Funded projects: Retain for 7 years (legal obligation)
- Ongoing audit: Retain until audit complete
- Legal claims: Retain for statute of limitations period

### 8.4 Right to Restriction of Processing (KVKK Article 11, GDPR Article 18)

**Request:** "Stop processing my data while you investigate my rectification request"

**Response Timeline:** 7 days

**Process:**
1. Mark record as "processing restricted"
2. Limit access to view-only
3. Do not use for evaluation or decision-making
4. Notify applicant when restriction can be lifted

### 8.5 Right to Data Portability (GDPR Article 20)

**Request:** "Provide my data in a machine-readable format"

**Response Timeline:** 30 days

**Format Options:**
- JSON (structured data)
- CSV (tabular data)
- PDF (human-readable)

**Scope:** Only data provided by applicant (not derived data or evaluations)

### 8.6 Right to Object (KVKK Article 11, GDPR Article 21)

**Request:** "I object to your processing of my data"

**Response Timeline:** 30 days

**Process:**
1. Assess grounds for objection
2. If legitimate: Cease processing (unless compelling legitimate grounds)
3. If not legitimate: Explain why processing continues
4. Applicant can still request erasure or file complaint

### 8.7 Rights Request Form

**Submission Methods:**
- Email: dpo@coria.app
- Web form: coria.app/foundation/data-request
- Postal mail: [Foundation address]

**Required Information:**
- Full name
- Email used in application
- Application ID (if known)
- Specific right being exercised
- Additional details (if rectification or objection)

---

## 9. Data Retention & Deletion Procedures

### 9.1 Automated Deletion (Recommended)

**Cron Job Schedule:**
```bash
# Run daily at 2 AM
0 2 * * * /usr/local/bin/node /path/to/cleanup-applications.js

# Cleanup script logic:
# 1. Identify applications > 24 months old (rejected/withdrawn)
# 2. Export to archive (encrypted backup)
# 3. Delete from primary database
# 4. Delete associated files from storage
# 5. Anonymize audit log entries
# 6. Send deletion report to DPO
```

**Implementation:**
```javascript
// cleanup-applications.js
async function cleanupOldApplications() {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - 24);

  // Find applications to delete
  const applicationsToDelete = await db.applications.find({
    status: { $in: ['rejected', 'withdrawn'] },
    decisionDate: { $lt: cutoffDate }
  });

  for (const app of applicationsToDelete) {
    // Archive (optional)
    await archiveApplication(app);

    // Delete files
    await deleteApplicationFiles(app.attachments);

    // Anonymize audit logs
    await anonymizeAuditLogs(app.id);

    // Delete application record
    await db.applications.delete({ id: app.id });

    console.log(`Deleted application: ${app.id}`);
  }

  // Send report to DPO
  await sendDeletionReport(applicationsToDelete);
}
```

### 9.2 Manual Deletion (Rights Requests)

**Process:**
1. **Verify Request:** Confirm identity and eligibility
2. **Check Dependencies:** Ensure no legal hold or ongoing audit
3. **Delete Data:**
   ```sql
   -- Step 1: Export for verification
   SELECT * FROM applications WHERE id = 'CORIA-XXX' INTO OUTFILE '/backup/app-XXX.csv';

   -- Step 2: Delete application
   DELETE FROM applications WHERE id = 'CORIA-XXX';

   -- Step 3: Delete files
   -- (Execute file deletion from S3/storage)

   -- Step 4: Anonymize logs
   UPDATE audit_log
   SET email_hash = 'DELETED', ip_hash = 'DELETED'
   WHERE application_id = 'CORIA-XXX';
   ```
4. **Verify Deletion:** Confirm data no longer exists
5. **Document:** Record in deletion log
6. **Notify Applicant:** Confirm deletion complete

### 9.3 Anonymization (Alternative to Deletion)

When deletion is not possible (legal obligation), anonymize instead:

**Anonymization Process:**
1. Remove direct identifiers (name, email, IP)
2. Generalize quasi-identifiers (country → region, date → month)
3. Remove attachments with identifying info
4. Retain only statistical data

**Result:** Cannot re-identify individual, but retain useful data for analysis

---

## 10. Third-Party Data Sharing

### 10.1 No Sharing by Default

CORIA Foundation does **NOT** share applicant data with third parties except:

### 10.2 Permitted Sharing (with safeguards)

**✅ Service Providers (Data Processors)**
- Email service (Nodemailer/SMTP provider)
- Cloud storage (if used for attachments)
- Hosting provider (Next.js deployment)

**Requirements:**
- Data Processing Agreement (DPA)
- EU Standard Contractual Clauses (SCC) if outside EU/Turkey
- Security requirements equal to or better than ours
- Right to audit

**✅ Legal Authorities (Legal Obligation)**
- Court orders
- KVKK/data protection authority requests
- Tax/financial audits

**Requirements:**
- Valid legal basis
- Document request in audit log
- Notify applicant (unless prohibited by law)

**✅ Funded Project Partners (Consent)**
- Only if applicant consents
- Only for project collaboration purposes
- Limited to contact info and project details

**Requirements:**
- Explicit consent
- Limited data sharing agreement
- Purpose-limited use

### 10.3 International Data Transfers

**General Rule:** Data processed within Turkey/EU only

**Exceptions (with safeguards):**
- Cloud services with EU/Turkey data centers
- Email services with Standard Contractual Clauses
- Applicant consent for specific transfer

**Safeguards:**
- Adequacy decision by KVKK/EU Commission
- Standard Contractual Clauses (SCC)
- Binding Corporate Rules (BCR)
- Consent (for non-systematic transfers)

---

## 11. Privacy by Design & Default

### 11.1 System Design Principles

**✅ Data Minimization**
- Collect only necessary fields
- Optional fields clearly marked
- No "nice to have" data collection

**✅ Purpose Limitation**
- Data used only for stated purpose (grant evaluation)
- No repurposing without new consent
- Clear boundaries in code and documentation

**✅ Storage Limitation**
- Automatic deletion after 24 months
- No indefinite storage
- Regular cleanup audits

**✅ Transparency**
- Privacy policy link before submission
- Clear consent language
- Accessible data rights information

**✅ Security**
- Encryption by default
- Hashed PII in logs
- Rate limiting and anti-spam
- Regular security updates

### 11.2 Privacy Impact Assessment (PIA)

**Conducted:** Pre-launch (2025-01-14)

**Key Findings:**
- ✅ Low risk for most applicants (rejected applications)
- ⚠️ Medium risk for funded applicants (financial data, 7-year retention)
- ✅ Adequate safeguards in place
- ✅ No high-risk processing identified

**Mitigation Measures:**
- Hashing of PII in audit logs
- Role-based access control
- Anonymization during evaluation
- Regular security audits

---

## 12. Compliance Monitoring & Auditing

### 12.1 Internal Audits

**Frequency:** Quarterly

**Scope:**
- Access log review (unusual patterns)
- Deletion schedule compliance
- Data retention adherence
- Staff training completion
- Incident response readiness

**Responsible:** Data Protection Officer

### 12.2 External Audits

**Frequency:** Annual (or as required by law)

**Auditors:**
- Independent data protection consultant
- Financial auditors (for funded projects)
- KVKK inspections (if requested)

### 12.3 Key Performance Indicators (KPIs)

| Metric | Target | Frequency |
|--------|--------|-----------|
| Rights Requests Response Time | < 30 days | Monthly |
| Unauthorized Access Attempts | 0 | Continuous |
| Staff Training Completion | 100% | Annual |
| Deletion Schedule Compliance | 100% | Quarterly |
| Data Breach Incidents | 0 | Continuous |
| Privacy Policy Updates | Within 7 days of change | As needed |

---

## 13. Policy Updates & Communication

### 13.1 Policy Review

**Trigger Events:**
- Regulatory changes (KVKK, GDPR amendments)
- Significant data breach
- New processing activities
- Annual review cycle

**Process:**
1. DPO initiates review
2. Consult legal counsel if needed
3. Update policy document
4. Management approval
5. Communicate changes
6. Train staff

### 13.2 Change Communication

**To Applicants:**
- Email notification if material changes
- Updated privacy policy on website
- Consent re-obtained if required

**To Staff:**
- Mandatory training on new procedures
- Updated internal documentation
- Policy acknowledgment signature

---

## 14. Contact Information

### 14.1 Data Protection Officer (DPO)

**Email:** dpo@coria.app
**Phone:** [Contact number]
**Address:** [CORIA Foundation registered address]

**Responsibilities:**
- Oversee data protection compliance
- Handle rights requests
- Conduct privacy impact assessments
- Serve as point of contact for supervisory authority

### 14.2 Supervisory Authority

**Turkey (KVKK):**
- **Name:** Kişisel Verileri Koruma Kurumu (KVKK)
- **Website:** https://www.kvkk.gov.tr
- **Email:** kvkk@kvkk.gov.tr

**EU (if applicable):**
- Relevant national data protection authority based on foundation's EU presence

---

## 15. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-14 | Data Protection Officer | Initial policy creation |

---

## 16. Appendices

### Appendix A: Data Processing Record (KVKK Article 10)

Required for KVKK compliance:

```
CORIA Foundation - Data Processing Activity: Grant Applications

1. Data Controller: CORIA Foundation
2. Purpose: Evaluation and selection of grant applications
3. Data Categories: Contact, project, financial
4. Data Subjects: Grant applicants (organizations and individuals)
5. Recipients: Operations team, evaluation committee, financial officer
6. Transfers: None (unless cloud services in EU/Turkey)
7. Retention: 24 months (rejected), 7 years (funded)
8. Security: TLS, hashing, RBAC, audit logs
```

### Appendix B: Privacy Policy Summary (For Applicants)

**How We Use Your Data:**
We collect your personal and project information to evaluate your grant application fairly and transparently. Your data is protected, used only for this purpose, and deleted after 24 months (unless your project is funded).

**Your Rights:**
You can request access, correction, or deletion of your data at any time by emailing dpo@coria.app.

**Questions?**
Contact our Data Protection Officer at dpo@coria.app.

---

**Policy Approved By:**
- Data Protection Officer: ________________ Date: __________
- Foundation Board Chair: ________________ Date: __________
- Legal Counsel: ________________________ Date: __________

---

*This policy is aligned with KVKK (Turkish Law No. 6698) and GDPR standards, adapted for foundation/NGO grant application processing.*
