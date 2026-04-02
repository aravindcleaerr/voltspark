# VoltSpark — Brainstorm Notes

**Date:** 22 February 2026

---

## Core Insight

**Compliance is the medicine. The customer buys the cure — which is profit, safety, and growth.**

If VoltSpark only tracks compliance, it's a cost center. If VoltSpark shows money saved, risks avoided, and customers won — it becomes indispensable.

---

## Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Product scope | Multi-framework compliance suite | Biggest market, highest defensibility |
| Primary user | Consultants (who serve their clients) | B2B2C model; consultants are the distribution channel |
| Branding | VoltSpark as separate brand | Broader market appeal, not tied to one consulting firm |
| Frameworks (v1) | ZED + ISO 50001 + Electrical Safety | Core expertise areas of target consultants |
| Client access | Configurable per client | Flexible for different consultant-client relationships |
| Monetization | Figure out later | Focus on product-market fit first |
| Launch approach | Invitation-only, 3-5 beta consultants | Build trust, iterate on feedback |
| Timeline | 3-4 months for solid v1 | Quality over speed |

---

## The Value Chain (Flywheel)

```
Client saves money
    → Consultant's value is proven
        → Consultant gets more clients
            → More clients on VoltSpark
                → Better benchmarking data
                    → More value for everyone
```

---

## Customer-Value Features (The "Customer Wins" Layer)

### Money Features
1. **Energy Cost Dashboard** — Show ₹, not just kWh
2. **Savings Tracker** — Prove ROI of improvements and consultant fees
3. **ROI Calculator** — Pre-investment analysis (solar, VFD, LED, PF correction)
4. **Utility Bill Analyzer** — Find hidden penalties, optimize tariff usage
5. **Government Scheme Tracker** — Unlock free money from subsidies

### Safety Features
6. **Safety Risk Score** — Quantify liability in ₹, not just compliance checkboxes
7. **Inspection Checklists** — Configurable, photo evidence, corrective action triggers
8. **Incident Register** — Near-miss and accident tracking with RCA
9. **Certification Tracker** — Expiry alerts for licenses and test certificates

### Growth Features
10. **Vendor Qualification Proof** — Shareable compliance dashboard for OEM buyers
11. **Industry Benchmarking** — "You're at 2.3 kWh/kg, industry average is 1.8"
12. **Impact Report** — Annual executive summary proving total value delivered

### Consultant Productivity Features
13. **Baseline Assessment** — Structured onboarding for new client engagements
14. **Action Plans** — Proactive improvement roadmaps (not just reactive CAPA)
15. **Recurring Schedules** — Auto-generate monthly/quarterly tasks
16. **Pre-Audit Readiness Check** — Mock audit before the real one
17. **Template Library** — Reuse checklists, plans, and documents across clients
18. **Client Health Score** — Prioritize where to spend time
19. **Evidence Traceability** — One-click evidence package for auditors

---

## MSME Owner's Real Problems (What They Actually Care About)

| What keeps them up at night | VoltSpark feature that solves it |
|---------------------------|--------------------------------|
| "₹5L/month on electricity, don't know where it goes" | Energy Cost Dashboard |
| "OEM buyer wants ISO or they'll drop us" | Vendor Qualification + Compliance Tracking |
| "Had an electrical incident, is our wiring safe?" | Safety Risk Score + Inspections |
| "BESCOM charged ₹40K penalty for low power factor" | Utility Bill Analyzer |
| "Heard there's a ZED subsidy, don't know how to get it" | Government Scheme Tracker |
| "Spent ₹3L on VFD, was it worth it?" | Savings Tracker + ROI Calculator |
| "My competitor is cheaper, what am I doing wrong?" | Industry Benchmarking |

---

## Competitive Positioning

**No platform exists that combines:**
1. Energy cost analytics (₹-focused)
2. Multi-framework compliance (ZED + ISO + Safety)
3. Consultant-centric workflow (portfolio management)
4. Client outcome measurement (savings tracking)
5. Indian market specifics (BESCOM, ZED subsidy, CEA regulations)

All for independent consultants serving SME manufacturers.

---

## Architecture: B2B2C Platform

```
VoltSpark (Platform)
├── Consultant A (Akshaya Createch)
│   ├── Unnathi CNC       [ZED Bronze ✅] [ISO 50001 🔄] [Safety ✅]
│   ├── Toyoda Gosei       [ZED Silver 🔄] [Safety 🔄]
│   └── Kanoria Plastics   [ZED Bronze 🔄]
├── Consultant B
│   ├── Their Client 1
│   └── Their Client 2
└── Consultant C
    └── ...
```

Each consultant manages their own portfolio. Clients get access as configured.
Data is isolated between consultants (they can't see each other's clients).
VoltSpark team sees everything for support and analytics.
