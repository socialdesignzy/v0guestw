'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-3xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-slate-300 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors">
            Go Home
          </Link>
          <Link
            href="/dashboard"
            className="border border-blue-400 hover:border-blue-300 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
