'use client'

import { useState } from 'react'
import { Shield, Search, AlertTriangle, CheckCircle, XCircle, ExternalLink, FileText } from 'lucide-react'
import Link from 'next/link'

type Finding = {
  id: string
  stig_id: string
  title: string
  severity: 'CAT I' | 'CAT II' | 'CAT III'
  status: 'open' | 'not_a_finding' | 'not_applicable'
  rule_id: string
  fix_text: string
  check_text: string
  discussion: string
  related_cves: string[]
  related_cwe: string
  mitre_technique?: string
}

const MOCK_STIGS = [
  {
    name: 'Windows Server 2022 STIG',
    version: 'V1R4',
    release: 'April 2026',
    total: 285,
    open: 23,
    not_finding: 248,
    not_applicable: 14,
  },
  {
    name: 'Red Hat Enterprise Linux 9 STIG',
    version: 'V1R3',
    release: 'March 2026',
    total: 312,
    open: 18,
    not_finding: 280,
    not_applicable: 14,
  },
  {
    name: 'Ubuntu 22.04 STIG',
    version: 'V1R2',
    release: 'February 2026',
    total: 256,
    open: 31,
    not_finding: 210,
    not_applicable: 15,
  },
]

const MOCK_FINDINGS: Finding[] = [
  {
    id: '1', stig_id: 'V-254239', title: 'Windows Server 2022 must have the built-in administrator account disabled.',
    severity: 'CAT I', status: 'open', rule_id: 'SV-254239r848739_rule',
    fix_text: 'Navigate to Local Security Policy → Security Settings → Local Policies → Security Options. Disable "Accounts: Administrator account status".',
    check_text: 'Run "net user administrator" from an elevated command prompt. If the account is not disabled, this is a finding.',
    discussion: 'The built-in administrator account is a well-known target for attackers. Even when renamed, the SID remains the same (S-1-5-21-*-500), making it discoverable via tools like PsGetSid or PowerShell. Disabling it forces use of named admin accounts with proper auditing.',
    related_cves: ['CVE-2021-36934 - HiveNightmare/SeriousSAM', 'CVE-2023-21746 - LocalPotato'],
    related_cwe: 'CWE-250: Execution with Unnecessary Privileges',
    mitre_technique: 'T1078.001 - Valid Accounts: Default Accounts',
  },
  {
    id: '2', stig_id: 'V-254247', title: 'Windows Server 2022 must be configured to audit logon failures.',
    severity: 'CAT II', status: 'open', rule_id: 'SV-254247r848755_rule',
    fix_text: 'Navigate to Local Security Policy → Advanced Audit Policy → Logon/Logoff. Set "Audit Logon" to include "Failure".',
    check_text: 'Run "auditpol /get /subcategory:Logon". If "Failure" is not included, this is a finding.',
    discussion: 'Without logon failure auditing, brute force attacks, credential stuffing, and unauthorized access attempts go undetected. This is critical for forensic analysis and real-time threat detection.',
    related_cves: ['CVE-2023-23397 - Outlook NTLM Relay'],
    related_cwe: 'CWE-778: Insufficient Logging',
    mitre_technique: 'T1110 - Brute Force',
  },
  {
    id: '3', stig_id: 'V-254281', title: 'Windows Server 2022 must not allow SMBv1.',
    severity: 'CAT I', status: 'open', rule_id: 'SV-254281r848811_rule',
    fix_text: 'Run PowerShell: Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol -NoRestart',
    check_text: 'Run "Get-WindowsOptionalFeature -Online -FeatureName SMB1Protocol". If State is "Enabled", this is a finding.',
    discussion: 'SMBv1 is riddled with vulnerabilities and was the vector for WannaCry and NotPetya. It uses weak encryption (DES/MD4) and has no protection against man-in-the-middle attacks. Modern environments should use SMBv3 exclusively.',
    related_cves: ['CVE-2017-0144 - EternalBlue (WannaCry)', 'CVE-2017-0145 - EternalRomance', 'CVE-2020-0796 - SMBGhost'],
    related_cwe: 'CWE-327: Use of a Broken Crypto Algorithm',
    mitre_technique: 'T1210 - Exploitation of Remote Services',
  },
  {
    id: '4', stig_id: 'V-261365', title: 'RHEL 9 must implement DOD-approved encryption for SSH.',
    severity: 'CAT I', status: 'open', rule_id: 'SV-261365r940045_rule',
    fix_text: 'Edit /etc/crypto-policies/back-ends/opensshserver.config and ensure only FIPS-approved ciphers are listed. Run: update-crypto-policies --set FIPS',
    check_text: 'Run "sshd -T | grep ciphers". If non-FIPS ciphers are present, this is a finding.',
    discussion: 'Weak ciphers (3DES, RC4, Blowfish) can be broken by modern adversaries. FIPS 140-2/140-3 approved ciphers (AES-256-GCM, AES-128-GCM, ChaCha20-Poly1305) provide the minimum level of protection for DoD data in transit.',
    related_cves: ['CVE-2023-48795 - SSH Terrapin Attack'],
    related_cwe: 'CWE-327: Use of a Broken Crypto Algorithm',
    mitre_technique: 'T1557 - Adversary-in-the-Middle',
  },
  {
    id: '5', stig_id: 'V-238326', title: 'Ubuntu must disable unattended automatic updates for security patches.',
    severity: 'CAT II', status: 'open', rule_id: 'SV-238326r654789_rule',
    fix_text: 'Edit /etc/apt/apt.conf.d/20auto-upgrades. Set APT::Periodic::Unattended-Upgrade "1"; and ensure only security updates are applied.',
    check_text: 'Verify /etc/apt/apt.conf.d/20auto-upgrades contains Unattended-Upgrade "1". If missing or set to 0, this is a finding.',
    discussion: 'Unpatched systems are the #1 attack vector. Automatic security updates ensure critical patches are applied without waiting for manual intervention. The delay between CVE publication and exploitation averages 15 days — automate or be breached.',
    related_cves: ['CVE-2024-6387 - regreSSHion (OpenSSH)', 'CVE-2024-3094 - XZ Utils Backdoor'],
    related_cwe: 'CWE-1104: Use of Unmaintained Third Party Components',
    mitre_technique: 'T1190 - Exploit Public-Facing Application',
  },
]

const SEV_COLORS = {
  'CAT I': 'bg-red-500/10 text-red-400 border-red-500/20',
  'CAT II': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'CAT III': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
}

const STATUS_COLORS = {
  open: 'text-red-400',
  not_a_finding: 'text-green-400',
  not_applicable: 'text-gray-500',
}

export default function StigScannerPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>('all')

  const filtered = MOCK_FINDINGS.filter(f => {
    const matchesSearch = searchQuery === '' ||
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.stig_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.related_cves.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesSeverity = severityFilter === 'all' || f.severity === severityFilter
    return matchesSearch && matchesSeverity
  })

  return (
    <div className="min-h-screen bg-[#030305]">
      {/* Nav */}
      <nav className="border-b border-[#141620] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Anomaly Grid" className="w-full h-full" />
          </div>
          <span className="font-bold text-white">Anomaly Grid</span>
          <span className="text-xs text-gray-600 ml-2">/ STIG Scanner</span>
        </div>
        <Link href="/dashboard" className="text-xs text-gray-400 hover:text-blue-400 transition">← Dashboard</Link>
      </nav>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              STIG Scanner & CVE Lookup
            </h1>
            <p className="text-sm text-gray-500 mt-1">Scan for STIG compliance, understand vulnerabilities, learn from CVEs</p>
          </div>
          <button className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Run Full Scan
          </button>
        </div>

        {/* STIG Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {MOCK_STIGS.map(stig => (
            <div key={stig.name} className="bg-[#0a0b10] border border-[#141620] rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-white">{stig.name}</span>
                <span className="text-xs text-gray-600">{stig.version}</span>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{stig.open}</div>
                  <div className="text-xs text-gray-500">Open</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{stig.not_finding}</div>
                  <div className="text-xs text-gray-500">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-500">{stig.not_applicable}</div>
                  <div className="text-xs text-gray-500">N/A</div>
                </div>
              </div>
              <div className="w-full bg-[#0f1118] rounded-full h-2">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500" style={{ width: `${(stig.not_finding / stig.total) * 100}%` }} />
                  <div className="bg-red-500" style={{ width: `${(stig.open / stig.total) * 100}%` }} />
                  <div className="bg-gray-600" style={{ width: `${(stig.not_applicable / stig.total) * 100}%` }} />
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2">{Math.round(((stig.not_finding) / stig.total) * 100)}% compliant</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by STIG ID, description, or CVE..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0b10] border border-[#141620] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'CAT I', 'CAT II', 'CAT III'].map(f => (
              <button
                key={f}
                onClick={() => setSeverityFilter(f)}
                className={`text-xs px-3 py-2 rounded-lg border transition ${
                  severityFilter === f
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-[#0a0b10] border-[#141620] text-gray-400 hover:border-gray-600'
                }`}
              >
                {f === 'all' ? 'All' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List */}
        <div className="bg-[#0a0b10] border border-[#141620] rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-800/50">
            {filtered.map(finding => (
              <div
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                className={`px-6 py-4 hover:bg-[#0f1118]/30 transition cursor-pointer ${
                  selectedFinding?.id === finding.id ? 'bg-[#0f1118]/50 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-mono text-blue-400">{finding.stig_id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${SEV_COLORS[finding.severity]}`}>
                        {finding.severity}
                      </span>
                      <span className={`text-xs ${STATUS_COLORS[finding.status]}`}>
                        {finding.status === 'open' ? '● OPEN' : finding.status === 'not_a_finding' ? '✓ PASS' : '— N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-200">{finding.title}</p>
                    {finding.related_cves.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {finding.related_cves.map(cve => (
                          <span key={cve} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded font-mono">
                            {cve.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Finding Detail Slide-Over */}
      {selectedFinding && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedFinding(null)} />
          <div className="relative w-full max-w-2xl bg-[#0a0b10] border-l border-[#141620] overflow-y-auto">
            <div className="sticky top-0 bg-[#0a0b10] border-b border-[#141620] px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-blue-400">{selectedFinding.stig_id}</span>
                <span className={`text-xs px-2 py-0.5 rounded border ${SEV_COLORS[selectedFinding.severity]}`}>
                  {selectedFinding.severity}
                </span>
              </div>
              <button onClick={() => setSelectedFinding(null)} className="text-gray-500 hover:text-white transition">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">{selectedFinding.title}</h2>
                <span className="text-xs text-gray-500 font-mono">{selectedFinding.rule_id}</span>
              </div>

              {/* Why is this vulnerable? */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Why This Matters
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-[#0f1118] rounded-lg p-4">
                  {selectedFinding.discussion}
                </p>
              </div>

              {/* How to check */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <Search className="w-3 h-3" /> How to Check
                </h3>
                <pre className="text-xs font-mono text-green-400 bg-black/50 border border-[#141620] rounded-lg p-4 whitespace-pre-wrap">
                  {selectedFinding.check_text}
                </pre>
              </div>

              {/* How to fix */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> How to Fix
                </h3>
                <pre className="text-xs font-mono text-blue-400 bg-black/50 border border-[#141620] rounded-lg p-4 whitespace-pre-wrap">
                  {selectedFinding.fix_text}
                </pre>
              </div>

              {/* MITRE ATT&CK Mapping */}
              {selectedFinding.mitre_technique && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">MITRE ATT&CK</h3>
                  <div className="text-xs bg-[#0f1118] text-gray-300 px-3 py-2 rounded font-mono">
                    {selectedFinding.mitre_technique}
                  </div>
                </div>
              )}

              {/* CWE */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Weakness Classification (CWE)</h3>
                <div className="text-xs bg-[#0f1118] text-gray-300 px-3 py-2 rounded">
                  {selectedFinding.related_cwe}
                </div>
              </div>

              {/* Related CVEs */}
              {selectedFinding.related_cves.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Related CVEs — Learn From Real Attacks</h3>
                  <div className="space-y-2">
                    {selectedFinding.related_cves.map(cve => {
                      const cveId = cve.split(' ')[0]
                      return (
                        <a
                          key={cve}
                          href={`https://nvd.nist.gov/vuln/detail/${cveId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 hover:bg-red-500/20 transition"
                        >
                          <div>
                            <div className="text-sm font-mono text-red-400">{cveId}</div>
                            <div className="text-xs text-gray-400">{cve.split(' - ').slice(1).join(' - ')}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-red-400" />
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 text-xs bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition">
                  Mark as Remediated
                </button>
                <button className="flex-1 text-xs bg-[#0f1118] text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700">
                  Create Ticket
                </button>
                <button className="flex-1 text-xs bg-[#0f1118] text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition border border-gray-700">
                  Export Finding
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
