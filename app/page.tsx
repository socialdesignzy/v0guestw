'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 sticky top-0 z-50 bg-slate-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">GuestWorker</h1>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-blue-400 transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            Workforce Management Made Simple
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            GuestWorker helps contractors manage attendance, payments, and worker records efficiently. Perfect for the
            Indian contractor economy.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
            <Link href="/pricing" className="border border-blue-400 hover:border-blue-300 px-8 py-3 rounded-lg font-semibold transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-700">
        <h3 className="text-3xl font-bold text-center mb-12">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: 'Attendance Tracking', desc: 'Easy check-in/check-out system with accurate records' },
            { title: 'Payment Management', desc: 'Secure payments with Razorpay integration' },
            { title: 'Worker Management', desc: 'Organize and manage your entire workforce' },
            { title: 'Room Bookings', desc: 'Manage worker accommodations and room assignments' },
            { title: 'Reports & Analytics', desc: 'Get insights with comprehensive reports' },
            { title: 'Commission Tracking', desc: 'Automate commission calculations' },
          ].map((feature, i) => (
            <div key={i} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-600 transition-colors">
              <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
              <p className="text-slate-300">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-700">
        <h3 className="text-3xl font-bold text-center mb-4">Simple Pricing</h3>
        <p className="text-center text-slate-300 mb-12">Choose the plan that fits your needs</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { name: 'Starter', price: '₹499', workers: '10', features: ['Up to 10 Workers', 'Attendance Tracking', 'Basic Reports'] },
            { name: 'Professional', price: '₹1,299', workers: '50', features: ['Up to 50 Workers', 'Full Payments', 'Advanced Reports', 'Commission Tracking'], highlight: true },
            { name: 'Enterprise', price: 'Custom', workers: 'Unlimited', features: ['Unlimited Workers', 'Custom Features', 'Priority Support', 'API Access'] },
          ].map((plan, i) => (
            <div
              key={i}
              className={`rounded-lg p-8 border ${
                plan.highlight ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500' : 'border-slate-700 bg-slate-800'
              }`}
            >
              <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
              <p className="text-3xl font-bold text-blue-400 mb-4">{plan.price}/mo</p>
              <p className="text-slate-300 mb-6">{plan.workers} workers</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center">
                    <span className="text-blue-400 mr-3">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`w-full block text-center py-2 rounded-lg font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-700 text-center">
        <h3 className="text-4xl font-bold mb-6">Ready to Simplify Workforce Management?</h3>
        <p className="text-xl text-slate-300 mb-8">Join thousands of contractors managing their workforce efficiently</p>
        <Link
          href="/register"
          className="inline-block bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Start Your Free Trial Today
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-bold mb-4">GuestWorker</h4>
            <p className="text-slate-400 text-sm">Making workforce management simple for India&apos;s contractors</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Product</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <p className="text-slate-400 text-sm">Email: support@guestworker.in</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2024 GuestWorker. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
