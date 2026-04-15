// Anomaly Grid — Mission Control (Intellusia Platform Admin)
// Route: /mission-control

import { Shield, Users, Activity, Server, DollarSign, AlertTriangle } from 'lucide-react'

const MOCK = {
  total_tenants: 12,
  active_tenants: 10,
  mrr: 18750,
  total_events_24h: 45230,
  total_sensors: 34,
  critical_alerts: 7,
  tenants: [
    { name: 'Bravo Defense LLC', plan: 'enterprise', status: 'active', mrr: 2500, sensors: 6, events_24h: 12400, alerts: 3 },
    { name: 'TacOps Logistics', plan: 'pro', status: 'active', mrr: 1500, sensors: 4, events_24h: 8200, alerts: 1 },
    { name: 'Pacific Supply Co', plan: 'pro', status: 'active', mrr: 1500, sensors: 3, events_24h: 5600, alerts: 0 },
    { name: 'Meridian IT Group', plan: 'starter', status: 'trial', mrr: 0, sensors: 2, events_24h: 3100, alerts: 2 },
    { name: 'Atlas Contracting', plan: 'starter', status: 'active', mrr: 750, sensors: 1, events_24h: 1200, alerts: 0 },
  ],
}

const PLAN_BADGE: Record<string, string> = {
  starter: 'bg-[#0f1118] text-gray-400',
  pro: 'bg-blue-900/50 text-blue-400',
  enterprise: 'bg-purple-900/50 text-purple-400',
}

const STATUS_BADGE: Record<string, string> = {
  active: 'text-green-400',
  trial: 'text-yellow-400',
  suspended: 'text-red-400',
}

export default function MissionControlPage() {
  return (
    <div className="min-h-screen bg-[#030305]">
      {/* Nav */}
      <nav className="border-b border-[#141620] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="/logo.png" alt="Anomaly Grid" className="w-full h-full" />
          </div>
          <div>
            <span className="font-bold text-white text-sm">Intellusia Studios</span>
            <span className="text-xs text-gray-600 ml-2">Mission Control</span>
          </div>
        </div>
        <span className="text-xs text-gray-600">Super Admin</span>
      </nav>

      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-2">Mission Control</h1>
        <p className="text-sm text-gray-500 mb-8">All tenants, all sensors, all threats — one view.</p>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Kpi icon={<Users className="w-4 h-4" />} label="Tenants" value={MOCK.total_tenants} color="blue" />
          <Kpi icon={<Activity className="w-4 h-4" />} label="Active" value={MOCK.active_tenants} color="green" />
          <Kpi icon={<DollarSign className="w-4 h-4" />} label="MRR" value={`$${MOCK.mrr.toLocaleString()}`} color="green" />
          <Kpi icon={<Server className="w-4 h-4" />} label="Sensors" value={MOCK.total_sensors} color="blue" />
          <Kpi icon={<Activity className="w-4 h-4" />} label="Events (24h)" value={MOCK.total_events_24h.toLocaleString()} color="blue" />
          <Kpi icon={<AlertTriangle className="w-4 h-4" />} label="Critical" value={MOCK.critical_alerts} color="red" />
        </div>

        {/* Tenant Table */}
        <div className="bg-[#0a0b10] border border-[#141620] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#141620]">
            <h2 className="text-sm font-semibold text-gray-200">Tenants</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#141620]">
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Tenant</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Plan</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Status</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">MRR</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Sensors</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Events (24h)</th>
                <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Alerts</th>
              </tr>
            </thead>
            <tbody>
              {MOCK.tenants.map(t => (
                <tr key={t.name} className="border-b border-[#141620]/50 hover:bg-[#0f1118]/30 transition cursor-pointer">
                  <td className="px-6 py-3 text-white font-medium">{t.name}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${PLAN_BADGE[t.plan]}`}>{t.plan}</span>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`text-xs ${STATUS_BADGE[t.status]}`}>● {t.status}</span>
                  </td>
                  <td className="px-6 py-3 text-gray-300">${t.mrr.toLocaleString()}</td>
                  <td className="px-6 py-3 text-gray-400">{t.sensors}</td>
                  <td className="px-6 py-3 text-gray-400">{t.events_24h.toLocaleString()}</td>
                  <td className="px-6 py-3">
                    {t.alerts > 0 ? (
                      <span className="text-xs text-red-400 font-semibold">{t.alerts}</span>
                    ) : (
                      <span className="text-xs text-gray-600">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* System Health */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0a0b10] border border-[#141620] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-200 mb-4">Inference Pipeline</h2>
            <div className="space-y-2">
              <HealthRow label="Triton Server" status="online" detail="GPU: 2x A10G" />
              <HealthRow label="DFP Pipeline" status="online" detail="Latency: 23ms" />
              <HealthRow label="Fingerprint Pipeline" status="online" detail="Latency: 12ms" />
              <HealthRow label="Threat Classifier" status="online" detail="Latency: 8ms" />
            </div>
          </div>
          <div className="bg-[#0a0b10] border border-[#141620] rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-200 mb-4">Infrastructure</h2>
            <div className="space-y-2">
              <HealthRow label="Redpanda Cluster" status="online" detail="3 brokers, 72 topics" />
              <HealthRow label="ClickHouse" status="online" detail="2.1TB stored" />
              <HealthRow label="PostgreSQL" status="online" detail="12 tenant schemas" />
              <HealthRow label="SIEM Export" status="degraded" detail="1 failed delivery" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = { red: 'text-red-400', green: 'text-green-400', blue: 'text-blue-400' }
  return (
    <div className="bg-[#0a0b10] border border-[#141620] rounded-xl p-4">
      <div className={`${colors[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  )
}

function HealthRow({ label, status, detail }: { label: string; status: 'online' | 'degraded' | 'offline'; detail: string }) {
  const dot = { online: 'bg-green-500', degraded: 'bg-yellow-500', offline: 'bg-red-500' }[status]
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <span className="text-xs text-gray-300">{label}</span>
      </div>
      <span className="text-xs text-gray-600">{detail}</span>
    </div>
  )
}
