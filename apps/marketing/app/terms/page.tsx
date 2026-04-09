import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LegalLayout from '@/components/legal/LegalLayout'

export default function TermsPage() {
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'eligibility', title: 'Eligibility' },
    { id: 'accounts', title: 'User Accounts' },
    { id: 'services', title: 'Our Services' },
    { id: 'user-content', title: 'User Content' },
    { id: 'prohibited', title: 'Prohibited Conduct' },
    { id: 'fees', title: 'Fees and Payment' },
    { id: 'termination', title: 'Termination' },
    { id: 'disclaimers', title: 'Disclaimers' },
    { id: 'limitation', title: 'Limitation of Liability' },
    { id: 'governing-law', title: 'Governing Law' },
    { id: 'changes', title: 'Changes to Terms' },
    { id: 'contact', title: 'Contact' },
  ]

  return (
    <>
      <Header />
      <LegalLayout
        title="Terms of Service"
        lastUpdated="March 30, 2026"
        sections={sections}
      >
        <section id="acceptance">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing or using KaziCloud, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use our services.
          </p>
        </section>

        <section id="eligibility">
          <h2>Eligibility</h2>
          <p>You must be at least 18 years old to use KaziCloud. By using our platform, you represent that:</p>
          <ul>
            <li>You are at least 18 years of age</li>
            <li>You have the legal capacity to enter into binding contracts</li>
            <li>You will comply with these Terms and all applicable laws</li>
          </ul>
        </section>

        <section id="accounts">
          <h2>User Accounts</h2>
          <h3>Account Creation</h3>
          <p>
            To use certain features, you must create an account. You agree to provide accurate, current, and complete information.
          </p>

          <h3>Account Security</h3>
          <ul>
            <li>You are responsible for maintaining the confidentiality of your password</li>
            <li>You are responsible for all activities under your account</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>Do not share your account credentials</li>
          </ul>

          <h3>Account Types</h3>
          <p>
            We offer different account types (job seeker, employer) with different features and obligations.
          </p>
        </section>

        <section id="services">
          <h2>Our Services</h2>
          <h3>For Job Seekers</h3>
          <ul>
            <li>Create a profile and upload your resume</li>
            <li>Search and apply for jobs</li>
            <li>Receive job recommendations</li>
            <li>Communicate with employers</li>
          </ul>

          <h3>For Employers</h3>
          <ul>
            <li>Post job listings</li>
            <li>Search candidate profiles</li>
            <li>Review applications</li>
            <li>Communicate with candidates</li>
          </ul>

          <h3>Service Modifications</h3>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of our services at any time.
          </p>
        </section>

        <section id="user-content">
          <h2>User Content</h2>
          <h3>Your Content</h3>
          <p>
            You retain ownership of content you submit (profiles, resumes, job postings). By submitting content, you grant us a license to use, display, and distribute it as necessary to provide our services.
          </p>

          <h3>Content Standards</h3>
          <p>You agree that your content will not:</p>
          <ul>
            <li>Be false, misleading, or fraudulent</li>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Contain malware or harmful code</li>
            <li>Be offensive, discriminatory, or harassing</li>
          </ul>

          <h3>Content Removal</h3>
          <p>
            We reserve the right to remove any content that violates these Terms or is otherwise objectionable.
          </p>
        </section>

        <section id="prohibited">
          <h2>Prohibited Conduct</h2>
          <p>You may not:</p>
          <ul>
            <li>Use the platform for any illegal purpose</li>
            <li>Impersonate another person or entity</li>
            <li>Scrape, crawl, or harvest data from the platform</li>
            <li>Interfere with or disrupt the platform's operation</li>
            <li>Attempt to gain unauthorized access to systems</li>
            <li>Post fake jobs or fraudulent applications</li>
            <li>Spam or send unsolicited communications</li>
            <li>Discriminate based on protected characteristics</li>
          </ul>
        </section>

        <section id="fees">
          <h2>Fees and Payment</h2>
          <h3>Job Seekers</h3>
          <p>
            Basic job seeker accounts are free. Premium features may require payment.
          </p>

          <h3>Employers</h3>
          <p>
            Employer accounts may require payment based on the selected plan. Fees are non-refundable unless otherwise stated.
          </p>

          <h3>Payment Terms</h3>
          <ul>
            <li>Payments are processed by third-party providers</li>
            <li>You authorize us to charge your payment method</li>
            <li>Subscriptions auto-renew unless cancelled</li>
            <li>We may change fees with 30 days' notice</li>
          </ul>
        </section>

        <section id="termination">
          <h2>Termination</h2>
          <h3>By You</h3>
          <p>
            You may terminate your account at any time through your account settings or by contacting us.
          </p>

          <h3>By Us</h3>
          <p>
            We may suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or for any other reason at our discretion.
          </p>

          <h3>Effect of Termination</h3>
          <p>
            Upon termination, your right to use the platform ceases. We may retain certain information as required by law or for legitimate business purposes.
          </p>
        </section>

        <section id="disclaimers">
          <h2>Disclaimers</h2>
          <p>
            KaziCloud is provided "as is" and "as available" without warranties of any kind, either express or implied.
          </p>
          <p>We do not guarantee:</p>
          <ul>
            <li>That you will find a job or hire a candidate</li>
            <li>The accuracy or reliability of user-generated content</li>
            <li>Uninterrupted or error-free service</li>
            <li>That the platform will meet your specific requirements</li>
          </ul>
          <p>
            We are not responsible for the conduct of users or the outcome of employment relationships.
          </p>
        </section>

        <section id="limitation">
          <h2>Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, KaziCloud shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
          </p>
          <p>
            Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </section>

        <section id="governing-law">
          <h2>Governing Law</h2>
          <p>
            These Terms are governed by the laws of Kenya. Any disputes shall be resolved in the courts of Nairobi, Kenya.
          </p>
        </section>

        <section id="changes">
          <h2>Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. We will notify you of material changes by email or through the platform.
          </p>
          <p>
            Continued use after changes constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section id="contact">
          <h2>Contact</h2>
          <p>
            Questions about these Terms? Contact us at:
          </p>
          <ul>
            <li>Email: legal@kazicloud.com</li>
            <li>Address: Westlands, Nairobi, Kenya</li>
          </ul>
        </section>
      </LegalLayout>
      <Footer />
    </>
  )
}
