import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Users, ArrowLeft, FileText, Shield, Lock, AlertCircle, Scale } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-[#F8FAFF]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B2ED0] to-[#4F46E5] rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] bg-clip-text text-transparent">
              GuestWorker
            </h1>
          </Link>
          <div className="flex gap-3 items-center">
            <Link to="/">
              <Button variant="ghost" className="hover:bg-[#3B2ED0]/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="hover:bg-[#3B2ED0]/10">Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-[#3B2ED0]" />
            <h1 className="text-4xl font-bold text-gray-900">Terms and Conditions</h1>
          </div>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#3B2ED0]" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to GuestWorker ("we," "our," or "us"), a Software-as-a-Service (SaaS) platform developed and operated by <strong>Designzy Technologies</strong>. These Terms and Conditions ("Terms") govern your access to and use of the GuestWorker platform, a workforce management service designed for contractors managing migrant workers.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our service.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-[#3B2ED0]" />
                2. Service Description
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                GuestWorker is a Software-as-a-Service (SaaS) platform developed by <strong>Designzy Technologies</strong> that provides contractors with tools to manage their migrant workforce. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Worker and employer management and tracking</li>
                <li>Dual attendance tracking system (from both worker and employer perspectives)</li>
                <li>Payment and wage management</li>
                <li>Advance payment tracking</li>
                <li>Commission calculations and tracking</li>
                <li>Extra charges management</li>
                <li>Reports and analytics</li>
                <li>Subscription management</li>
              </ul>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-[#3B2ED0]" />
                3. Account Registration and Security
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>3.1 Account Creation:</strong> To use our service, you must create an account by providing accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.
                </p>
                <p className="leading-relaxed">
                  <strong>3.2 Account Security:</strong> You are responsible for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account or any other breach of security.
                </p>
                <p className="leading-relaxed">
                  <strong>3.3 Age Requirement:</strong> You must be at least 18 years old to create an account and use our service.
                </p>
                <p className="leading-relaxed">
                  <strong>3.4 One Account Per User:</strong> Each user is allowed one account. Creating multiple accounts to circumvent limitations is strictly prohibited.
                </p>
              </div>
            </section>

            {/* Subscription and Payment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#3B2ED0]" />
                4. Subscription and Payment Terms
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>4.1 Subscription Plans:</strong> We offer various subscription plans with different features and pricing. Current plans and pricing are available on our pricing page and may change at any time.
                </p>
                <p className="leading-relaxed">
                  <strong>4.2 Billing:</strong> Subscriptions are billed on a monthly basis. Payment is due in advance for each billing period. We accept payments through Razorpay and other approved payment gateways.
                </p>
                <p className="leading-relaxed">
                  <strong>4.3 Free Trial:</strong> We may offer free trial periods. During the trial, you can access the service without payment. Upon trial expiration, your subscription will automatically convert to a paid plan unless cancelled before the trial ends.
                </p>
                <p className="leading-relaxed">
                  <strong>4.4 Auto-Renewal:</strong> Subscriptions automatically renew at the end of each billing period unless cancelled. You can cancel your subscription at any time from your account settings.
                </p>
                <p className="leading-relaxed">
                  <strong>4.5 Price Changes:</strong> We reserve the right to modify subscription prices. Price changes will be communicated to you at least 30 days in advance and will apply to your next billing cycle.
                </p>
                <p className="leading-relaxed">
                  <strong>4.6 Payment Processing:</strong> All payments are processed securely through third-party payment processors. We do not store your complete payment card information.
                </p>
                <p className="leading-relaxed">
                  <strong>4.7 Failed Payments:</strong> If a payment fails, we will attempt to retry the payment. If payment continues to fail, we may suspend or terminate your account.
                </p>
              </div>
            </section>

            {/* Cancellation */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-[#3B2ED0]" />
                5. Subscription Cancellation
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>5.1 Cancellation Rights:</strong> You may cancel your subscription at any time through your account settings or by contacting our support team.
                </p>
                <p className="leading-relaxed">
                  <strong>5.2 Effect of Cancellation:</strong> When you cancel your subscription:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Your subscription will not auto-renew after the current billing period</li>
                  <li>You will retain access to the service until the end of your current billing period</li>
                  <li>No refunds will be provided for the current or previous billing periods</li>
                  <li>After your billing period ends, your account will be downgraded to a free/inactive status</li>
                </ul>
                <p className="leading-relaxed">
                  <strong>5.3 Reactivation:</strong> You may reactivate your subscription at any time by selecting a plan and completing payment.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. User Responsibilities and Acceptable Use</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>6.1 Lawful Use:</strong> You agree to use our service only for lawful purposes and in accordance with these Terms. You will not use the service:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>In any way that violates any applicable local, state, national, or international law or regulation</li>
                  <li>To transmit any malicious code, viruses, or harmful software</li>
                  <li>To attempt to gain unauthorized access to any part of the service</li>
                  <li>To interfere with or disrupt the service or servers</li>
                  <li>To engage in any fraudulent, abusive, or harmful activities</li>
                </ul>
                <p className="leading-relaxed">
                  <strong>6.2 Data Accuracy:</strong> You are responsible for ensuring that all data you enter into the system, including worker information, attendance records, and payment details, is accurate and up to date.
                </p>
                <p className="leading-relaxed">
                  <strong>6.3 Compliance:</strong> You must comply with all applicable labor laws, data protection laws, and other regulations when using our service to manage your workforce.
                </p>
                <p className="leading-relaxed">
                  <strong>6.4 Backup:</strong> While we maintain backups of your data, you are responsible for maintaining your own backups of critical information.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>7.1 Our Rights:</strong> The GuestWorker platform, including all content, features, functionality, and software, is owned by us and protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  <strong>7.2 Your Data:</strong> You retain all ownership rights to the data you upload or enter into the system. By using our service, you grant us a license to use, store, and process your data as necessary to provide the service.
                </p>
                <p className="leading-relaxed">
                  <strong>7.3 Restrictions:</strong> You may not copy, modify, distribute, sell, or lease any part of our service or software without our express written permission.
                </p>
              </div>
            </section>

            {/* Privacy and Data Protection */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy, which explains how we collect, use, and protect your information. By using our service, you consent to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            {/* Data Retention and Deletion */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-[#3B2ED0]" />
                9. Data Retention and Deletion Policy
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>9.1 Account Deletion Requests:</strong> If you request account deletion through our platform, the following process will apply:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Your deletion request will be reviewed by our admin team</li>
                  <li>Upon approval, your account will be scheduled for permanent deletion after a 30-day grace period</li>
                  <li>During the 30-day grace period, you may cancel your deletion request and restore your account</li>
                  <li>After 30 days from approval, all your data will be permanently deleted from our systems, including:
                    <ul className="list-circle pl-6 mt-2 space-y-1">
                      <li>Worker profiles and information</li>
                      <li>Employer profiles and information</li>
                      <li>Attendance records</li>
                      <li>Payment history and transactions</li>
                      <li>Advance payment records</li>
                      <li>Extra charges and commission data</li>
                      <li>All notifications and messages</li>
                      <li>Subscription and payment order information</li>
                    </ul>
                  </li>
                  <li>A summary record (without personal details) will be retained for administrative and legal compliance purposes</li>
                </ul>
                
                <p className="leading-relaxed mt-4">
                  <strong>9.2 Inactive Free User Accounts:</strong> To maintain system efficiency and data hygiene:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Free plan user accounts that remain inactive (no login) for 6 consecutive months will be automatically flagged for deletion</li>
                  <li>After 6 months of inactivity, all data associated with the inactive free account will be permanently deleted</li>
                  <li>This automatic deletion applies only to free plan users and inactive accounts</li>
                  <li>Active paid subscribers are exempt from automatic deletion regardless of login frequency</li>
                  <li>We may send notification emails before automatic deletion (if email is available)</li>
                </ul>

                <p className="leading-relaxed mt-4">
                  <strong>9.3 Data Recovery:</strong> Once data is permanently deleted (after the 30-day grace period or automatic deletion), it cannot be recovered. We strongly recommend exporting any important data before requesting account deletion.
                </p>

                <p className="leading-relaxed">
                  <strong>9.4 Archived Summary Data:</strong> After deletion, we retain minimal summary information (such as total number of workers managed, deletion date, and deletion reason) for:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Legal compliance and audit purposes</li>
                  <li>Service improvement and analytics</li>
                  <li>Fraud prevention and security monitoring</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2 italic">
                  Note: Archived summary data does not contain personally identifiable information or detailed user data.
                </p>

                <p className="leading-relaxed mt-4">
                  <strong>9.5 Right to Data Portability:</strong> Before deletion, you have the right to request a copy of your data in a portable format. Please contact our support team to request data export.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                  <p className="text-amber-900 font-semibold mb-2">⚠️ Important Notice:</p>
                  <ul className="list-disc pl-6 space-y-1 text-amber-800 text-sm">
                    <li>Data deletion is permanent and irreversible after the 30-day grace period</li>
                    <li>Free plan users inactive for 6 months will have their data automatically deleted</li>
                    <li>Export your data before requesting deletion if you need to retain records</li>
                    <li>Paid subscribers are not subject to automatic deletion due to inactivity</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>10.1 Service Availability:</strong> We strive to maintain service availability but do not guarantee uninterrupted or error-free service. The service is provided "as is" and "as available" without warranties of any kind.
                </p>
                <p className="leading-relaxed">
                  <strong>10.2 Disclaimer:</strong> To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
                </p>
                <p className="leading-relaxed">
                  <strong>10.3 Limitation:</strong> Our total liability to you for any claims arising from or related to the service shall not exceed the amount you paid us in the 12 months preceding the claim.
                </p>
                <p className="leading-relaxed">
                  <strong>10.4 Indirect Damages:</strong> We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>11.1 Termination by You:</strong> You may terminate your account at any time by cancelling your subscription and requesting account deletion through our support team. Please refer to Section 9 (Data Retention and Deletion Policy) for details on the deletion process.
                </p>
                <p className="leading-relaxed">
                  <strong>11.2 Termination by Us:</strong> We reserve the right to suspend or terminate your account immediately if you violate these Terms, engage in fraudulent activities, or fail to pay subscription fees.
                </p>
                <p className="leading-relaxed">
                  <strong>11.3 Effect of Termination:</strong> Upon termination, your access to the service will cease. Data deletion will follow the process outlined in Section 9 (Data Retention and Deletion Policy).
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Material changes will be communicated to you via email or through the service. Your continued use of the service after changes become effective constitutes acceptance of the modified Terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law and Dispute Resolution</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>13.1 Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles.
                </p>
                <p className="leading-relaxed">
                  <strong>13.2 Dispute Resolution:</strong> Any disputes arising from or related to these Terms or the service shall first be addressed through good faith negotiation. If negotiation fails, disputes shall be resolved through binding arbitration or in the courts of India.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-[#3B2ED0]/10 rounded-lg p-4 space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> support@guestworker.app</p>
                <p className="text-gray-700"><strong>Service:</strong> GuestWorker Workforce Management Platform</p>
                <p className="text-gray-700"><strong>Location:</strong> India</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="border-t pt-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 leading-relaxed">
                  <strong>By using GuestWorker, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</strong>
                </p>
              </div>
            </section>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex justify-center gap-4">
          <Link to="/">
            <Button variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link to="/register">
            <Button size="lg" className="bg-gradient-to-r from-[#3B2ED0] to-[#4F46E5] hover:from-[#2A1FB8] hover:to-[#3D35D4]">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

