This session is being continued from a previous conversation that ran out of context. The summary below covers the earlier portion of the conversation.

Summary:
1. Primary Request and Intent:

This session covered multiple sequential requests:

**a. Sensor/IoT expansion brainstorm**: User raised integrating temperature, humidity, vibration, CO2, pressure sensors alongside energy meters. Key decisions: sensors priced below Basic (₹149/sensor/month), include 1 sensor in Basic plan with same ₹299 price (more sensors in higher tiers), Schneider has compatible sensors, manufacturing needs vibration + temperature for predictive maintenance, rule-based alerts now with ML anomaly detection on roadmap.

**b. Remove PAS600 references**: "Lets not mention about PAS600 as we are building voltspark with flexibility to use any meter, sensor, iot gateway. For now we have associated with lotus and titan" — removed from all public pages, kept in internal IoT device code.

**c. Sensor messaging correction**: "the pitch highlight Includes environmental sensors. we need no highlight this and each industry needs different sensor... we can be agnostic here. Also all the pages are not updated yet" — partner/start/investor/economics pages needed sensor context added per industry (vibration for manufacturing, temp for kitchen, CO2+humidity for HVAC, temp+humidity+pressure for healthcare).

**d. Meter tiers correction**: "you got it wrong, meter tiers need to mention about sensor but let it me generic like just say sensor. Also thoroughly check and review all the pages as there is no consistency on the pricing and wordings" — add "includes X sensor(s)" generically to each meter tier across all pages; full audit found commission math errors and old module names.

**e. Contact information**: Add link to akshayacreatech.in, correct email to aravind@akshayacreatech.in, add mobile 8317308558, get Lakshminarasimhan's contact from akshayacreatech.in website.

**f. Private pages + B2B2C + B2C**: Partner/investor pages should be private (shared via WhatsApp). "Since now the VoltSpark is B2B2C and also B2C, we need to changes the wordings in all the pages accordingly." Case study to be built with A Plus Fixtures (aplus.net.in), Bommanahalli factory, 3 CNC machines + solar installation.

**g. Future plans documented**: Consultant referral tracking, sensor onboarding flow, auto-incident from sensor breach, WhatsApp alerts.

2. Key Technical Concepts:

- **VoltSpark**: Multi-tenant B2B2C+B2C SaaS for industrial energy compliance. Consultants manage client portfolios; facilities can also sign up directly.
- **Pricing model**: Core FREE → IoT meter tiers (₹299/₹599/₹999/₹1,499) each including sensors generically → Industry Intelligence Bundles (₹2,500–₹5,000/site) → Sensor add-on ₹149/sensor
- **Sensor counts per meter tier**: Basic=1, Standard=2, Advanced=3, Power Quality=5 (included in price, no extra charge)
- **Industry Intelligence Bundles**: Manufacturing (vibration+temp sensors), Commercial Kitchen (temp+humidity), HVAC & Building (temp+CO2+humidity), Healthcare (temp+humidity+pressure)
- **Internal addon codes**: COMPRESSED_AIR, KITCHEN, IOT_METERING, POWER_QUALITY — never renamed, only display labels change
- **Typical IoT site**: 1 Advanced (₹999) + 3 Standard (3×₹599=₹1,797) + Manufacturing bundle (₹2,500) = ₹5,296/month ≈ ₹5,300
- **Partner commission**: 30% → ₹1,589/typical site/month
- **PrivateGate**: Client-side passphrase gate (passphrase: `akshaya2026`) using sessionStorage; wraps /investor, /partner, /partner/economics pages
- **Hardware partners**: Lotus Controls (Schneider authorised distributor — gateways + meters + sensors), Titan by Tor.ai (kitchen smart metering)
- **Contact**: Aravind: aravind@akshayacreatech.in, +91 83173 08558, wa.me/918317308558; Lakshminarasimhan: akshayacreatech@gmail.com, +91 79750 55916
- **Next.js 14 App Router**: Server components with metadata exports can wrap in 'use client' PrivateGate component
- **Turso (libSQL)** production DB, better-sqlite3 locally, Prisma 7 with driver adapters

3. Files and Code Sections:

- **app/src/components/PrivateGate.tsx** (NEW FILE):
  - Client-side passphrase gate component wrapping private pages
  - Uses sessionStorage to persist unlocked state for the session
  - Shows WhatsApp link to request access if no passphrase
  ```tsx
  'use client';
  const PASSPHRASE = 'akshaya2026';
  const STORAGE_KEY = 'vs_private_unlocked';
  export default function PrivateGate({ children, pageName }) {
    const [unlocked, setUnlocked] = useState(false);
    useEffect(() => {
      if (sessionStorage.getItem(STORAGE_KEY) === PASSPHRASE) setUnlocked(true);
    }, []);
    if (unlocked) return <>{children}</>;
    // renders password form with WhatsApp fallback link
  }
  ```

- **app/src/app/investor/page.tsx**:
  - Wrapped with `<PrivateGate pageName="Investor Pitch">`
  - Added `PrivateGate` import
  - Team array updated with email, phone, wa fields for both Aravind and Lakshminarasimhan
  - Team cards now show email + phone + WhatsApp link in a border-top contact row
  - All "Talk to us" CTAs → WhatsApp links (wa.me/918317308558)
  - Nav "by Akshaya Createch" → link to akshayacreatech.in
  - Footer: added akshayacreatech.in link
  - Bottom CTA: WhatsApp primary, email secondary
  - Meter tiers: added "Includes X sensors." to each description
  - Sensor row renamed: "Sensor (additional)" at ₹149/sensor/mo
  - Bundle descriptions: "Pairs with vibration/temperature sensors" per industry
  - Moat: added "Unified sensor + energy infrastructure" and "Multi-sensor compliance automation"
  - ML anomaly detection added to fund use product items
  - Revenue cards: ₹1,289 commission corrected to ₹1,589

- **app/src/app/partner/page.tsx**:
  - Wrapped with `<PrivateGate pageName="Partner Programme">`
  - Manufacturing capabilities: added vibration sensors (bearing/motor health) + temperature sensors (coolant/oil monitoring)
  - Kitchen capabilities: added temperature sensors (HACCP/FSSAI cold rooms) + humidity sensors
  - HVAC capabilities: added temperature sensors (COP/EER), CO2+humidity (IAQ, ASHRAE 62.1), differential pressure (filter health)
  - Healthcare capabilities: added temp+humidity (NABH OT/ICU), cold storage temperature, differential pressure
  - Step 3: mentions sensors are chosen per industry bundle
  - Revenue cards corrected: 5→₹7,945, 10→₹15,890, 20→₹31,780/mo
  - Footnote: ₹1,289→₹1,589 avg commission
  - Footer: added akshayacreatech.in link
  - "Talk to us" → WhatsApp link

- **app/src/app/partner/economics/page.tsx**:
  - Wrapped with `<PrivateGate pageName="Partner Economics">`
  - Meter commission table: added "+ X sensors" to each tier params column
  - Added "Sensor (additional)" row: ₹149/mo client, ₹45/mo commission
  - Fixed machineTypes: "Compressed Air Intelligence" → "Manufacturing Intelligence", "Kitchen Intelligence" → "Commercial Kitchen Intelligence"
  - Example row: ₹5,595→₹5,296 client bill, ₹1,679→₹1,589 commission
  - Footer: added akshayacreatech.in
  - "Talk to Us" → WhatsApp link

- **app/src/app/start/page.tsx**:
  - Meter pricing table: each tier now shows "params + X sensors"
  - "Sensor (any type)" renamed to "Sensor (additional)"
  - Bundle descriptions: Manufacturing adds vibration+temp context, Kitchen adds HACCP temp sensors, HVAC adds COP/EER temp + IAQ CO2+humidity, Healthcare adds NABH temp+humidity + cold storage
  - IoT upgrade card: mentions sensors alongside meters
  - All "Talk to us" → WhatsApp links (3 occurrences via replace_all)
  - Footer: added akshayacreatech.in link
  - Email: .com → .in (via sed)

- **app/src/components/LandingPage.tsx**:
  - Nav: removed "For Partners" → /partner link; kept "For Facilities" → /start
  - Hero copy: "all-in-one platform for energy consultants..." → "all-in-one platform for industrial energy compliance... Sign up as a facility... or work with your energy consultant through the same platform."
  - "Built for" cards: Factories first (direct B2C), Consultants (WhatsApp CTA, not /partner), Auditors (try free); consultant card uses external href, handled with conditional `<a>` vs `<Link>`
  - Meter feature: added "+ X sensors" to each tier description
  - Enterprise plan CTA → WhatsApp link
  - Footer: removed /partner, /partner/economics, /investor links; "For Consultants" → WhatsApp link; added contact section (WhatsApp + email) in footer brand column; added akshayacreatech.in link; copyright updated with akshayacreatech.in link

- **app/src/app/(app)/ca/dashboard/page.tsx** (earlier in session):
  - Both PageHeader titles: "Compressed Air Intelligence" → "Manufacturing Intelligence"

- **app/src/app/(app)/console/page.tsx** (earlier in session):
  - "Add-ons:" → "Intelligence bundles:"
  - "Compressed Air" button → "Manufacturing"
  - "Kitchen" → "Kitchen Intel"

- **app/src/components/layout/Sidebar.tsx** (earlier in session):
  - caNavSection label: "Compressed Air" → "Manufacturing Intelligence"
  - kitchenNavSection label: "Kitchen Intelligence" → "Commercial Kitchen Intelligence"

- **Memory files updated**:
  - `MEMORY.md`: Added public/private pages structure, client pilots section, future roadmap link
  - `project_future_roadmap.md` (NEW): Referral tracking, sensor onboarding flow, auto-incident from sensor breach, WhatsApp alerts, private page auth upgrade
  - `project_aplus_pilot.md` (NEW): A Plus Fixtures details, 3 CNC + solar, Bommanahalli, first public case study target

4. Errors and Fixes:

- **String not found error on investor page**: When trying to edit Commercial Kitchen bundle description, the exact string had slight differences (used grep to find actual content, then matched it exactly).

- **Sensor "includes X" messaging confusion**: User said "the pitch highlight Includes environmental sensors. we need no highlight this" — initially removed sensor counts entirely from meter tiers. Then user corrected: "meter tiers need to mention about sensor but let it me generic like just say sensor." Fixed by adding generic "Includes X sensor(s)" (not "environmental sensor") to each meter tier row.

- **Math error in partner commission**: Partner page showed ₹1,289/site average commission. Correct calculation: 30% of ₹5,296 (1×₹999 + 3×₹599 + ₹2,500) = ₹1,589. Fixed on partner/page.tsx revenue cards and footnote.

- **Wrong example row price in economics page**: ₹5,595 was based on ₹699 Standard meter (old price), while commission table shows ₹599. Corrected to ₹5,296.

- **Old module names in economics page**: machineTypes table still had "Compressed Air Intelligence" and "Kitchen Intelligence" from before the bundle rename. Fixed to "Manufacturing Intelligence" and "Commercial Kitchen Intelligence".

- **replace_all on start page Talk to Us links**: Used replace_all for the email→WhatsApp swap but had to be careful not to double-add target/rel attributes since one link already had those from a prior sed operation.

5. Problem Solving:

- **Sensor agnosticism vs specificity**: The tension between "mention sensors in meter tiers" (generic) and "each industry needs different sensors" (specific). Resolved by: generic "+ X sensors" in meter tier descriptions, and industry-specific sensor types only in the intelligence bundle descriptions/capabilities.

- **Private pages for sensitive content**: /investor and /partner have business-sensitive pricing, commission structures, and investment data. Solution: client-side passphrase gate (`akshaya2026`) that blocks casual discovery. Noted limitation: content is in HTML source. Future upgrade to server-side middleware documented.

- **B2B2C + B2C landing page positioning**: Previously hero said "built for energy consultants." Now acknowledges two tracks: consultants (B2B2C, WhatsApp CTA since /partner is private) and facilities (B2C, /start still public).

- **Conditional Link vs anchor**: "Built for" card for consultants now uses WhatsApp href (external). Used ternary `w.href.startsWith('http') ? <a> : <Link>` to handle mixed internal/external hrefs.

6. All User Messages:

- "we may have to integrate other meters/sensor like temperature humidity for kitchen, hvac to get more intelligence in our bundle offering. we need to brainstorm on this as well."
- "1. we need to consider sensor also a meter. if it is less complex and low data than IOT meter -Basic pricing, then we need to price it lower than the IOT meter Basic and include one sensor in the basic itself with the same price of 299 and more sensor in other plan accordingly. let me know your thoughts and suggestion / 2. schneider has sensors as well in their portfolio which are compatible with the PAS600 gateway / 3. yes agree. even manufacturing need vibration and temperature sensor for machine maintenance predictiveness / 4. rule now and ml anomaly is future. we need to put this in all the page. / we need to modify the investor pitch page with new update we are doing and how we will compete moat with others"
- "Lets not mention about PAS600 as we are building voltspark with flexibility to use any meter, sensor, iot gateway. For now we have associated with lotus and titan"
- "the pitch highlight Includes environmental sensors. we need no highlight this and each industry needs different sensor as I said before machine maintenance needs vibration sensor. we can be agnostic here. Also all the pages are not updated yet"
- "you got it wrong, meter tiers need to mention about sensor but let it me generic like just say sensor. Also thoroughly check and review all the pages as there is no consistency on the pricing and wordings"
- "Thanks. Do you have any suggestion. we should have link to akshayacreatech.in and email is aravind@akshayacreatech.in and mobile is 8317308558. Get lakshmi narasimham sir mail from website and mobile number"
- "1. now the partner and investor page are public and the landing pages have links to these pages. we need to make it private. we will send private whatsapp messages to partners and investors who are interested. we can brainstorm on this / 2. we can't as unnathi's data is private and we can't open it for others / 3. ok / 4. ok / 5. agree / 6. agree / 7. Lets this be for future. Let document a future plan / 8. we will create a case study with A PLUS FIXTURES PRIVATE LIMITED(https://www.aplus.net.in/). we are running a pilot here. they have 3 CNC machines and a solar installation in their bommanahalli factory / Since now the VoltSpark is B2B2C and also B2C, we need to changes the wordings in all the pages accordingly."

7. Pending Tasks:

- **A Plus Fixtures case study**: Pilot is in progress (3 CNC machines + solar, Bommanahalli). Case study to be created after 3-6 months of meaningful data. Documented in memory but not yet built.
- **Future roadmap items** (documented, not built): Consultant referral tracking, sensor onboarding flow UI, auto-incident from sensor breach pipeline, WhatsApp Business API alerts, upgrade private page gate to server-side middleware.
- **RESEND_API_KEY**: Not set on Vercel — emails won't work in production until added.

8. Current Work:

The most recently completed work was implementing private page gating + B2B2C+B2C positioning updates. Specifically:

1. Created `app/src/components/PrivateGate.tsx` — client-side passphrase gate (`akshaya2026`) wrapping /investor, /partner, /partner/economics
2. Wrapped all three pages with `<PrivateGate pageName="...">` tags
3. Updated `LandingPage.tsx`:
   - Removed "For Partners" nav link
   - Updated hero copy to acknowledge both B2C facility signup and B2B2C consultant track
   - "Built for" cards: Factories (direct /start), Consultants (WhatsApp CTA), Auditors (/register)
   - Removed /partner, /partner/economics, /investor from footer
4. Saved future roadmap and A Plus Fixtures pilot to memory files
5. All changes built clean, committed, and deployed to volt-spark.vercel.app

The last commit message was: "Private pages gate, B2B2C+B2C positioning, remove private links from public pages"

9. Optional Next Step:

No explicit pending tasks remain from the user's last message. All requested items were completed:
- ✅ Private pages gated with passphrase
- ✅ WhatsApp sharing workflow set up
- ✅ B2B2C + B2C wording updated across landing page
- ✅ Future plans documented (referral tracking, sensor onboarding, WhatsApp alerts)
- ✅ A Plus Fixtures pilot saved to memory as first case study target

The natural next step would be confirming with the user whether any of the /start page wording also needs updating for the B2C framing (it's already positioned for direct facility use, but may need minor tweaks), or starting work on the A Plus Fixtures case study page once the user confirms the pilot has enough data. However, since the user's explicit requests are all complete, this should be confirmed before proceeding.

If you need specific details from before compaction (like exact code snippets, error messages, or content you generated), read the full transcript at: C:\Users\DELL\.claude\projects\d--Project-AI-LNK-VoltSpark\ebe7c691-fa7b-4557-b9df-63e242030b43.jsonl
Continue the conversation from where it left off without asking the user any further questions. Resume directly — do not acknowledge the summary, do not recap what was happening, do not preface with "I'll continue" or similar. Pick up the last task as if the break never happened.

Under the hero CTAs — "Already set up by your energy consultant? Log in here →" so consultant-managed facilities know where to go instead of re-registering.

New section before the final CTA — explains the consultant-managed (B2B2C) track: what they do, how the facility gets their own login, and a WhatsApp link to "find an energy consultant near you."

The page now cleanly serves both tracks: self-serve B2C at the top, consultant-managed path explained further down.

we need to change these wording in the landing page as it doesn't depict on whom we are addressing - B2B2C or B2C
review every where as well

The landing page has a core problem — "How it works" and the "Value Chain" are entirely written for the B2B2C (consultant) track. A facility owner landing here would be confused. I'll rewrite the affected sections to clearly separate the two tracks throughout the page.

How it works — now two side-by-side cards:

Facilities (brand blue): Sign up free → Enter bills → Fix waste & track savings
Consultants (purple): Create account → Add clients → Prove value & retain
What you get (replaced the consultant-only "Value Chain"):

Facility wins: know where ₹ goes, catch penalties, ROI calculator, compliance, shareable reports
Consultant wins: portfolio dashboard, data-backed advisory, ₹ savings reports, IoT commission, retain clients
Built for — descriptions rewritten so each card is unambiguous about who it's for and what they do on the platform.

Final CTA — two cards: "I manage a facility" → Start Free, and "I am a consultant/ESCO" → WhatsApp to Partner.

Hero — cleaner two-track statement: "Industrial facilities sign up directly... Energy consultants manage their entire client portfolio... One platform, both tracks."

we need to hide the earn commission in the consultant cards as this will create questions in facity owners. Any how for consultant we have separted locked partner page where they can check  on the commisions. we need to make a different wording in landing pages and other pages which are public

Also I need pass phrase for patner and investor page

Passphrase: akshaya2026 (for both /partner and /investor)

Commission wording removed from 3 public spots:

Where	Was	Now
"Built for" consultant card	"recurring commission on IoT upgrades"	"all the data you need to deliver better advisory"
"What you get" consultant list	"Recurring commission income on every IoT meter"	"Grow your practice — with data that clients can see and trust"
Final CTA consultant card	"Earn commission on IoT upgrades"	"Deliver data-backed advisory at scale"
Commission details stay only on the private /partner and /partner/economics pages where they belong.

The investor page doesn't have mention of B2C

Hero — now says "used directly by industrial facilities, and by energy consultants who manage portfolios of those facilities"
Approach subtitle — "Dual-track SaaS" replaces "B2B2C SaaS"
New Track 1 callout — a highlighted box explaining the direct B2C path (factory signs up free, enters bills, adds IoT when ready via any local contractor)
Track 2 label — the existing 3-step B2B2C flow is now clearly labelled "Track 2 — Consultant-managed portfolio"
SAM note — updated to say "direct signups + consultant-managed" instead of "reachable through consultants" only

should we revisit on the landing page headline wording - Save Energy. Stay Safe. Win customers and also the investor page headline working  - The software layer for
industrial energy compliance in India.

The headlines wordings should be such that it should not raise questions or doubts

Both have real problems. Here's my read:

Landing page: "Save Energy. Stay Safe. Win Customers."

"Stay Safe" — vague. Safe from what? Electrical accidents? Penalties? Doesn't land.
"Win Customers" — raises questions. How does energy software win customers? (The intent is ZED/ISO certification opens doors to OEM buyers — but that connection is invisible to someone reading it cold.)
My recommendation:

"Find the waste. Fix it. Prove the savings."

It's the actual user journey. Works for both a facility owner and a consultant. No jargon, no ambiguity.

Investor page: "The software layer for industrial energy compliance in India."

"Software layer" — sounds like middleware or an API. Not an end-user product.
Leading with "compliance" makes it sound like a regulatory burden tool, not a value creation platform.
My recommendation:

"Energy intelligence for India's 12 lakh industrial facilities."

Tells investors: what it does (energy intelligence), who it's for (Indian industry), how big (12 lakh facilities). Clean, no doubts.

Want me to go ahead with both, or adjust the wording first?

Instead of negative connotation words like waste, can we have different word
on Invertor page, the Energy intelligence for India's 12 lakh industrial facilities is good but we are also want to serve other sectors as well

Good callouts. Here are clean options:

Landing page — positive, no "waste":

Option	Feel
"Save Energy. Cut Costs. Stay Compliant."	Direct, functional, no ambiguity
"Measure it. Improve it. Prove the savings."	Action-oriented, outcome-focused
"Energy clarity. Cost control. Compliance confidence."	Aspirational, B2B feel
My pick: "Save Energy. Cut Costs. Stay Compliant." — each word earns its place, works equally for a factory owner and a consultant, zero negative connotation.

Investor page — broader than "industrial facilities":

Option	Feel
"Energy intelligence for India's factories, hospitals, hotels, and commercial buildings."	Explicit sectors, no doubt about scope
"Energy and compliance intelligence for every facility in India."	Broadest possible, clean
"Energy intelligence across Indian industry, healthcare, and commercial real estate."	Investor-friendly sectors language
My pick: "Energy intelligence for India's factories, hospitals, hotels, and commercial buildings." — names the sectors explicitly so an investor immediately understands the breadth without having to infer.

Which landing page option do you prefer, and should I go with the explicit sectors version for the investor page?

For landing page we will go with Save Energy. Cut Costs. Stay Compliant. For Investor page, currently we are concentrating on industrial facitlities and the market opportunity sections only highlights this. lets start with industrial and should convey that we are going to serve the other sectors as well

Landing page: Save Energy. Cut Costs. Stay Compliant. — replaces the ambiguous "Win Customers"
Investor page headline: Energy intelligence for India's industrial facilities. — clear focus
Investor page sub-paragraph: adds "We are starting with manufacturing and industrial facilities. Healthcare, hospitality, and commercial buildings are the next sectors on the roadmap, using the same platform and IoT infrastructure." — signals ambition without overpromising the current state

Energy intelligence for India's 12 lakh industrial facilities.

The number does the work — an investor immediately understands the scale of the addressable market without needing to read further.

below wordings in landing page below headlines says how 
Industrial facilities sign up directly and track their own energy costs and compliance. Energy consultants manage their entire client portfolio from one dashboard. One platform, both tracks.
We need to highlight what voltspark is here rather than how as there is a separte how it works section elsewhere.

Save Energy. Cut Costs. Stay Compliant.

An all-in-one energy intelligence platform for Indian industry — energy cost tracking, compliance management, IoT metering, and savings proof in one place.

I am now feeling even the Save Energy. Cut Costs. Stay Compliant. headlines also ambinguious as voltspark does directly save energy and cut costs

You're right — VoltSpark doesn't save energy or cut costs directly. It gives you the visibility to do those things yourself. The headline is claiming outcomes that belong to the user, not the platform.

What VoltSpark actually delivers:

Visibility — shows you what your energy is costing and where
Compliance management — tracks requirements, audits, CAPAs
Savings proof — records and quantifies improvements you make
So the headline should describe what VoltSpark provides, not what the user achieves. My recommendation:

Energy Visibility. Compliance Management. Savings Proof.

Each word is something VoltSpark directly delivers. No ambiguity, no overclaiming. Want me to go ahead with this?

any other appealing wordings

Here are some alternatives, grouped by tone:

Descriptive (what it is)

Know your energy. Own your compliance. Prove your savings.

See the numbers. Manage compliance. Track every rupee.

Outcome without overclaiming

Your energy costs, visible. Your compliance, managed. Your savings, proven.

Short and punchy

Energy clarity. Compliance control. Savings proof.

See it. Manage it. Prove it.

Platform identity angle

One platform for energy intelligence, compliance, and savings.

The energy intelligence platform Indian industry has been missing.

My pick would be:

Know your energy. Own your compliance. Prove your savings.

"Know", "Own", "Prove" — each verb describes something VoltSpark enables without claiming to do it for you. Confident without overclaiming. Works equally for a facility owner and a consultant.

Second choice: Energy clarity. Compliance control. Savings proof. — tighter, more headline-like.

Which direction appeals to you?

How about this Energy, Compliance, Savings - See it, Manage it, Prove it. Let me know your suggestion
That's actually very strong. Here's why it works:

"Energy, Compliance, Savings — See it, Manage it, Prove it."

The three nouns (Energy, Compliance, Savings) tell you what VoltSpark covers
The three verbs (See, Manage, Prove) tell you what VoltSpark does — accurately, without overclaiming
Each verb maps cleanly to its noun: See energy costs → Manage compliance → Prove savings
Zero ambiguity, zero false promise
Works for a factory owner, a consultant, and an investor reading it cold
The only minor thing — it's a long single headline. For the landing page hero it might work better split across two lines:

Energy. Compliance. Savings.
See it. Manage it. Prove it.

This way the first line is the "what", the second line is the "how VoltSpark helps" — and visually it's clean and balanced.

Go ahead with this?

yes