'use client'

import Link from 'next/link'

export default function Error({ error }: { error: Error }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <h2 className="text-3xl font-semibold mb-4">Server Error</h2>
        <p className="text-slate-300 mb-4">Something went wrong on our end. We&apos;re working to fix it.</p>
        <p className="text-slate-400 text-sm mb-8 break-all">{error.message}</p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-semibold transition-colors">
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="border border-blue-400 hover:border-blue-300 px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </main>
  )
}
