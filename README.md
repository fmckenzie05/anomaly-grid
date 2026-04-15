# Anomaly Grid

**AI-Powered Cybersecurity SaaS Platform**  
Built by Intellusia Studios

> Real-time network monitoring, threat fingerprinting, and actor profiling — powered by NVIDIA Morpheus.

---

## Project Structure

```
anomaly_grid/
├── dashboard/              # Next.js frontend (tenant + mission control)
├── api/                    # FastAPI backend
├── sensor/                 # Edge sensor agent (Go)
├── pipelines/              # Morpheus ML inference pipelines
├── infra/                  # Docker, K8s, Terraform configs
├── supabase/               # DB migrations & RLS policies
├── docs/                   # Architecture, PRD, runbooks
└── README.md
```

## Quick Start

```bash
cd dashboard && npm install && npm run dev
cd api && pip install -r requirements.txt && uvicorn main:app --reload
```

## Architecture

See `docs/MORPHEUS_INFRA_SCHEMA.md` for full infrastructure design.

## License

Proprietary — Intellusia Studios
