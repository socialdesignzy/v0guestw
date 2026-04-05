import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Users, ArrowLeft, XCircle, AlertTriangle, Info, Mail, Clock, CreditCard } from 'lucide-react';

export default function RefundPolicy() {
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
            <CreditCard className="h-8 w-8 text-[#3B2ED0]" />
            <h1 className="text-4xl font-bold text-gray-900">Refund Policy</h1>
          </div>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="h-6 w-6 text-[#3B2ED0]" />
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                This Refund Policy ("Policy") governs refunds, cancellations, and billing for GuestWorker subscription services. Please read this policy carefully before subscribing to our service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By subscribing to GuestWorker, you acknowledge that you have read, understood, and agree to this Refund Policy.
              </p>
            </section>

            {/* No Refunds Policy */}
            <section>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex items-start gap-3">
                  <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">No Refunds Policy</h3>
                    <p className="text-red-800 leading-relaxed">
                      <strong>GuestWorker does not provide refunds for subscription payments, including:</strong>
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-red-800 mt-2">
                      <li>Monthly subscription fees</li>
                      <li>Partial payments for billing periods</li>
                      <li>Unused portions of subscription periods</li>
                      <li>Early cancellation requests</li>
                      <li>Service dissatisfaction or change of mind</li>
                    </ul>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">
                All subscription payments are final and non-refundable. This policy applies regardless of whether you have used the service during the billing period.
              </p>
            </section>

            {/* Subscription Cancellation */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <XCircle className="h-6 w-6 text-[#3B2ED0]" />
                2. Subscription Cancellation
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Cancellation Rights</h3>
                  <p className="leading-relaxed mb-2">
                    You have the right to cancel your subscription at any time. You can cancel your subscription through:
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Your account settings page ("Manage Subscription")</li>
                    <li>Contacting our support team at support@guestworker.app</li>
                  </ul>
                </div>

                <div className="bg-[#3B2ED0]/10 rounded-lg p-4 border border-[#3B2ED0]/30">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#3B2ED0]" />
                    2.2 What Happens When You Cancel
                  </h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="leading-relaxed">
                      When you cancel your subscription:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Immediate Effect:</strong> Your subscription will be marked as "cancelled" and auto-renewal will be disabled</li>
                      <li><strong>Continued Access:</strong> You will retain full access to all features until the end of your current billing period</li>
                      <li><strong>No New Charges:</strong> You will not be charged for any future billing periods after your current period ends</li>
                      <li><strong>Data Retention:</strong> Your data will be retained for a reasonable period (typically 30-90 days) after cancellation</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2.3 Cancellation Process</h3>
                  <p className="leading-relaxed mb-2">To cancel your subscription:</p>
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Log in to your GuestWorker account</li>
                    <li>Navigate to "Account" → "Manage Subscription"</li>
                    <li>Click "Cancel Subscription"</li>
                    <li>Confirm your cancellation</li>
                    <li>You will receive a confirmation email with details about your cancellation and access period</li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">2.4 Reactivation</h3>
                  <p className="leading-relaxed">
                    You can reactivate your subscription at any time by selecting a plan and completing payment. Upon reactivation, your subscription will resume with the same features and billing cycle.
                  </p>
                </div>
              </div>
            </section>

            {/* Billing Period Retention */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-[#3B2ED0]" />
                3. Billing Period and Access Retention
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>3.1 Billing Period:</strong> Our subscriptions operate on monthly billing cycles. Each billing period is 30 days from the date of your initial subscription or renewal.
                </p>
                <p className="leading-relaxed">
                  <strong>3.2 Access Until Period End:</strong> Even after cancellation, you retain full access to all paid features until the end of your current billing period. For example:
                </p>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 ml-4">
                  <p className="text-gray-700 text-sm italic">
                    If your billing period ends on December 31st and you cancel on December 15th, you will continue to have full access until December 31st, but you will not be charged for January or any future months.
                  </p>
                </div>
                <p className="leading-relaxed">
                  <strong>3.3 No Pro-Rated Refunds:</strong> We do not provide pro-rated refunds for the remaining days in your billing period after cancellation. You have already paid for the entire billing period and will have access for the full period.
                </p>
              </div>
            </section>

            {/* Free Trial */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Free Trial Period</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>4.1 Trial Period:</strong> We may offer free trial periods for new users. During the trial period, no payment is required.
                </p>
                <p className="leading-relaxed">
                  <strong>4.2 Trial Cancellation:</strong> You can cancel your subscription during the free trial period without any charges. If you cancel before the trial ends, you will not be charged.
                </p>
                <p className="leading-relaxed">
                  <strong>4.3 Trial to Paid Conversion:</strong> If you do not cancel before the trial period ends, your subscription will automatically convert to a paid plan, and you will be charged for the first billing period.
                </p>
              </div>
            </section>

            {/* Payment Issues */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-[#3B2ED0]" />
                5. Payment Issues and Disputes
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>5.1 Failed Payments:</strong> If a payment fails, we will attempt to retry the payment. If payment continues to fail, your subscription may be suspended or terminated. No refunds are provided for failed payment attempts.
                </p>
                <p className="leading-relaxed">
                  <strong>5.2 Payment Disputes:</strong> If you believe you have been charged incorrectly, please contact us immediately at support@guestworker.app with:
                </p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Your account email</li>
                  <li>Transaction ID or payment receipt</li>
                  <li>Description of the issue</li>
                  <li>Supporting documentation if available</li>
                </ul>
                <p className="leading-relaxed">
                  <strong>5.3 Investigation:</strong> We will investigate your dispute within 5-7 business days and respond accordingly. However, please note that our no-refund policy still applies unless there is a genuine billing error on our part.
                </p>
                <p className="leading-relaxed">
                  <strong>5.4 Chargebacks:</strong> Initiating a chargeback or payment reversal may result in immediate account suspension or termination. We reserve the right to dispute chargebacks and provide evidence of service delivery.
                </p>
              </div>
            </section>

            {/* Exceptions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limited Exceptions</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  While we maintain a strict no-refund policy, we may, at our sole discretion, consider refunds in the following exceptional circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Duplicate Charges:</strong> If you are accidentally charged multiple times for the same billing period</li>
                  <li><strong>Billing Errors:</strong> If there is a proven error on our part that resulted in incorrect charges</li>
                  <li><strong>Service Unavailability:</strong> If our service is unavailable for an extended period (more than 48 consecutive hours) during your billing period due to our technical failures</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  Any such exceptions will be evaluated on a case-by-case basis and are not guaranteed. To request consideration for an exception, contact us at support@guestworker.app with detailed information.
                </p>
              </div>
            </section>

            {/* Plan Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription Plan Changes</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>7.1 Upgrading Plans:</strong> You can upgrade to a higher-tier plan at any time. The upgrade will be prorated, and you will be charged the difference for the remainder of your billing period.
                </p>
                <p className="leading-relaxed">
                  <strong>7.2 Downgrading Plans:</strong> If you downgrade to a lower-tier plan, the change will take effect at your next billing cycle. You will continue to have access to your current plan's features until the current billing period ends. No refunds are provided for downgrades.
                </p>
                <p className="leading-relaxed">
                  <strong>7.3 Plan Modifications:</strong> If we modify plan features or pricing, we will provide at least 30 days' notice. You can cancel your subscription before changes take effect if you do not agree with the modifications.
                </p>
              </div>
            </section>

            {/* Account Deletion */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Account Deletion and Data</h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  <strong>8.1 Account Deletion:</strong> You can request account deletion at any time. Account deletion will result in the permanent loss of all your data. Account deletion does not entitle you to a refund for any paid subscription periods.
                </p>
                <p className="leading-relaxed">
                  <strong>8.2 Data Export:</strong> Before deleting your account, you can export your data. We recommend doing this if you may need the information in the future, as it cannot be recovered after deletion.
                </p>
              </div>
            </section>

            {/* Contact for Questions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-[#3B2ED0]" />
                9. Questions and Support
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about this Refund Policy, subscription cancellation, or billing issues, please contact our support team:
              </p>
              <div className="bg-[#3B2ED0]/10 rounded-lg p-4 space-y-2">
                <p className="text-gray-700"><strong>Email:</strong> support@guestworker.app</p>
                <p className="text-gray-700"><strong>Response Time:</strong> We typically respond within 24-48 hours</p>
                <p className="text-gray-700"><strong>Service:</strong> GuestWorker Workforce Management Platform</p>
              </div>
            </section>

            {/* Policy Changes */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Refund Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify this Refund Policy at any time. Material changes will be communicated to active subscribers via email or through the service. Your continued use of the service after changes become effective constitutes acceptance of the modified policy.
              </p>
            </section>

            {/* Summary */}
            <section className="border-t pt-6">
              <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Policy Summary</h3>
                <div className="space-y-2 text-gray-700">
                  <p className="leading-relaxed"><strong>✓ No Refunds:</strong> All subscription payments are final and non-refundable</p>
                  <p className="leading-relaxed"><strong>✓ Cancel Anytime:</strong> You can cancel your subscription at any time</p>
                  <p className="leading-relaxed"><strong>✓ Full Access Until Period End:</strong> You retain access until your current billing period ends after cancellation</p>
                  <p className="leading-relaxed"><strong>✓ No Future Charges:</strong> After cancellation, you will not be charged for future billing periods</p>
                  <p className="leading-relaxed"><strong>✓ Contact Support:</strong> For questions or issues, contact support@guestworker.app</p>
                </div>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="border-t pt-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-gray-700 leading-relaxed">
                  <strong>By subscribing to GuestWorker, you acknowledge that you have read, understood, and agree to this Refund Policy. You understand that all payments are final and non-refundable, except in the limited circumstances outlined above.</strong>
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
          <Link to="/terms-and-conditions">
            <Button variant="outline" size="lg">
              View Terms & Conditions
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

