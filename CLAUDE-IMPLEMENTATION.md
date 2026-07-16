# Y Factor Landing Page — Claude Code Implementation Plan

**Repo:** this folder (`index.html`, `styles.css`, `script.js`, `assets/`)  
**Live:** https://moganz.github.io/yfactor/  
**Goal:** Implement trust, conversion, content, UX, and SEO improvements without losing the existing brand system (ink / bone / ember, Manrope + Inter, kinetic “FACTORY → Y Factor” story).

---

## How to use this file with Claude Code

```text
Read CLAUDE-IMPLEMENTATION.md and implement all P0 tasks first.
Work through phases in order. Keep commits logical (one phase per commit if possible).
Do not redesign the visual identity. Extend the existing CSS tokens and components.
After each phase, verify index.html opens cleanly and the form still validates.
```

### Rules for the implementer

1. **Do not** invent customer logos, fake case studies, or fake certifications. Use placeholders only where noted.
2. **Do not** break reduced-motion, skip-link, form a11y, or the kinetic take-apart.
3. Prefer **minimal diffs**: edit existing sections; avoid a full rewrite.
4. Match existing class names, spacing scale, and button styles.
5. All new copy must sound like the current site: direct, plant-floor, no fluff.
6. Test: mobile nav, demo form validation, keyboard tab order, `prefers-reduced-motion`.

### Project map

| File | Role |
|------|------|
| `index.html` | Structure, copy, form, SEO meta, JSON-LD |
| `styles.css` | Design tokens, layout, components |
| `script.js` | Nav, reveals, counters, form submit, kinetic |
| `assets/` | Favicons, OG image |

---

## Phase 0 — Baseline (before editing)

- [ ] Confirm files open and match live site structure (`#why`, `#services`, `#platform`, `#industries`, `#features`, `#flow`, `#demo`).
- [ ] Note current demo form: `#demoForm` → FormSubmit AJAX in `script.js`.
- [ ] Note brand tokens in `:root` (do not rename casually).

---

## Phase 1 — P0: Trust & honesty (must ship)

### 1.1 Honest mock UI labels

**Files:** `index.html`, `styles.css`

- On every product mock / dashboard chrome (hero plant overview, platform KPIs, ring-frame grid, heatmaps), add a small badge:

  ```html
  <span class="mock-badge">Illustrative · sample plant data</span>
  ```

- Style `.mock-badge`: small label, muted text, subtle border/background, top-right or under the mock title. Must meet contrast AA.

### 1.2 Fix fake “Create work order” CTAs

**Files:** `index.html`, `styles.css`

- Replace links `href="#demo"` with text like **Create work order →** that currently scroll to the form.
- Change them to non-navigating UI that looks secondary, e.g.:

  ```html
  <button type="button" class="btn-mock" disabled aria-disabled="true">
    Create work order →
  </button>
  <span class="mock-hint">In product: drafts a CMMS work order for review</span>
  ```

- Or keep as a button that opens a tiny non-modal note / `aria-describedby` explanation. Do **not** pretend it submits a work order.

### 1.3 Privacy + form microcopy

**Files:** `index.html`, `styles.css`

- Under `#demoForm` submit button (or above it), add:

  > By submitting, you agree we may contact you about a demo. We do not sell your data.  
  > [Privacy](#privacy)

- Add a minimal **Privacy** section before the footer (or as `#privacy` block in footer area):

  - What you collect (name, company, contact)
  - Why (schedule demo / reply)
  - Retention (e.g. “until you ask us to delete” or “for sales follow-up only”)
  - Contact: `hello@yfactor.ai`
  - Keep it short (one screen on mobile)

- Footer: links to `#privacy` (and optional `#terms` one-liner if you add Terms).

### 1.4 Inclusive 4M copy

**File:** `index.html` (Why Y Factor section)

- Change:

  > men, machines, materials, methods

  to:

  > people, machines, materials, methods

### 1.5 Social proof strip (honest placeholders)

**Files:** `index.html`, `styles.css`

- Add a **Proof** band immediately under the hero (or under pilot stats):

  - Heading: e.g. `Early pilots · what we measure first`
  - If no real logos yet, use a text strip **not** fake logos:

    ```text
    Piloting with select manufacturing partners · case studies publishing soon
    ```

  - Or 1–2 **anonymized** cards only if copy is approved, e.g.:

    | Card | Content |
    |------|---------|
    | Vertical | Yarn / spinning (anonymized) |
    | Scope | 1 line · vibration + OEE |
    | Status | Pilot in progress |

- **Never** invent company names or percentage wins unless the user provides real numbers.

### 1.6 Domain / canonical prep (comments only if domain not ready)

**File:** `index.html`

- Add an HTML comment near `<link rel="canonical">`:

  ```html
  <!-- When yfactor.ai is live: set canonical, og:url, JSON-LD url to https://yfactor.ai/ -->
  ```

- If user has custom domain ready, update:
  - `canonical`
  - `og:url`
  - JSON-LD `url` / `logo` absolute URLs

**Acceptance (Phase 1):** Mock badges visible; no fake work-order navigation; privacy exists; “people” not “men”; proof strip is honest.

---

## Phase 2 — P0/P1: Lead capture that works

### 2.1 Form field improvements

**Files:** `index.html`, `script.js`

Current fields: Name, Company, Work email or phone.

**Keep required:** name, company, contact.

**Add optional fields** (same card layout, `full` width as needed):

| Field | `name` | Notes |
|-------|--------|--------|
| Role | `role` | `<select>`: Plant head / Operations / Maintenance / IT / Other |
| Plant type | `plant_type` | select: Textile / Yarn / FMCG / Automotive / General / Other |
| Approx. lines or machines | `scale` | optional text, e.g. “3 lines” |

- Fix contact `autocomplete`:
  - Prefer `autocomplete="on"` or dual hint; do not force `autocomplete="email"` only if phone is allowed.

### 2.2 FormSubmit hardening (or swap endpoint)

**Files:** `index.html`, `script.js`

In the AJAX body (and hidden inputs if using classic POST), add:

- `_subject`: keep `Demo request - Y Factor site`
- `_template`: `table` (if supported)
- When contact looks like email, send `_replyto`: that email
- Optional: `_cc` only if product owner requests it

**Error path:** existing mailto fallback is good — keep it.

**If FormSubmit is unacceptable:** leave a clear `TODO` and structure form so `action` and fetch URL are one config constant at top of `script.js`:

```js
var FORM_ENDPOINT = 'https://formsubmit.co/ajax/hello@yfactor.ai';
```

### 2.3 Submit UX polish

**File:** `script.js`

- Button text: `Sending…` (ellipsis character or `...`)
- On success: keep success message; clear fields or leave them (prefer clear + success state)
- Ensure `sending` guard still prevents double submit
- Include new optional fields in JSON body

### 2.4 Dual CTA in hero + demo section

**File:** `index.html`

Hero secondary path already has “See the platform” — keep.

Add under demo form:

- `Prefer a calendar link?` → placeholder `href="#"` with comment `<!-- replace with Cal.com / Calendly URL -->` **or** mailto with subject prefilled.

**Acceptance (Phase 2):** Optional qual fields work; form still validates; optional fields submit; endpoint centralized.

---

## Phase 3 — P1: Conversion content blocks

### 3.1 Hero clarity (no full rewrite)

**File:** `index.html`

Keep H1 `Ask Y first.`

Ensure subcopy answers in one breath: **what** (agentic AI for manufacturing data), **how** (ask why, trace machines/shifts), **outcome** (decision before shift ends).

Add a single supporting line under the CTAs if missing, e.g.:

> Live OEE, root-cause agents, and action-ready insights on the lines you already run.

### 3.2 Pilot stats honesty

**File:** `index.html` (stats band under hero)

- Eyebrow already says targets — strengthen labels so they cannot be read as guaranteed ROI:

  - “Target range · first line (not a guarantee)”
  - Or footnote under the grid: `Ranges are pilot scoping targets; results depend on sensor coverage and process maturity.`

### 3.3 FAQ section

**Files:** `index.html`, `styles.css`, `script.js` (optional accordion)

Insert **before** Get started / `#demo` (after How it works `#flow` is ideal).

**id:** `faq`  
**Heading:** e.g. `Questions plants ask before a pilot`

Accordion items (use `<details>`/`<summary>` for zero-JS, or button pattern with `aria-expanded`):

1. **Does data leave our plant?** — Cloud, VPC, or on-prem options; state what is true today honestly. If not decided: “Pilot can start with a scoped data path; deployment model agreed per plant.”
2. **What if machines are old?** — Existing sensors first; retrofit where thin; OPC-UA / Modbus / gateways.
3. **Who acts on an alert?** — Human in the loop; agents recommend; operators decide (align with step 06 in flow).
4. **How long to first signal?** — Scope one line; target window consistent with “&lt;90 days” messaging; no fake week-by-week unless real.
5. **What do you integrate with?** — ERP/MES, PLCs, SCADA/historians; list protocols you already claim.
6. **How do you price a pilot?** — “Scoped per line / problem. Book a demo for a written pilot outline.” (no fake prices)

Nav: optional link `FAQ` → `#faq` in desktop + mobile menus.

### 3.4 Security & trust block

**Files:** `index.html`, `styles.css`

Near integrations / features, add a compact band:

**Heading:** `Built for plant IT, not only the control room`

Four bullets (only claim what is true; soften if unknown):

- Encryption in transit (TLS)
- Access control for plant users
- Optional on-prem / private deployment discussion
- Your production data is not used to train public models *(only if true — otherwise omit)*

### 3.5 Team / company teaser

**File:** `index.html`

Short section before footer or inside footer brand column:

- “Built for the factory floor” + 2–3 lines on who is building Y Factor
- Link: LinkedIn (placeholder `https://www.linkedin.com/` with HTML comment to replace) + `mailto:hello@yfactor.ai`

**Do not invent founder bios.** Use:

```html
<!-- TODO: replace with real founder names, titles, LinkedIn URLs -->
```

### 3.6 Services hierarchy

**File:** `index.html` (+ light CSS)

In `#services`, visually elevate **AI Agents** (first card, or `service-card featured` with accent border).  
Optional short label on that card: `Core`.

**Acceptance (Phase 3):** FAQ works without JS if using `<details>`; security band present; pilot disclaimer clear; agents emphasized.

---

## Phase 4 — P2: Information architecture

### 4.1 Nav updates

**File:** `index.html`

Desktop + `#mmenu`:

| Label | Href |
|-------|------|
| Why Y Factor | `#why` |
| Platform | `#platform` |
| How it works | `#flow` |
| Industries | `#industries` |
| FAQ | `#faq` |
| Book a demo | `#demo` (button) |

- Drop or demote **Services** / **Features** from top nav if crowded (still reachable via in-page links/footer).
- Update scroll-spy in `script.js` so new section ids are observed if nav links change.

### 4.2 Reduce dashboard repetition (light touch)

**File:** `index.html`

- Keep hero mock + one platform mock as primary.
- On the weakest duplicate chart block, shorten copy or collapse optional decorative SVG if it adds little.
- Do **not** delete the kinetic Why section or the 7-step flow.

### 4.3 Integrations specificity

**File:** `index.html`

Replace vague “ERP & accounting” only list with:

- Protocols: OPC-UA, Modbus, MQTT (if true)
- Systems: “ERP / MES via API or export” + “SCADA & historians”
- Note: “Named connectors added per pilot”

Avoid fake SAP/Oracle badges unless true.

### 4.4 Industry positioning

**File:** `index.html`

If ICP is textile/yarn-heavy, add one line under industries H2:

> Deepest models first where yarn, textile, and fabric processes fail differently — general manufacturing uses the same platform spine.

**Acceptance (Phase 4):** Nav matches sections; spy still works; integrations clearer.

---

## Phase 5 — P3: UX polish

### 5.1 Sticky mobile CTA

**Files:** `styles.css`, `index.html`, `script.js`

- Fixed bar bottom on `max-width: 640px` (or 820px): **Book a demo** → `#demo`
- Hide when `#demo` is in view (IntersectionObserver) or when mobile menu open
- `padding-bottom` on `body` so content is not covered
- Respect safe-area: `env(safe-area-inset-bottom)`

### 5.2 Mobile menu a11y

**File:** `script.js`

Confirm / implement:

- Escape closes menu
- `aria-expanded` on `#burger` toggles correctly
- Focus moves into menu when opened; returns to burger on close
- Optional: basic focus trap while open

### 5.3 Heatmap / chart a11y

**File:** `index.html`

- For heatmap and key charts, add visually hidden or caption text summarizing insight
- Legend: keep Low/High text (already present); ensure not color-only meaning

### 5.4 Footer social

**File:** `index.html`

- Keep email icon
- Add LinkedIn icon link (placeholder OK with TODO)
- Optional: X/Twitter only if real handle exists

**Acceptance (Phase 5):** Sticky CTA usable; menu keyboard-friendly; no content underlap.

---

## Phase 6 — P4: SEO & technical

### 6.1 JSON-LD expansion

**File:** `index.html`

Keep Organization. Add second script block or `@graph`:

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Y Factor",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "Agentic AI for manufacturing data comprehension.",
  "url": "https://moganz.github.io/yfactor/",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Pilot scoping via demo"
  }
}
```

(Adjust offers if misleading — or omit `offers` if no public price.)

Optional: `WebSite` with `name` + `url`.

### 6.2 robots + sitemap (GitHub Pages)

Create:

- `robots.txt`
- `sitemap.xml`

Point to the canonical URL in use (github.io until custom domain).

### 6.3 Meta polish

**File:** `index.html`

- Ensure title uses a normal hyphen or en dash consistently: `Y Factor — Ask Y first.`
- File must be saved **UTF-8**
- If analytics desired: add Plausible or GA4 only with a clear `TODO` and env comment — do not invent measurement IDs

**Acceptance (Phase 6):** Valid JSON-LD; robots/sitemap present; UTF-8 clean.

---

## Phase 7 — Copy checklist (apply during phases)

| Location | Change |
|----------|--------|
| Why section | people, machines, materials, methods |
| Pilot stats | explicit non-guarantee footnote |
| Services | AI Agents featured |
| Security | concrete bullets, no empty “secure & scalable” only |
| Form | privacy line + optional qual fields |
| Work order | not a real navigation CTA |
| Mocks | “Illustrative · sample plant data” |

---

## Phase 8 — Manual QA checklist

### Functional

- [ ] All nav links scroll to correct sections (desktop + mobile)
- [ ] Burger open/close, Escape, focus return
- [ ] Demo form: empty submit shows errors + focus first invalid
- [ ] Demo form: valid email or 7+ digit phone passes contact rule
- [ ] Success and error states still work
- [ ] Kinetic take-apart + Replay still work
- [ ] Sticky CTA does not cover form inputs

### Visual

- [ ] 375px, 768px, 1280px widths
- [ ] Dark bands still readable (accent-dark on ink)
- [ ] Mock badges do not break card layouts

### A11y

- [ ] Skip to content
- [ ] Tab order logical
- [ ] `prefers-reduced-motion: reduce` — no broken layout; counters visible
- [ ] Form errors linked via `aria-describedby` when shown

### Content integrity

- [ ] No invented customers, logos, or ROI case studies
- [ ] No fake compliance badges (SOC2/ISO) unless real

---

## Suggested commit order

1. `fix: honest mocks, work-order CTAs, inclusive 4M copy`
2. `feat: privacy section and form consent microcopy`
3. `feat: proof strip and pilot disclaimers`
4. `feat: form qual fields and endpoint config`
5. `feat: FAQ, security band, team teaser`
6. `feat: nav IA, sticky mobile CTA, menu a11y`
7. `chore: JSON-LD, robots.txt, sitemap.xml`

---

## Out of scope (do not do unless asked)

- Full visual rebrand or new color system
- Building the real product app / auth / CMMS
- Fake testimonials or purchased stock “customer” logos
- Complex 3D / WebGL hero rewrite
- Pricing page with dollar amounts (unless provided)
- i18n / multiple languages

---

## Optional follow-ups (after this plan)

1. Wire real Cal.com/Calendly URL  
2. Custom domain `yfactor.ai` + HTTPS + update canonical  
3. Real pilot metrics and logos when available  
4. Replace FormSubmit with CRM-backed endpoint  
5. Founder photos + LinkedIn  
6. 30–60s silent product video with captions  

---

## Definition of done

The landing page still feels like Y Factor, but a plant visitor can:

1. Understand the product in the hero  
2. See that dashboards are **illustrative**  
3. Read privacy + security posture  
4. Get FAQ answers without a call  
5. Submit a **qualified** demo request reliably  
6. Trust that claims are **targets/pilots**, not fabricated case studies  

When finished, reply with a short summary of files changed and any TODOs left for real customer data / domain / calendar links.
```
