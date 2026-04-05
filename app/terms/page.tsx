'use client'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms of Service</h1>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Agreement to Terms</h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing and using GuestWorker, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Use License</h2>
            <p className="text-slate-700 leading-relaxed">
              Permission is granted to temporarily download one copy of the materials (information or software) on
              GuestWorker for personal, non-commercial transitory viewing only. This is the grant of a license, not a
              transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 text-slate-700 space-y-2 mt-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on the site</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Disclaimer</h2>
            <p className="text-slate-700 leading-relaxed">
              The materials on GuestWorker are provided on an &quot;as is&quot; basis. GuestWorker makes no warranties,
              expressed or implied, and hereby disclaims and negates all other warranties including, without limitation,
              implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement
              of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Limitations</h2>
            <p className="text-slate-700 leading-relaxed">
              In no event shall GuestWorker or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to
              use the materials on GuestWorker, even if GuestWorker or an authorized representative has been notified
              orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Accuracy of Materials</h2>
            <p className="text-slate-700 leading-relaxed">
              The materials appearing on GuestWorker could include technical, typographical, or photographic errors.
              GuestWorker does not warrant that any of the materials on its website are accurate, complete, or current.
              GuestWorker may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Contact Us</h2>
            <p className="text-slate-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us at support@guestworker.in
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
