'use client'

import { useState, useEffect } from 'react'
import { Shield, Activity, AlertTriangle, Radio, Eye, Wifi, X, ExternalLink, MapPin, Search, Crosshair, Fingerprint, Zap, Target, Lock, Skull } from 'lucide-react'
import Link from 'next/link'

// ─── CVE Ticker (stock tape style) ───
function CVETicker() {
  const cves = [
    { id: 'CVE-2024-3400', score: 10.0, vendor: 'Palo Alto', desc: 'PAN-OS Command Injection', trend: 'up' },
    { id: 'CVE-2024-6387', score: 8.1, vendor: 'OpenSSH', desc: 'regreSSHion RCE', trend: 'up' },
    { id: 'CVE-2024-3094', score: 10.0, vendor: 'XZ Utils', desc: 'Supply Chain Backdoor', trend: 'down' },
    { id: 'CVE-2023-48795', score: 5.9, vendor: 'SSH', desc: 'Terrapin Prefix Truncation', trend: 'flat' },
    { id: 'CVE-2024-21887', score: 9.1, vendor: 'Ivanti', desc: 'Connect Secure RCE', trend: 'up' },
    { id: 'CVE-2023-46805', score: 8.2, vendor: 'Ivanti', desc: 'Auth Bypass', trend: 'up' },
    { id: 'CVE-2024-1709', score: 10.0, vendor: 'ConnectWise', desc: 'ScreenConnect Auth Bypass', trend: 'down' },
    { id: 'CVE-2023-4966', score: 9.4, vendor: 'Citrix', desc: 'Citrix Bleed', trend: 'down' },
    { id: 'CVE-2024-27198', score: 9.8, vendor: 'JetBrains', desc: 'TeamCity Auth Bypass', trend: 'up' },
    { id: 'CVE-2023-22515', score: 10.0, vendor: 'Atlassian', desc: 'Confluence Priv Escalation', trend: 'flat' },
    { id: 'CVE-2024-20353', score: 8.6, vendor: 'Cisco', desc: 'ASA WebVPN DoS', trend: 'up' },
    { id: 'CVE-2023-20198', score: 10.0, vendor: 'Cisco', desc: 'IOS XE Web UI RCE', trend: 'down' },
    { id: 'CVE-2024-4577', score: 9.8, vendor: 'PHP', desc: 'CGI Argument Injection', trend: 'up' },
    { id: 'CVE-2019-0708', score: 9.8, vendor: 'Microsoft', desc: 'BlueKeep RDP RCE', trend: 'flat' },
    { id: 'CVE-2020-0796', score: 10.0, vendor: 'Microsoft', desc: 'SMBGhost RCE', trend: 'flat' },
    { id: 'CVE-2024-23897', score: 9.8, vendor: 'Jenkins', desc: 'Arbitrary File Read', trend: 'up' },
  ]

  const trendIcon = (t: string) => t === 'up' ? '🔺' : t === 'down' ? '🔻' : '▬'
  const trendColor = (t: string) => t === 'up' ? 'text-red-400' : t === 'down' ? 'text-green-400' : 'text-gray-500'
  const scoreColor = (s: number) => s >= 9.0 ? 'text-red-400' : s >= 7.0 ? 'text-orange-400' : s >= 4.0 ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="bg-black/80 border-y border-gray-800 overflow-hidden mb-6">
      <div className="flex items-center">
        <div className="bg-red-600 px-3 py-1.5 text-xs font-bold text-white shrink-0 z-10">CVE FEED</div>
        <div className="overflow-hidden flex-1">
          <div className="flex gap-8 animate-ticker whitespace-nowrap py-1.5">
            {[...cves, ...cves].map((cve, i) => (
              <a
                key={`${cve.id}-${i}`}
                href={`https://nvd.nist.gov/vuln/detail/${cve.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:opacity-80 transition shrink-0"
              >
                <span className="text-xs font-mono font-bold text-white">{cve.id}</span>
                <span className={`text-xs font-bold ${scoreColor(cve.score)}`}>{cve.score.toFixed(1)}</span>
                <span className={`text-xs ${trendColor(cve.trend)}`}>{trendIcon(cve.trend)}</span>
                <span className="text-xs text-gray-600">{cve.vendor}</span>
                <span className="text-xs text-gray-500">{cve.desc}</span>
                <span className="text-gray-800">│</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Threat Level System (gamified but real) ───
function ThreatLevelGauge({ score }: { score: number }) {
  const level = score >= 90 ? 'DEFCON 1' : score >= 70 ? 'DEFCON 2' : score >= 50 ? 'DEFCON 3' : score >= 30 ? 'DEFCON 4' : 'DEFCON 5'
  const color = score >= 90 ? 'text-red-500' : score >= 70 ? 'text-orange-500' : score >= 50 ? 'text-yellow-500' : score >= 30 ? 'text-blue-400' : 'text-green-400'
  const bgColor = score >= 90 ? 'from-red-500/20' : score >= 70 ? 'from-orange-500/20' : score >= 50 ? 'from-yellow-500/20' : 'from-blue-500/20'
  const desc = score >= 90 ? 'ACTIVE BREACH — Immediate response required' : score >= 70 ? 'HIGH ALERT — Multiple threat actors active' : score >= 50 ? 'ELEVATED — Anomalous activity detected' : score >= 30 ? 'GUARDED — Normal with minor concerns' : 'NOMINAL — All systems clear'

  return (
    <div className={`bg-gradient-to-r ${bgColor} to-transparent border border-gray-800 rounded-xl p-5 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`text-3xl font-black font-mono ${color} tracking-wider`}>{level}</div>
          <div>
            <div className="text-sm text-gray-300 font-semibold">Network Threat Level</div>
            <div className="text-xs text-gray-500">{desc}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black font-mono ${color}`}>{score}</div>
          <div className="text-xs text-gray-600">/ 100</div>
        </div>
      </div>
      {/* Animated bar */}
      <div className="mt-3 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full transition-all duration-1000 ${score >= 70 ? 'bg-red-500 animate-pulse' : score >= 50 ? 'bg-yellow-500' : 'bg-blue-500'}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

// ─── Fingerprint Confidence Badge ───
function FingerprintBadge({ confidence, fp_method }: { confidence: number; fp_method: string }) {
  const color = confidence >= 95 ? 'text-green-400 bg-green-500/10 border-green-500/20'
    : confidence >= 80 ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    : confidence >= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-red-400 bg-red-500/10 border-red-500/20'
  const label = confidence >= 95 ? 'VERIFIED' : confidence >= 80 ? 'HIGH' : confidence >= 60 ? 'MODERATE' : 'LOW'

  return (
    <div className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded border ${color}`}>
      <Fingerprint className="w-3 h-3" />
      <span>{label} ({confidence}%)</span>
      <span className="text-gray-600">• {fp_method}</span>
    </div>
  )
}

// ─── Live Event Counter (ticking) ───
function LiveCounter({ label, base }: { label: string; base: number }) {
  const [count, setCount] = useState(base)
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3))
    }, 2000 + Math.random() * 3000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="text-center">
      <div className="text-lg font-mono font-bold text-white tabular-nums">{count.toLocaleString()}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}

// ─── Mock Data ───
const MOCK_EVENTS = [
  {
    id: '1', time: '2 min ago', src: '185.220.101.34', dst: '10.0.1.50', severity: 'critical',
    category: 'C2 Beacon', dst_port: 443, src_port: 49221, protocol: 'TCP', os: 'Linux 5.x',
    actor: 'APT-SHADOW-7', country: '🇷🇺 Russia', city: 'Moscow', lat: 55.75, lon: 37.62,
    fp_confidence: 97, fp_method: 'TLS+TCP+Behavioral',
    description: 'Encrypted callback to known Tor exit node. Beacon interval: 30s ±2s jitter. TLS 1.3 with self-signed cert (SHA256: 4a:f2:...). JA3 hash matches known Cobalt Strike profile.',
    why_dangerous: 'This is a Command & Control channel. The attacker already has a foothold inside your network and is receiving instructions. The 30s beacon interval with jitter is designed to evade detection by blending into normal HTTPS traffic.',
    how_we_caught_it: 'Morpheus DFP flagged this connection as anomalous — the baseline for this subnet shows zero outbound connections to Tor exit nodes. JA3 fingerprint matched our threat intel database for Cobalt Strike 4.9.',
    false_positive_risk: 'LOW — JA3 hash match + Tor exit node + behavioral anomaly. Triple correlation.',
    mitre: [
      { id: 'T1071.001', name: 'Application Layer Protocol: Web', tactic: 'Command and Control', description: 'Adversary uses HTTPS to communicate with C2 server, blending with legitimate web traffic.' },
      { id: 'T1573.002', name: 'Encrypted Channel: Asymmetric Crypto', tactic: 'Command and Control', description: 'TLS 1.3 encryption prevents payload inspection. Self-signed cert is the giveaway.' },
      { id: 'T1095', name: 'Non-Application Layer Protocol', tactic: 'Command and Control', description: 'Periodic beaconing pattern distinguishes this from human browsing behavior.' },
    ],
    kill_chain_phase: 'PHASE 6: Command & Control',
    countermeasure: 'Block Tor exit nodes at firewall. Deploy JA3 hash blocklist. Isolate affected host immediately. Run memory forensics to identify implant.',
    cves: ['CVE-2024-3400 - PAN-OS Command Injection (initial access vector)'],
    raw_log: '{"ts":"2026-04-15T04:18:00Z","uid":"CTo78A36gh","proto":"tcp","service":"ssl","duration":29.8,"ja3":"72a589da586844d7f0818ce684948eea","ja3s":"f4febc55ea12b31ae17cfb7e614afda8","server_name":"update-service.cloud","cert_sha256":"4af2e8b1c9d3..."}',
  },
  {
    id: '2', time: '5 min ago', src: '45.155.205.233', dst: '10.0.1.1', severity: 'high',
    category: 'Port Scan', dst_port: 22, src_port: 0, protocol: 'TCP', os: 'Unknown',
    actor: 'SCAN-CLUSTER-44', country: '🇨🇳 China', city: 'Shanghai', lat: 31.23, lon: 121.47,
    fp_confidence: 72, fp_method: 'TCP Stack+Rate',
    description: 'Masscan-style SYN sweep. 10,400 ports scanned in 58 seconds targeting SSH, RDP, SMB, and HTTP services.',
    why_dangerous: 'This is the reconnaissance phase. The attacker is mapping your attack surface — finding open doors before kicking them in. Masscan can scan the entire internet in 6 minutes.',
    how_we_caught_it: 'Rate anomaly detection: 179 SYN packets/second from a single source to sequential ports. Normal traffic: 2-5 connections/second. This is 35x the baseline.',
    false_positive_risk: 'LOW — Rate + sequential port pattern + known scanner IP.',
    mitre: [
      { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery', description: 'Scanning ports to identify running services (SSH:22, RDP:3389, SMB:445, HTTP:80,8080).' },
      { id: 'T1595.001', name: 'Active Scanning: Scanning IP Blocks', tactic: 'Reconnaissance', description: 'Systematic enumeration of your IP range from external infrastructure.' },
    ],
    kill_chain_phase: 'PHASE 1: Reconnaissance',
    countermeasure: 'Rate-limit inbound SYN packets. Enable SYN cookies. Add source IP to blocklist. Review exposed services — close unnecessary ports.',
    cves: [],
    raw_log: '{"ts":"2026-04-15T04:15:00Z","scan_rate":"10400/58s","top_ports":[22,3389,445,80,8080,443,8443,5900],"ttl":128,"window_size":1024}',
  },
  {
    id: '3', time: '8 min ago', src: '193.42.33.14', dst: '10.0.1.20', severity: 'high',
    category: 'Brute Force', dst_port: 3389, src_port: 55123, protocol: 'TCP', os: 'Windows 10',
    actor: 'BF-GROUP-12', country: '🇮🇷 Iran', city: 'Tehran', lat: 35.69, lon: 51.39,
    fp_confidence: 89, fp_method: 'RDP Cookie+TCP',
    description: 'RDP brute force attack. 523 failed login attempts in 10 minutes. Credential stuffing pattern — usernames sourced from known breach databases.',
    why_dangerous: 'If they guess one valid credential, they have full remote desktop access. RDP is the #1 initial access vector for ransomware operators. BlueKeep (CVE-2019-0708) can also be chained for unauthenticated RCE.',
    how_we_caught_it: 'Auth failure rate exceeded threshold: 523 failures in 600 seconds (0.87/sec). Usernames matched patterns from Have I Been Pwned breach data. Source IP has 47 prior incidents in threat intel.',
    false_positive_risk: 'VERY LOW — 523 failures + credential stuffing pattern + known threat actor IP.',
    mitre: [
      { id: 'T1110.004', name: 'Brute Force: Credential Stuffing', tactic: 'Credential Access', description: 'Using breached username/password pairs to attempt RDP login.' },
      { id: 'T1078', name: 'Valid Accounts', tactic: 'Initial Access', description: 'Goal is to obtain valid credentials for persistent access.' },
      { id: 'T1021.001', name: 'Remote Services: RDP', tactic: 'Lateral Movement', description: 'Once credentials are obtained, RDP enables full interactive control.' },
    ],
    kill_chain_phase: 'PHASE 3: Delivery / Exploitation',
    countermeasure: 'Enable Network Level Authentication (NLA). Implement account lockout after 5 failures. Deploy MFA on RDP. Move RDP behind VPN or Zero Trust gateway. Block source IP range.',
    cves: ['CVE-2019-0708 - BlueKeep RDP RCE', 'CVE-2019-1181 - DejaBlue'],
    raw_log: '{"ts":"2026-04-15T04:12:00Z","attempts":523,"unique_usernames":45,"success":false,"lockouts_triggered":12,"top_users":["admin","administrator","svc_backup","jsmith"]}',
  },
  {
    id: '4', time: '12 min ago', src: '91.219.236.174', dst: '10.0.1.5', severity: 'medium',
    category: 'DNS Tunnel', dst_port: 53, src_port: 49882, protocol: 'UDP', os: 'Linux 4.x',
    actor: null, country: '🇰🇵 North Korea', city: 'Pyongyang', lat: 39.03, lon: 125.75,
    fp_confidence: 64, fp_method: 'DNS Entropy+Volume',
    description: 'High-entropy TXT queries to suspicious domain. 847 queries in 5 minutes with base64-encoded subdomain labels — consistent with DNS-based data exfiltration tool (iodine/dnscat2).',
    why_dangerous: 'DNS tunneling bypasses most firewalls because DNS (port 53) is almost always allowed. The attacker is exfiltrating data or maintaining a covert C2 channel by encoding payloads in DNS queries.',
    how_we_caught_it: 'Shannon entropy of subdomain labels: 4.8 (normal DNS: 2.1-3.2). Query volume: 2.8 queries/sec to a single domain. Domain registered 3 days ago with privacy protection.',
    false_positive_risk: 'MODERATE — Some CDNs and anti-malware tools use high-entropy DNS. Correlated with new domain registration to reduce FP.',
    mitre: [
      { id: 'T1071.004', name: 'Application Layer Protocol: DNS', tactic: 'Command and Control', description: 'Using DNS queries/responses as a covert communication channel.' },
      { id: 'T1048.003', name: 'Exfiltration Over Unencrypted Protocol', tactic: 'Exfiltration', description: 'Encoding stolen data in DNS query labels and TXT record responses.' },
    ],
    kill_chain_phase: 'PHASE 7: Actions on Objective (Exfiltration)',
    countermeasure: 'Deploy DNS sinkholing. Block TXT queries to non-whitelisted domains. Implement DNS-over-HTTPS inspection. Monitor for high-entropy domain queries.',
    cves: [],
    raw_log: '{"ts":"2026-04-15T04:08:00Z","query":"aGVsbG8gd29ybGQ.bm90aGluZyB0bw.c2VlIGhlcmU.evil-domain.cc","type":"TXT","entropy":4.8,"queries_5min":847,"domain_age_days":3}',
  },
  {
    id: '5', time: '15 min ago', src: '103.75.201.2', dst: '10.0.1.50', severity: 'low',
    category: 'New Fingerprint', dst_port: 80, src_port: 62001, protocol: 'TCP', os: 'macOS 14',
    actor: null, country: '🇻🇳 Vietnam', city: 'Hanoi', lat: 21.03, lon: 105.85,
    fp_confidence: 91, fp_method: 'p0f+UA+TLS',
    description: 'Previously unseen device fingerprint. macOS 14 Sonoma connecting via corporate VPN. User agent and TLS fingerprint consistent with Safari 17.',
    why_dangerous: 'New devices could indicate a compromised VPN credential, a new employee who needs provisioning, or shadow IT. Without fingerprinting, you have zero visibility into what\'s connecting to your network.',
    how_we_caught_it: 'Device fingerprint (p0f TCP stack + TLS ClientHello + User-Agent) does not match any known baseline device for this subnet. Flagged for analyst review — not blocked.',
    false_positive_risk: 'HIGH — Likely legitimate new device. Flagged for verification, not as threat.',
    mitre: [
      { id: 'T1592', name: 'Gather Victim Host Information', tactic: 'Reconnaissance', description: 'We fingerprint inbound connections the same way attackers do — but we do it to protect you.' },
    ],
    kill_chain_phase: 'N/A — Informational',
    countermeasure: 'Verify device ownership with user. Add to device allowlist if legitimate. If unknown, revoke VPN credential and investigate.',
    cves: [],
    raw_log: '{"ts":"2026-04-15T04:05:00Z","ua":"Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15","ja3":"773906b0efdefa24a7f2b8eb6985bf37","p0f":"s:unix:MacOS:14.x","vpn":"wireguard","new_fp":true}',
  },
]

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  info: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

const SEVERITY_DOT: Record<string, string> = {
  critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-blue-500', info: 'bg-gray-500',
}

const KILL_CHAIN_COLORS: Record<string, string> = {
  'PHASE 1': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'PHASE 3': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'PHASE 6': 'bg-red-500/10 text-red-400 border-red-500/20',
  'PHASE 7': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'N/A': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

// ─── Attack Map ───
function AttackMap({ events }: { events: typeof MOCK_EVENTS }) {
  const mapW = 800, mapH = 400
  const toX = (lon: number) => ((lon + 180) / 360) * mapW
  const toY = (lat: number) => ((90 - lat) / 180) * mapH
  const targetX = toX(-77.04)
  const targetY = toY(38.9)

  return (
    <div className="relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <Target className="w-4 h-4 text-red-500" />
          Threat Origin Map — Live
        </h2>
        <div className="flex items-center gap-4">
          <LiveCounter label="packets analyzed" base={1247892} />
          <LiveCounter label="threats blocked" base={3421} />
          <LiveCounter label="fingerprints" base={892} />
        </div>
      </div>
      <svg viewBox={`0 0 ${mapW} ${mapH}`} className="w-full" style={{ background: '#050510' }}>
        {/* Subtle grid */}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1={0} y1={i * (mapH / 6)} x2={mapW} y2={i * (mapH / 6)} stroke="#0a1628" strokeWidth={0.5} />
        ))}
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={i * (mapW / 12)} y1={0} x2={i * (mapW / 12)} y2={mapH} stroke="#0a1628" strokeWidth={0.5} />
        ))}
        {/* Continent shapes */}
        <ellipse cx={180} cy={140} rx={90} ry={60} fill="none" stroke="#0f2847" strokeWidth={1} />
        <ellipse cx={220} cy={270} rx={50} ry={70} fill="none" stroke="#0f2847" strokeWidth={1} />
        <ellipse cx={420} cy={120} rx={50} ry={40} fill="none" stroke="#0f2847" strokeWidth={1} />
        <ellipse cx={430} cy={230} rx={50} ry={70} fill="none" stroke="#0f2847" strokeWidth={1} />
        <ellipse cx={580} cy={140} rx={110} ry={60} fill="none" stroke="#0f2847" strokeWidth={1} />
        <ellipse cx={660} cy={300} rx={40} ry={25} fill="none" stroke="#0f2847" strokeWidth={1} />

        {/* HQ shield */}
        <circle cx={targetX} cy={targetY} r={6} fill="#3b82f6" opacity={0.9}>
          <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx={targetX} cy={targetY} r={20} fill="none" stroke="#3b82f6" strokeWidth={0.5} opacity={0.2}>
          <animate attributeName="r" values="12;24;12" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx={targetX} cy={targetY} r={35} fill="none" stroke="#3b82f6" strokeWidth={0.3} opacity={0.1}>
          <animate attributeName="r" values="20;40;20" dur="4s" repeatCount="indefinite" />
        </circle>
        <text x={targetX + 14} y={targetY + 4} fill="#3b82f6" fontSize={9} fontFamily="monospace" fontWeight="bold">PROTECTED</text>

        {/* Attack vectors */}
        {events.map((e, i) => {
          const sx = toX(e.lon), sy = toY(e.lat)
          const color = e.severity === 'critical' ? '#ef4444' : e.severity === 'high' ? '#f97316' : e.severity === 'medium' ? '#eab308' : '#3b82f6'
          return (
            <g key={e.id}>
              <line x1={sx} y1={sy} x2={targetX} y2={targetY} stroke={color} strokeWidth={1.5} opacity={0.3} strokeDasharray="4,4">
                <animate attributeName="strokeDashoffset" values="0;-8" dur={`${1 + i * 0.3}s`} repeatCount="indefinite" />
              </line>
              <circle cx={sx} cy={sy} r={5} fill={color} opacity={0.9}>
                <animate attributeName="r" values="3;6;3" dur={`${1.5 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <circle cx={sx} cy={sy} r={10} fill="none" stroke={color} strokeWidth={0.5} opacity={0.3}>
                <animate attributeName="r" values="6;14;6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <text x={sx + 9} y={sy - 5} fill={color} fontSize={7} fontFamily="monospace" opacity={0.9}>{e.src}</text>
              <text x={sx + 9} y={sy + 4} fill="#666" fontSize={6} fontFamily="monospace">{e.category}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default function DashboardPage() {
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_EVENTS[0] | null>(null)
  const threatScore = 72

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">Anomaly Grid</span>
          <span className="text-xs text-gray-600 ml-2">/ Threat Operations Center</span>
        </div>
        <div className="flex items-center gap-6">
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

      {/* CVE Ticker */}
      <CVETicker />

      <div className="p-6">
        {/* Threat Level */}
        <ThreatLevelGauge score={threatScore} />

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <KpiCard icon={<AlertTriangle className="w-4 h-4" />} label="Threats (24h)" value={47} color="red" />
          <KpiCard icon={<Skull className="w-4 h-4" />} label="Critical" value={3} color="red" />
          <KpiCard icon={<Eye className="w-4 h-4" />} label="Active Actors" value={12} color="orange" />
          <KpiCard icon={<Wifi className="w-4 h-4" />} label="Sensors Online" value={8} color="green" />
          <KpiCard icon={<Fingerprint className="w-4 h-4" />} label="Fingerprints" value={892} color="blue" />
          <KpiCard icon={<Lock className="w-4 h-4" />} label="Blocked Today" value={3421} color="green" />
        </div>

        {/* Attack Map */}
        <div className="mb-6">
          <AttackMap events={MOCK_EVENTS} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Threat Feed */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Live Threat Feed
              </h2>
              <span className="text-xs text-gray-500">Click event for full analysis</span>
            </div>
            <div className="divide-y divide-gray-800/50">
              {MOCK_EVENTS.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`px-6 py-3.5 flex items-center justify-between hover:bg-gray-800/30 transition cursor-pointer group ${
                    selectedEvent?.id === event.id ? 'bg-gray-800/50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-0.5 rounded border ${SEVERITY_COLORS[event.severity]}`}>
                      {event.severity}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white font-mono">{event.src}</span>
                        <span className="text-xs text-gray-600">→</span>
                        <span className="text-xs text-gray-400 font-mono">{event.dst}:{event.dst_port}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-500">{event.category}</span>
                        <FingerprintBadge confidence={event.fp_confidence} fp_method={event.fp_method} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">{event.country}</div>
                    <div className="text-xs text-gray-600">{event.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Kill Chain Heatmap */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-red-500" /> Cyber Kill Chain
              </h2>
              <div className="space-y-2">
                {[
                  { phase: '1. Reconnaissance', count: 312, active: true },
                  { phase: '2. Weaponization', count: 0, active: false },
                  { phase: '3. Delivery', count: 89, active: true },
                  { phase: '4. Exploitation', count: 23, active: true },
                  { phase: '5. Installation', count: 5, active: true },
                  { phase: '6. C2', count: 12, active: true },
                  { phase: '7. Actions', count: 3, active: true },
                ].map(p => (
                  <div key={p.phase} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${p.count > 50 ? 'bg-red-500' : p.count > 10 ? 'bg-orange-500' : p.count > 0 ? 'bg-yellow-500' : 'bg-gray-800'} ${p.active ? 'animate-pulse' : ''}`} />
                    <span className="text-xs text-gray-400 flex-1">{p.phase}</span>
                    <span className={`text-xs font-mono ${p.count > 0 ? 'text-white' : 'text-gray-700'}`}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Actors */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Skull className="w-4 h-4 text-red-500" /> Active Threat Actors
                </h2>
                <Link href="/dashboard/actors" className="text-xs text-blue-400 hover:text-blue-300">View all →</Link>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'APT-SHADOW-7', events: 234, severity: 'critical', country: '🇷🇺', confidence: '97%' },
                  { name: 'SCAN-CLUSTER-44', events: 156, severity: 'high', country: '🇨🇳', confidence: '72%' },
                  { name: 'BF-GROUP-12', events: 89, severity: 'high', country: '🇮🇷', confidence: '89%' },
                  { name: 'RECON-NODE-9', events: 32, severity: 'medium', country: '🇰🇵', confidence: '64%' },
                ].map(actor => (
                  <Link href="/dashboard/actors" key={actor.name} className="flex items-center justify-between hover:bg-gray-800/30 rounded p-1.5 -mx-1 transition">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${SEVERITY_DOT[actor.severity]}`} />
                      <span className="text-xs font-mono text-gray-300">{actor.name}</span>
                      <span className="text-xs text-gray-600">{actor.country}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">{actor.events}</span>
                      <span className="text-xs text-green-400/70">{actor.confidence}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sensors */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-green-500" /> Edge Sensors
              </h2>
              <div className="space-y-2">
                {[
                  { name: 'edge-sensor-01', location: 'HQ', status: 'online', events: '12.4K' },
                  { name: 'edge-sensor-02', location: 'DC-East', status: 'online', events: '8.2K' },
                  { name: 'edge-sensor-03', location: 'Branch-ATL', status: 'degraded', events: '3.1K' },
                  { name: 'edge-sensor-04', location: 'Remote', status: 'offline', events: '0' },
                ].map(s => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.status === 'online' ? 'bg-green-500' : s.status === 'degraded' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                      <span className="text-xs font-mono text-gray-300">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-600">{s.location}</span>
                      <span className="text-xs text-gray-500">{s.events}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Event Detail Slide-Over (Full Threat Analysis) ─── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-2xl bg-gray-900 border-l border-gray-800 overflow-y-auto">
            <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded border ${SEVERITY_COLORS[selectedEvent.severity]}`}>
                  {selectedEvent.severity}
                </span>
                <span className="text-sm font-semibold text-white">{selectedEvent.category}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${KILL_CHAIN_COLORS[selectedEvent.kill_chain_phase.split(':')[0]] || KILL_CHAIN_COLORS['N/A']}`}>
                  {selectedEvent.kill_chain_phase}
                </span>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-gray-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Connection */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Connection Details</h3>
                <div className="bg-black/30 border border-gray-800 rounded-lg p-4 space-y-2 font-mono text-xs">
                  <div className="flex justify-between"><span className="text-gray-500">Source</span><span className="text-red-400">{selectedEvent.src}:{selectedEvent.src_port}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="text-blue-400">{selectedEvent.dst}:{selectedEvent.dst_port}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Protocol</span><span className="text-white">{selectedEvent.protocol}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Origin</span><span className="text-white">{selectedEvent.country} — {selectedEvent.city}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">OS</span><span className="text-white">{selectedEvent.os}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Fingerprint</span>
                    <FingerprintBadge confidence={selectedEvent.fp_confidence} fp_method={selectedEvent.fp_method} />
                  </div>
                </div>
              </div>

              {/* What happened */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> What Happened
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Why dangerous */}
              <div>
                <h3 className="text-xs font-semibold text-red-400 uppercase mb-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Why This Is Dangerous
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-red-500/5 border border-red-500/10 rounded-lg p-4">{selectedEvent.why_dangerous}</p>
              </div>

              {/* How we caught it */}
              <div>
                <h3 className="text-xs font-semibold text-green-400 uppercase mb-3 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> How Anomaly Grid Detected This
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-green-500/5 border border-green-500/10 rounded-lg p-4">{selectedEvent.how_we_caught_it}</p>
              </div>

              {/* False positive risk */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <Fingerprint className="w-3 h-3" /> False Positive Assessment
                </h3>
                <div className={`text-sm rounded-lg p-3 border ${
                  selectedEvent.false_positive_risk.startsWith('LOW') ? 'bg-green-500/5 border-green-500/10 text-green-400'
                  : selectedEvent.false_positive_risk.startsWith('VERY') ? 'bg-green-500/5 border-green-500/10 text-green-400'
                  : selectedEvent.false_positive_risk.startsWith('MODERATE') ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-400'
                  : 'bg-red-500/5 border-red-500/10 text-red-400'
                }`}>
                  {selectedEvent.false_positive_risk}
                </div>
              </div>

              {/* MITRE ATT&CK with full detail */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">MITRE ATT&CK Techniques</h3>
                <div className="space-y-2">
                  {selectedEvent.mitre.map(t => (
                    <a
                      key={t.id}
                      href={`https://attack.mitre.org/techniques/${t.id.replace('.', '/')}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-black/30 border border-gray-800 rounded-lg p-3 hover:border-gray-600 transition"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-blue-400">{t.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{t.tactic}</span>
                          <ExternalLink className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                      <div className="text-sm text-white mb-1">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.description}</div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Countermeasure */}
              <div>
                <h3 className="text-xs font-semibold text-blue-400 uppercase mb-3 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Recommended Countermeasure
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-blue-500/5 border border-blue-500/10 rounded-lg p-4">{selectedEvent.countermeasure}</p>
              </div>

              {/* CVEs */}
              {selectedEvent.cves.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Exploited CVEs</h3>
                  <div className="space-y-2">
                    {selectedEvent.cves.map(cve => (
                      <a key={cve} href={`https://nvd.nist.gov/vuln/detail/${cve.split(' ')[0]}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 hover:bg-red-500/20 transition">
                        <span className="text-sm font-mono text-red-400">{cve}</span>
                        <ExternalLink className="w-3 h-3 text-red-400" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Threat Actor */}
              {selectedEvent.actor && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Attributed Actor</h3>
                  <Link href="/dashboard/actors" className="flex items-center justify-between bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-mono text-white">{selectedEvent.actor}</span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </Link>
                </div>
              )}

              {/* Raw Log */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Raw Log</h3>
                <pre className="text-xs font-mono text-gray-400 bg-black/50 border border-gray-800 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap">{selectedEvent.raw_log}</pre>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 text-xs bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition">Acknowledge</button>
                <button className="flex-1 text-xs bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition">Block Source</button>
                <button className="flex-1 text-xs bg-gray-800 text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700">False Positive</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = { red: 'text-red-400', orange: 'text-orange-400', yellow: 'text-yellow-400', green: 'text-green-400', blue: 'text-blue-400' }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className={`${colors[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}
