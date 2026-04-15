"""
Anomaly Grid — FastAPI Backend
AI Cybersecurity SaaS Platform by Intellusia Studios
"""
import sys
sys.path.insert(0, './lib')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import random

app = FastAPI(
    title="Anomaly Grid API",
    description="AI-powered cybersecurity platform backend",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.anomalygrid.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───

class TenantInfo(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    status: str
    sensor_count: int
    event_count_24h: int
    alert_count: int

class ThreatEvent(BaseModel):
    id: str
    timestamp: str
    src_ip: str
    dst_ip: str
    dst_port: int
    protocol: str
    severity: str
    category: str
    description: str
    os_fingerprint: Optional[str] = None
    actor_name: Optional[str] = None
    acknowledged: bool = False

class ThreatActor(BaseModel):
    id: str
    name: str
    severity: str
    confidence: str
    source_ips: list[str]
    country: str
    event_count: int
    mitre_tactics: list[str]
    first_seen: str
    last_seen: str

class SensorInfo(BaseModel):
    id: str
    hostname: str
    ip_address: str
    location: str
    status: str
    last_seen: str
    version: str

class DashboardStats(BaseModel):
    threats_24h: int
    critical: int
    active_actors: int
    sensors_online: int
    anomaly_score: float
    events_per_min: int

class AlertInfo(BaseModel):
    id: str
    severity: str
    title: str
    description: str
    status: str
    created_at: str

# ─── Mock Data Generator ───

def _mock_ips():
    return [f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}" for _ in range(random.randint(1,5))]

MOCK_ACTORS = [
    ThreatActor(id="1", name="APT-SHADOW-7", severity="critical", confidence="confirmed",
                source_ips=["185.220.101.34","185.220.101.35"], country="RU", event_count=234,
                mitre_tactics=["Reconnaissance","Initial Access","C2"],
                first_seen="2026-03-28T00:00:00Z", last_seen="2026-04-15T04:00:00Z"),
    ThreatActor(id="2", name="SCAN-CLUSTER-44", severity="high", confidence="high",
                source_ips=["45.155.205.233"], country="CN", event_count=156,
                mitre_tactics=["Reconnaissance","Discovery"],
                first_seen="2026-04-01T00:00:00Z", last_seen="2026-04-15T03:40:00Z"),
    ThreatActor(id="3", name="BF-GROUP-12", severity="high", confidence="high",
                source_ips=["193.42.33.14","193.42.33.15","193.42.33.16"], country="IR", event_count=89,
                mitre_tactics=["Initial Access","Credential Access"],
                first_seen="2026-04-05T00:00:00Z", last_seen="2026-04-15T03:15:00Z"),
    ThreatActor(id="4", name="RECON-NODE-9", severity="medium", confidence="medium",
                source_ips=["103.75.201.2"], country="KP", event_count=32,
                mitre_tactics=["Reconnaissance"],
                first_seen="2026-04-10T00:00:00Z", last_seen="2026-04-15T02:50:00Z"),
]

MOCK_SENSORS = [
    SensorInfo(id="1", hostname="edge-sensor-01", ip_address="10.0.1.10", location="HQ", status="online", last_seen="2026-04-15T04:20:00Z", version="1.0.0"),
    SensorInfo(id="2", hostname="edge-sensor-02", ip_address="10.0.2.10", location="DC-East", status="online", last_seen="2026-04-15T04:19:00Z", version="1.0.0"),
    SensorInfo(id="3", hostname="edge-sensor-03", ip_address="10.0.3.10", location="Branch-ATL", status="degraded", last_seen="2026-04-15T03:45:00Z", version="0.9.8"),
    SensorInfo(id="4", hostname="edge-sensor-04", ip_address="10.0.4.10", location="Remote", status="offline", last_seen="2026-04-14T22:00:00Z", version="0.9.5"),
]

CATEGORIES = ["malware", "c2", "scan", "brute_force", "phishing", "lateral_movement", "exfiltration"]
SEVERITIES = ["critical", "high", "high", "medium", "medium", "medium", "low", "low", "low", "info"]
OS_FPS = ["Linux 5.x", "Windows 10", "Windows 11", "macOS 14", "FreeBSD 13", "Unknown"]

def _gen_event(i: int) -> ThreatEvent:
    ts = datetime.utcnow() - timedelta(minutes=random.randint(0, 1440))
    cat = random.choice(CATEGORIES)
    sev = random.choice(SEVERITIES)
    return ThreatEvent(
        id=str(i),
        timestamp=ts.isoformat() + "Z",
        src_ip=f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
        dst_ip="10.0.1.50",
        dst_port=random.choice([22, 80, 443, 3389, 8080, 53, 445]),
        protocol=random.choice(["TCP", "UDP"]),
        severity=sev,
        category=cat,
        description=f"{cat.replace('_',' ').title()} detected on port {random.randint(1,65535)}",
        os_fingerprint=random.choice(OS_FPS),
        actor_name=random.choice([None, None, "APT-SHADOW-7", "SCAN-CLUSTER-44", "BF-GROUP-12"]),
        acknowledged=random.random() > 0.8,
    )

# ─── Routes ───

@app.get("/")
def root():
    return {"name": "Anomaly Grid API", "version": "0.1.0", "status": "online"}

@app.get("/api/health")
def health():
    return {
        "api": "online",
        "database": "online",
        "inference_pipeline": "online",
        "triton_server": "online",
    }

@app.get("/api/dashboard/stats", response_model=DashboardStats)
def dashboard_stats():
    return DashboardStats(
        threats_24h=random.randint(30, 80),
        critical=random.randint(1, 8),
        active_actors=len(MOCK_ACTORS),
        sensors_online=sum(1 for s in MOCK_SENSORS if s.status == "online"),
        anomaly_score=round(random.uniform(40, 95), 1),
        events_per_min=random.randint(200, 500),
    )

@app.get("/api/events", response_model=list[ThreatEvent])
def list_events(limit: int = 50, severity: Optional[str] = None):
    events = [_gen_event(i) for i in range(limit)]
    events.sort(key=lambda e: e.timestamp, reverse=True)
    if severity:
        events = [e for e in events if e.severity == severity]
    return events

@app.get("/api/events/{event_id}", response_model=ThreatEvent)
def get_event(event_id: str):
    return _gen_event(int(event_id))

@app.post("/api/events/{event_id}/acknowledge")
def acknowledge_event(event_id: str):
    return {"id": event_id, "acknowledged": True}

@app.get("/api/actors", response_model=list[ThreatActor])
def list_actors():
    return MOCK_ACTORS

@app.get("/api/actors/{actor_id}", response_model=ThreatActor)
def get_actor(actor_id: str):
    actor = next((a for a in MOCK_ACTORS if a.id == actor_id), None)
    if not actor:
        raise HTTPException(status_code=404, detail="Actor not found")
    return actor

@app.get("/api/sensors", response_model=list[SensorInfo])
def list_sensors():
    return MOCK_SENSORS

@app.get("/api/sensors/{sensor_id}", response_model=SensorInfo)
def get_sensor(sensor_id: str):
    sensor = next((s for s in MOCK_SENSORS if s.id == sensor_id), None)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@app.get("/api/alerts", response_model=list[AlertInfo])
def list_alerts(status: Optional[str] = None):
    alerts = [
        AlertInfo(id="1", severity="critical", title="C2 beacon detected from 185.220.101.34",
                  description="Encrypted callback to known Tor exit node every 30s", status="open", created_at="2026-04-15T04:10:00Z"),
        AlertInfo(id="2", severity="high", title="Port scan from 45.155.205.233",
                  description="Masscan-style sweep hitting 10k+ ports in 60s", status="open", created_at="2026-04-15T03:55:00Z"),
        AlertInfo(id="3", severity="high", title="RDP brute force from BF-GROUP-12",
                  description="500+ failed login attempts on port 3389", status="acknowledged", created_at="2026-04-15T03:30:00Z"),
        AlertInfo(id="4", severity="medium", title="DNS tunnel detected",
                  description="High entropy TXT queries to suspicious domain", status="open", created_at="2026-04-15T02:15:00Z"),
        AlertInfo(id="5", severity="low", title="New device fingerprint",
                  description="Previously unseen macOS 14 device connecting from VPN range", status="resolved", created_at="2026-04-15T01:00:00Z"),
    ]
    if status:
        alerts = [a for a in alerts if a.status == status]
    return alerts

@app.get("/api/mitre/coverage")
def mitre_coverage():
    return {
        "tactics": [
            {"name": "Reconnaissance", "event_count": 312, "pct": 85},
            {"name": "Initial Access", "event_count": 156, "pct": 60},
            {"name": "Command & Control", "event_count": 89, "pct": 45},
            {"name": "Credential Access", "event_count": 67, "pct": 35},
            {"name": "Lateral Movement", "event_count": 23, "pct": 20},
            {"name": "Exfiltration", "event_count": 12, "pct": 10},
        ]
    }

# ─── Mission Control Routes ───

@app.get("/api/mission-control/tenants", response_model=list[TenantInfo])
def mc_tenants():
    return [
        TenantInfo(id="1", name="Bravo Defense LLC", slug="bravo-defense", plan="enterprise", status="active", sensor_count=6, event_count_24h=12400, alert_count=3),
        TenantInfo(id="2", name="TacOps Logistics", slug="tacops", plan="pro", status="active", sensor_count=4, event_count_24h=8200, alert_count=1),
        TenantInfo(id="3", name="Pacific Supply Co", slug="pacific-supply", plan="pro", status="active", sensor_count=3, event_count_24h=5600, alert_count=0),
        TenantInfo(id="4", name="Meridian IT Group", slug="meridian-it", plan="starter", status="trial", sensor_count=2, event_count_24h=3100, alert_count=2),
        TenantInfo(id="5", name="Atlas Contracting", slug="atlas", plan="starter", status="active", sensor_count=1, event_count_24h=1200, alert_count=0),
    ]

@app.get("/api/mission-control/stats")
def mc_stats():
    return {
        "total_tenants": 12,
        "active_tenants": 10,
        "mrr": 18750,
        "arr": 225000,
        "total_sensors": 34,
        "total_events_24h": 45230,
        "critical_alerts": 7,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
