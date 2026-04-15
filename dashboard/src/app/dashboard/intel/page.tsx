'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ExternalLink, AlertTriangle, Shield, Database, Crosshair, Globe, BookOpen } from 'lucide-react'

// ─── Types ───
type FeedCategory = 'all' | 'ttp' | 'ioc' | 'vuln' | 'pattern'

interface IntelFeed {
  id: string
  name: string
  source: string
  category: FeedCategory
  description: string
  url: string
  status: 'connected' | 'available' | 'premium'
  lastSync?: string
  indicators?: number
}

interface MitreEntry {
  id: string
  name: string
  tactic: string
  description: string
  actors: string[]
  platforms: string[]
  dataSource: string
  capec?: string
  cwe?: string
  detection: string
}

interface VulnEntry {
  cve: string
  cvss: number
  cwe: string
  cweName: string
  capec: string
  capecName: string
  vendor: string
  product: string
  description: string
  exploitedInWild: boolean
  published: string
}

// ─── Data ───
const INTEL_FEEDS: IntelFeed[] = [
  { id: '1', name: 'MITRE ATT&CK', source: 'MITRE', category: 'ttp', description: 'Adversarial tactics, techniques, and procedures knowledge base. Maps real-world threat actor behavior.', url: 'https://attack.mitre.org', status: 'connected', lastSync: '2 min ago', indicators: 794 },
  { id: '2', name: 'AlienVault OTX', source: 'AT&T Cybersecurity', category: 'ioc', description: 'Open Threat Exchange — community-driven IOC sharing. IPs, domains, hashes, URLs from global contributors.', url: 'https://otx.alienvault.com', status: 'connected', lastSync: '5 min ago', indicators: 12483 },
  { id: '3', name: 'MISP', source: 'CIRCL', category: 'ioc', description: 'Malware Information Sharing Platform. Structured threat intelligence sharing with correlation engine.', url: 'https://www.misp-project.org', status: 'connected', lastSync: '8 min ago', indicators: 8721 },
  { id: '4', name: 'NVD', source: 'NIST', category: 'vuln', description: 'National Vulnerability Database. CVSS-scored CVEs with CPE mappings, weakness classifications, and fix data.', url: 'https://nvd.nist.gov', status: 'connected', lastSync: '1 hr ago', indicators: 234521 },
  { id: '5', name: 'CWE', source: 'MITRE', category: 'vuln', description: 'Common Weakness Enumeration. Root-cause weakness categories that CVEs map to (e.g., CWE-79 = XSS, CWE-89 = SQLi).', url: 'https://cwe.mitre.org', status: 'connected', indicators: 933 },
  { id: '6', name: 'CAPEC', source: 'MITRE', category: 'pattern', description: 'Common Attack Pattern Enumeration. Catalog of attack patterns that map to CWEs, providing the "how" behind weaknesses.', url: 'https://capec.mitre.org', status: 'connected', indicators: 559 },
  { id: '7', name: 'CVSS Calculator', source: 'FIRST.org', category: 'vuln', description: 'Common Vulnerability Scoring System v4.0. Standardized severity scoring framework independent of CVE database.', url: 'https://www.first.org/cvss/calculator/4.0', status: 'connected' },
  { id: '8', name: 'STIX/TAXII', source: 'OASIS', category: 'ioc', description: 'Structured Threat Information Expression + Trusted Automated Exchange. Standard format for threat intel sharing.', url: 'https://oasis-open.github.io/cti-documentation/', status: 'connected', indicators: 4200 },
  { id: '9', name: 'FS-ISAC', source: 'Financial Sector', category: 'ioc', description: 'Financial Services ISAC. Sector-specific threat sharing for banking, insurance, and financial infrastructure.', url: 'https://www.fsisac.com', status: 'available' },
  { id: '10', name: 'H-ISAC', source: 'Health Sector', category: 'ioc', description: 'Health Information Sharing and Analysis Center. Threat intelligence for healthcare and public health organizations.', url: 'https://h-isac.org', status: 'available' },
  { id: '11', name: 'MS-ISAC', source: 'Government', category: 'ioc', description: 'Multi-State ISAC. Threat intel for state, local, tribal, and territorial government entities.', url: 'https://www.cisecurity.org/ms-isac', status: 'available' },
  { id: '12', name: 'Recorded Future', source: 'Recorded Future', category: 'ttp', description: 'Premium threat intelligence with predictive analytics, dark web monitoring, and real-time threat correlation.', url: 'https://www.recordedfuture.com', status: 'premium' },
  { id: '13', name: 'Mandiant', source: 'Google Cloud', category: 'ttp', description: 'Incident response intelligence. APT group tracking, nation-state threat profiles, and breach forensics.', url: 'https://www.mandiant.com', status: 'premium' },
  { id: '14', name: 'CrowdStrike Falcon', source: 'CrowdStrike', category: 'ttp', description: 'Adversary intelligence with named threat actor profiles (FANCY BEAR, WIZARD SPIDER, etc.) and IOCs.', url: 'https://www.crowdstrike.com', status: 'premium' },
  { id: '15', name: 'CISA KEV', source: 'CISA', category: 'vuln', description: 'Known Exploited Vulnerabilities catalog. Confirmed actively exploited CVEs — mandatory patching for federal agencies.', url: 'https://www.cisa.gov/known-exploited-vulnerabilities-catalog', status: 'connected', lastSync: '30 min ago', indicators: 1124 },
]

const MITRE_DATA: MitreEntry[] = [
  {
    id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control',
    description: 'Adversaries use HTTP/HTTPS to communicate with C2 servers, blending malicious traffic with legitimate web browsing.',
    actors: ['APT29', 'APT28', 'Lazarus Group', 'FIN7'],
    platforms: ['Windows', 'Linux', 'macOS'],
    dataSource: 'Network Traffic: Content + Flow',
    capec: 'CAPEC-609',
    cwe: 'CWE-311',
    detection: 'Monitor for unusual HTTPS connections to new/rare domains. Analyze JA3/JA3S fingerprints. Flag beaconing patterns (regular intervals ±jitter).',
  },
  {
    id: 'T1110.004', name: 'Brute Force: Credential Stuffing', tactic: 'Credential Access',
    description: 'Using breached credentials (username/password pairs) to attempt login across many services, exploiting password reuse.',
    actors: ['APT33', 'Kimsuky', 'BF-GROUP-12'],
    platforms: ['Windows', 'Linux', 'SaaS', 'Azure AD'],
    dataSource: 'Authentication Logs',
    capec: 'CAPEC-600',
    cwe: 'CWE-521',
    detection: 'Correlate failed logins across multiple accounts from same source. Match usernames against known breach databases.',
  },
  {
    id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery',
    description: 'Scanning for running services on remote hosts (port scanning) to map the attack surface before exploitation.',
    actors: ['APT41', 'Volt Typhoon', 'SCAN-CLUSTER-44'],
    platforms: ['Windows', 'Linux', 'Network'],
    dataSource: 'Network Traffic: Flow',
    capec: 'CAPEC-300',
    cwe: 'CWE-200',
    detection: 'Detect high rate of SYN packets from single source. Flag sequential port scanning patterns. Monitor for masscan/nmap signatures.',
  },
  {
    id: 'T1190', name: 'Exploit Public-Facing Application', tactic: 'Initial Access',
    description: 'Exploiting vulnerabilities in internet-facing applications (web servers, VPNs, email gateways) to gain initial access.',
    actors: ['APT40', 'Hafnium', 'Sandworm'],
    platforms: ['Windows', 'Linux', 'Network Appliances'],
    dataSource: 'Application Logs + Network IDS',
    capec: 'CAPEC-676',
    cwe: 'CWE-20',
    detection: 'Monitor web application logs for anomalous requests. Deploy WAF rules. Track CVE exploitation attempts against known signatures.',
  },
  {
    id: 'T1048.003', name: 'Exfiltration Over Unencrypted Protocol', tactic: 'Exfiltration',
    description: 'Encoding stolen data in DNS queries, HTTP headers, or ICMP payloads to bypass firewalls that allow these protocols.',
    actors: ['APT34', 'DarkHydrus', 'Turla'],
    platforms: ['Windows', 'Linux'],
    dataSource: 'DNS Logs + Network Content',
    capec: 'CAPEC-157',
    cwe: 'CWE-311',
    detection: 'Measure Shannon entropy of DNS query labels. Flag high-volume TXT queries to single domains. Monitor for base64/hex patterns in subdomain labels.',
  },
  {
    id: 'T1595.001', name: 'Active Scanning: Scanning IP Blocks', tactic: 'Reconnaissance',
    description: 'Systematically scanning IP address ranges to identify live hosts, open ports, and running services before launching an attack.',
    actors: ['APT1', 'Scattered Spider', 'RECON-NODE-9'],
    platforms: ['PRE (pre-compromise)'],
    dataSource: 'Network Flow + Firewall Logs',
    capec: 'CAPEC-300',
    cwe: 'CWE-200',
    detection: 'Rate-limit inbound connection attempts. Flag sources exceeding SYN threshold. Correlate with threat intel for known scanner IPs.',
  },
]

const VULN_DATA: VulnEntry[] = [
  { cve: 'CVE-2024-3400', cvss: 10.0, cwe: 'CWE-77', cweName: 'Command Injection', capec: 'CAPEC-88', capecName: 'OS Command Injection', vendor: 'Palo Alto', product: 'PAN-OS', description: 'Unauthenticated command injection in GlobalProtect gateway. Allows full device takeover.', exploitedInWild: true, published: '2024-04-12' },
  { cve: 'CVE-2024-6387', cvss: 8.1, cwe: 'CWE-362', cweName: 'Race Condition', capec: 'CAPEC-29', capecName: 'Leveraging Race Conditions', vendor: 'OpenSSH', product: 'sshd', description: 'Signal handler race condition (regreSSHion). Unauthenticated RCE on glibc-based Linux systems.', exploitedInWild: true, published: '2024-07-01' },
  { cve: 'CVE-2024-3094', cvss: 10.0, cwe: 'CWE-506', cweName: 'Embedded Malicious Code', capec: 'CAPEC-538', capecName: 'Open-Source Library Manipulation', vendor: 'XZ Utils', product: 'liblzma', description: 'Sophisticated supply chain backdoor in XZ compression library. Targets SSH authentication on systemd-based systems.', exploitedInWild: true, published: '2024-03-29' },
  { cve: 'CVE-2023-4966', cvss: 9.4, cwe: 'CWE-119', cweName: 'Buffer Overflow', capec: 'CAPEC-100', capecName: 'Overflow Buffers', vendor: 'Citrix', product: 'NetScaler ADC', description: 'Citrix Bleed — session token leak allowing authenticated session hijack without credentials.', exploitedInWild: true, published: '2023-10-10' },
  { cve: 'CVE-2024-21887', cvss: 9.1, cwe: 'CWE-77', cweName: 'Command Injection', capec: 'CAPEC-88', capecName: 'OS Command Injection', vendor: 'Ivanti', product: 'Connect Secure', description: 'Authenticated command injection chained with CVE-2023-46805 auth bypass for full unauthenticated RCE.', exploitedInWild: true, published: '2024-01-10' },
  { cve: 'CVE-2019-0708', cvss: 9.8, cwe: 'CWE-416', cweName: 'Use After Free', capec: 'CAPEC-123', capecName: 'Exploiting Dangling Pointers', vendor: 'Microsoft', product: 'Windows RDP', description: 'BlueKeep — pre-auth RCE in RDP. Wormable. Used by nation-states and ransomware groups.', exploitedInWild: true, published: '2019-05-14' },
]

// ─── Components ───
const STATUS_BADGE: Record<string, string> = {
  connected: 'bg-green-500/10 text-green-400 border-green-500/20',
  available: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  premium: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const CAT_BADGE: Record<string, string> = {
  ttp: 'bg-red-500/10 text-red-400 border-red-500/20',
  ioc: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  vuln: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  pattern: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
}

const CAT_LABEL: Record<string, string> = { ttp: 'TTP', ioc: 'IOC', vuln: 'VULN', pattern: 'PATTERN' }

function CvssScore({ score }: { score: number }) {
  const color = score >= 9 ? 'text-red-400 bg-red-500/10 border-red-500/20'
    : score >= 7 ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    : score >= 4 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : 'text-green-400 bg-green-500/10 border-green-500/20'
  const label = score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW'
  return (
    <div className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded border ${color}`}>
      <span className="font-bold">{score.toFixed(1)}</span>
      <span className="opacity-70">{label}</span>
    </div>
  )
}

export default function IntelPage() {
  const [tab, setTab] = useState<'feeds' | 'mitre' | 'vulns'>('feeds')
  const [searchQ, setSearchQ] = useState('')
  const [catFilter, setCatFilter] = useState<FeedCategory>('all')
  const [selectedMitre, setSelectedMitre] = useState<MitreEntry | null>(null)
  const [selectedVuln, setSelectedVuln] = useState<VulnEntry | null>(null)

  const filteredFeeds = INTEL_FEEDS.filter(f => {
    const matchCat = catFilter === 'all' || f.category === catFilter
    const matchSearch = searchQ === '' || f.name.toLowerCase().includes(searchQ.toLowerCase()) || f.description.toLowerCase().includes(searchQ.toLowerCase())
    return matchCat && matchSearch
  })

  const filteredMitre = MITRE_DATA.filter(m =>
    searchQ === '' || m.id.toLowerCase().includes(searchQ.toLowerCase()) || m.name.toLowerCase().includes(searchQ.toLowerCase()) || m.tactic.toLowerCase().includes(searchQ.toLowerCase())
  )

  const filteredVulns = VULN_DATA.filter(v =>
    searchQ === '' || v.cve.toLowerCase().includes(searchQ.toLowerCase()) || v.vendor.toLowerCase().includes(searchQ.toLowerCase()) || v.cwe.toLowerCase().includes(searchQ.toLowerCase()) || v.capec.toLowerCase().includes(searchQ.toLowerCase())
  )

  return (
    <div>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-500" />
              THREAT INTELLIGENCE CENTER
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">Integrated feeds: MITRE ATT&CK • NVD • CWE • CAPEC • CVSS • STIX/TAXII • ISACs • OTX • MISP</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-green-400">● {INTEL_FEEDS.filter(f => f.status === 'connected').length} CONNECTED</span>
            <span className="text-yellow-400">● {INTEL_FEEDS.filter(f => f.status === 'available').length} AVAILABLE</span>
            <span className="text-purple-400">● {INTEL_FEEDS.filter(f => f.status === 'premium').length} PREMIUM</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { id: 'feeds' as const, label: '📡 INTEL FEEDS', icon: Globe },
            { id: 'mitre' as const, label: '🎯 MITRE ATT&CK', icon: Crosshair },
            { id: 'vulns' as const, label: '🔓 CVE / CWE / CAPEC', icon: AlertTriangle },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setSearchQ('') }}
              className={`text-xs font-mono px-4 py-2 rounded-lg border transition-all ${tab === t.id ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#0a0b10] border-[#141620] text-gray-500 hover:text-gray-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input type="text" placeholder={tab === 'feeds' ? 'Search feeds, sources...' : tab === 'mitre' ? 'Search technique ID, name, tactic...' : 'Search CVE, CWE, CAPEC, vendor...'}
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full bg-[#0a0b10] border border-[#141620] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50" />
          </div>
          {tab === 'feeds' && (
            <div className="flex gap-1">
              {(['all', 'ttp', 'ioc', 'vuln', 'pattern'] as FeedCategory[]).map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`text-[10px] font-mono px-3 py-2 rounded-lg border transition ${catFilter === c ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-[#0a0b10] border-[#141620] text-gray-600 hover:text-gray-400'}`}>
                  {c === 'all' ? 'ALL' : c.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ─── FEEDS TAB ─── */}
        {tab === 'feeds' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFeeds.map(feed => (
              <div key={feed.id} className="bg-[#0a0b10] border border-[#141620] rounded-xl p-5 hover:border-[#1e2030] transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{feed.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${CAT_BADGE[feed.category]}`}>{CAT_LABEL[feed.category]}</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-mono">{feed.source}</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-mono ${STATUS_BADGE[feed.status]}`}>
                    {feed.status === 'connected' ? '● LIVE' : feed.status === 'available' ? '○ AVAILABLE' : '★ PREMIUM'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{feed.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] font-mono">
                    {feed.indicators && <span className="text-gray-500">IOCs: <span className="text-white">{feed.indicators.toLocaleString()}</span></span>}
                    {feed.lastSync && <span className="text-gray-500">Synced: <span className="text-green-400">{feed.lastSync}</span></span>}
                  </div>
                  <a href={feed.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono">
                    OPEN <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ─── MITRE TAB ─── */}
        {tab === 'mitre' && (
          <div className="space-y-3">
            {filteredMitre.map(m => (
              <div key={m.id} onClick={() => setSelectedMitre(selectedMitre?.id === m.id ? null : m)}
                className={`bg-[#0a0b10] border rounded-xl p-5 cursor-pointer transition ${selectedMitre?.id === m.id ? 'border-cyan-500/30' : 'border-[#141620] hover:border-[#1e2030]'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-mono text-cyan-400 font-bold">{m.id}</span>
                  <span className="text-sm font-bold text-white">{m.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">{m.tactic}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{m.description}</p>

                {selectedMitre?.id === m.id && (
                  <div className="mt-4 pt-4 border-t border-[#141620] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">KNOWN THREAT ACTORS</h4>
                        <div className="flex flex-wrap gap-1">{m.actors.map(a => <span key={a} className="text-[10px] font-mono bg-red-500/10 text-red-400 px-2 py-0.5 rounded">{a}</span>)}</div>
                      </div>
                      <div>
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">PLATFORMS</h4>
                        <div className="flex flex-wrap gap-1">{m.platforms.map(p => <span key={p} className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">{p}</span>)}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">DATA SOURCE</h4>
                      <span className="text-xs font-mono text-gray-300">{m.dataSource}</span>
                    </div>
                    {m.capec && (
                      <div className="flex gap-4">
                        <div>
                          <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">CAPEC MAPPING</h4>
                          <a href={`https://capec.mitre.org/data/definitions/${m.capec.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1">{m.capec} <ExternalLink className="w-3 h-3" /></a>
                        </div>
                        {m.cwe && <div>
                          <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-1">CWE MAPPING</h4>
                          <a href={`https://cwe.mitre.org/data/definitions/${m.cwe.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1">{m.cwe} <ExternalLink className="w-3 h-3" /></a>
                        </div>}
                      </div>
                    )}
                    <div>
                      <h4 className="text-[10px] font-mono text-green-400 uppercase mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> HOW ANOMALY GRID DETECTS THIS</h4>
                      <p className="text-xs text-gray-300 bg-green-500/5 border border-green-500/10 rounded-lg p-3">{m.detection}</p>
                    </div>
                    <a href={`https://attack.mitre.org/techniques/${m.id.replace('.', '/')}/`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300">
                      View on MITRE ATT&CK <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── VULNS TAB ─── */}
        {tab === 'vulns' && (
          <div className="space-y-3">
            {filteredVulns.map(v => (
              <div key={v.cve} onClick={() => setSelectedVuln(selectedVuln?.cve === v.cve ? null : v)}
                className={`bg-[#0a0b10] border rounded-xl p-5 cursor-pointer transition ${selectedVuln?.cve === v.cve ? 'border-cyan-500/30' : 'border-[#141620] hover:border-[#1e2030]'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-sm font-mono font-bold text-white">{v.cve}</span>
                  <CvssScore score={v.cvss} />
                  {v.exploitedInWild && <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono animate-pulse">⚠ EXPLOITED IN WILD</span>}
                  <span className="text-[10px] text-gray-600 font-mono">{v.vendor} / {v.product}</span>
                </div>
                <p className="text-xs text-gray-400">{v.description}</p>

                {selectedVuln?.cve === v.cve && (
                  <div className="mt-4 pt-4 border-t border-[#141620] space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-[#050508] rounded-lg p-3">
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">CVSS v3.1</h4>
                        <div className="text-2xl font-bold font-mono" style={{ color: v.cvss >= 9 ? '#ef4444' : v.cvss >= 7 ? '#f97316' : '#eab308' }}>{v.cvss}</div>
                        <div className="text-[10px] text-gray-500 font-mono mt-1">{v.cvss >= 9 ? 'CRITICAL' : v.cvss >= 7 ? 'HIGH' : 'MEDIUM'}</div>
                      </div>
                      <div className="bg-[#050508] rounded-lg p-3">
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">WEAKNESS (CWE)</h4>
                        <a href={`https://cwe.mitre.org/data/definitions/${v.cwe.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1">{v.cwe} <ExternalLink className="w-3 h-3" /></a>
                        <div className="text-[10px] text-gray-400 mt-1">{v.cweName}</div>
                      </div>
                      <div className="bg-[#050508] rounded-lg p-3">
                        <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">ATTACK PATTERN (CAPEC)</h4>
                        <a href={`https://capec.mitre.org/data/definitions/${v.capec.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">{v.capec} <ExternalLink className="w-3 h-3" /></a>
                        <div className="text-[10px] text-gray-400 mt-1">{v.capecName}</div>
                      </div>
                    </div>

                    {/* Relationship chain */}
                    <div>
                      <h4 className="text-[10px] font-mono text-gray-500 uppercase mb-2">VULNERABILITY CHAIN</h4>
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded">{v.cve}</span>
                        <span className="text-gray-600">→ exploits →</span>
                        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded">{v.cwe}</span>
                        <span className="text-gray-600">→ via pattern →</span>
                        <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-1 rounded">{v.capec}</span>
                        <span className="text-gray-600">→ scores →</span>
                        <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded">CVSS {v.cvss}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a href={`https://nvd.nist.gov/vuln/detail/${v.cve}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-[#050508] px-3 py-1.5 rounded">NVD <ExternalLink className="w-3 h-3" /></a>
                      <a href={`https://cwe.mitre.org/data/definitions/${v.cwe.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-[#050508] px-3 py-1.5 rounded">CWE <ExternalLink className="w-3 h-3" /></a>
                      <a href={`https://capec.mitre.org/data/definitions/${v.capec.split('-')[1]}.html`} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-[#050508] px-3 py-1.5 rounded">CAPEC <ExternalLink className="w-3 h-3" /></a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
