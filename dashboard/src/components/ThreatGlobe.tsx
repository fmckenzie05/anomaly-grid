'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Threat {
  lat: number
  lng: number
  label: string
  severity: string
  color: string
  category: string
  events: number
}

const HQ = { lat: 38.9, lng: -77.04 }

const THREATS: Threat[] = [
  { lat: 55.75, lng: 37.62, label: 'APT-SHADOW-7', severity: 'CRITICAL', color: '#ef4444', category: 'C2 Beacon', events: 234 },
  { lat: 31.23, lng: 121.47, label: 'SCAN-CLUSTER-44', severity: 'HIGH', color: '#f97316', category: 'Port Scan', events: 156 },
  { lat: 35.69, lng: 51.39, label: 'BF-GROUP-12', severity: 'HIGH', color: '#f97316', category: 'Brute Force', events: 89 },
  { lat: 39.03, lng: 125.75, label: 'RECON-NODE-9', severity: 'MEDIUM', color: '#eab308', category: 'DNS Tunnel', events: 32 },
  { lat: 21.03, lng: 105.85, label: 'VN-PROBE-3', severity: 'LOW', color: '#3b82f6', category: 'Fingerprint', events: 14 },
  { lat: -23.55, lng: -46.63, label: 'BR-SCAN-7', severity: 'MEDIUM', color: '#eab308', category: 'Recon', events: 28 },
  { lat: 51.51, lng: -0.13, label: 'UK-RELAY-3', severity: 'LOW', color: '#3b82f6', category: 'Proxy Hop', events: 8 },
  { lat: 1.35, lng: 103.82, label: 'SG-NODE-11', severity: 'HIGH', color: '#f97316', category: 'Exploit', events: 67 },
  { lat: 48.86, lng: 2.35, label: 'FR-BOT-22', severity: 'MEDIUM', color: '#eab308', category: 'Botnet', events: 41 },
  { lat: -33.87, lng: 151.21, label: 'AU-SCAN-5', severity: 'LOW', color: '#3b82f6', category: 'Recon', events: 11 },
]

// ─── 3D Globe View ───
function GlobeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [autoRotate, setAutoRotate] = useState(true)
  const rotationRef = useRef(0)
  const draggingRef = useRef(false)
  const lastMouseRef = useRef(0)
  const [hoveredThreat, setHoveredThreat] = useState<Threat | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const animRef = useRef<number>(0)

  const project = useCallback((lat: number, lng: number, cx: number, cy: number, r: number, rot: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + rot) * (Math.PI / 180)
    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi)
    const z = r * Math.sin(phi) * Math.sin(theta)
    return { x: cx + x, y: cy - y, z, visible: z < 0 }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2
    const R = Math.min(W, H) * 0.38

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)
      const rot = rotationRef.current

      // Globe
      const grad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R)
      grad.addColorStop(0, '#0a1628'); grad.addColorStop(0.7, '#050a14'); grad.addColorStop(1, '#020306')
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill()
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.strokeStyle = '#0ea5e920'; ctx.lineWidth = 2; ctx.stroke()

      // Atmosphere
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.15)
      atmo.addColorStop(0, '#0ea5e915'); atmo.addColorStop(1, '#0ea5e900')
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2); ctx.fillStyle = atmo; ctx.fill()

      // Grid
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        for (let lng = 0; lng <= 360; lng += 2) {
          const p = project(lat, lng, cx, cy, R, rot)
          if (p.visible) { if (lng === 0 || !project(lat, lng - 2, cx, cy, R, rot).visible) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y) }
        }
        ctx.strokeStyle = '#0a1c3a'; ctx.lineWidth = 0.5; ctx.stroke()
      }
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath()
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lat, lng, cx, cy, R, rot)
          if (p.visible) { if (lat === -90 || !project(lat - 2, lng, cx, cy, R, rot).visible) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y) }
        }
        ctx.strokeStyle = '#0a1c3a'; ctx.lineWidth = 0.5; ctx.stroke()
      }

      // HQ
      const hq = project(HQ.lat, HQ.lng, cx, cy, R, rot)
      if (hq.visible) {
        const pulse = (Date.now() % 2000) / 2000
        for (let i = 0; i < 3; i++) { const rp = ((pulse + i * 0.33) % 1) * 20; ctx.beginPath(); ctx.arc(hq.x, hq.y, rp, 0, Math.PI * 2); ctx.strokeStyle = `rgba(6,182,212,${0.4 - (rp / 20) * 0.4})`; ctx.lineWidth = 1; ctx.stroke() }
        ctx.beginPath(); ctx.arc(hq.x, hq.y, 5, 0, Math.PI * 2); ctx.fillStyle = '#06b6d4'; ctx.shadowColor = '#06b6d4'; ctx.shadowBlur = 15; ctx.fill(); ctx.shadowBlur = 0
        ctx.font = '9px Orbitron, monospace'; ctx.fillStyle = '#06b6d4'; ctx.fillText('HQ', hq.x + 8, hq.y + 3)
      }

      // Threats
      THREATS.forEach((t, i) => {
        const tp = project(t.lat, t.lng, cx, cy, R, rot)
        if (tp.visible || hq.visible) {
          const steps = 40; ctx.beginPath(); let started = false
          const dashOff = (Date.now() / (800 + i * 200)) % 1
          for (let s = 0; s <= steps; s++) {
            const f = s / steps, mLat = t.lat + (HQ.lat - t.lat) * f, mLng = t.lng + (HQ.lng - t.lng) * f
            const mp = project(mLat, mLng, cx, cy, R * (1 + Math.sin(f * Math.PI) * 0.15), rot)
            if (mp.visible) { if (Math.sin(((f + dashOff) % 1) * Math.PI * 20) > 0) { if (!started) { ctx.moveTo(mp.x, mp.y); started = true } else ctx.lineTo(mp.x, mp.y) } else started = false } else started = false
          }
          ctx.strokeStyle = t.color + '80'; ctx.lineWidth = 1.5; ctx.stroke()
        }
        if (tp.visible) {
          ctx.beginPath(); ctx.arc(tp.x, tp.y, 8, 0, Math.PI * 2); ctx.fillStyle = t.color + '15'; ctx.fill()
          ctx.beginPath(); ctx.arc(tp.x, tp.y, 3.5, 0, Math.PI * 2); ctx.fillStyle = t.color; ctx.shadowColor = t.color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0
          ctx.font = '8px Orbitron, monospace'; ctx.fillStyle = t.color + 'cc'; ctx.fillText(t.label, tp.x + 7, tp.y - 4)
          ctx.font = '7px monospace'; ctx.fillStyle = '#666'; ctx.fillText(t.category, tp.x + 7, tp.y + 5)
        }
      })

      if (autoRotate && !draggingRef.current) rotationRef.current += 0.15
      animRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [project, autoRotate])

  const handleMouseDown = (e: React.MouseEvent) => { draggingRef.current = true; lastMouseRef.current = e.clientX }
  const handleMouseUp = () => { draggingRef.current = false }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingRef.current) {
      const delta = e.clientX - lastMouseRef.current
      rotationRef.current -= delta * 0.3
      lastMouseRef.current = e.clientX
    }
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    setMousePos({ x: e.clientX, y: e.clientY })
    const cx = canvas.width / 2, cy = canvas.height / 2, R = Math.min(canvas.width, canvas.height) * 0.38
    let found: Threat | null = null
    for (const t of THREATS) { const tp = project(t.lat, t.lng, cx, cy, R, rotationRef.current); if (tp.visible && Math.hypot(tp.x - mx, tp.y - my) < 15) { found = t; break } }
    setHoveredThreat(found)
  }

  return (
    <div className="relative">
      <canvas ref={canvasRef} width={1200} height={600} className="w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={() => { draggingRef.current = false; setHoveredThreat(null) }} onMouseMove={handleMouseMove} />
      {/* Auto-rotate toggle */}
      <button onClick={() => setAutoRotate(!autoRotate)}
        className={`absolute bottom-12 right-6 text-[10px] font-mono px-3 py-1.5 rounded border transition-all ${autoRotate ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#0a0b10] border-[#141620] text-gray-500'}`}>
        {autoRotate ? '⏸ PAUSE' : '▶ ROTATE'}
      </button>
      {hoveredThreat && (
        <div className="fixed z-50 pointer-events-none" style={{ left: mousePos.x + 15, top: mousePos.y - 10 }}>
          <div className="bg-[#0a0b10] border rounded px-3 py-2 font-mono text-xs" style={{ borderColor: hoveredThreat.color + '40' }}>
            <div className="font-bold" style={{ color: hoveredThreat.color }}>{hoveredThreat.label}</div>
            <div className="text-gray-400">{hoveredThreat.category} • {hoveredThreat.severity} • {hoveredThreat.events} events</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Flat Map View (original) ───
function FlatMapView() {
  const mapW = 800, mapH = 400
  const toX = (lon: number) => ((lon + 180) / 360) * mapW
  const toY = (lat: number) => ((90 - lat) / 180) * mapH
  const targetX = toX(HQ.lng), targetY = toY(HQ.lat)

  return (
    <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full" style={{ background: '#020204' }}>
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * (mapH / 6)} x2={mapW} y2={i * (mapH / 6)} stroke="#060810" strokeWidth={0.5} />)}
      {Array.from({ length: 13 }, (_, i) => <line key={`v${i}`} x1={i * (mapW / 12)} y1={0} x2={i * (mapW / 12)} y2={mapH} stroke="#060810" strokeWidth={0.5} />)}
      <ellipse cx={180} cy={140} rx={90} ry={60} fill="none" stroke="#081430" strokeWidth={1} />
      <ellipse cx={220} cy={270} rx={50} ry={70} fill="none" stroke="#081430" strokeWidth={1} />
      <ellipse cx={420} cy={120} rx={50} ry={40} fill="none" stroke="#081430" strokeWidth={1} />
      <ellipse cx={430} cy={230} rx={50} ry={70} fill="none" stroke="#081430" strokeWidth={1} />
      <ellipse cx={580} cy={140} rx={110} ry={60} fill="none" stroke="#081430" strokeWidth={1} />
      <ellipse cx={660} cy={300} rx={40} ry={25} fill="none" stroke="#081430" strokeWidth={1} />
      <circle cx={targetX} cy={targetY} r={6} fill="#06b6d4" opacity={0.9}><animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx={targetX} cy={targetY} r={20} fill="none" stroke="#06b6d4" strokeWidth={0.5} opacity={0.2}><animate attributeName="r" values="12;24;12" dur="3s" repeatCount="indefinite" /></circle>
      <text x={targetX + 14} y={targetY + 4} fill="#06b6d4" fontSize={9} fontFamily="Orbitron, monospace" fontWeight="bold">PROTECTED</text>
      {THREATS.map((e, i) => {
        const sx = toX(e.lng), sy = toY(e.lat)
        return (
          <g key={i}>
            <line x1={sx} y1={sy} x2={targetX} y2={targetY} stroke={e.color} strokeWidth={1.5} opacity={0.3} strokeDasharray="4,4"><animate attributeName="strokeDashoffset" values="0;-8" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" /></line>
            <circle cx={sx} cy={sy} r={5} fill={e.color} opacity={0.9}><animate attributeName="r" values="3;6;3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" /></circle>
            <text x={sx + 9} y={sy - 5} fill={e.color} fontSize={7} fontFamily="Orbitron, monospace" opacity={0.9}>{e.label}</text>
            <text x={sx + 9} y={sy + 4} fill="#666" fontSize={6} fontFamily="monospace">{e.category}</text>
          </g>
        )
      })}
    </svg>
  )
}

// ─── Heatmap / Confusion Matrix ───
function ThreatMatrix() {
  const categories = ['C2', 'Scan', 'Brute Force', 'DNS Tunnel', 'Exploit', 'Recon', 'Phishing', 'Exfil']
  const severities = ['Critical', 'High', 'Medium', 'Low']

  // Simulated event counts per category x severity
  const matrix: number[][] = [
    [12, 8, 3, 1],   // C2
    [2, 45, 28, 15],  // Scan
    [5, 34, 12, 3],   // Brute Force
    [1, 3, 18, 8],    // DNS Tunnel
    [8, 12, 5, 2],    // Exploit
    [0, 5, 32, 44],   // Recon
    [3, 7, 14, 6],    // Phishing
    [4, 2, 1, 0],     // Exfil
  ]

  const maxVal = Math.max(...matrix.flat())

  const cellColor = (val: number, sevIdx: number) => {
    if (val === 0) return 'bg-[#050508]'
    const intensity = val / maxVal
    if (sevIdx === 0) return intensity > 0.5 ? 'bg-red-500/60' : intensity > 0.2 ? 'bg-red-500/30' : 'bg-red-500/10'
    if (sevIdx === 1) return intensity > 0.5 ? 'bg-orange-500/60' : intensity > 0.2 ? 'bg-orange-500/30' : 'bg-orange-500/10'
    if (sevIdx === 2) return intensity > 0.5 ? 'bg-yellow-500/50' : intensity > 0.2 ? 'bg-yellow-500/25' : 'bg-yellow-500/10'
    return intensity > 0.5 ? 'bg-blue-500/50' : intensity > 0.2 ? 'bg-blue-500/25' : 'bg-blue-500/10'
  }

  const rowTotal = (row: number[]) => row.reduce((a, b) => a + b, 0)
  const colTotal = (colIdx: number) => matrix.reduce((sum, row) => sum + row[colIdx], 0)

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-[10px] font-mono text-gray-600 pb-2 pr-4 w-28">CATEGORY</th>
              {severities.map(s => (
                <th key={s} className="text-center text-[10px] font-mono text-gray-500 pb-2 px-1">{s.toUpperCase()}</th>
              ))}
              <th className="text-center text-[10px] font-mono text-gray-600 pb-2 pl-3">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, ri) => (
              <tr key={cat}>
                <td className="text-[10px] font-mono text-gray-400 py-1 pr-4">{cat}</td>
                {matrix[ri].map((val, ci) => (
                  <td key={ci} className="p-0.5">
                    <div className={`${cellColor(val, ci)} rounded text-center py-2 px-2 text-[11px] font-mono transition-all hover:scale-110 hover:z-10 cursor-default ${val > 0 ? 'text-white' : 'text-gray-800'}`}>
                      {val}
                    </div>
                  </td>
                ))}
                <td className="text-center text-[11px] font-mono text-gray-300 pl-3 font-bold">{rowTotal(matrix[ri])}</td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="border-t border-[#141620]">
              <td className="text-[10px] font-mono text-gray-600 py-2 pr-4">TOTAL</td>
              {severities.map((_, ci) => (
                <td key={ci} className="text-center text-[11px] font-mono text-gray-300 py-2 font-bold">{colTotal(ci)}</td>
              ))}
              <td className="text-center text-[11px] font-mono text-cyan-400 pl-3 font-bold">{matrix.flat().reduce((a, b) => a + b, 0)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Category breakdown bars */}
      <div className="mt-6 space-y-2">
        {categories.map((cat, ri) => {
          const total = rowTotal(matrix[ri])
          const maxTotal = Math.max(...matrix.map(rowTotal))
          return (
            <div key={cat} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-gray-500 w-24 text-right">{cat}</span>
              <div className="flex-1 flex h-3 rounded-sm overflow-hidden bg-[#050508]">
                {matrix[ri].map((val, ci) => {
                  if (val === 0) return null
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500']
                  return <div key={ci} className={`${colors[ci]} transition-all`} style={{ width: `${(val / maxTotal) * 100}%` }} />
                })}
              </div>
              <span className="text-[10px] font-mono text-gray-400 w-8 text-right">{total}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component with Tabs ───
export default function ThreatGlobe() {
  const [view, setView] = useState<'globe' | 'flat' | 'matrix'>('globe')

  return (
    <div className="bg-[#020204] border border-[#141620] rounded-xl overflow-hidden">
      {/* Header with tabs */}
      <div className="px-6 py-3 flex items-center justify-between border-b border-[#141620]">
        <h2 className="text-xs font-bold text-gray-200 tracking-wider flex items-center gap-2">
          <span className="text-red-500 animate-pulse">◉</span> THREAT VISUALIZATION — LIVE
        </h2>
        <div className="flex items-center gap-1">
          {[
            { id: 'globe' as const, label: '🌐 GLOBE' },
            { id: 'flat' as const, label: '🗺️ FLAT MAP' },
            { id: 'matrix' as const, label: '📊 MATRIX' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`text-[10px] font-mono px-3 py-1.5 rounded transition-all ${
                view === tab.id ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Views */}
      {view === 'globe' && <GlobeView />}
      {view === 'flat' && <FlatMapView />}
      {view === 'matrix' && <ThreatMatrix />}

      {/* Bottom stats */}
      <div className="px-6 py-2.5 flex items-center justify-between border-t border-[#141620]">
        <div className="flex items-center gap-6 text-[10px] font-mono">
          <span className="text-gray-500">ORIGINS: <span className="text-white">{THREATS.length}</span></span>
          <span className="text-gray-500">EVENTS: <span className="text-red-400">{THREATS.reduce((s, t) => s + t.events, 0)}</span></span>
          <span className="text-gray-500">TARGET: <span className="text-cyan-400">DEFENDED</span></span>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> CRITICAL</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /> HIGH</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" /> MEDIUM</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> LOW</span>
        </div>
      </div>
    </div>
  )
}
