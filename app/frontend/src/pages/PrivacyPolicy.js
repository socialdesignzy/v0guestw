import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Users, ArrowLeft, Shield, Lock, Database, Eye, Mail, AlertCircle } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield className="h-8 w-8 text-[#3B2ED0]" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-[#3B2ED0]" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                GuestWorker ("we," "our," or "us"), a Software-as-a-Service (SaaS) platform developed and operated by <strong>Designzy Technologies</strong>, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our workforce management platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our service, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our service.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-[#3B2ED0]" />
                2. Information We Collect
              </h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Account Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">When you create an account, we collect:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Password (encrypted)</li>
                    <li>Company or business name (if provided)</li>
                    <li>Account creation date and activity logs</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Worker Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">To manage your workforce, we store:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Worker names and identification details</li>
                    <li>Contact information</li>
                    <li>Employment status and assignment details</li>
                    <li>Performance and attendance records</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Employer Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">We collect employer data including:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Employer names and contact details</li>
                    <li>Business information</li>
                    <li>Contract and commission details</li>
                    <li>Payment and transaction history</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Financial Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">We process payment-related data:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Wage and salary information</li>
                    <li>Advance payments</li>
                    <li>Commission calculations</li>
                    <li>Payment transaction records</li>
                    <li>Subscription payment details (processed through Razorpay)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.5 Attendance and Work Records</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">We track:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Daily attendance records</li>
                    <li>Work assignments and schedules</li>
                    <li>Overtime and leave records</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">2.6 Technical Information</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">Automatically collected data:</p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Usage patterns and access logs</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-[#3B2ED0]" />
                3. How We Use Your Information
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Delivery:</strong> To provide and maintain our workforce management platform, process transactions, and manage your account</li>
                  <li><strong>Communication:</strong> To send you service-related notifications, updates, security alerts, and respond to your inquiries</li>
                  <li><strong>Improvement:</strong> To analyze usage patterns, improve our services, develop new features, and enhance user experience</li>
                  <li><strong>Security:</strong> To detect, prevent, and address technical issues, fraud, and unauthorized access</li>
                  <li><strong>Compliance:</strong> To comply with legal obligations, enforce our terms of service, and protect our rights</li>
                  <li><strong>Billing:</strong> To process subscription payments and manage billing cycles</li>
                  <li><strong>Support:</strong> To provide customer support and technical assistance</li>
                </ul>
              </div>
            </section>

            {/* Data Sharing and Disclosure */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  We do not sell your personal information. We may share your information only in the following circumstances:
                </p>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.1 Payment Processors</h3>
                  <p className="leading-relaxed">
                    We share payment information with Razorpay and other authorized payment processors to process subscription payments. These processors are bound by their own privacy policies and security standards.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.2 Service Providers</h3>
                  <p className="leading-relaxed">
                    We may share information with trusted third-party service providers who assist us in operating our platform, conducting business, or servicing you (e.g., hosting providers, analytics services). These providers are contractually obligated to protect your data.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.3 Legal Requirements</h3>
                  <p className="leading-relaxed">
                    We may disclose information if required by law, court order, or government regulation, or to protect our rights, property, or safety, or that of our users or others.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.4 Business Transfers</h3>
                  <p className="leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction, subject to the same privacy protections.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">4.5 With Your Consent</h3>
                  <p className="leading-relaxed">
                    We may share your information with your explicit consent or at your direction.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-[#3B2ED0]" />
                5. Data Security
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> Data is encrypted in transit (HTTPS/TLS) and at rest</li>
                  <li><strong>Authentication:</strong> Secure password hashing and JWT-based authentication</li>
                  <li><strong>Access Controls:</strong> Role-based access control and authorization mechanisms</li>
                  <li><strong>Regular Backups:</strong> Automated backup systems to prevent data loss</li>
                  <li><strong>Security Monitoring:</strong> Continuous monitoring for security threats and vulnerabilities</li>
                  <li><strong>Secure Infrastructure:</strong> Hosted on secure, compliant cloud infrastructure</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            {/* Data Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-[#3B2ED0]" />
                6. Data Retention and Deletion
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We retain your information for as long as necessary to provide our services and fulfill the purposes described in this policy:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Active Accounts:</strong> Data is retained while your account is active and you continue using our services</li>
                  <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law or for legitimate business purposes</li>
                  <li><strong>Backups:</strong> Data in backups may be retained for a longer period for disaster recovery purposes</li>
                </ul>

                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Account Deletion and Data Removal
                  </h3>
                  
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">User-Requested Account Deletion:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>You can request account deletion through our platform at any time</li>
                        <li>Upon admin approval, your account will be scheduled for permanent deletion after a <strong>30-day grace period</strong></li>
                        <li>During the 30-day grace period, you may cancel your deletion request and restore your account</li>
                        <li>After 30 days, all your personal data and associated information will be <strong>permanently deleted</strong>, including:
                          <ul className="list-circle pl-6 mt-1 space-y-0.5">
                            <li>Worker profiles and information</li>
                            <li>Employer profiles and information</li>
                            <li>Attendance and payment records</li>
                            <li>All messages and notifications</li>
                            <li>Subscription and transaction history</li>
                          </ul>
                        </li>
                        <li>A minimal summary record (without personally identifiable information) will be retained for legal compliance and audit purposes</li>
                      </ul>
                    </div>

                    <div className="mt-4">
                      <p className="font-semibold text-gray-900 mb-2">Automatic Deletion of Inactive Free Accounts:</p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Free plan user accounts that remain inactive (no login) for <strong>6 consecutive months</strong> will be automatically flagged for deletion</li>
                        <li>After 6 months of inactivity, all data associated with the inactive free account will be permanently deleted</li>
                        <li>This automatic deletion applies only to free plan users and inactive accounts</li>
                        <li>Active paid subscribers are exempt from automatic deletion regardless of login frequency</li>
                        <li>We may send notification emails before automatic deletion (if email is available)</li>
                      </ul>
                    </div>

                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3">
                      <p className="font-semibold text-amber-900 mb-1">⚠️ Important:</p>
                      <ul className="list-disc pl-6 space-y-0.5 text-amber-800">
                        <li>Data deletion is permanent and irreversible after the grace period</li>
                        <li>We strongly recommend exporting your data before requesting deletion</li>
                        <li>Deleted data cannot be recovered</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-[#3B2ED0]" />
                7. Your Privacy Rights
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  Depending on your jurisdiction, you may have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a structured, machine-readable format</li>
                  <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
                  <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                  <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  To exercise these rights, please contact us at support@guestworker.app. We will respond to your request within a reasonable timeframe and in accordance with applicable laws.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking Technologies</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to enhance your experience:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the service to function (e.g., authentication, session management)</li>
                  <li><strong>Functional Cookies:</strong> Enhance functionality and personalization</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our service to improve it</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our service.
                </p>
              </div>
            </section>

            {/* Third-Party Links */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Links and Services</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service may contain links to third-party websites or integrate with third-party services (e.g., Razorpay). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies before providing any information.
              </p>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our service is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately so we can delete it.
              </p>
            </section>

            {/* International Data Transfers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy and applicable data protection laws.
              </p>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of the service after changes become effective constitutes acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-[#3B2ED0]" />
                13. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
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
                  <strong>By using GuestWorker, you acknowledge that you have read and understood this Privacy Policy and consent to our data practices as described herein.</strong>
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

