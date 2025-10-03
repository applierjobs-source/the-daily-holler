import React from 'react';
import Footer from './Footer';

const Privacy = () => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you:</p>
          <ul>
            <li>Visit our website</li>
            <li>Subscribe to our newsletter</li>
            <li>Contact us for support</li>
            <li>Interact with our content</li>
          </ul>
          
          <h3>Types of Information:</h3>
          <ul>
            <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited, time spent, and referring websites</li>
            <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
            <li><strong>Contact Information:</strong> Email address (if you subscribe to our newsletter)</li>
            <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance your experience</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Send you newsletters and updates (if you subscribe)</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns and optimize our website</li>
            <li>Comply with legal obligations</li>
            <li>Protect against fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2>3. Third-Party Services</h2>
          <p>We use third-party services that may collect information about you:</p>
          
          
          <h3>Analytics</h3>
          <p>
            We may use analytics services to understand how our website is used. These services may collect information about your use of our website and other websites.
          </p>
        </section>

        <section>
          <h2>4. Cookies and Tracking Technologies</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Remember your preferences and settings</li>
            <li>Analyze how our website is used</li>
            <li>Provide personalized content and advertisements</li>
            <li>Improve our services</li>
          </ul>
          
          <p>You can control cookies through your browser settings, but disabling cookies may affect the functionality of our website.</p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2>6. Data Sharing</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties except:</p>
          <ul>
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist us in operating our website</li>
          </ul>
        </section>

        <section>
          <h2>7. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Delete your personal information</li>
            <li>Object to processing of your information</li>
            <li>Data portability</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section>
          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: privacy@holler.news
            <br />
            Address: The Daily Holler Privacy Department
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
