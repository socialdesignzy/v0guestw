import { prisma } from '@/lib/prisma';

export default async function PrivacyPage() {
  const content = await prisma.content.findUnique({
    where: { slug: 'privacy-policy' },
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none space-y-6">
          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              GuestWorker (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the GuestWorker website and mobile application (&quot;the Service&quot;).
            </p>
            <p className="text-muted-foreground mt-4">
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>
          </section>

          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Information Collection and Use</h2>
            <p className="text-muted-foreground">
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-muted-foreground">
              <li>Personal Data (name, email, phone number, address)</li>
              <li>Usage Data (access logs, pages viewed, time spent)</li>
              <li>Device Information (device type, browser, IP address)</li>
              <li>Payment Information (processed securely through Razorpay)</li>
            </ul>
          </section>

          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Security of Data</h2>
            <p className="text-muted-foreground">
              The security of your data is important to us, but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="bg-card p-6 rounded-lg border border-border">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at support@guestworker.in
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
