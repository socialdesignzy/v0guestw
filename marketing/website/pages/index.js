import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>GuestWorker - Manage Your Workforce Efficiently</title>
        <meta name="description" content="GuestWorker helps contractors and employers manage workers, attendance, payments, and more." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-indigo-600">GuestWorker</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your workforce management with our comprehensive platform for contractors and employers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="https://app.guestworker.app/login"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Get Started
            </Link>
            <Link 
              href="https://app.guestworker.app/pricing"
              className="border-2 border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              View Pricing
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Worker Management</h3>
            <p className="text-gray-600">Efficiently manage your workforce with detailed profiles and tracking.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Attendance Tracking</h3>
            <p className="text-gray-600">Real-time attendance management with automated alerts and reports.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">Payment Processing</h3>
            <p className="text-gray-600">Streamlined payment collection and wage settlement system.</p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">Join thousands of contractors and employers using GuestWorker.</p>
          <Link 
            href="https://app.guestworker.app/register"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition inline-block"
          >
            Sign Up Now
          </Link>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 GuestWorker. All rights reserved.</p>
          <div className="mt-4 space-x-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

