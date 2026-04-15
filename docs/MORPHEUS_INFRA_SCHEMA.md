# SaaS Cybersecurity Platform — Infrastructure Schema
## Built on NVIDIA Morpheus AI Framework

**Author:** Intellusia Studios  
**Version:** 1.0  
**Date:** 2026-04-15  
**Classification:** Internal Architecture Document

---

## Executive Summary

This schema defines a multi-tenant, AI-driven network security SaaS platform using NVIDIA Morpheus as the core inference and pipeline engine. The architecture is layered: lightweight edge sensors deployed at client sites stream telemetry to a cloud SaaS backend for AI-powered threat analysis, behavioral fingerprinting, and actor profiling — all surfaced per-tenant in an isolated dashboard.

---

## Layer Architecture (7 Layers)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  LAYER 7 │  FRONTEND          Multi-tenant React Dashboard + Admin CP   │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 6 │  API GATEWAY       REST/gRPC + Auth + Tenant Routing         │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 5 │  INFERENCE         NVIDIA Morpheus Pipelines + Triton Server │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 4 │  STREAM PIPELINE   Kafka / Redpanda + Schema Registry        │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 3 │  STORAGE           TimeSeries DB + Object Store + SIEM Bus   │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 2 │  TRANSPORT         mTLS Telemetry Relay + Edge Buffer        │
├─────────────────────────────────────────────────────────────────────────┤
│  LAYER 1 │  EDGE SENSOR       On-prem Agent (passive tap + DPI)         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Layer 1 — Edge Sensor (Client On-Prem)

### Purpose
Passive network monitoring at the client site. Zero-trust footprint — read-only tap, never inline.

### Components

| Component | Technology | Role |
|---|---|---|
| Network Tap | SPAN port / TAP hardware | Passive packet capture |
| Packet Capture Engine | PF_RING + Zeek | Deep packet inspection, flow extraction |
| Log Aggregator | Fluent Bit | Syslog, Windows Event, NetFlow ingestion |
| Edge Buffer | Redpanda (single-node) | Local queue for offline/air-gap operation |
| Edge Inference (optional) | Morpheus Pipeline (lite) + Triton | Local inference when cloud connectivity unavailable |
| Sensor Agent | Custom Go binary | Orchestrates capture, serializes to Protobuf/Avro, manages relay |
| Secure Relay | WireGuard tunnel or mTLS gRPC | Encrypted telemetry to cloud backend |

### Data Produced
- Raw flow records (NetFlow v9 / IPFIX)
- Zeek logs (conn.log, dns.log, http.log, ssl.log, files.log, weird.log)
- Host telemetry (Windows/Linux event logs)
- PCAP samples (flagged sessions only — configurable)

### Air-Gap / Offline Mode
- Redpanda edge buffer holds up to configurable retention (default 72h)
- Local Morpheus pipeline runs DFP model on-prem
- Findings stored locally, synced to cloud when connectivity restores
- No cloud dependency for core detection — cloud adds enrichment + cross-tenant intelligence

### GPU Requirements (Edge)
- **Standard deployment:** CPU-only (no GPU required at edge)
- **Edge inference mode:** NVIDIA T4 or RTX 3000 series (16GB VRAM minimum)
- **Air-gapped federal/defense:** NVIDIA A2 (10GB, low-power, PCIe, export-compliant)

---

## Layer 2 — Transport

### Purpose
Secure, authenticated telemetry relay from edge to cloud. Enforces per-tenant isolation at the wire level.

### Components

| Component | Technology | Role |
|---|---|---|
| Mutual TLS Relay | gRPC + mTLS (client cert per tenant) | Authenticated encrypted transport |
| Edge VPN (alt) | WireGuard | Site-to-site tunnel for legacy sensor deployments |
| Relay Load Balancer | AWS NLB / Azure Load Balancer | Distribute inbound sensor connections |
| Tenant Authentication | Per-sensor X.509 cert + tenant JWT | Cryptographic tenant binding at transport layer |

### Tenant Isolation at Transport
- Each deployed sensor gets a unique X.509 client certificate signed by the platform CA
- Certificate CN encodes `tenant_id:sensor_id`
- Relay layer validates cert, extracts tenant context, tags all messages before enqueue
- No sensor can submit telemetry to another tenant's topic

---

## Layer 3 — Storage

### Purpose
Multi-tenant, time-series optimized storage for events, findings, and threat actor profiles.

### Components

| Component | Technology | Justification |
|---|---|---|
| Time-Series Events DB | ClickHouse (cloud-hosted) | Column-oriented, blazing fast on security event queries, native TTL policies |
| Threat Actor Profiles | PostgreSQL (per-tenant schema) | Relational, structured actor + fingerprint data |
| Raw Log Archive | S3 / Azure Blob (object storage) | Long-term retention, compliance, SIEM export |
| Vector Store | Weaviate or pgvector | Embedding storage for behavioral fingerprint similarity search |
| Cache Layer | Redis | Real-time alert state, active session context |
| SIEM Export Bus | Kafka topic → Logstash → CEF/STIX | Feeds external SIEM tools (Splunk, Sentinel, QRadar) |

### Multi-Tenant Isolation in Storage
- ClickHouse: every table has `tenant_id` column + row policies enforced at query layer
- PostgreSQL: separate schema per tenant, connection pools isolated by tenant
- S3/Blob: separate bucket prefix per tenant (`s3://bucket/tenant_id/...`), IAM policies scoped per tenant
- Redis: key namespace prefix per tenant

---

## Layer 4 — Stream Pipeline

### Purpose
High-throughput message bus between edge sensors and the Morpheus inference layer.

### Component Choice: Redpanda over Kafka

| Factor | Kafka | Redpanda |
|---|---|---|
| Latency | ~5-10ms | ~1-2ms |
| Ops complexity | High (ZooKeeper/KRaft) | Low (single binary) |
| Kafka API compat | Native | Yes — drop-in |
| GPU pipeline integration | Via connector | Via connector |
| Cloud managed | MSK / Confluent | Redpanda Cloud |

**Decision: Redpanda** — lower latency, simpler ops, Kafka-compatible so Morpheus connectors work unchanged.

### Topics Architecture

```
morpheus.{tenant_id}.raw.flows          → Raw NetFlow/IPFIX records
morpheus.{tenant_id}.raw.zeek           → Zeek log events
morpheus.{tenant_id}.raw.host           → Host telemetry
morpheus.{tenant_id}.infer.fingerprint  → DFP model output
morpheus.{tenant_id}.infer.threat       → Threat classification results
morpheus.{tenant_id}.alerts             → Fired alert events
morpheus.platform.intel                 → Cross-tenant threat intel (anonymized)
```

### Schema Registry
- Confluent Schema Registry (Redpanda-compatible)
- Avro schemas for all message types
- Schema evolution enforced — no breaking changes without version bump

---

## Layer 5 — Inference Engine (Core: NVIDIA Morpheus)

### Purpose
AI-powered threat detection, behavioral fingerprinting, and actor profiling.

### NVIDIA Morpheus Component Mapping

| Morpheus Component | Layer | Function |
|---|---|---|
| **Morpheus Pipeline** | Orchestration | Defines and runs the full ML inference pipeline as a DAG |
| **Digital Fingerprinting (DFP)** | Behavioral AI | Baselines normal behavior per user/device, flags anomalies |
| **AppShield** | App-layer detection | Detects process injection, memory anomalies, malware in running apps |
| **Ransomware Detection Pipeline** | Threat classification | ML model for ransomware behavioral signatures |
| **Phishing Detection Pipeline** | Threat classification | NLP model on DNS/HTTP/email metadata |
| **Triton Inference Server** | Model serving | Serves all ML models with GPU acceleration (ONNX, TensorRT, PyTorch) |
| **Morpheus SDK** | Custom pipelines | Custom stages for actor profiling, fingerprint similarity |

### Inference Pipelines

**Pipeline 1: Digital Fingerprinting (DFP)**
```
Redpanda source → Morpheus DFP Stage → Autoencoder anomaly model (Triton)
→ Anomaly score → Actor profile update → Alert if score > threshold
→ Sink: ClickHouse + tenant alert topic
```

**Pipeline 2: Connection Fingerprinting**
```
Raw flow records → Feature extraction stage → Device/OS classifier (Triton)
→ p0f-style passive fingerprint → Behavior signature → Threat classification
→ Sink: PostgreSQL actor profile + alert topic
```

**Pipeline 3: Threat Actor Profiling**
```
Fingerprint stream → Entity resolution stage → Actor graph builder
→ TTP mapping (MITRE ATT&CK) → Threat score → Actor profile upsert
→ Sink: PostgreSQL + vector store (for similarity search)
```

**Pipeline 4: SIEM Export**
```
Alert topic → CEF/STIX/JSON formatter → S3 archive + Logstash
→ External SIEM (Splunk, Sentinel, QRadar, Elastic)
```

### Triton Inference Server Models

| Model | Framework | Function |
|---|---|---|
| DFP Autoencoder | PyTorch / ONNX | Behavioral anomaly detection |
| Device Classifier | XGBoost / ONNX | OS + device type fingerprinting |
| Threat Classifier | FIL (Forest) | Malware / C2 / scan classification |
| NLP Phishing | Transformer (ONNX) | Phishing detection in DNS/HTTP |
| Embedding Model | Sentence-BERT | Behavioral similarity vectors |

### GPU Requirements (Cloud Inference)
- **Minimum:** 2x NVIDIA A10G (24GB VRAM each) — handles up to ~50 tenants
- **Recommended:** 2x NVIDIA A100 (40GB VRAM) — up to ~200 tenants
- **Scale-out:** Kubernetes GPU node pools with Triton horizontal scaling
- **Cloud:** AWS `p3.2xlarge` (V100) to start; scale to `p4d.24xlarge` (A100 x8)

---

## Layer 6 — API Gateway

### Purpose
Authenticated, tenant-isolated API layer between the inference/storage backend and the frontend dashboard.

### Components

| Component | Technology | Role |
|---|---|---|
| API Gateway | Kong or AWS API Gateway | Rate limiting, auth middleware, routing |
| Auth Service | Keycloak or Auth0 | OAuth2/OIDC, per-tenant SSO, RBAC |
| Backend API | FastAPI (Python) | Core REST endpoints, tenant context injection |
| gRPC Services | Python gRPC | High-throughput internal services (pipeline control, model mgmt) |
| Tenant Resolver | Custom middleware | Extracts tenant from JWT, scopes all DB queries |
| Audit Logger | Structured logging → ClickHouse | Every API call logged with tenant context |

### Tenant Isolation at API Layer
- JWT contains `tenant_id` claim — signed by auth service
- Every backend service validates JWT and scopes queries with `tenant_id`
- No cross-tenant data access possible — enforced at middleware, DB, and storage layers (defense in depth)

---

## Layer 7 — Frontend Dashboard

### Components

| Component | Technology | Role |
|---|---|---|
| Client Dashboard | Next.js + Tailwind + Recharts | Per-tenant threat visibility UI |
| Mission Control | Next.js (dark theme) | Platform admin — all tenants, usage, health |
| Real-time Updates | WebSocket (via API) or SSE | Live alert feed, active threat stream |
| Map View | Mapbox GL or Leaflet | Geo-plot of attack origins |
| Actor Profile View | Custom React | Threat actor timeline, TTPs, fingerprints |
| Alert Management | Custom React | Triage, acknowledge, escalate alerts |
| SIEM Config | Settings UI | Configure export format, destination, schedule |

### Dashboard Features Per Tenant
- Live connection feed with device/OS fingerprint
- Threat actor profiles (persistent across sessions)
- Alert timeline with MITRE ATT&CK TTP tags
- Behavioral anomaly heatmap (DFP output)
- Geo-origin map of inbound connection attempts
- SIEM export config + download

---

## Data Flow Diagram

```
CLIENT SITE (on-prem)
─────────────────────────────────────────────────────────
 Network Traffic
      │
      ▼
 [SPAN Port / TAP]
      │
      ▼
 [Zeek + PF_RING]  ←── Passive DPI, flow extraction
      │
      ▼
 [Fluent Bit]  ←── Host logs, syslog, events
      │
      ▼
 [Edge Buffer: Redpanda]  ←── Local queue (air-gap hold)
      │
      │  (offline: local Morpheus lite pipeline runs here)
      │  (online: relay to cloud)
      │
      ▼
 [Sensor Agent: Go binary]
      │
      │  mTLS gRPC / WireGuard tunnel
      │  (tenant cert authenticates at transport)
      ▼

CLOUD BACKEND (AWS / Azure)
─────────────────────────────────────────────────────────
 [Relay Load Balancer]
      │
      ▼
 [Redpanda Cloud]  ←── Per-tenant topics
      │
      ├──────────────────────────────────────────┐
      ▼                                          ▼
 [Morpheus Pipeline]                    [Raw Archive → S3]
  DFP + Fingerprint + Threat
      │
      ▼
 [Triton Inference Server]  ←── GPU-accelerated models
  (DFP Autoencoder, Device Classifier,
   Threat Classifier, NLP, Embeddings)
      │
      ├─────────────────────────────────────────────────┐
      ▼                                                 ▼
 [ClickHouse]                                   [PostgreSQL]
  Time-series events                     Actor profiles, fingerprints
  Alert history                          Tenant config, RBAC
  Usage metrics
      │
      ▼
 [Redis Cache]  ←── Active alert state, session context
      │
      ▼
 [FastAPI Backend]
      │
      ├──────────────────┐
      ▼                  ▼
 [REST API]         [SIEM Export]
      │              CEF / STIX / JSON
      │              → Splunk / Sentinel / QRadar
      ▼
 [API Gateway: Kong]
  Auth (JWT), rate limit, tenant routing
      │
      ▼
 [Next.js Dashboard]
  Per-tenant threat visibility
  Mission Control (platform admin)
```

---

## Multi-Tenancy Model

### Isolation Layers (Defense in Depth)

| Layer | Isolation Mechanism |
|---|---|
| Transport | Per-sensor X.509 cert with embedded tenant_id |
| Message Bus | Per-tenant Redpanda topics |
| Inference | Morpheus pipeline instances tagged by tenant_id |
| Storage (ClickHouse) | Row-level policies on tenant_id column |
| Storage (PostgreSQL) | Separate schema per tenant |
| Storage (S3) | Separate prefix + scoped IAM policies |
| API | JWT tenant claim, middleware enforcement |
| Frontend | Tenant resolved from subdomain or JWT |

### Tenant Onboarding Flow
1. Create tenant record in platform DB
2. Generate unique X.509 sensor cert (signed by platform CA)
3. Provision Redpanda topics for tenant
4. Deploy sensor package to client site (Docker container or bare metal)
5. Sensor establishes mTLS tunnel using cert
6. Tenant dashboard provisioned at `client.platform.com`

---

## SIEM Integration

| Format | Use Case | Export Method |
|---|---|---|
| **CEF** (Common Event Format) | ArcSight, Splunk legacy | Syslog forwarding via Logstash |
| **STIX/TAXII 2.1** | Threat intel sharing, ISACs | REST API push to TAXII server |
| **JSON (custom)** | Elastic, custom pipelines | Kafka topic → webhook |
| **CSV/PDF** | Compliance reporting | Scheduled export via dashboard |
| **QRadar DSM** | IBM QRadar | Log Source extension |

---

## GPU Requirements Summary

| Deployment | Hardware | Workload |
|---|---|---|
| Edge (CPU-only) | None | Packet capture, Zeek, log shipping |
| Edge (local inference) | NVIDIA T4 or A2 | Lite DFP pipeline, local classification |
| Air-gapped federal | NVIDIA A2 (PCIe, low-power) | Full local Morpheus + Triton |
| Cloud inference (starter) | 2x A10G (24GB) | Up to ~50 active tenants |
| Cloud inference (scale) | 4x A100 (40GB) | Up to ~500 active tenants |
| Cloud inference (enterprise) | Multi-node GPU cluster | Kubernetes + Triton horizontal scale |

---

## Gaps & Hard Constraints

### 1. NVIDIA Morpheus Requires GPU
- Morpheus is not CPU-only. Cloud inference layer **must** have GPU instances.
- Edge CPU-only mode is possible but requires shipping models via ONNX and running a stripped Triton.
- Cost implication: GPU cloud instances are expensive — factor into per-tenant pricing.

### 2. Morpheus Model Training
- DFP requires **per-entity baseline training** — 1-2 weeks of normal traffic before it's useful.
- New tenant onboarding will have a "learning period" — alert fidelity is low until baseline is established.
- Solution: pre-trained general models at onboarding, DFP personalizes over time.

### 3. Air-Gap / Data Residency
- Full air-gap mode requires shipping model weights to client site.
- Model updates (new threat signatures) require a secure update mechanism — cannot auto-pull.
- Federal/defense clients may require FedRAMP-authorized cloud regions + ITAR compliance on model distribution.

### 4. Zeek at Scale
- Zeek is single-threaded per interface. High-bandwidth links (10Gbps+) require PF_RING + multi-core Zeek cluster or Zeek on a flow exporter.
- Alternative for high-throughput: replace Zeek with Suricata (multi-threaded) for flow + IDS combo.

### 5. Redpanda Topic Sprawl
- Per-tenant topic architecture creates many topics at scale (6 topics × N tenants).
- At 1,000 tenants = 6,000 topics. Redpanda handles this well; Kafka starts struggling above ~10k partitions.
- Mitigation: topic-per-tier grouping at large scale (shared topics with tenant_id in message key).

### 6. Triton Model Versioning
- Model updates must be rolled out carefully — a bad model update affects all tenants using it.
- Solution: blue/green model deployment in Triton, per-tenant model version config for enterprise clients.

### 7. STIX/TAXII Operational Cost
- Maintaining a TAXII server for threat intel sharing is non-trivial ops.
- Recommend partnering with an existing ISAC (e.g., MS-ISAC, FS-ISAC) for STIX feeds rather than running your own TAXII server initially.

### 8. Passive Tap Access at Client Site
- Requires physical or virtual SPAN port access to network switch.
- Some clients (especially SMB) won't have a managed switch that supports SPAN.
- Solution: offer a "host-based sensor" mode (agent installed on a gateway/firewall) as fallback.

---

## Recommended Cloud Stack

| Layer | AWS | Azure (alt) |
|---|---|---|
| Compute | EKS (Kubernetes) | AKS |
| GPU Instances | p3.2xlarge → p4d.24xlarge | NC-series (A100) |
| Message Bus | Redpanda Cloud | Redpanda Cloud |
| Object Storage | S3 | Azure Blob |
| Time-Series DB | ClickHouse Cloud (self-hosted on EC2) | Same |
| Auth | Cognito or Auth0 | Entra ID (Azure AD) |
| CDN / Edge | CloudFront | Azure CDN |
| Secrets | AWS Secrets Manager | Azure Key Vault |
| Monitoring | Datadog or Grafana Cloud | Same |

---

## Next Steps (Build Sequence)

1. **Phase 1 — Foundation**
   - Redpanda cluster + schema registry
   - Sensor agent (Go) + Zeek integration
   - mTLS transport + tenant cert authority
   - ClickHouse + PostgreSQL (multi-tenant schema)

2. **Phase 2 — Inference**
   - Triton Inference Server on GPU instance
   - Morpheus DFP pipeline (first model)
   - Device/OS fingerprinting pipeline
   - Alert generation + storage

3. **Phase 3 — Dashboard**
   - FastAPI backend + Kong gateway
   - Next.js tenant dashboard
   - Mission Control
   - Real-time WebSocket alert feed

4. **Phase 4 — SIEM + Compliance**
   - CEF/STIX export pipelines
   - Audit logging
   - Scheduled reports + PDF export

5. **Phase 5 — Air-Gap / Federal**
   - Edge Triton deployment
   - Offline model update mechanism
   - FedRAMP alignment
