// ─── Anomaly Grid Core Types ───

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info'
export type ThreatCategory = 'malware' | 'c2' | 'scan' | 'brute_force' | 'phishing' | 'lateral_movement' | 'exfiltration' | 'unknown'
export type ShipmentDirection = 'inbound' | 'outbound'
export type SensorStatus = 'online' | 'offline' | 'degraded'
export type ActorConfidence = 'confirmed' | 'high' | 'medium' | 'low'

export interface Tenant {
  id: string
  name: string
  slug: string
  logo_url?: string
  primary_color?: string
  custom_domain?: string
  plan: 'starter' | 'pro' | 'enterprise'
  status: 'active' | 'trial' | 'suspended'
  created_at: string
}

export interface Sensor {
  id: string
  tenant_id: string
  hostname: string
  ip_address: string
  location?: string
  status: SensorStatus
  last_seen: string
  version: string
  created_at: string
}

export interface ThreatEvent {
  id: string
  tenant_id: string
  sensor_id: string
  timestamp: string
  src_ip: string
  dst_ip: string
  src_port?: number
  dst_port?: number
  protocol?: string
  severity: ThreatSeverity
  category: ThreatCategory
  description: string
  fingerprint?: DeviceFingerprint
  actor_id?: string
  mitre_tactics?: string[]
  mitre_techniques?: string[]
  raw_log?: string
  acknowledged: boolean
  created_at: string
}

export interface DeviceFingerprint {
  id: string
  src_ip: string
  os_family?: string
  os_version?: string
  device_type?: string
  user_agent?: string
  behavior_signature?: string
  first_seen: string
  last_seen: string
  connection_count: number
}

export interface ThreatActor {
  id: string
  tenant_id: string
  name: string
  aliases?: string[]
  first_seen: string
  last_seen: string
  event_count: number
  severity: ThreatSeverity
  confidence: ActorConfidence
  source_ips: string[]
  fingerprints: DeviceFingerprint[]
  mitre_tactics?: string[]
  mitre_techniques?: string[]
  geo_origin?: GeoLocation
  notes?: string
  created_at: string
}

export interface GeoLocation {
  country: string
  country_code: string
  city?: string
  latitude?: number
  longitude?: number
}

export interface Alert {
  id: string
  tenant_id: string
  event_id: string
  severity: ThreatSeverity
  title: string
  description: string
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive'
  assigned_to?: string
  created_at: string
  resolved_at?: string
}

export interface AnomalyScore {
  id: string
  tenant_id: string
  entity_type: 'user' | 'device' | 'ip'
  entity_id: string
  score: number // 0-100
  baseline_deviation: number
  model: string
  timestamp: string
}

export interface UsageSnapshot {
  id: string
  tenant_id: string
  snapshot_date: string
  event_count: number
  alert_count: number
  sensor_count: number
  user_count: number
  created_at: string
}
