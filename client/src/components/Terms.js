import React from 'react';
import Footer from './Footer';

const Terms = () => {
  return (
    <div className="legal-page">
      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using The Daily Holler ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            The Daily Holler is a local events and activities website that helps you discover things to do in your city. We provide information about local events, activities, and happenings to help you stay connected with your community.
          </p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>Users agree to:</p>
          <ul>
            <li>Understand that event information may change and should be verified independently</li>
            <li>Not share content as factual news</li>
            <li>Respect other users and the community</li>
            <li>Not attempt to hack, damage, or interfere with the service</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2>4. Content Disclaimer</h2>
          <p>
            <strong>IMPORTANT:</strong> The Daily Holler provides information about local events and activities. While we strive for accuracy, event details may change. Please verify event information directly with organizers before attending. We are not responsible for event cancellations, changes, or any issues that may arise from attending events listed on our site.
          </p>
        </section>

        <section>
          <h2>5. Intellectual Property</h2>
          <p>
            The content, organization, graphics, design, compilation, magnetic translation, digital conversion, and other matters related to the Service are protected under applicable copyrights, trademarks, and other proprietary rights. The copying, redistribution, use, or publication by you of any such matters or any part of the Service is strictly prohibited.
          </p>
        </section>

        <section>
          <h2>6. Limitation of Liability</h2>
          <p>
            The Daily Holler shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service, including but not limited to any errors or omissions in any content, or any loss or damage of any kind incurred as a result of the use of any content posted, transmitted, or otherwise made available via the Service.
          </p>
        </section>

        <section>
          <h2>7. Privacy Policy</h2>
          <p>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
          </p>
        </section>

        <section>
          <h2>8. Modifications to Terms</h2>
          <p>
            The Daily Holler reserves the right to modify these terms at any time. We will notify users of any changes by posting the new Terms of Service on this page. You are advised to review these terms periodically for any changes.
          </p>
        </section>

        <section>
          <h2>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            Email: legal@holler.news
            <br />
            Address: The Daily Holler Legal Department
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Terms;
