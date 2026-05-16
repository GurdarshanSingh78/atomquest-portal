# 🌌 Nexus Tracker
### Next-Gen Enterprise Goal Management Portal

> **AtomQuest Hackathon 1.0** · Built by [Gurdarshan Singh](https://github.com/GurdarshanSingh78)

[![Next.js](https://img.shields.io/badge/Next.js-RSC-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Python](https://img.shields.io/badge/API-Python%20Serverless-3776AB?style=flat-square&logo=python)](https://python.org)
[![Azure AD](https://img.shields.io/badge/SSO-Microsoft%20Entra%20ID-0078D4?style=flat-square&logo=microsoftazure)](https://azure.microsoft.com)

---

## 💡 What is Nexus Tracker?

Traditional corporate performance systems are plagued by visibility gaps, misaligned KPIs, and slow appraisal cycles. **Nexus Tracker** eliminates all of that — a serverless, cost-optimized platform that unifies goal setting, progress tracking, and compliance management across Employees, Managers, and Admins in one seamless loop.

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React Server Components) + mobile-first utility CSS |
| Theme Engine | Context Provider with Light/Dark state persistence |
| Backend API | Python Serverless Micro-Functions (`/api`) — zero idle billing |
| Database | Supabase · PostgreSQL (serverless, relational) |
| Auth | Microsoft Entra ID (Azure AD) SSO Simulation |

---

## ✨ Feature Highlights

### 🎯 Phase 1 — Goal Architecture
- **Smart Guardrails** — Enforces exactly `100%` total weightage, `10%` minimum per goal, and a cap of `8` goals per employee — on both client and backend.
- **Manager Override Console** — L1 Managers can edit weightage and targets inline before approving.
- **Shared KPI Broadcast** — Executives can push goals to teams simultaneously. Child clones lock Title & Target; only weightage is editable downstream.

### 📊 Phase 2 — Telemetry & Scoring Engine
- **Quarterly Isolation** — Strict Q1–Q4 reporting windows via dropdown controllers.
- **Performance Score Formulas:**
  - *Higher is Better →* `Achievement ÷ Target`
  - *Lower is Better →* `Target ÷ Achievement`
  - *Date-Based →* Automated deadline-to-realization matching
  - *Incident Tracker →* Binary logic — `0 incidents = 100%`, any breach = `0%`

### 🔐 Phase 3 — Governance & Bonus Modules
- **Immutable Audit Trail** — Every post-lock change logs user identity, description, and timestamp permanently.
- **Azure AD SSO** — Token claims auto-configure roles, hierarchies, and reporting chains.
- **Escalation Engine** — Stalled pipelines auto-escalate: Employee → Manager → HR.
- **CSV Export** — One-click performance report generation from multi-table schemas.

---

## 🗄️ Database Schema

```sql
users       → id, full_name, email, role (Employee|Manager|Admin), manager_id
goals       → id, user_id, parent_goal_id, title, thrust_area, target, weightage, is_locked, is_shared
check_ins   → id, goal_id, quarter (Q1–Q4), actual_achievement, progress_score, manager_comment
audit_logs  → id, goal_id, changed_by, change_description, changed_at
```

---

## 🚀 Local Setup

```bash
# 1. Clone & enter project
git clone https://github.com/GurdarshanSingh78/nexus-tracker.git
cd nexus-tracker

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Set SUPABASE_URL and SUPABASE_KEY in .env.local

# 4. Start dev server
npm run dev
```

---

## 🧭 Role Navigation

| Role | Route | Access |
|---|---|---|
| Employee | `/employee` | Goal setup, KPI view, quarterly check-ins |
| Manager | `/manager` | Team approvals, inline edits, check-in comments |
| Admin | `/admin` | Audit logs, escalations, system oversight |

---

*Built for the AtomQuest 1.0 Hackathon · © 2024 Gurdarshan Singh*