// Anomaly Grid — Threat Actor Profiles
// Route: /dashboard/actors

import Link from 'next/link'
import { Eye, Globe, Clock, AlertTriangle } from 'lucide-react'

const MOCK_ACTORS = [
  {
    id: '1',
    name: 'APT-SHADOW-7',
    confidence: 'confirmed',
    severity: 'critical',
    first_seen: '2026-03-28',
    last_seen: '2 min ago',
    event_count: 234,
    source_ips: ['185.220.101.34', '185.220.101.35', '185.220.101.42'],
    country: '🇷🇺 Russia',
    tactics: ['Reconnaissance', 'Initial Access', 'Command & Control'],
    techniques: ['T1595 - Active Scanning', 'T1190 - Exploit Public App', 'T1071 - Application Layer Protocol'],
    fingerprints: [
      { os: 'Linux 5.x', device: 'VPS', behavior: 'Tor exit node, rotating IPs, encrypted C2' }
    ],
  },
  {
    id: '2',
    name: 'SCAN-CLUSTER-44',
    confidence: 'high',
    severity: 'high',
    first_seen: '2026-04-01',
    last_seen: '18 min ago',
    event_count: 156,
    source_ips: ['45.155.205.233', '45.155.205.234'],
    country: '🇨🇳 China',
    tactics: ['Reconnaissance', 'Discovery'],
    techniques: ['T1046 - Network Service Discovery', 'T1018 - Remote System Discovery'],
    fingerprints: [
      { os: 'Unknown', device: 'Scanner', behavior: 'Masscan-style port sweep, 10k ports/sec' }
    ],
  },
  {
    id: '3',
    name: 'BF-GROUP-12',
    confidence: 'high',
    severity: 'high',
    first_seen: '2026-04-05',
    last_seen: '45 min ago',
    event_count: 89,
    source_ips: ['193.42.33.14', '193.42.33.15', '193.42.33.16', '193.42.33.17'],
    country: '🇮🇷 Iran',
    tactics: ['Initial Access', 'Credential Access'],
    techniques: ['T1110 - Brute Force', 'T1078 - Valid Accounts'],
    fingerprints: [
      { os: 'Windows 10', device: 'Botnet node', behavior: 'RDP brute force, credential stuffing' }
    ],
  },
]

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

const CONFIDENCE_COLORS: Record<string, string> = {
  confirmed: 'text-green-400',
  high: 'text-blue-400',
  medium: 'text-yellow-400',
  low: 'text-gray-400',
}

export default function ActorsPage() {
  return (
    <div className="min-h-screen bg-[#030305] px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-xs text-gray-500 hover:text-gray-300">← Dashboard</Link>
          <h1 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Threat Actor Profiles
          </h1>
        </div>
        <span className="text-xs text-gray-600">{MOCK_ACTORS.length} actors tracked</span>
      </div>

      <div className="space-y-4">
        {MOCK_ACTORS.map(actor => (
          <div key={actor.id} className="bg-[#0a0b10] border border-[#141620] rounded-xl p-6 hover:border-gray-700 transition">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-mono font-bold text-white">{actor.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded border ${SEVERITY_COLORS[actor.severity]}`}>
                    {actor.severity}
                  </span>
                  <span className={`text-xs ${CONFIDENCE_COLORS[actor.confidence]}`}>
                    ● {actor.confidence} confidence
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {actor.country}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> First seen: {actor.first_seen}</span>
                  <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {actor.event_count} events</span>
                  <span>Last seen: {actor.last_seen}</span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Source IPs */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2">Source IPs</h3>
                <div className="space-y-1">
                  {actor.source_ips.map(ip => (
                    <div key={ip} className="text-xs font-mono text-gray-300 bg-[#0f1118] px-2 py-1 rounded">
                      {ip}
                    </div>
                  ))}
                </div>
              </div>

              {/* MITRE Mapping */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2">MITRE ATT&CK</h3>
                <div className="space-y-1">
                  {actor.techniques.map(t => (
                    <div key={t} className="text-xs text-gray-400 bg-[#0f1118] px-2 py-1 rounded">
                      {t}
                    </div>
                  ))}
                </div>
              </div>

              {/* Fingerprint */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-2">Device Fingerprint</h3>
                {actor.fingerprints.map((fp, i) => (
                  <div key={i} className="bg-[#0f1118] rounded p-2 space-y-1">
                    <div className="text-xs text-gray-300">OS: <span className="text-white">{fp.os}</span></div>
                    <div className="text-xs text-gray-300">Type: <span className="text-white">{fp.device}</span></div>
                    <div className="text-xs text-gray-400">{fp.behavior}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
