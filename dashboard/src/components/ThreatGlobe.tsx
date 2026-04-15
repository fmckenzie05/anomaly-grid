'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Threat {
  lat: number
  lng: number
  label: string
  severity: string
  color: string
  category: string
}

const HQ = { lat: 38.9, lng: -77.04 }

const THREATS: Threat[] = [
  { lat: 55.75, lng: 37.62, label: 'APT-SHADOW-7', severity: 'CRITICAL', color: '#ef4444', category: 'C2 Beacon' },
  { lat: 31.23, lng: 121.47, label: 'SCAN-CLUSTER-44', severity: 'HIGH', color: '#f97316', category: 'Port Scan' },
  { lat: 35.69, lng: 51.39, label: 'BF-GROUP-12', severity: 'HIGH', color: '#f97316', category: 'Brute Force' },
  { lat: 39.03, lng: 125.75, label: 'RECON-NODE-9', severity: 'MEDIUM', color: '#eab308', category: 'DNS Tunnel' },
  { lat: 21.03, lng: 105.85, label: 'VN-PROBE-3', severity: 'LOW', color: '#3b82f6', category: 'Fingerprint' },
  { lat: -23.55, lng: -46.63, label: 'BR-SCAN-7', severity: 'MEDIUM', color: '#eab308', category: 'Recon' },
  { lat: 51.51, lng: -0.13, label: 'UK-RELAY-3', severity: 'LOW', color: '#3b82f6', category: 'Proxy Hop' },
  { lat: 1.35, lng: 103.82, label: 'SG-NODE-11', severity: 'HIGH', color: '#f97316', category: 'Exploit' },
  { lat: 48.86, lng: 2.35, label: 'FR-BOT-22', severity: 'MEDIUM', color: '#eab308', category: 'Botnet' },
  { lat: -33.87, lng: 151.21, label: 'AU-SCAN-5', severity: 'LOW', color: '#3b82f6', category: 'Recon' },
]

export default function ThreatGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [hoveredThreat, setHoveredThreat] = useState<Threat | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const animRef = useRef<number>(0)

  // Orthographic projection for a sphere
  const project = useCallback((lat: number, lng: number, cx: number, cy: number, r: number, rot: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + rot) * (Math.PI / 180)
    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi)
    const z = r * Math.sin(phi) * Math.sin(theta)
    // Only show if facing us (z > 0 means back of globe)
    const visible = z < 0
    return { x: cx + x, y: cy - y, z, visible }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2
    const R = Math.min(W, H) * 0.38

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, W, H)

      // Globe body
      const grad = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R)
      grad.addColorStop(0, '#0a1628')
      grad.addColorStop(0.7, '#050a14')
      grad.addColorStop(1, '#020306')
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Globe border glow
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.strokeStyle = '#0ea5e920'
      ctx.lineWidth = 2
      ctx.stroke()

      // Atmosphere
      const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.95, cx, cy, R * 1.15)
      atmoGrad.addColorStop(0, '#0ea5e915')
      atmoGrad.addColorStop(1, '#0ea5e900')
      ctx.beginPath()
      ctx.arc(cx, cy, R * 1.15, 0, Math.PI * 2)
      ctx.fillStyle = atmoGrad
      ctx.fill()

      // Grid lines (latitude)
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath()
        for (let lng = 0; lng <= 360; lng += 2) {
          const p = project(lat, lng, cx, cy, R, rotation)
          if (p.visible) {
            if (lng === 0 || !project(lat, lng - 2, cx, cy, R, rotation).visible) {
              ctx.moveTo(p.x, p.y)
            } else {
              ctx.lineTo(p.x, p.y)
            }
          }
        }
        ctx.strokeStyle = '#0a1c3a'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Grid lines (longitude)
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath()
        for (let lat = -90; lat <= 90; lat += 2) {
          const p = project(lat, lng, cx, cy, R, rotation)
          if (p.visible) {
            if (lat === -90 || !project(lat - 2, lng, cx, cy, R, rotation).visible) {
              ctx.moveTo(p.x, p.y)
            } else {
              ctx.lineTo(p.x, p.y)
            }
          }
        }
        ctx.strokeStyle = '#0a1c3a'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // HQ point with rings
      const hq = project(HQ.lat, HQ.lng, cx, cy, R, rotation)
      if (hq.visible) {
        // Pulsing rings
        const pulse = (Date.now() % 2000) / 2000
        for (let i = 0; i < 3; i++) {
          const rp = ((pulse + i * 0.33) % 1) * 20
          ctx.beginPath()
          ctx.arc(hq.x, hq.y, rp, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(6,182,212,${0.4 - (rp / 20) * 0.4})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
        // Center dot
        ctx.beginPath()
        ctx.arc(hq.x, hq.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#06b6d4'
        ctx.shadowColor = '#06b6d4'
        ctx.shadowBlur = 15
        ctx.fill()
        ctx.shadowBlur = 0
        // Label
        ctx.font = '9px Orbitron, monospace'
        ctx.fillStyle = '#06b6d4'
        ctx.fillText('HQ', hq.x + 8, hq.y + 3)
      }

      // Threat arcs and points
      THREATS.forEach((t, i) => {
        const tp = project(t.lat, t.lng, cx, cy, R, rotation)
        if (!tp.visible && !hq.visible) return

        // Arc (curved line from threat to HQ)
        if (tp.visible || hq.visible) {
          const steps = 40
          const dashOffset = (Date.now() / (800 + i * 200)) % 1
          ctx.beginPath()
          let started = false
          for (let s = 0; s <= steps; s++) {
            const frac = s / steps
            const midLat = t.lat + (HQ.lat - t.lat) * frac
            const midLng = t.lng + (HQ.lng - t.lng) * frac
            // Add altitude curve
            const alt = 1 + Math.sin(frac * Math.PI) * 0.15
            const mp = project(midLat, midLng, cx, cy, R * alt, rotation)
            if (mp.visible) {
              // Dashed effect
              const dashPos = (frac + dashOffset) % 1
              if (Math.sin(dashPos * Math.PI * 20) > 0) {
                if (!started) { ctx.moveTo(mp.x, mp.y); started = true }
                else ctx.lineTo(mp.x, mp.y)
              } else {
                started = false
              }
            } else {
              started = false
            }
          }
          ctx.strokeStyle = t.color + '80'
          ctx.lineWidth = 1.5
          ctx.stroke()
        }

        // Threat point
        if (tp.visible) {
          // Glow
          ctx.beginPath()
          ctx.arc(tp.x, tp.y, 8, 0, Math.PI * 2)
          ctx.fillStyle = t.color + '15'
          ctx.fill()
          // Dot
          ctx.beginPath()
          ctx.arc(tp.x, tp.y, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = t.color
          ctx.shadowColor = t.color
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
          // Label
          ctx.font = '8px Orbitron, monospace'
          ctx.fillStyle = t.color + 'cc'
          ctx.fillText(t.label, tp.x + 7, tp.y - 4)
          ctx.font = '7px monospace'
          ctx.fillStyle = '#666'
          ctx.fillText(t.category, tp.x + 7, tp.y + 5)
        }
      })

      setRotation(r => r + 0.15)
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [project, rotation])

  // Mouse hover detection
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
    const my = (e.clientY - rect.top) * (canvas.height / rect.height)
    setMousePos({ x: e.clientX, y: e.clientY })

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const R = Math.min(canvas.width, canvas.height) * 0.38

    let found: Threat | null = null
    for (const t of THREATS) {
      const tp = project(t.lat, t.lng, cx, cy, R, rotation)
      if (tp.visible && Math.hypot(tp.x - mx, tp.y - my) < 15) {
        found = t
        break
      }
    }
    setHoveredThreat(found)
  }, [project, rotation])

  return (
    <div className="relative bg-[#020204] border border-[#141620] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-[#020204] via-[#020204]/80 to-transparent">
        <h2 className="text-xs font-bold text-gray-200 tracking-wider flex items-center gap-2">
          <span className="text-red-500 animate-pulse">◉</span> GLOBAL THREAT MAP — LIVE
        </h2>
        <div className="flex items-center gap-4 text-[10px] font-mono">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" /> CRITICAL</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" /> HIGH</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" /> MEDIUM</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" /> LOW</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" /> DEFENDED</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={600}
        className="w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredThreat(null)}
      />

      {/* Hover tooltip */}
      {hoveredThreat && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: mousePos.x + 15, top: mousePos.y - 10 }}
        >
          <div className="bg-[#0a0b10] border rounded px-3 py-2 font-mono text-xs" style={{ borderColor: hoveredThreat.color + '40' }}>
            <div className="font-bold" style={{ color: hoveredThreat.color }}>{hoveredThreat.label}</div>
            <div className="text-gray-400">{hoveredThreat.category} • {hoveredThreat.severity}</div>
          </div>
        </div>
      )}

      {/* Bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 py-3 flex items-center justify-between bg-gradient-to-t from-[#020204] via-[#020204]/80 to-transparent">
        <div className="flex items-center gap-6 text-[10px] font-mono">
          <span className="text-gray-500">ORIGINS: <span className="text-white">{THREATS.length}</span></span>
          <span className="text-gray-500">ACTIVE VECTORS: <span className="text-red-400">{THREATS.length}</span></span>
          <span className="text-gray-500">TARGET: <span className="text-cyan-400">DEFENDED</span></span>
        </div>
        <span className="text-[10px] font-mono text-gray-700">auto-rotating • hover for details</span>
      </div>
    </div>
  )
}
