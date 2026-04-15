-- Anomaly Grid — Core Schema
-- AI Cybersecurity SaaS Platform by Intellusia Studios

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- TENANTS
-- ─────────────────────────────────────────
create table tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#3b82f6',
  custom_domain text unique,
  plan text check (plan in ('starter','pro','enterprise')) default 'starter',
  status text check (status in ('active','trial','suspended','churned')) default 'trial',
  trial_ends_at timestamptz,
  mrr_cents integer default 0,
  notes text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null check (role in ('admin','analyst','viewer')),
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PLATFORM ADMINS (Intellusia operators)
-- ─────────────────────────────────────────
create table platform_admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- SENSORS (edge agents deployed at client sites)
-- ─────────────────────────────────────────
create table sensors (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hostname text not null,
  ip_address text,
  location text,
  status text check (status in ('online','offline','degraded')) default 'offline',
  last_seen timestamptz,
  version text,
  cert_fingerprint text unique,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- DEVICE FINGERPRINTS
-- ─────────────────────────────────────────
create table device_fingerprints (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  src_ip text not null,
  os_family text,
  os_version text,
  device_type text,
  user_agent text,
  behavior_signature text,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  connection_count integer default 1
);

-- ─────────────────────────────────────────
-- THREAT ACTORS
-- ─────────────────────────────────────────
create table threat_actors (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  name text not null,
  aliases text[],
  severity text check (severity in ('critical','high','medium','low','info')),
  confidence text check (confidence in ('confirmed','high','medium','low')),
  source_ips text[],
  geo_country text,
  geo_country_code text,
  geo_city text,
  geo_lat numeric,
  geo_lon numeric,
  mitre_tactics text[],
  mitre_techniques text[],
  event_count integer default 0,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  notes text,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- THREAT EVENTS
-- ─────────────────────────────────────────
create table threat_events (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  sensor_id uuid references sensors(id),
  timestamp timestamptz default now(),
  src_ip text not null,
  dst_ip text,
  src_port integer,
  dst_port integer,
  protocol text,
  severity text check (severity in ('critical','high','medium','low','info')),
  category text check (category in ('malware','c2','scan','brute_force','phishing','lateral_movement','exfiltration','unknown')),
  description text,
  fingerprint_id uuid references device_fingerprints(id),
  actor_id uuid references threat_actors(id),
  mitre_tactics text[],
  mitre_techniques text[],
  raw_log jsonb,
  acknowledged boolean default false,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ALERTS
-- ─────────────────────────────────────────
create table alerts (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  event_id uuid references threat_events(id),
  severity text check (severity in ('critical','high','medium','low','info')),
  title text not null,
  description text,
  status text check (status in ('open','acknowledged','resolved','false_positive')) default 'open',
  assigned_to uuid references users(id),
  created_at timestamptz default now(),
  resolved_at timestamptz
);

-- ─────────────────────────────────────────
-- ANOMALY SCORES (DFP output)
-- ─────────────────────────────────────────
create table anomaly_scores (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  entity_type text check (entity_type in ('user','device','ip')),
  entity_id text not null,
  score numeric(5,2) not null,
  baseline_deviation numeric(5,2),
  model text,
  timestamp timestamptz default now()
);

-- ─────────────────────────────────────────
-- USAGE SNAPSHOTS (daily rollup per tenant)
-- ─────────────────────────────────────────
create table usage_snapshots (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  snapshot_date date not null default current_date,
  event_count integer default 0,
  alert_count integer default 0,
  sensor_count integer default 0,
  user_count integer default 0,
  created_at timestamptz default now(),
  unique(tenant_id, snapshot_date)
);

-- ─────────────────────────────────────────
-- AUDIT LOG
-- ─────────────────────────────────────────
create table audit_log (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  user_id uuid references users(id),
  action text not null,
  table_name text not null,
  record_id uuid,
  changes jsonb,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- PLATFORM EVENTS
-- ─────────────────────────────────────────
create table platform_events (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references tenants(id) on delete set null,
  event_type text not null,
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- ─────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────
alter table users enable row level security;
alter table sensors enable row level security;
alter table device_fingerprints enable row level security;
alter table threat_actors enable row level security;
alter table threat_events enable row level security;
alter table alerts enable row level security;
alter table anomaly_scores enable row level security;
alter table audit_log enable row level security;

create policy "tenant_isolation" on users for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on sensors for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on device_fingerprints for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on threat_actors for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on threat_events for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on alerts for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on anomaly_scores for all using (tenant_id = (select tenant_id from users where id = auth.uid()));
create policy "tenant_isolation" on audit_log for all using (tenant_id = (select tenant_id from users where id = auth.uid()));

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
create index idx_threat_events_tenant on threat_events(tenant_id);
create index idx_threat_events_timestamp on threat_events(timestamp desc);
create index idx_threat_events_severity on threat_events(severity);
create index idx_threat_events_src_ip on threat_events(src_ip);
create index idx_threat_actors_tenant on threat_actors(tenant_id);
create index idx_alerts_tenant on threat_events(tenant_id);
create index idx_alerts_status on alerts(status);
create index idx_anomaly_scores_tenant on anomaly_scores(tenant_id);
create index idx_anomaly_scores_entity on anomaly_scores(entity_type, entity_id);
create index idx_sensors_tenant on sensors(tenant_id);
create index idx_device_fp_tenant on device_fingerprints(tenant_id);
create index idx_device_fp_ip on device_fingerprints(src_ip);
create index idx_audit_log_tenant on audit_log(tenant_id);
create index idx_audit_log_created on audit_log(created_at desc);

-- ─────────────────────────────────────────
-- HELPER VIEW: tenant summary for mission control
-- ─────────────────────────────────────────
create or replace view tenant_summary as
select
  t.id,
  t.name,
  t.slug,
  t.plan,
  t.status,
  t.mrr_cents,
  t.created_at,
  count(distinct u.id) as user_count,
  count(distinct s.id) as sensor_count,
  count(distinct te.id) as event_count_30d,
  count(distinct a.id) as open_alert_count
from tenants t
left join users u on u.tenant_id = t.id
left join sensors s on s.tenant_id = t.id
left join threat_events te on te.tenant_id = t.id and te.timestamp > now() - interval '30 days'
left join alerts a on a.tenant_id = t.id and a.status = 'open'
group by t.id;
