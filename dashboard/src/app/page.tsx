'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Matrix Rain Effect ───
function MatrixRain() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.07] pointer-events-none">
      {Array.from({ length: 40 }, (_, i) => (
        <div
          key={i}
          className="absolute text-green-400 font-mono text-xs leading-none select-none"
          style={{
            left: `${i * 2.5}%`,
            animation: `matrix-fall ${3 + Math.random() * 7}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          {Array.from({ length: 30 }, () =>
            String.fromCharCode(0x30A0 + Math.random() * 96)
          ).join('\n')}
        </div>
      ))}
    </div>
  )
}

// ─── Glitch Text Effect ───
function GlitchText({ text, className }: { text: string; className?: string }) {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 150)
    }, 3000 + Math.random() * 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={`relative inline-block ${className}`}>
      <span className={glitch ? 'opacity-0' : ''}>{text}</span>
      {glitch && (
        <>
          <span className="absolute top-0 left-0 text-cyan-400 animate-pulse" style={{ clipPath: 'inset(0 0 50% 0)', transform: 'translateX(-2px)' }}>{text}</span>
          <span className="absolute top-0 left-0 text-pink-500 animate-pulse" style={{ clipPath: 'inset(50% 0 0 0)', transform: 'translateX(2px)' }}>{text}</span>
        </>
      )}
    </span>
  )
}

// ─── Typing Terminal ───
function TerminalTyper() {
  const lines = [
    '> initializing anomaly_grid v0.1...',
    '> connecting to NVIDIA Morpheus pipeline...',
    '> loading DFP autoencoder model... ✓',
    '> loading threat classifier... ✓',
    '> loading fingerprint engine... ✓',
    '> scanning 4,219 network endpoints...',
    '> 12 threat actors identified',
    '> 47 anomalies detected in last 24h',
    '> 3 critical alerts — C2 beacon active',
    '> system armed. watching everything.',
  ]

  const [currentLine, setCurrentLine] = useState(0)
  const [currentChar, setCurrentChar] = useState(0)
  const [displayLines, setDisplayLines] = useState<string[]>([])

  useEffect(() => {
    if (currentLine >= lines.length) return

    const line = lines[currentLine]
    if (currentChar < line.length) {
      const timeout = setTimeout(() => setCurrentChar(c => c + 1), 20 + Math.random() * 30)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setDisplayLines(prev => [...prev, line])
        setCurrentLine(l => l + 1)
        setCurrentChar(0)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [currentLine, currentChar])

  return (
    <div className="bg-[#020204]/90 border border-[#141620] rounded-lg p-4 font-mono text-xs max-w-lg w-full backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-3 border-b border-[#141620] pb-2">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
        <span className="text-gray-600 text-xs ml-2">anomaly_grid — threat_ops</span>
      </div>
      <div className="space-y-0.5 min-h-[200px]">
        {displayLines.map((line, i) => (
          <div key={i} className={`${line.includes('✓') ? 'text-green-400' : line.includes('critical') ? 'text-red-400' : line.includes('armed') ? 'text-cyan-400' : 'text-gray-400'}`}>
            {line}
          </div>
        ))}
        {currentLine < lines.length && (
          <div className="text-gray-400">
            {lines[currentLine].slice(0, currentChar)}
            <span className="text-cyan-400 animate-pulse">█</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Scanning Line ───
function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"
        style={{ animation: 'scan-line 4s linear infinite' }}
      />
    </div>
  )
}

// ─── Live Stats Bar ───
function LiveStatBar() {
  const [stats, setStats] = useState({ packets: 1247892, threats: 3421, actors: 12, uptime: 99.97 })

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(s => ({
        ...s,
        packets: s.packets + Math.floor(Math.random() * 50),
        threats: s.threats + (Math.random() > 0.7 ? 1 : 0),
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-8 text-xs font-mono">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        <span className="text-gray-500">PACKETS</span>
        <span className="text-cyan-400 tabular-nums">{stats.packets.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-gray-500">BLOCKED</span>
        <span className="text-red-400 tabular-nums">{stats.threats.toLocaleString()}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">ACTORS</span>
        <span className="text-orange-400 tabular-nums">{stats.actors}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-500">UPTIME</span>
        <span className="text-green-400">{stats.uptime}%</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#020204] overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/anomaly-grid/hero-bg.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020204]/70 via-[#020204]/85 to-[#020204]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Matrix rain */}
      <MatrixRain />

      {/* Scan line */}
      <ScanLine />

      {/* Top bar */}
      <div className="relative z-20 border-b border-cyan-500/10 px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden relative">
            <Image src="/logo.png" alt="Anomaly Grid" fill className="object-cover" />
          </div>
          <span className="text-sm font-mono font-bold text-cyan-400 tracking-widest">ANOMALY GRID</span>
        </div>
        <LiveStatBar />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-60px)] px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          {/* Glitch title */}
          <div className="mb-2">
            <span className="text-xs font-mono text-cyan-500/60 tracking-[0.3em] uppercase">// network threat operations</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-white mb-4 leading-[0.9] tracking-tight">
            <GlitchText text="SEE EVERY" className="block" />
            <GlitchText text="THREAT." className="block text-cyan-400" />
          </h1>

          <p className="text-lg text-gray-400 mb-3 font-mono">
            <span className="text-pink-500">&gt;</span> before it sees you.
          </p>

          <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            AI-powered network monitoring that passively fingerprints every connection,
            profiles threat actors in real time, and maps every attack vector to MITRE ATT&CK —
            powered by NVIDIA Morpheus inference at the edge.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 justify-center mb-10">
            <Link
              href="/dashboard"
              className="group relative bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-8 py-3.5 rounded font-mono font-bold text-sm hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]"
            >
              <span className="relative z-10">[ ENTER DASHBOARD ]</span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
            </Link>
            <Link
              href="/login"
              className="border border-gray-700/50 text-gray-500 px-8 py-3.5 rounded font-mono text-sm hover:border-gray-600 hover:text-gray-300 transition-all duration-300"
            >
              [ AUTHENTICATE ]
            </Link>
          </div>

          {/* Tech badges - hacker style */}
          <div className="flex gap-3 justify-center flex-wrap mb-10">
            {[
              { label: 'MORPHEUS', color: 'text-green-400 border-green-500/20' },
              { label: 'TRITON', color: 'text-green-400 border-green-500/20' },
              { label: 'DFP', color: 'text-cyan-400 border-cyan-500/20' },
              { label: 'MITRE ATT&CK', color: 'text-red-400 border-red-500/20' },
              { label: 'STIX/TAXII', color: 'text-orange-400 border-orange-500/20' },
              { label: 'JA3', color: 'text-purple-400 border-purple-500/20' },
              { label: 'ZERO-TRUST', color: 'text-cyan-400 border-cyan-500/20' },
            ].map(tag => (
              <span key={tag.label} className={`text-xs font-mono px-3 py-1 rounded border bg-[#020204]/50 ${tag.color}`}>
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        {/* Terminal */}
        <TerminalTyper />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs font-mono text-gray-700">
            <span className="text-gray-600">BUILT BY</span>{' '}
            <span className="text-cyan-500/40">INTELLUSIA STUDIOS</span>{' '}
            <span className="text-gray-700">// VETERAN-LED // AI-POWERED</span>
          </p>
        </div>
      </div>

      {/* Corner decorations - Watch Dogs style */}
      <div className="absolute top-16 left-4 w-16 h-16 border-l border-t border-cyan-500/10" />
      <div className="absolute top-16 right-4 w-16 h-16 border-r border-t border-cyan-500/10" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-l border-b border-cyan-500/10" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-r border-b border-cyan-500/10" />

      {/* Floating hex decorations */}
      <div className="absolute top-1/4 left-8 text-cyan-500/5 font-mono text-xs hidden lg:block">
        {'0x4E 0x45 0x54\n0x57 0x4F 0x52\n0x4B 0x20 0x4F\n0x50 0x53 0x00'.split('\n').map((l, i) => <div key={i}>{l}</div>)}
      </div>
      <div className="absolute top-1/3 right-8 text-pink-500/5 font-mono text-xs hidden lg:block">
        {'01001110 01000101\n01010100 01010111\n01001111 01010010\n01001011 00100000'.split('\n').map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </main>
  )
}
