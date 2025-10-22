import { Container, Heading, Text } from '@/components/ui';

export async function generateMetadata() {
  return {
    title: 'Privacy Policy | CORIA',
    description: 'CORIA app privacy policy. Learn how we collect, use, and protect your data.',
    openGraph: {
      title: 'Privacy Policy | CORIA',
      description: 'CORIA app privacy policy. Learn how we collect, use, and protect your data.',
      type: 'website',
    },
  };
}

export default function PrivacyPage() {
  const lastUpdated = new Date('2025-01-22').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Container size="lg" padding="md" className="py-24">
      {/* Header */}
      <div className="mb-12 text-center">
        <Heading as="h1" size="3xl" weight="bold" className="text-[var(--coria-primary)] mb-4">
          Privacy Policy
        </Heading>
        <Text size="sm" color="secondary" className="text-gray-600">
          Last Updated: {lastUpdated}
        </Text>
      </div>

      {/* Privacy Policy Content */}
      <div className="prose prose-lg max-w-none space-y-12">
        {/* Introduction */}
        <section id="introduction">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">📋</span>
            Introduction
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>
              <strong>CORIA</strong> values your privacy and data security. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use the CORIA mobile app and website.
            </p>
            <p>
              CORIA is a <strong>vegan lifestyle assistant</strong> that helps users make conscious consumption decisions by scanning product barcodes to provide vegan compatibility, allergen warnings, health, and sustainability scores.
            </p>
            <p>
              This policy complies with Turkey&apos;s <strong>Personal Data Protection Law (KVKK)</strong> and the European Union <strong>General Data Protection Regulation (GDPR)</strong>.
            </p>
          </div>
        </section>

        {/* Data Controller */}
        <section id="dataController">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🏢</span>
            Data Controller
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p><strong>Data Controller:</strong> CORIA</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Contact:</strong> privacy@coria.app</li>
              <li><strong>Website:</strong> <a href="https://getcoria.com" className="text-[var(--coria-primary)] hover:underline">https://getcoria.com</a></li>
            </ul>
            <p>
              As the data controller under KVKK and GDPR, we are responsible for processing your personal data. Use the contact information above to exercise your rights or ask questions.
            </p>
          </div>
        </section>

        {/* Data We Collect */}
        <section id="dataCollected">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">📊</span>
            Data We Collect
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>We collect the following categories of personal data when you use CORIA:</p>

            <div>
              <p className="font-semibold mb-2">1. Account Information</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email address</li>
                <li>Username</li>
                <li>Profile photo (optional)</li>
                <li>Authentication credentials (encrypted)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">2. Usage Data</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Scanned product barcodes</li>
                <li>Product scanning history</li>
                <li>Favorite products list</li>
                <li>Allergen and dietary preferences (vegan, gluten-free, etc.)</li>
                <li>AI chat history</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">3. Technical Data</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Device information (model, operating system)</li>
                <li>IP address</li>
                <li>App usage metrics (analytics)</li>
                <li>Error logs (crash logs)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">4. Permission-Based Data</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Camera:</strong> For barcode scanning (required)</li>
                <li><strong>Location:</strong> For regional product recommendations (optional)</li>
                <li><strong>Biometric:</strong> For secure login via fingerprint/face recognition (optional)</li>
                <li><strong>Gallery Access:</strong> To select product photos from gallery (optional)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Data */}
        <section id="dataUsage">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            How We Use Your Data
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>We use your personal data for the following purposes:</p>

            <div>
              <p className="font-semibold mb-2">1. App Functionality</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Barcode scanning and product recognition</li>
                <li>AI-powered vegan analysis</li>
                <li>Personalized product recommendations</li>
                <li>Allergen warnings and dietary compliance checks</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">2. User Experience</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account management and authentication</li>
                <li>Saving your preferences (allergens, language, region)</li>
                <li>Storing scanning history and favorite products</li>
                <li>Regional product recommendations (if location permission granted)</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold mb-2">3. Security and Fraud Prevention</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Account security (biometric authentication)</li>
                <li>Unauthorized access detection</li>
                <li>Spam and abuse prevention</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Third-Party Services */}
        <section id="thirdParty">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🔗</span>
            Third-Party Services
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>CORIA shares data with the following third-party services:</p>

            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-2">Supabase (Authentication, Database)</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Purpose:</strong> User authentication, data storage</li>
                  <li><strong>Location:</strong> European Union (EU servers)</li>
                  <li><strong>Privacy:</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--coria-primary)] hover:underline">supabase.com/privacy</a></li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-2">OpenAI (AI Product Analysis)</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Purpose:</strong> AI-powered vegan analysis</li>
                  <li><strong>Location:</strong> United States</li>
                  <li><strong>Data:</strong> Anonymous product information only (no user ID)</li>
                  <li><strong>Privacy:</strong> <a href="https://openai.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--coria-primary)] hover:underline">openai.com/privacy</a></li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-2">RevenueCat (In-App Purchases)</p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Purpose:</strong> Premium subscription management</li>
                  <li><strong>Location:</strong> United States</li>
                  <li><strong>Privacy:</strong> <a href="https://www.revenuecat.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--coria-primary)] hover:underline">revenuecat.com/privacy</a></li>
                </ul>
              </div>
            </div>

            <p className="text-sm italic">
              All third-party services use GDPR-compliant Standard Contractual Clauses (SCC) for data protection.
            </p>
          </div>
        </section>

        {/* User Rights */}
        <section id="userRights">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            Your Rights (GDPR & KVKK)
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>Under KVKK and GDPR, you have the following rights:</p>

            <div className="space-y-3">
              <div>
                <p className="font-semibold mb-1">Right to Access</p>
                <p className="text-sm">Learn what personal data we process about you.</p>
                <p className="text-sm text-gray-600 mt-1">→ App → Profile → Settings → &quot;View My Data&quot;</p>
              </div>

              <div>
                <p className="font-semibold mb-1">Right to Rectification</p>
                <p className="text-sm">Correct inaccurate or incomplete data.</p>
                <p className="text-sm text-gray-600 mt-1">→ App → Profile → &quot;Edit Profile&quot;</p>
              </div>

              <div>
                <p className="font-semibold mb-1">Right to Erasure (&quot;Right to be Forgotten&quot;)</p>
                <p className="text-sm">Permanently delete your account and all data.</p>
                <p className="text-sm text-gray-600 mt-1">→ App → Profile → Settings → &quot;Delete Account&quot;</p>
              </div>

              <div>
                <p className="font-semibold mb-1">Right to Data Portability</p>
                <p className="text-sm">Receive your data in JSON format.</p>
                <p className="text-sm text-gray-600 mt-1">→ Email privacy@coria.app</p>
              </div>
            </div>

            <p className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 text-sm">
              <strong>Note:</strong> All data requests are processed within 30 days as required by KVKK and GDPR.
            </p>
          </div>
        </section>

        {/* Security */}
        <section id="security">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            Security Measures
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>We implement industry-standard security measures:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>SSL/TLS Encryption:</strong> All data transmission is encrypted</li>
              <li><strong>Database Encryption:</strong> AES-256 encryption for stored data</li>
              <li><strong>Password Security:</strong> Bcrypt hashing (one-way, non-reversible)</li>
              <li><strong>Biometric Authentication:</strong> Device-based fingerprint/face recognition</li>
              <li><strong>Regular Security Audits:</strong> Continuous monitoring and updates</li>
            </ul>
          </div>
        </section>

        {/* Children's Privacy */}
        <section id="children">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">👶</span>
            Children&apos;s Privacy
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>
              CORIA is <strong>not intended for children under 13 years old</strong>. We do not knowingly collect personal data from children under 13.
            </p>
            <p>
              If you become aware that a child under 13 is using our app, please contact us immediately at <strong>privacy@coria.app</strong> and we will delete the account and all associated data within 7 days.
            </p>
          </div>
        </section>

        {/* Changes to Policy */}
        <section id="changes">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">🔄</span>
            Policy Changes
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>
              We may update this Privacy Policy from time to time. Significant changes will be communicated through:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>In-app notification</li>
              <li>Email to registered users</li>
              <li>Updated &quot;Last Updated&quot; date on this page</li>
            </ul>
            <p>
              Continued use of the app after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section id="contact">
          <Heading as="h2" size="xl" weight="semibold" className="mb-4 flex items-center gap-3">
            <span className="text-2xl">📧</span>
            Contact Us
          </Heading>
          <div className="text-gray-700 space-y-4">
            <p>For questions about this privacy policy or your data:</p>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="mb-2"><strong>Email:</strong> <a href="mailto:privacy@coria.app" className="text-[var(--coria-primary)] hover:underline">privacy@coria.app</a></p>
              <p className="mb-2"><strong>Website:</strong> <a href="https://getcoria.com/contact" target="_blank" rel="noopener noreferrer" className="text-[var(--coria-primary)] hover:underline">getcoria.com/contact</a></p>
              <p className="text-sm text-gray-600 mt-4">
                <strong>Response time:</strong> General questions within 5 business days, data requests within 30 days (KVKK/GDPR requirement)
              </p>
            </div>

            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-sm">
              <p className="font-semibold mb-2">Data Protection Authorities</p>
              <p className="mb-1">If you believe your privacy rights have been violated, you can contact:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Turkey:</strong> <a href="https://www.kvkk.gov.tr" target="_blank" rel="noopener noreferrer" className="text-[var(--coria-primary)] hover:underline">Personal Data Protection Authority (KVKK)</a></li>
                <li><strong>EU:</strong> Your <a href="https://edpb.europa.eu/about-edpb/board/members_en" target="_blank" rel="noopener noreferrer" className="text-[var(--coria-primary)] hover:underline">local Data Protection Authority</a></li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center">
        <Text size="sm" color="secondary" className="text-gray-600">
          This privacy policy was last updated on {lastUpdated}. For questions, contact privacy@coria.app
        </Text>
      </div>
    </Container>
  );
}
