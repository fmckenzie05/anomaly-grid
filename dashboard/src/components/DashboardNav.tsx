'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Database, Search, Skull, Crosshair } from 'lucide-react'

export default function DashboardNav() {
  return (
    <nav className="border-b border-[#141620] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg overflow-hidden relative">
          <Image src="/logo.png" alt="Anomaly Grid" fill className="object-cover" />
        </div>
        <span className="font-bold text-white">Anomaly Grid</span>
        <span className="text-xs text-gray-600 ml-2">/ Threat Operations Center</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/dashboard/intel" className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1 transition">
          <Database className="w-3 h-3" /> Intel
        </Link>
        <Link href="/dashboard/stig-scanner" className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition">
          <Search className="w-3 h-3" /> STIG Scanner
        </Link>
        <Link href="/dashboard/actors" className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition">
          <Skull className="w-3 h-3" /> Actors
        </Link>
        <Link href="/mission-control" className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition">
          <Crosshair className="w-3 h-3" /> Mission Control
        </Link>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">LIVE</span>
        </div>
      </div>
    </nav>
  )
}
