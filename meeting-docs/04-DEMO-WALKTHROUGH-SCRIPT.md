# System Demo Walkthrough Script
## ZED Energy Management Compliance Suite
### Duration: 20-30 minutes

---

## Before the Demo

### Setup Checklist
- [ ] Laptop fully charged / plugged in
- [ ] App running (`cd /home/labpc/codeAI/unnathicnc/app && npm run dev`)
- [ ] Browser open at `http://localhost:3000`
- [ ] Browser zoom at 100% (or adjust for projector/screen size)
- [ ] Demo data seeded (fresh if possible: `npx prisma migrate reset --force`)
- [ ] Login credentials ready:
  - Admin: `sureshkumar@unnathicnc.com` / `unnathi123`
  - Manager: `sandeep@unnathicnc.com` / `unnathi123`
  - Employee: `rajesh@unnathicnc.com` / `unnathi123`

### Key Talking Points to Weave In
- "This is **your data**, on **your computer** — no cloud, no subscription"
- "Your team can start using this **today**"
- "Every screen you see becomes **evidence for the ZED assessor**"
- "The system **automatically detects** when something is off"

---

## Demo Flow

### Step 1: Login (1 minute)
**Action:** Open browser → Login page appears

**Say:**
> "The system is password-protected with role-based access. Let me log in as Suresh Kumar — the Admin. Different users see different things based on their role."

**Action:** Enter `sureshkumar@unnathicnc.com` / `unnathi123` → Click Login

**Point out:**
- Clean, professional login screen
- Company branding (Unnathi CNC name visible)

---

### Step 2: Dashboard Overview (3-4 minutes)
**Action:** Dashboard loads after login

**Say:**
> "This is your command center. At a glance, you can see how ready you are for the ZED assessment."

**Point out each section:**

1. **ZED Compliance Score** (the big number/ring)
   > "This score tells you overall readiness. We calculate it from 5 factors — the exact 5 things the ZED assessor checks. Right now it shows X% — our goal is to get this above 80%."

2. **Stat Cards** (Energy Sources, Active Targets, etc.)
   > "Quick numbers — how many energy sources registered, active targets, training completion rate, open CAPAs."

3. **Deviation Alerts** (if visible)
   > "These are automatic alerts. When daily consumption deviates more than 10% from your target, the system flags it in yellow. More than 20% — it goes red and recommends a CAPA. No manual checking needed."

4. **Charts** (if visible)
   > "Visual trends so management can see patterns at a glance."

**Key message:**
> "An assessor walking in and seeing this dashboard immediately knows you take energy management seriously."

---

### Step 3: Energy Sources Register (3-4 minutes)
**Action:** Click "Energy Sources" in sidebar

**Say:**
> "ZED Requirement #1 — the assessor wants to see that you've identified all your energy sources. Here they are."

**Point out:**
- All 6 sources listed: Main Grid Electricity, DG Set, Diesel Storage, Compressed Air, LPG, Coolant Pump
- Each shows type, unit, meter number, status

**Action:** Click on "Main Grid Electricity" to open detail

**Say:**
> "Each source has complete details — meter number, location, unit of measurement. And see here — the targets linked to this source. The assessor can see you've set reduction targets."

**Action:** Go back to list

**Offer:**
> "We've added your sources based on what we know. Tomorrow when we set up the real system, we'll add your actual meter numbers and any sources we might have missed."

---

### Step 4: Consumption Recording (4-5 minutes) ★ KEY DEMO
**Action:** Click "Consumption" in sidebar

**Say:**
> "ZED Requirement #2 — daily consumption monitoring. This is where the real value is."

**Point out:**
- Table of daily readings
- Deviation column showing color-coded badges (Normal/Warning/Critical)

**Action:** Click "Record Entry" (or "New") button

**Say:**
> "Let me show you how simple it is to record daily consumption. Your operator selects the energy source, enters today's reading..."

**Action:** Select "Main Grid Electricity", enter a reading value, select today's date

**Say:**
> "Watch what happens — the system automatically compares against the target and shows if there's a deviation."

**Point out:**
- The deviation preview (percentage and severity)
- Color coding (green = normal, yellow = warning, red = critical)

**Say:**
> "If this reading is more than 20% over target, the system will flag it as critical and recommend raising a CAPA. No manual calculation, no guesswork."

**Key message:**
> "This takes your operator maybe 2 minutes a day. But it generates months of documented evidence that the assessor needs."

---

### Step 5: Targets (2-3 minutes)
**Action:** Click "Targets" in sidebar

**Say:**
> "Here you see your reduction targets — actual vs target with visual progress."

**Point out:**
- Progress bars showing target vs actual
- Period (quarterly/annual)
- Baseline values for comparison

**Say:**
> "The assessor wants to see that you don't just consume energy blindly — you set targets and track against them. This page is exactly that evidence."

---

### Step 6: Training Management (3-4 minutes)
**Action:** Click "Training" in sidebar

**Say:**
> "ZED Requirement #3 — employee awareness training. The assessor will ask: 'Have you conducted energy awareness training? Show me attendance records.'"

**Point out:**
- Programs listed with status (Completed, Scheduled, Upcoming)
- Show the completed Akshaya Createch training program

**Action:** Click on a completed training program

**Say:**
> "See — full details of the program: date, trainer, topic. And here's the attendance list with each employee's status."

**Point out:**
- Attendance table with Present/Absent marking
- Completion percentage

**Say:**
> "This is digital attendance — no paper register that gets lost. The assessor gets a clean, professional report."

**If time allows, briefly show attendance marking:**
> "Marking attendance is simple — just check the boxes. You can mark all present and then uncheck absentees."

---

### Step 7: Audit Management (3-4 minutes)
**Action:** Click "Audits" in sidebar

**Say:**
> "ZED Requirement #4 — internal energy audits. The assessor will ask: 'Do you conduct periodic energy audits? What were the findings?'"

**Point out:**
- Audits listed with type, status, findings count
- Show the completed audit

**Action:** Click on the completed audit

**Say:**
> "Here's a completed audit with all findings documented — categorized as Observation, Minor NC, or Major NC. Each finding has a due date and status."

**Point out:**
- Finding list with categories and statuses
- "Raise CAPA" button next to findings

**Say:**
> "And here's the powerful part — from any finding, you can directly raise a CAPA. The finding and CAPA stay linked, so you have full traceability."

---

### Step 8: CAPA System (4-5 minutes) ★ KEY DEMO
**Action:** Click "CAPA" in sidebar

**Say:**
> "ZED Requirement #5 — Root Cause Analysis and Corrective/Preventive Actions. This is usually where companies struggle the most."

**Point out:**
- CAPA list with status badges, priority, type

**Action:** Click on a CAPA that has RCA done (the one in Implementation status)

**Say:**
> "Look at this CAPA lifecycle. It starts with a problem description, then goes through Root Cause Analysis..."

**Point out each section:**

1. **Status Timeline**
   > "Visual timeline showing where this CAPA is in its lifecycle — from Open to RCA to Action Planning to Implementation to Verification to Closure."

2. **5-Why Analysis**
   > "We built in the 5-Why root cause analysis tool. The assessor specifically looks for 'systematic problem-solving' — this is it. You ask 'Why?' five times to get to the real root cause."

3. **Corrective & Preventive Actions**
   > "Clear actions with who's responsible and by when."

4. **Comments Thread**
   > "Full discussion history — when the assessor asks 'How was this resolved?', you have the complete story."

**Key message:**
> "Most companies fix problems but don't document how. This system makes documentation a natural part of the process, not extra paperwork."

---

### Step 9: Reports (2-3 minutes)
**Action:** Click "Reports" in sidebar

**Say:**
> "Finally — report generation. When the assessor asks for evidence, you generate it in one click."

**Action:** Show the report type dropdown

**Say:**
> "Six types of reports covering all ZED requirements:"

**List them:**
1. Energy Source Register — all your sources in one printable page
2. Consumption Summary — monthly trends with deviation analysis
3. Training Compliance — programs conducted + attendance
4. Audit Summary — audits done + findings + closure rate
5. CAPA Summary — all CAPAs with status and RCA details
6. ZED Compliance Overview — single-page status of all 5 requirements

**Action:** Generate one report (ZED Compliance Overview recommended)

**Say:**
> "See — print-ready, professional format. This goes directly to the assessor."

**Action:** Show the Print button

**Say:**
> "One click to print or save as PDF."

---

### Step 10: Settings & Roles (1-2 minutes, if time allows)
**Action:** Click "Settings" in sidebar

**Say:**
> "Admin can manage users and roles. Three levels:"

**Point out:**
- Admin — full access, can manage users and settings
- Manager — can record data, manage audits, raise CAPAs
- Employee — can view data and attend training

**Say:**
> "We'll set up accounts for your team so everyone has appropriate access."

---

## Closing the Demo

**Say:**
> "So that's the complete system — all 5 ZED energy management requirements covered in one application."

**Summarize:**
> "To recap:
> 1. Energy sources are registered with targets — ✓
> 2. Daily consumption is monitored with automatic deviation detection — ✓
> 3. Training programs are tracked with attendance — ✓
> 4. Internal audits are managed with findings tracking — ✓
> 5. CAPAs have full lifecycle with 5-Why RCA — ✓
>
> All of this runs on your own computer, no internet needed, no monthly fees. Your team records data as part of daily work, and when the assessor comes, you generate reports in one click."

**Transition to next agenda item:**
> "Now, let's go through your factory and identify all the energy sources, meters, and data points we need to set up in the system..."

---

## Handling Common Questions During Demo

| Question | Response |
|----------|----------|
| "Can we modify the energy source types?" | "Yes, you can add any type of energy source — the system is flexible." |
| "What if someone enters wrong data?" | "Entries can be edited. We also have audit logs that track all changes for traceability." |
| "Can multiple people use it at the same time?" | "Yes, it's a web application. Anyone on your network can access it from their browser — phone, tablet, or computer." |
| "What happens if the computer crashes?" | "The database can be backed up regularly. We'll set up a simple backup routine." |
| "How long to set up with our real data?" | "We can have it running with your real energy sources and employees within 1-2 days." |
| "Can we add more reports?" | "Yes, the system can be extended. We start with these 6 which cover what the assessor needs." |
| "Is this only for energy?" | "Currently focused on energy management for ZED. But the architecture can extend to other ZED parameters in the future." |

---

## Troubleshooting During Demo

| Issue | Quick Fix |
|-------|-----------|
| App won't start | Check terminal for errors. Try `npm run dev` again. |
| Login fails | Use credentials exactly: `sureshkumar@unnathicnc.com` / `unnathi123` |
| Page shows error | Refresh the browser (F5). Check if dev server is running. |
| Data looks empty | Run `npx prisma migrate reset --force` to re-seed demo data. |
| Charts not loading | Wait a few seconds — Recharts may take a moment on first load. |
| Slow performance | Close other browser tabs. The dev server uses more resources than production. |

---

*Akshaya Createch | Demo Script — Confidential*
