'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── OAuth Provider Buttons ───
function OAuthButton({ provider, icon, color }: { provider: string; icon: React.ReactNode; color: string }) {
  return (
    <button className={`w-full flex items-center justify-center gap-3 py-2.5 rounded border transition-all duration-300 ${color}`}>
      {icon}
      <span className="text-sm font-mono">Continue with {provider}</span>
    </button>
  )
}

// Google icon
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

// GitHub icon
function GitHubIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

// Microsoft icon
function MicrosoftIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
      <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
    </svg>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [orgName, setOrgName] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setTimeout(() => {
      setLoading(false)
      setError('Connect Supabase to enable auth')
    }, 1000)
  }

  return (
    <main className="min-h-screen flex bg-[#020204] relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Corner brackets */}
      <div className="absolute top-4 left-4 w-12 h-12 border-l border-t border-cyan-500/10" />
      <div className="absolute top-4 right-4 w-12 h-12 border-r border-t border-cyan-500/10" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-l border-b border-cyan-500/10" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-r border-b border-cyan-500/10" />

      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between flex-1 p-12 relative z-10">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-20">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Anomaly Grid" className="w-full h-full" />
            </div>
            <span className="text-sm font-mono font-bold text-cyan-400 tracking-widest">ANOMALY GRID</span>
          </Link>

          <div className="max-w-md">
            <h2 className="text-3xl font-black text-white mb-4 leading-tight">
              Your network.<br />
              <span className="text-cyan-400">Our eyes.</span>
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-mono">
              AI-powered threat detection that watches every connection,
              fingerprints every device, and profiles every actor — so you don&apos;t have to.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="space-y-4">
          {[
            { icon: '🛡️', text: 'Real-time passive network monitoring' },
            { icon: '🔍', text: 'Device fingerprinting with 95%+ confidence' },
            { icon: '🎯', text: 'MITRE ATT&CK mapped threat analysis' },
            { icon: '🧠', text: 'NVIDIA Morpheus AI inference engine' },
          ].map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <span className="text-sm">{f.icon}</span>
              <span className="text-xs text-gray-500 font-mono">{f.text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs font-mono text-gray-700">© 2026 Intellusia Studios // All rights reserved</p>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Anomaly Grid" className="w-full h-full" />
            </div>
            <span className="text-sm font-mono font-bold text-cyan-400 tracking-widest">ANOMALY GRID</span>
          </Link>

          <div className="bg-[#0a0b10] border border-[#141620] rounded-xl p-8">
            {/* Mode toggle */}
            <div className="flex mb-6 border border-[#141620] rounded-lg overflow-hidden">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-xs font-mono font-bold transition-all ${
                  mode === 'login' ? 'bg-cyan-500/10 text-cyan-400 border-r border-[#141620]' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                [ SIGN IN ]
              </button>
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-xs font-mono font-bold transition-all ${
                  mode === 'signup' ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-600 hover:text-gray-400'
                }`}
              >
                [ CREATE ACCOUNT ]
              </button>
            </div>

            <h1 className="text-xl font-bold text-white mb-1 font-mono">
              {mode === 'login' ? '> authenticate' : '> initialize'}
            </h1>
            <p className="text-xs text-gray-500 mb-6 font-mono">
              {mode === 'login' ? 'Access your threat operations center' : 'Deploy Anomaly Grid for your organization'}
            </p>

            {/* OAuth providers */}
            <div className="space-y-2 mb-6">
              <OAuthButton
                provider="Google"
                icon={<GoogleIcon />}
                color="bg-[#0f1118] border-[#141620] text-gray-300 hover:bg-[#141620] hover:border-gray-600"
              />
              <OAuthButton
                provider="GitHub"
                icon={<GitHubIcon />}
                color="bg-[#0f1118] border-[#141620] text-gray-300 hover:bg-[#141620] hover:border-gray-600"
              />
              <OAuthButton
                provider="Microsoft"
                icon={<MicrosoftIcon />}
                color="bg-[#0f1118] border-[#141620] text-gray-300 hover:bg-[#141620] hover:border-gray-600"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#141620]" />
              <span className="text-xs font-mono text-gray-600">or use email</span>
              <div className="flex-1 h-px bg-[#141620]" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1.5">ORGANIZATION NAME</label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder="Acme Defense Corp"
                      className="w-full bg-[#050508] border border-[#141620] rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-gray-500 mb-1.5">FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#050508] border border-[#141620] rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1.5">EMAIL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@company.com"
                  className="w-full bg-[#050508] border border-[#141620] rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-500 mb-1.5">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#050508] border border-[#141620] rounded-lg px-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all"
                />
              </div>

              {error && (
                <div className="text-xs font-mono text-red-400 bg-red-500/5 border border-red-500/10 rounded px-3 py-2">
                  &gt; ERROR: {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 py-3 rounded-lg font-mono font-bold text-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] disabled:opacity-50"
              >
                {loading ? '> authenticating...' : mode === 'login' ? '[ ACCESS GRANTED ]' : '[ DEPLOY SYSTEM ]'}
              </button>
            </form>

            {/* Footer links */}
            <div className="mt-6 flex items-center justify-between">
              <button className="text-xs font-mono text-gray-600 hover:text-cyan-400 transition">
                forgot_password?
              </button>
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs font-mono text-gray-600 hover:text-cyan-400 transition"
              >
                {mode === 'login' ? 'need_access?' : 'already_deployed?'}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="text-xs font-mono text-gray-700">🔒 256-bit encryption</span>
            <span className="text-gray-800">|</span>
            <span className="text-xs font-mono text-gray-700">SOC 2 compliant</span>
            <span className="text-gray-800">|</span>
            <span className="text-xs font-mono text-gray-700">FedRAMP ready</span>
          </div>
        </div>
      </div>
    </main>
  )
}
