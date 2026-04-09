import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LegalLayout from '@/components/legal/LegalLayout'

export default function PrivacyPage() {
  const sections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'information-we-collect', title: 'Information We Collect' },
    { id: 'how-we-use', title: 'How We Use Your Information' },
    { id: 'sharing', title: 'Information Sharing' },
    { id: 'security', title: 'Data Security' },
    { id: 'your-rights', title: 'Your Rights' },
    { id: 'cookies', title: 'Cookies' },
    { id: 'changes', title: 'Changes to This Policy' },
    { id: 'contact', title: 'Contact Us' },
  ]

  return (
    <>
      <Header />
      <LegalLayout
        title="Privacy Policy"
        lastUpdated="March 30, 2026"
        sections={sections}
      >
        <section id="introduction">
          <h2>Introduction</h2>
          <p>
            KaziCloud ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p>
            By using KaziCloud, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section id="information-we-collect">
          <h2>Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information (resume, work history, skills)</li>
            <li>Job applications and related documents</li>
            <li>Communications with us or other users</li>
            <li>Payment information (processed by third-party providers)</li>
          </ul>

          <h3>Information We Collect Automatically</h3>
          <ul>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, features used, time spent)</li>
            <li>Location data (if you enable location services)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section id="how-we-use">
          <h2>How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Match job seekers with relevant opportunities</li>
            <li>Process applications and facilitate hiring</li>
            <li>Communicate with you about your account and our services</li>
            <li>Improve and personalize your experience</li>
            <li>Detect and prevent fraud or abuse</li>
            <li>Comply with legal obligations</li>
            <li>Send marketing communications (with your consent)</li>
          </ul>
        </section>

        <section id="sharing">
          <h2>Information Sharing</h2>
          <p>We may share your information with:</p>
          <ul>
            <li><strong>Employers:</strong> When you apply to jobs, employers can view your profile and application materials</li>
            <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (hosting, analytics, payment processing)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
          <p>
            We do not sell your personal information to third parties.
          </p>
        </section>

        <section id="security">
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and testing</li>
            <li>Access controls and authentication</li>
            <li>Employee training on data protection</li>
          </ul>
          <p>
            However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
          </p>
        </section>

        <section id="your-rights">
          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Object:</strong> Object to certain processing of your data</li>
          </ul>
          <p>
            To exercise these rights, contact us at privacy@kazicloud.com.
          </p>
        </section>

        <section id="cookies">
          <h2>Cookies</h2>
          <p>
            We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content.
          </p>
          <p>
            You can control cookies through your browser settings. Note that disabling cookies may affect platform functionality.
          </p>
        </section>

        <section id="changes">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the platform.
          </p>
          <p>
            Continued use of KaziCloud after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section id="contact">
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at:
          </p>
          <ul>
            <li>Email: privacy@kazicloud.com</li>
            <li>Address: Westlands, Nairobi, Kenya</li>
          </ul>
        </section>
      </LegalLayout>
      <Footer />
    </>
  )
}
