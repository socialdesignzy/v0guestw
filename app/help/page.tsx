import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Help Center</h1>

        <div className="space-y-8">
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I add workers?</h3>
                <p className="text-muted-foreground">
                  Navigate to the Workers section and click "Add Worker" to create a new worker profile.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do I track attendance?</h3>
                <p className="text-muted-foreground">
                  Go to the Attendance page and mark workers as present, absent, or half-day for each day.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How do I manage room bookings?</h3>
                <p className="text-muted-foreground">
                  Create rooms in the Rooms section, then use the Bookings page to assign workers to rooms.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Billing & Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit/debit cards, UPI, and bank transfers through Razorpay.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-muted-foreground">
                  Yes, you can change your plan anytime from the Pricing page. Changes take effect in the next billing cycle.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Technical Support</h2>
            <p className="text-muted-foreground mb-4">
              For technical issues or additional support, please contact our support team.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:opacity-90"
            >
              Contact Support
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
