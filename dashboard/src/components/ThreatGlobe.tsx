'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false })

interface ThreatArc {
  startLat: number
  startLng: number
  endLat: number
  endLng: number
  color: string
  label: string
  severity: string
}

interface ThreatPoint {
  lat: number
  lng: number
  size: number
  color: string
  label: string
}

const HQ = { lat: 38.9, lng: -77.04 } // Washington DC area

const THREATS: { lat: number; lng: number; label: string; severity: string; color: string }[] = [
  { lat: 55.75, lng: 37.62, label: 'APT-SHADOW-7', severity: 'critical', color: '#ef4444' },
  { lat: 31.23, lng: 121.47, label: 'SCAN-CLUSTER-44', severity: 'high', color: '#f97316' },
  { lat: 35.69, lng: 51.39, label: 'BF-GROUP-12', severity: 'high', color: '#f97316' },
  { lat: 39.03, lng: 125.75, label: 'RECON-NODE-9', severity: 'medium', color: '#eab308' },
  { lat: 21.03, lng: 105.85, label: 'VN-PROBE', severity: 'low', color: '#3b82f6' },
  { lat: -23.55, lng: -46.63, label: 'BR-SCAN-7', severity: 'medium', color: '#eab308' },
  { lat: 51.51, lng: -0.13, label: 'UK-RELAY-3', severity: 'low', color: '#3b82f6' },
  { lat: 1.35, lng: 103.82, label: 'SG-NODE-11', severity: 'high', color: '#f97316' },
]

export default function ThreatGlobe() {
  const globeRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  const arcsData: ThreatArc[] = THREATS.map(t => ({
    startLat: t.lat,
    startLng: t.lng,
    endLat: HQ.lat,
    endLng: HQ.lng,
    color: t.color,
    label: t.label,
    severity: t.severity,
  }))

  const pointsData: ThreatPoint[] = [
    // HQ point
    { lat: HQ.lat, lng: HQ.lng, size: 0.8, color: '#06b6d4', label: 'HQ — PROTECTED' },
    // Threat origins
    ...THREATS.map(t => ({
      lat: t.lat,
      lng: t.lng,
      size: t.severity === 'critical' ? 0.6 : t.severity === 'high' ? 0.4 : 0.3,
      color: t.color,
      label: t.label,
    })),
  ]

  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('globe-container')
      if (container) {
        setDimensions({ width: container.clientWidth, height: 500 })
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate
      globeRef.current.controls().autoRotate = true
      globeRef.current.controls().autoRotateSpeed = 0.5
      // Start view looking at US
      globeRef.current.pointOfView({ lat: 30, lng: -40, altitude: 2.2 }, 1000)
    }
  }, [])

  return (
    <div id="globe-container" className="relative bg-[#020204] border border-[#141620] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4 flex items-center justify-between bg-gradient-to-b from-[#020204] to-transparent">
        <h2 className="text-xs font-bold text-gray-200 tracking-wider flex items-center gap-2">
          <span className="text-red-500">◉</span> GLOBAL THREAT MAP — LIVE
        </h2>
        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Critical</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" /> Protected</span>
        </div>
      </div>

      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(2,2,4,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        atmosphereColor="#0ea5e9"
        atmosphereAltitude={0.15}
        // Arcs (attack lines)
        arcsData={arcsData}
        arcColor={(d: any) => d.color}
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={2000}
        arcStroke={0.5}
        arcAltitudeAutoScale={0.4}
        arcLabel={(d: any) => `<div style="font-family:monospace;font-size:11px;color:${d.color};background:#0a0b10;padding:4px 8px;border:1px solid ${d.color}40;border-radius:4px;"><b>${d.label}</b><br/><span style="color:#888">${d.severity.toUpperCase()}</span></div>`}
        // Points
        pointsData={pointsData}
        pointColor={(d: any) => d.color}
        pointAltitude={0.01}
        pointRadius={(d: any) => d.size}
        pointLabel={(d: any) => `<span style="font-family:monospace;font-size:11px;color:${d.color}">${d.label}</span>`}
        // Rings at HQ
        ringsData={[{ lat: HQ.lat, lng: HQ.lng }]}
        ringColor={() => '#06b6d4'}
        ringMaxRadius={3}
        ringPropagationSpeed={2}
        ringRepeatPeriod={1200}
      />

      {/* Bottom stats bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 py-3 flex items-center justify-between bg-gradient-to-t from-[#020204] to-transparent">
        <div className="flex items-center gap-6 text-xs font-mono">
          <span className="text-gray-500">ORIGINS: <span className="text-white">{THREATS.length}</span></span>
          <span className="text-gray-500">ACTIVE ARCS: <span className="text-red-400">{THREATS.length}</span></span>
          <span className="text-gray-500">TARGET: <span className="text-cyan-400">DEFENDED</span></span>
        </div>
        <span className="text-xs font-mono text-gray-600">drag to rotate • scroll to zoom</span>
      </div>
    </div>
  )
}
