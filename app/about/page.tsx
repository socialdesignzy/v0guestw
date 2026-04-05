'use client'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">About GuestWorker</h1>
          <p className="text-xl text-slate-600">Transforming workforce management for India's contractor economy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-slate-700 leading-relaxed">
              We believe every contractor deserves access to modern, reliable tools to manage their workforce efficiently.
              GuestWorker is built to simplify attendance tracking, payment management, and worker coordination for
              contractors across India.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-slate-700 leading-relaxed">
              To become the most trusted platform for workforce management in the informal economy, empowering millions
              of contractors and workers with financial transparency and operational efficiency.
            </p>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold mb-6">Why Choose GuestWorker?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2">Easy Attendance Tracking</h3>
              <p className="text-slate-300">Simple check-in/check-out system with accurate records and analytics.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Secure Payment Processing</h3>
              <p className="text-slate-300">Integrated with Razorpay for safe and reliable payment processing.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Comprehensive Reports</h3>
              <p className="text-slate-300">Get insights with detailed attendance and financial reports.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Flexible Plans</h3>
              <p className="text-slate-300">Choose a plan that fits your needs with free trial available.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl text-slate-600 mb-8">Join thousands of contractors managing their workforce efficiently.</p>
          <a
            href="/register"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </main>
  )
}
