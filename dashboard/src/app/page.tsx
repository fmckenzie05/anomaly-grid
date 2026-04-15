'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Matrix Rain Effect ───
function MatrixRain() {
  const glyphSets = [
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'abcdefghijklmnopqrstuvwxyz',
    '0123456789',
    'アイウエオカキクケコサシスセソタチツテトナニヌネノマミムメモラリルレロワヲン',
    'あいうえおかきくけこさしすせそたちつてとなにぬねのまみむめもやゆよらりるれろわをん',
    'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
    'αβγδεζηθικλμνξοπρστυφχψω',
    'אבגדהוזחטיכלמנסעפצקרשת',
    'ابتثجحخدذرزسشصضطظعغفقكلمنهوي',
    '가나다라마바사아자차카타파하',
    'अआइईउऊऋएऐओऔकखगघचछजझटठडढतथदधनपफबभमयरलवशषसह',
    'กขคงจฉชซญดตถทธนบปผพฟภมยรลวศษสห',
    '!@#$%^&*()_+-=[]{}<>?/|~:;.,█▓▒░◢◣◤◥◉◎◌◍◈',
  ]

  const streams = Array.from({ length: 52 }, (_, i) => {
    const glyphPool = glyphSets[i % glyphSets.length]
    const rows = 34 + (i % 10)
    const text = Array.from({ length: rows }, (_, row) => {
      const char = glyphPool[Math.floor(Math.random() * glyphPool.length)]
      const bright = row === 0 || (row % 9 === 0 && Math.random() > 0.55)
      return bright ? `█${char}` : char
    }).join('\n')

    return {
      left: `${i * 1.95}%`,
      duration: `${4 + (i % 8) * 0.8 + Math.random() * 2.5}s`,
      delay: `${Math.random() * 6}s`,
      fontSize: `${10 + (i % 4)}px`,
      text,
      color: i % 7 === 0 ? 'text-cyan-300/70' : i % 5 === 0 ? 'text-emerald-300/65' : 'text-green-400/70',
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.07] pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent" />
      {streams.map((stream, i) => (
        <div
          key={i}
          className={`absolute font-mono leading-none select-none whitespace-pre ${stream.color}`}
          style={{
            left: stream.left,
            fontSize: stream.fontSize,
            animation: `matrix-fall ${stream.duration} linear infinite`,
            animationDelay: stream.delay,
            textShadow: '0 0 8px rgba(34,197,94,0.18), 0 0 16px rgba(34,197,94,0.08)',
          }}
        >
          {stream.text}
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

function DemoShots() {
  const shots = [
    {
      title: 'THREAT OPERATIONS',
      subtitle: 'Live globe, flat map, and confusion matrix views',
      href: '/dashboard',
      image: '/dashboard-preview.svg',
      accent: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    },
    {
      title: 'THREAT INTEL CENTER',
      subtitle: 'MITRE ATT&CK, CVE, CWE, CAPEC, IOC feed correlation',
      href: '/dashboard/intel',
      image: '/intel-preview.svg',
      accent: 'from-orange-500/20 via-orange-500/5 to-transparent',
    },
    {
      title: 'STIG SCANNER',
      subtitle: 'Compliance checks, control gaps, and vuln context',
      href: '/dashboard/stig-scanner',
      image: '/stig-preview.svg',
      accent: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    },
    {
      title: 'MISSION CONTROL',
      subtitle: 'Tenant oversight, platform health, and usage visibility',
      href: '/mission-control',
      image: '/mission-control-preview.svg',
      accent: 'from-pink-500/20 via-pink-500/5 to-transparent',
    },
  ]

  return (
    <section className="w-full max-w-7xl mt-16 px-4">
      <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
        <div>
          <p className="text-[11px] font-mono tracking-[0.3em] uppercase text-cyan-500/60 mb-2">// live product surfaces</p>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">More shots from inside the platform</h2>
        </div>
        <p className="text-sm text-gray-600 max-w-xl">A few more demo surfaces so the homepage feels more like a real product showcase, not just a hero screen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shots.map((shot) => (
          <Link
            key={shot.title}
            href={shot.href}
            className="group relative overflow-hidden rounded-2xl border border-[#141620] bg-[#05070c]/80 backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${shot.accent} opacity-60 group-hover:opacity-90 transition-opacity`} />
            <div className="relative aspect-[16/10] border-b border-[#141620] overflow-hidden">
              <Image src={shot.image} alt={shot.title} fill className="object-cover object-center opacity-90 group-hover:scale-[1.02] transition-transform duration-500" />
            </div>
            <div className="relative p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-sm font-mono font-bold tracking-[0.18em] text-white">{shot.title}</h3>
                <span className="text-cyan-400 text-xs font-mono">OPEN ↗</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{shot.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
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

        <DemoShots />

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
