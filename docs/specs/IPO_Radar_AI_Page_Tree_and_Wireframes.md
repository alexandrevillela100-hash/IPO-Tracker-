# IPO Radar AI — Page Tree and Wireframe Specification

**Author:** Manus AI
**Date:** April 4, 2026
**Version:** 1.0

---

## I. Introduction

This document defines the complete page tree (information architecture) and wireframe specifications for IPO Radar AI. The goal is to establish a clear, logical navigation structure that supports the product's core use cases: discovering upcoming IPOs, researching individual companies, tracking filing amendments, and consuming AI-generated intelligence reports. The platform is entirely self-service — there are no demo-booking or sales-assisted flows.

---

## II. Page Tree (Site Map)

The following table presents the complete page hierarchy. Each page is assigned a unique identifier for cross-referencing in wireframe descriptions. Pages marked as "Auth Required" require the user to be logged in.

| ID | Page | URL Pattern | Auth Required | Status |
|----|------|-------------|---------------|--------|
| P-01 | **Landing / Home** | `/` | No | Built |
| P-02 | **IPO Discovery (Browse All)** | `/ipos` | No | Planned |
| P-03 | **IPO Detail Page** | `/ipo/:cik` | No | Built |
| P-04 | **Filing Diff Viewer** | `/ipo/:cik/diff/:version` | No | Planned |
| P-05 | **AI First-Look Report** | `/ipo/:cik/report` | No | Planned |
| P-06 | **IPO Calendar** | `/calendar` | No | Planned |
| P-07 | **Sector Overview** | `/sectors` | No | Planned |
| P-08 | **Sector Detail** | `/sectors/:sectorSlug` | No | Planned |
| P-09 | **Weekly Digest** | `/digest` | No | Planned |
| P-10 | **Search Results** | `/search?q=...` | No | Planned |
| P-11 | **User Dashboard** | `/dashboard` | Yes | Planned |
| P-12 | **Watchlist** | `/dashboard/watchlist` | Yes | Planned |
| P-13 | **Alerts & Notifications** | `/dashboard/alerts` | Yes | Planned |
| P-14 | **Account Settings** | `/dashboard/settings` | Yes | Planned |
| P-15 | **Login / Sign Up** | `/auth` | No | Planned |
| P-16 | **Pricing** | `/pricing` | No | Planned |
| P-17 | **About / Product** | `/about` | No | Planned |
| P-18 | **Terms of Service** | `/terms` | No | Planned |
| P-19 | **Privacy Policy** | `/privacy` | No | Planned |
| P-20 | **404 Not Found** | `/404` | No | Built |

### Page Tree Diagram

```
IPO Radar AI
├── Landing / Home (P-01)
│   ├── Hero + CTA
│   ├── Market Snapshot Strip
│   ├── Upcoming IPOs Grid → links to P-03
│   ├── How It Works
│   ├── Features
│   ├── Why We're Different
│   └── Final CTA
│
├── IPO Discovery (P-02)
│   ├── Filter Bar (sector, form type, date, status)
│   ├── Sort Controls (date, deal size, sector)
│   ├── Card Grid / Table Toggle
│   └── Pagination
│       └── Each card → P-03
│
├── IPO Detail (P-03) ← per company
│   ├── Hero Banner
│   ├── Company Overview
│   ├── Financial Metrics
│   ├── Offering Details
│   ├── Risk Factors
│   ├── Filing History Timeline
│   │   └── Each amendment → P-04
│   ├── AI First-Look Report → P-05
│   └── Sidebar (Quick Facts, SEC Links)
│
├── Filing Diff Viewer (P-04)
│   ├── Version Selector
│   ├── Side-by-Side Comparison
│   └── Material Changes Highlights
│
├── AI First-Look Report (P-05)
│   ├── Executive Summary
│   ├── Business Analysis
│   ├── Financial Assessment
│   ├── Risk Analysis
│   ├── Peer Comparison
│   ├── Key Investor Questions
│   └── Export (PDF/Markdown)
│
├── IPO Calendar (P-06)
│   ├── Monthly Calendar View
│   ├── List View Toggle
│   ├── Filter by Status
│   └── Each event → P-03
│
├── Sectors (P-07)
│   ├── Sector Cards Grid
│   └── Each sector → P-08
│       ├── Sector Stats
│       ├── Companies in Sector
│       └── Recent Filings
│
├── Weekly Digest (P-09)
│   ├── This Week in IPOs
│   ├── Most Important Amendment
│   ├── Sector Activity Snapshot
│   └── Archive of Past Digests
│
├── Search (P-10)
│   ├── Search Bar (global, in navbar)
│   ├── Results: Companies
│   ├── Results: Filings
│   └── Results: Reports
│
├── User Dashboard (P-11) [Auth]
│   ├── Overview / Activity Feed
│   ├── Watchlist (P-12)
│   │   ├── Watched Companies
│   │   ├── Add/Remove
│   │   └── Each company → P-03
│   ├── Alerts (P-13)
│   │   ├── Alert Rules
│   │   ├── Notification History
│   │   └── Create/Edit Alert
│   └── Settings (P-14)
│       ├── Profile
│       ├── Email Preferences
│       └── API Access (future)
│
├── Auth (P-15)
│   ├── Login (Manus OAuth)
│   └── Sign Up
│
├── Pricing (P-16)
│   ├── Plan Comparison Table
│   └── CTA to Sign Up
│
├── Static Pages
│   ├── About / Product (P-17)
│   ├── Terms of Service (P-18)
│   └── Privacy Policy (P-19)
│
└── 404 Not Found (P-20)
```

---

## III. Navigation Structure

### Primary Navigation (Top Bar — All Pages)

The top navigation bar is persistent across all pages. It adapts based on authentication state.

**Unauthenticated:**

| Position | Element | Action |
|----------|---------|--------|
| Left | Logo + "IPO Radar AI" | Links to Home (P-01) |
| Center | Product, Browse IPOs, Calendar, Sectors, Pricing | Links to P-17, P-02, P-06, P-07, P-16 |
| Right | Search icon | Opens search overlay → P-10 |
| Right | Log in | Links to P-15 |
| Right | "Get Started" (primary button) | Links to P-15 |

**Authenticated:**

| Position | Element | Action |
|----------|---------|--------|
| Left | Logo + "IPO Radar AI" | Links to Home (P-01) |
| Center | Browse IPOs, Calendar, Sectors, Digest | Links to P-02, P-06, P-07, P-09 |
| Right | Search icon | Opens search overlay → P-10 |
| Right | Bell icon (notifications) | Opens notifications dropdown |
| Right | User avatar | Opens dropdown: Dashboard, Watchlist, Settings, Log out |

### Dashboard Sidebar Navigation (P-11 through P-14)

The user dashboard uses a left sidebar layout for internal navigation.

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Overview | `/dashboard` |
| Star | Watchlist | `/dashboard/watchlist` |
| Bell | Alerts | `/dashboard/alerts` |
| Settings | Settings | `/dashboard/settings` |

---

## IV. Wireframe Specifications

Each wireframe is described in terms of layout regions, content blocks, and interactive elements. The design language follows the established "Dark Terminal Luxe" aesthetic: dark charcoal base, slate card surfaces, teal primary accent, DM Sans headings, JetBrains Mono for financial data.

---

### P-01: Landing / Home Page

**Purpose:** Convert visitors into users by demonstrating immediate value with live IPO data.

**Layout (top to bottom):**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]  Logo   Product  Browse  Calendar  Sectors        │
│                                    Search  Login  [Get Started] │
├─────────────────────────────────────────────────────────────┤
│  [Hero Section]                                              │
│  Badge: "SEC Filing Intelligence"                            │
│  H1: "See the IPO before the market does."                   │
│  Subtitle: "IPO Radar AI turns SEC filings..."               │
│  [Get Started Free]  [Request Sample Report]                 │
├─────────────────────────────────────────────────────────────┤
│  [Trust Bar] Monitors S-1 · SEC-powered · Amendment tracking │
├─────────────────────────────────────────────────────────────┤
│  [SEC Sync Bar]  Pipeline status  [Sync with SEC]            │
├─────────────────────────────────────────────────────────────┤
│  [Market Stats]  4 metric cards in a row                     │
│  New Filings | Amendments | Companies | Total Filings        │
├─────────────────────────────────────────────────────────────┤
│  [Upcoming IPOs Grid]  H2 + "View all" link                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Image   │ │  Image   │ │  Image   │                     │
│  │  Name    │ │  Name    │ │  Name    │                     │
│  │  Sector  │ │  Sector  │ │  Sector  │                     │
│  │  Status  │ │  Status  │ │  Status  │                     │
│  │  Desc    │ │  Desc    │ │  Desc    │                     │
│  │  Metrics │ │  Metrics │ │  Metrics │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│  (3 cols desktop, 2 tablet, 1 mobile)                        │
├─────────────────────────────────────────────────────────────┤
│  [How It Works]  4 step cards: Detect → Structure → Compare  │
│                                → Deliver                     │
├─────────────────────────────────────────────────────────────┤
│  [Features]  6 feature cards in 3x2 grid                     │
├─────────────────────────────────────────────────────────────┤
│  [Why We're Different]  2-column comparison                  │
├─────────────────────────────────────────────────────────────┤
│  [Target Users]  5 audience pills                            │
├─────────────────────────────────────────────────────────────┤
│  [Final CTA]  "Get ahead of the IPO market."                 │
│  [Get Started Free]  [Create Account]                        │
├─────────────────────────────────────────────────────────────┤
│  [Footer]  Links + Disclaimer                                │
└─────────────────────────────────────────────────────────────┘
```

**Status:** Built and functional.

---

### P-02: IPO Discovery (Browse All)

**Purpose:** Full browsable, filterable, and searchable listing of all tracked IPO filings. This is the "Airbnb search results" equivalent — where users go to explore beyond the homepage highlights.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  [Page Header]                                               │
│  H1: "Browse Upcoming IPOs"                                  │
│  Subtitle: "X companies currently tracked from SEC EDGAR"    │
├─────────────────────────────────────────────────────────────┤
│  [Filter Bar]                                                │
│  ┌────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ ┌───────┐ │
│  │ Sector ▼│ │Form Type▼│ │ Status ▼ │ │Date Rng│ │ Sort ▼│ │
│  └────────┘ └──────────┘ └──────────┘ └────────┘ └───────┘ │
│  Active filters shown as removable pills below               │
│  [Card View] [Table View] toggle on the right                │
├─────────────────────────────────────────────────────────────┤
│  [Results Grid — Card View]                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Card    │ │  Card    │ │  Card    │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Card    │ │  Card    │ │  Card    │                     │
│  └──────────┘ └──────────┘ └──────────┘                     │
│  ... (paginated, 12 per page)                                │
├─────────────────────────────────────────────────────────────┤
│  [Results Grid — Table View (alternate)]                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Company | Sector | Form | Date | Status | Deal Size │    │
│  │─────────────────────────────────────────────────────│    │
│  │ Row 1                                                │    │
│  │ Row 2                                                │    │
│  │ ...                                                  │    │
│  └──────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  [Pagination]  ← 1 2 3 ... 8 →                              │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Filter Options:**

| Filter | Type | Options |
|--------|------|---------|
| Sector | Multi-select dropdown | Technology, Healthcare, Energy, Financial Services, Consumer, Industrial, etc. |
| Form Type | Multi-select dropdown | S-1 (Domestic), F-1 (Foreign), S-1/A (Amendment), F-1/A (Amendment) |
| Status | Single-select | All, New Filing, Amended, Priced |
| Date Range | Date picker | Last 7 days, Last 30 days, Last 90 days, Custom |
| Sort | Single-select | Most Recent, Alphabetical, Sector |

**Table View Columns:**

| Column | Width | Format |
|--------|-------|--------|
| Company Name | 25% | Text, linked to P-03 |
| Sector | 15% | Color-coded pill |
| Form Type | 10% | Badge (S-1, F-1, etc.) |
| Filing Date | 12% | YYYY-MM-DD, monospaced |
| Status | 10% | Color-coded badge |
| Location | 15% | City, State/Country |
| Action | 13% | "View Details" link → P-03 |

---

### P-03: IPO Detail Page

**Purpose:** Comprehensive research destination for a single company's IPO filing. Consolidates all available intelligence into a structured, scannable layout.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  [Hero Banner — full width]                                  │
│  Gradient overlay on sector image                            │
│  Company Name (H1) + Ticker/Exchange                         │
│  Sector Badge + Filing Status Badge                          │
│  Location + SIC Description                                  │
├─────────────────────────────────────────────────────────────┤
│  [Action Bar]                                                │
│  ← Back to IPO Radar  |  [Add to Watchlist] [View Report]   │
├──────────────────────────────────┬──────────────────────────┤
│  [Main Content — 2/3]            │  [Sidebar — 1/3]         │
│                                  │                          │
│  ┌─ Company Overview ──────────┐ │  ┌─ Quick Facts ───────┐ │
│  │  Business description       │ │  │  CIK: ...           │ │
│  │  Key facts grid             │ │  │  Ticker: ...        │ │
│  └─────────────────────────────┘ │  │  Exchange: ...      │ │
│                                  │  │  SIC: ...           │ │
│  ┌─ Financial Metrics ─────────┐ │  │  Entity Type: ...   │ │
│  │  6-metric grid              │ │  │  Fiscal Year: ...   │ │
│  │  Income Statement table     │ │  └─────────────────────┘ │
│  │  Balance Sheet highlights   │ │                          │
│  │  Revenue History chart      │ │  ┌─ Offering Summary ──┐ │
│  └─────────────────────────────┘ │  │  Deal Size: ...     │ │
│                                  │  │  Price Range: ...   │ │
│  ┌─ Offering Details ──────────┐ │  │  Shares: ...        │ │
│  │  Shares offered, price      │ │  │  Underwriters: ...  │ │
│  │  Underwriters list          │ │  │  [View SEC Filing]  │ │
│  │  Use of proceeds            │ │  └─────────────────────┘ │
│  └─────────────────────────────┘ │                          │
│                                  │  ┌─ Filing History ────┐ │
│  ┌─ Risk Factors ──────────────┐ │  │  Timeline:          │ │
│  │  Severity-rated risk list   │ │  │  ● S-1 — date      │ │
│  └─────────────────────────────┘ │  │  ● S-1/A — date    │ │
│                                  │  │  [View Diff] → P-04 │ │
│  ┌─ AI First-Look Report ─────┐ │  └─────────────────────┘ │
│  │  Preview or "Coming Soon"   │ │                          │
│  │  [View Full Report] → P-05  │ │  ┌─ SEC Links ────────┐ │
│  └─────────────────────────────┘ │  │  [View on EDGAR]    │ │
│                                  │  │  [View Filing Doc]  │ │
├──────────────────────────────────┴──────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**Status:** Built and functional (with simulated financial data).

---

### P-04: Filing Diff Viewer

**Purpose:** Side-by-side comparison of two filing versions (e.g., S-1 vs. S-1/A) highlighting what changed. This is a key differentiator — no other IPO site offers this.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  [Header]                                                    │
│  ← Back to [Company Name]                                    │
│  H1: "Filing Comparison: [Company]"                          │
│  Version selector: [S-1 (Mar 15)] vs [S-1/A (Apr 2)]  ▼    │
├─────────────────────────────────────────────────────────────┤
│  [Material Changes Summary Bar]                              │
│  3 material changes detected | Pricing ● | Risk Factors ●   │
├────────────────────────────────┬────────────────────────────┤
│  [Version A — Left Panel]      │  [Version B — Right Panel] │
│                                │                            │
│  Section: Offering Details     │  Section: Offering Details  │
│  ┌────────────────────────┐    │  ┌────────────────────────┐│
│  │ Price: $14-$16         │    │  │ Price: $16-$18 ██████ ││
│  │ Shares: 10M            │    │  │ Shares: 12M    ██████ ││
│  │ Underwriter: GS        │    │  │ Underwriter: GS, MS ██││
│  └────────────────────────┘    │  └────────────────────────┘│
│                                │                            │
│  Section: Risk Factors         │  Section: Risk Factors      │
│  ┌────────────────────────┐    │  ┌────────────────────────┐│
│  │ 1. Market risk...      │    │  │ 1. Market risk...      ││
│  │ 2. Regulatory...       │    │  │ 2. Regulatory...       ││
│  │                        │    │  │ 3. NEW: Tariff risk ██ ││
│  └────────────────────────┘    │  └────────────────────────┘│
│                                │                            │
│  (█ = highlighted changes)     │                            │
├────────────────────────────────┴────────────────────────────┤
│  [Change Log Table]                                          │
│  Field         | Before      | After       | Materiality    │
│  Price Range   | $14-$16     | $16-$18     | High           │
│  Shares        | 10,000,000  | 12,000,000  | High           │
│  Risk #3       | —           | Tariff risk | Medium         │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### P-05: AI First-Look Report

**Purpose:** A polished, institutional-grade initiation report generated by AI from the S-1/F-1 filing. This is the product's premium output — the equivalent of a sell-side equity research initiation note.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  [Report Header]                                             │
│  "IPO Radar AI — First-Look Report"                          │
│  Company: [Name] | Ticker: [TKR] | Date: [Generated Date]   │
│  [Export PDF] [Export Markdown] [Share]                       │
├─────────────────────────────────────────────────────────────┤
│  [Table of Contents — sticky sidebar]                        │
│  1. Executive Summary                                        │
│  2. Company Overview                                         │
│  3. Business Model Analysis                                  │
│  4. Financial Assessment                                     │
│  5. Offering Analysis                                        │
│  6. Risk Assessment                                          │
│  7. Competitive Landscape                                    │
│  8. Preliminary Peer Comparison                              │
│  9. Key Investor Questions                                   │
│  10. Disclaimer                                              │
├──────────────────────────────────┬──────────────────────────┤
│  [Report Body — scrollable]      │  [TOC Sidebar — sticky]  │
│                                  │                          │
│  § Executive Summary             │  ● Executive Summary     │
│  One-paragraph thesis on the     │  ○ Company Overview      │
│  investment opportunity.         │  ○ Business Model        │
│                                  │  ○ Financial Assessment  │
│  § Company Overview              │  ○ Offering Analysis     │
│  Business description, history,  │  ○ Risk Assessment       │
│  management, market position.    │  ○ Competitive Landscape │
│                                  │  ○ Peer Comparison       │
│  § Financial Assessment          │  ○ Investor Questions    │
│  Revenue trends, margins,        │  ○ Disclaimer            │
│  cash flow, key metrics table.   │                          │
│                                  │                          │
│  § Risk Assessment               │                          │
│  Categorized risks with          │                          │
│  severity ratings.               │                          │
│                                  │                          │
│  § Key Investor Questions        │                          │
│  5-7 questions an analyst        │                          │
│  would want answered.            │                          │
│                                  │                          │
│  § Disclaimer                    │                          │
│  AI-generated, not investment    │                          │
│  advice, verify with primary     │                          │
│  sources.                        │                          │
├──────────────────────────────────┴──────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### P-06: IPO Calendar

**Purpose:** Visual timeline of IPO events — filings, amendments, expected pricing dates. Helps users plan their research and trading around upcoming events.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  [Header]                                                    │
│  H1: "IPO Calendar"                                          │
│  [Calendar View] [List View] toggle                          │
│  Filter: [All] [Filed] [Amended] [Expected Pricing]         │
├─────────────────────────────────────────────────────────────┤
│  [Calendar View]                                             │
│  ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐               │
│  │ Sun │ Mon │ Tue │ Wed │ Thu │ Fri │ Sat │               │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤               │
│  │     │  1  │  2  │  3  │  4  │  5  │  6  │               │
│  │     │     │ ●●  │ ●   │     │ ●●● │     │               │
│  ├─────┼─────┼─────┼─────┼─────┼─────┼─────┤               │
│  │  7  │  8  │  9  │ 10  │ 11  │ 12  │ 13  │               │
│  │     │ ●   │     │ ●●  │     │ ●   │     │               │
│  └─────┴─────┴─────┴─────┴─────┴─────┴─────┘               │
│  (● = filing event, color-coded by type)                     │
│  ← March 2026          April 2026          May 2026 →        │
├─────────────────────────────────────────────────────────────┤
│  [Selected Day Detail Panel]                                 │
│  April 3, 2026 — 3 events                                    │
│  ┌─────────────────────────────────────────┐                 │
│  │ ● X-Energy, Inc. — S-1/A (Amendment)    │ → P-03          │
│  │ ● Libera Gaming — F-1/A (Amendment)     │ → P-03          │
│  │ ● INNOCAN PHARMA — F-1/A (Amendment)    │ → P-03          │
│  └─────────────────────────────────────────┘                 │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### P-07 / P-08: Sector Overview and Detail

**Purpose:** Aggregate view of IPO activity by industry sector. Helps users identify trends (e.g., "biotech IPOs are surging this quarter").

**P-07 Layout (Sector Overview):**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  H1: "IPO Activity by Sector"                                │
│  Subtitle: "Track which industries are going public"         │
├─────────────────────────────────────────────────────────────┤
│  [Sector Cards Grid — 3 columns]                             │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│  │ 🔬 Healthcare    │ │ 💻 Technology    │ │ ⚡ Energy     │ │
│  │ 18 companies     │ │ 14 companies     │ │ 9 companies  │ │
│  │ 24 filings       │ │ 19 filings       │ │ 12 filings   │ │
│  │ +5 this week     │ │ +3 this week     │ │ +1 this week │ │
│  └──────────────────┘ └──────────────────┘ └──────────────┘ │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐ │
│  │ 🏦 Financial     │ │ 🛒 Consumer      │ │ 🏭 Industrial│ │
│  │ 12 companies     │ │ 8 companies      │ │ 6 companies  │ │
│  └──────────────────┘ └──────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

**P-08 Layout (Sector Detail):**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  ← Back to Sectors                                           │
│  H1: "Healthcare IPOs"                                       │
│  18 companies | 24 filings | 5 new this week                 │
├─────────────────────────────────────────────────────────────┤
│  [Sector Stats Bar]                                          │
│  Avg Deal Size: $250M | Most Active Sub-sector: Biotech      │
├─────────────────────────────────────────────────────────────┤
│  [Company Cards — same as P-02 but filtered to sector]       │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### P-11: User Dashboard

**Purpose:** Authenticated user's home base. Shows personalized activity feed, watchlist highlights, and recent alerts.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar — authenticated]                                    │
├──────────┬──────────────────────────────────────────────────┤
│ [Sidebar]│  [Main Content]                                   │
│          │                                                   │
│ Overview │  H1: "Welcome back, [Name]"                       │
│ Watchlist│                                                   │
│ Alerts   │  [Stats Row]                                      │
│ Settings │  Watched: 12 | New Filings: 3 | Alerts: 2        │
│          │                                                   │
│          │  [Recent Activity Feed]                            │
│          │  ┌─────────────────────────────────────────┐      │
│          │  │ ● X-Energy filed S-1/A — 2 hours ago   │      │
│          │  │ ● New S-1: Yesway, Inc. — yesterday     │      │
│          │  │ ● Alert triggered: Magnum price change  │      │
│          │  └─────────────────────────────────────────┘      │
│          │                                                   │
│          │  [Watchlist Preview — top 5]                       │
│          │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│          │  │ Company  │ │ Company  │ │ Company  │          │
│          │  └──────────┘ └──────────┘ └──────────┘          │
│          │  [View Full Watchlist →]                           │
├──────────┴──────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

### P-16: Pricing

**Purpose:** Self-service pricing page. Clear plan comparison to drive sign-ups.

**Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Navbar]                                                    │
├─────────────────────────────────────────────────────────────┤
│  [Header — centered]                                         │
│  H1: "Simple, Transparent Pricing"                           │
│  Subtitle: "Start free. Upgrade when you need more."         │
│  [Monthly] [Annual — Save 20%] toggle                        │
├─────────────────────────────────────────────────────────────┤
│  [Plan Cards — 3 columns]                                    │
│  ┌──────────────┐ ┌──────────────────┐ ┌──────────────────┐ │
│  │   Free       │ │   Professional   │ │   Enterprise     │ │
│  │   $0/mo      │ │   $49/mo         │ │   Custom         │ │
│  │              │ │   ★ Most Popular │ │                  │ │
│  │ ✓ 5 tracked  │ │ ✓ Unlimited      │ │ ✓ Everything in  │ │
│  │ ✓ Basic data │ │ ✓ AI Reports     │ │   Professional   │ │
│  │ ✓ SEC links  │ │ ✓ Diff Viewer    │ │ ✓ API access     │ │
│  │              │ │ ✓ Alerts         │ │ ✓ Custom alerts  │ │
│  │              │ │ ✓ Watchlists     │ │ ✓ Data export    │ │
│  │              │ │ ✓ Weekly Digest  │ │ ✓ Priority       │ │
│  │ [Get Started]│ │ [Start Free Trial│ │ [Contact Us]     │ │
│  └──────────────┘ └──────────────────┘ └──────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  [Feature Comparison Table]                                  │
│  Feature              | Free | Pro  | Enterprise            │
│  Companies tracked    | 5    | ∞    | ∞                     │
│  AI First-Look Reports| —    | ✓    | ✓                     │
│  Filing Diff Viewer   | —    | ✓    | ✓                     │
│  Custom Alerts        | —    | 5    | ∞                     │
│  API Access           | —    | —    | ✓                     │
│  Data Export           | —    | —    | ✓                     │
├─────────────────────────────────────────────────────────────┤
│  [FAQ Accordion]                                             │
│  ▸ Can I cancel anytime?                                     │
│  ▸ What payment methods do you accept?                       │
│  ▸ Is there a free trial?                                    │
│  ▸ What's included in the free plan?                         │
├─────────────────────────────────────────────────────────────┤
│  [Footer]                                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## V. User Flow Diagrams

### Flow 1: New Visitor Discovery Journey

```
Visit Landing Page (P-01)
    │
    ├── Scroll → See Upcoming IPOs grid
    │       │
    │       └── Click card → IPO Detail (P-03)
    │               │
    │               ├── Read company overview, financials
    │               ├── Click "View Full Report" → AI Report (P-05)
    │               └── Click "View Diff" → Diff Viewer (P-04)
    │
    ├── Click "Browse IPOs" in nav → IPO Discovery (P-02)
    │       │
    │       ├── Apply filters (sector, date, form type)
    │       └── Click card → IPO Detail (P-03)
    │
    ├── Click "Get Started Free" → Sign Up (P-15)
    │       │
    │       └── After sign up → User Dashboard (P-11)
    │
    └── Click "Pricing" → Pricing (P-16)
            │
            └── Select plan → Sign Up (P-15)
```

### Flow 2: Returning User Research Workflow

```
Login (P-15) → Dashboard (P-11)
    │
    ├── Check activity feed → New filing alert
    │       │
    │       └── Click alert → IPO Detail (P-03)
    │               │
    │               ├── Review changes
    │               ├── View Diff (P-04)
    │               └── Read AI Report (P-05)
    │
    ├── Check Watchlist (P-12)
    │       │
    │       └── Click watched company → IPO Detail (P-03)
    │
    ├── Browse Calendar (P-06)
    │       │
    │       └── Click event → IPO Detail (P-03)
    │
    └── Read Weekly Digest (P-09)
```

---

## VI. Responsive Breakpoints

All pages follow a consistent responsive strategy:

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| Mobile | < 640px | Single column. Cards stack vertically. Sidebar content moves below main content. Navigation collapses to hamburger menu. |
| Tablet | 640px – 1024px | Two-column card grids. Sidebar may overlay or collapse. Full navigation visible. |
| Desktop | > 1024px | Three-column card grids. Full two-column layout with sidebar. All navigation visible. |

---

## VII. Priority Implementation Order

Based on user value and technical dependencies, the recommended build order is:

| Priority | Page | Rationale |
|----------|------|-----------|
| 1 | P-02: IPO Discovery | Extends the homepage grid into a full browsable experience with filters |
| 2 | P-06: IPO Calendar | High-value visual feature, uses existing filing date data |
| 3 | P-05: AI First-Look Report | Key differentiator, requires LLM integration |
| 4 | P-15: Login / Sign Up | Prerequisite for dashboard, watchlists, and alerts |
| 5 | P-11: User Dashboard | Personalized experience for returning users |
| 6 | P-12: Watchlist | Core engagement feature for authenticated users |
| 7 | P-04: Filing Diff Viewer | Advanced feature, requires amendment parsing |
| 8 | P-07/P-08: Sectors | Aggregation view, uses existing sector data |
| 9 | P-13: Alerts | Requires notification infrastructure |
| 10 | P-16: Pricing | Needed before monetization |
| 11 | P-09: Weekly Digest | Content marketing feature |
| 12 | P-14: Account Settings | Standard CRUD, low priority |
| 13 | P-17–P-19: Static Pages | Legal/marketing, can be added anytime |
