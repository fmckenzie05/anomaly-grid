import Link from 'next/link'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#030305]">
      {/* Grid background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative text-center max-w-3xl z-10">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">Anomaly Grid</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          See every threat.<br />
          <span className="text-blue-500">Before it sees you.</span>
        </h1>

        <p className="text-lg text-gray-400 mb-10 max-w-2xl mx-auto">
          AI-powered network monitoring that passively fingerprints every connection,
          profiles threat actors, and surfaces anomalies in real time — powered by NVIDIA Morpheus.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
          >
            Open Dashboard
          </Link>
          <Link
            href="/login"
            className="border border-gray-700 text-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-[#0a0b10] hover:border-gray-600 transition"
          >
            Sign In
          </Link>
        </div>

        {/* Tech badges */}
        <div className="mt-12 flex gap-3 justify-center flex-wrap">
          {['NVIDIA Morpheus', 'Triton Inference', 'Real-time DFP', 'MITRE ATT&CK', 'STIX/TAXII'].map(tag => (
            <span key={tag} className="text-xs px-3 py-1 rounded-full bg-[#0a0b10] border border-[#141620] text-gray-500">
              {tag}
            </span>
          ))}
        </div>

        <p className="mt-8 text-xs text-gray-600">Built by Intellusia Studios</p>
      </div>
    </main>
  )
}
