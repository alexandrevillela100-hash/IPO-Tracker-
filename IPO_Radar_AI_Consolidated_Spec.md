# IPO Radar AI: Consolidated Product & Technical Specification

## I. Executive Summary

IPO Radar AI is an enterprise software platform that monitors the U.S. Securities and Exchange Commission (SEC) for new Initial Public Offering (IPO) related filings, structures the information, enriches it with artificial intelligence (AI), and delivers professional outputs such as dashboards, alerts, and first-look research reports.

The product is an IPO intelligence workflow platform designed to replace manual filing tracking. The core capabilities include detecting new IPO-related filings, extracting structured company and offering data, producing AI-generated summaries, tracking changes across amended filings, and generating a polished "initial coverage" style report. The primary value proposition is enabling professionals to open the platform and immediately understand what new IPO filings matter, what changed, and what the first institutional take should be.

## II. Product Architecture

The IPO Radar AI platform is built upon a five-layer enterprise architecture, supported by a three-service deployment model.

### The Five-Layer Model

1. **Layer 1: Data Ingestion**
   This layer is responsible for discovering, fetching, and storing raw IPO-related source documents from the SEC. It monitors SEC EDGAR for S-1, S-1/A, F-1, and F-1/A filings. The system detects when a new relevant filing appears, determines its type (new candidate, amendment, or noise), and fetches the raw document, metadata, and accession number. The original filing content is preserved exactly as received as the immutable source of truth.

2. **Layer 2: Data Cleansing & Normalization**
   This layer transforms raw SEC filings into a consistent structured schema. It relies on rules first, and AI only when necessary. It maps filings to companies, extracts core entities (issuer, offering, business fields), segments the filing into meaningful sections (e.g., prospectus summary, risk factors, financial statements), links amendments to prior filing chains, and validates the extracted fields.

3. **Layer 3: AI Enrichment**
   This layer uses Large Language Models (LLMs) and supporting logic to turn structured filing data into usable intelligence. It generates executive summaries, drafts investment-style memos (first-look initiation reports), summarizes risk factors, analyzes filing differences (diffs), suggests comparable companies, and generates internal signal scores. All AI outputs must be grounded in extracted source material, with strict quality assurance and hallucination controls.

4. **Layer 4: Workflow**
   This layer turns the intelligence system into enterprise software by enabling users to monitor, save, alert, organize, and act on information. It provides a main dashboard, dedicated company pages, watchlists, alerting capabilities, and search/filtering tools. It also includes administrative workflows for internal operators.

5. **Layer 5: Data Analytics & Visualization**
   The final presentation layer converts underlying data and intelligence into polished, high-value deliverables. It produces first-look reports, filing change (amendment) reports, weekly IPO briefs, and exportable structured outputs (Markdown, PDF-ready HTML, CSV).

### The Three-Service Split

The platform is logically divided into three services:
* **Collector Service:** Handles SEC ingestion and raw storage.
* **Intelligence Service:** Manages parsing, extraction, enrichment, diffing, and report generation.
* **Application Service:** Provides the API, authentication, dashboard, watchlists, alerts, and report delivery.

## III. Technology Stack and Guardrails

The implemented technology choices as of April 2026 reflect a robust, production-ready stack designed for a startup environment.

### Implemented Stack
* **Frontend:** React 19 with Tailwind CSS 4
* **Backend Framework:** Express with tRPC 11
* **Database & ORM:** MySQL/TiDB accessed via Drizzle ORM
* **Authentication:** Manus OAuth

*Note: Initial technical specifications recommended Next.js, FastAPI, and PostgreSQL. The implemented stack utilizes React/Express/tRPC as the authoritative architecture.*

### Architectural Guardrails

The development process follows strict constraints to prevent drift and ensure maintainability:

* **Single Source of Truth:** All environment variables reside in `server/_core/env.ts`. All database queries are in `server/db.ts`. All tRPC procedures are in `server/routers.ts`. All shared constants are in `shared/const.ts`.
* **Strict Data Flow:** Database access is exclusively managed through `server/db.ts`. Components and pages never interact with the database directly. The data flow is: Database → `server/db.ts` (Drizzle ORM) → `server/routers.ts` (tRPC procedures) → `client/src/lib/trpc.ts` (typed hooks) → React components.
* **Query Key Management:** tRPC manages query keys automatically. Manual string-literal query keys are prohibited. Invalidation uses `trpc.useUtils().featureName.invalidate()`.
* **Context-Based IDs:** No hardcoded organization or tenant IDs in runtime code. IDs must be derived from context (e.g., `ctx.user`).
* **File Size Limits:** Files are restricted to a maximum of 300 lines to ensure clarity and reviewability.
* **Responsive Design:** Tailwind CSS responsive prefixes (`sm:`, `md:`, `lg:`) must be used from the beginning.
* **Caching Strategy:** SEC filing data is immutable and must be cached aggressively. It should never be re-fetched or re-processed unless explicitly requested.

## IV. SEC Data Access and Ingestion Strategy

IPO Radar AI accesses SEC filing data exclusively through the SEC's official, publicly available EDGAR APIs. These APIs are free, require no API key or registration, and are accessible to any application that identifies itself with a proper User-Agent header. The system has been tested and validated against live SEC servers as of April 2026, successfully retrieving real filing data for over 90 companies in a single ingestion cycle.

### Implemented Data Sources

The current implementation relies on two primary EDGAR APIs, with a third used for constructing direct document links.

**API 1: EFTS Full-Text Search (`efts.sec.gov/LATEST/search-index`)**

This is the primary discovery mechanism for new IPO filings. The EFTS (Electronic Full-Text Search) API allows the system to search for filings by form type and date range without needing to know the company's CIK number in advance. The system queries this endpoint periodically to discover new S-1, S-1/A, F-1, and F-1/A filings.

| Parameter | Purpose | Example Value |
|-----------|---------|---------------|
| `forms` | Comma-separated form types to search | `S-1,F-1` |
| `dateRange` | Date range mode | `custom` |
| `startdt` | Start date for the search window | `2026-01-01` |
| `enddt` | End date for the search window | `2026-04-04` |
| `from` | Pagination offset | `0` |
| `size` | Results per page (max 100) | `100` |

The API returns an Elasticsearch-style response containing `hits.hits[]`, where each hit's `_source` object includes the company's CIK numbers, display names, form type, file type, filing date, accession number, business locations, SIC industry codes, and state of incorporation. Because the response includes all documents within a filing (including exhibits like EX-4.1 or EX-23.1), the system filters results by `file_type` to retain only main filing documents (S-1, S-1/A, F-1, F-1/A) and deduplicates by accession number.

**API 2: Submissions API (`data.sec.gov/submissions/CIK{10-digit-number}.json`)**

Once a filing is discovered through the EFTS search, the system uses the Submissions API to retrieve detailed company metadata. This endpoint returns comprehensive information about the filer, including the legal company name, ticker symbols, exchange listings, SIC code and description, entity type, state of incorporation, fiscal year end, business and mailing addresses, and the complete filing history. The filing history includes every document the company has ever filed with the SEC, from which the system filters for IPO-related forms.

| Response Field | Description | Example |
|----------------|-------------|--------|
| `name` | Legal company name | Magnum Ice Cream Co N.V. |
| `cik` | Central Index Key | 0002071668 |
| `tickers` | Assigned ticker symbols | ["MICC"] |
| `exchanges` | Target exchange(s) | ["NYSE"] |
| `sic` | Standard Industrial Classification code | 2024 |
| `sicDescription` | Human-readable industry name | Ice Cream and Frozen Desserts |
| `stateOfIncorporation` | Jurisdiction of incorporation | X2 (Netherlands) |
| `entityType` | SEC entity classification | "foreign-private-issuer" |
| `addresses.business` | Street, city, state, ZIP | Amsterdam, NL |
| `filings.recent` | Arrays of form, filingDate, accessionNumber, primaryDocument | S-1 filed 2026-04-02 |

**API 3: Filing Document URLs (Constructed)**

Direct links to the actual filing documents on SEC.gov are constructed using a deterministic URL pattern. The system combines the company's CIK, the accession number (with dashes removed), and the primary document filename to produce a URL that links directly to the filing on the SEC website.

> URL Pattern: `https://www.sec.gov/Archives/edgar/data/{CIK}/{accession-no-dashes}/{primaryDocument}`

For example, a filing by X-Energy, Inc. (CIK 0002088896) with accession number 0001104659-26-039550 and primary document `tm2527636-7_s1a.htm` produces the URL: `https://www.sec.gov/Archives/edgar/data/0002088896/000110465926039550/tm2527636-7_s1a.htm`.

### Fair-Access Compliance

The SEC requires all automated systems to comply with fair-access policies. The IPO Radar AI implementation enforces the following rules at the infrastructure level:

* **Rate Limiting:** A global rate limiter ensures no more than approximately 8 requests per second to any SEC endpoint, staying safely below the SEC's 10 requests-per-second threshold. The limiter introduces a minimum 120-millisecond gap between consecutive requests.
* **User-Agent Identification:** Every request includes a User-Agent header identifying the application and providing a contact email address (currently `IPORadarAI alexandre.villela@velociaventures.com`). This is a mandatory SEC requirement; requests without a proper User-Agent may be blocked.
* **Error Handling:** The system handles HTTP 429 (Too Many Requests), 403 (Forbidden), and 5xx (Server Error) responses gracefully, with retry logic and exponential backoff.
* **Caching:** SEC filing data is immutable by nature (a filed document never changes). The system stores all retrieved data in the database and never re-fetches data for filings that have already been ingested.

### Implemented Ingestion Flow

The current ingestion pipeline operates as follows:

1. **Discovery Phase:** The backend calls the EFTS Search API to find all S-1 and F-1 filings within a configurable date window (default: last 90 days). The search returns up to 100 results per page, which are deduplicated by accession number.
2. **Company Enrichment Phase:** For each unique CIK discovered in the search results, the system calls the Submissions API to retrieve full company metadata (name, address, SIC code, ticker, exchange, entity type, fiscal year end).
3. **Storage Phase:** Company records are upserted into the `companies` table (keyed by CIK), and filing records are upserted into the `filings` table (keyed by accession number). The upsert pattern ensures that re-running ingestion does not create duplicate records.
4. **Linking Phase:** Each filing record is linked to its parent company via the CIK foreign key, enabling the frontend to display all filings for a given company on the detail page.

The ingestion can be triggered manually via the "Sync with SEC" button on the frontend, which calls the `edgar.ingest` tRPC mutation. In a production deployment, this would be replaced or supplemented by a scheduled background job polling every 15 minutes.

### Validated Results

As of April 2026, a single ingestion cycle successfully retrieved **100 filings from 93 unique companies** spanning sectors including nuclear energy, biotechnology, fintech, e-commerce, gaming, cryptocurrency trusts, ice cream manufacturing, robotics, and logistics. All data was stored in the database and rendered on the frontend within seconds.

## V. Data Model

The database schema is structured around several core entities:

* **`issuers`:** The canonical company table containing CIK, legal name, proposed ticker, exchange, headquarters, industry, and status.
* **`filings`:** One row per filing version, tracking accession numbers, form types, filing dates, source URLs, storage paths, and amendment sequences.
* **`filing_sections`:** Normalized sections extracted from a filing, including section type, title, content text, and offsets.
* **`offering_snapshots`:** Structured offering facts (size, share count, price range, use of proceeds, underwriters) per filing version.
* **`financial_snapshots`:** Extracted financial metrics (revenue, gross profit, operating income, net income, cash, debt) tied to a filing version.
* **`risk_items`:** Risk-factor summaries or extracted categorized risks, including importance scores.
* **`ai_reports`:** Generated artifacts such as first-look reports, storing content in Markdown and JSON formats.
* **`filing_diffs`:** Structured comparison records between filing versions, highlighting changes and materiality scores.
* **Workflow Tables:** `watchlists`, `watchlist_items`, `alert_subscriptions`, `users`, `jobs`, and `audit_log`.

## VI. Processing Pipeline and Parsing

The system employs a discrete job queue for ingestion, parsing, enrichment, workflow, and administrative tasks. The parsing strategy is a three-pass model that prioritizes deterministic extraction over LLM-based parsing.

### Job Taxonomy

* **Ingestion Jobs:** `poll_sec_indexes_job`, `fetch_filing_job`, `fetch_submissions_json_job`
* **Parsing Jobs:** `parse_filing_structure_job`, `segment_filing_sections_job`, `extract_structured_fields_job`
* **Enrichment Jobs:** `generate_exec_summary_job`, `generate_risk_summary_job`, `generate_filing_diff_job`, `generate_first_look_report_job`, `generate_weekly_digest_job`
* **Workflow Jobs:** `send_alerts_job`, `rebuild_dashboard_cache_job`, `export_report_job`
* **Admin Jobs:** `reprocess_filing_job`, `repair_issuer_mapping_job`

### Parsing Strategy

The parsing and normalization pipeline is rule-based and deterministic:

1. **Pass 1: Deterministic Extraction**
   Uses regular expressions, parsers, and heuristics to extract the accession number, CIK, form type, filing date, issuer name, ticker (if explicitly disclosed), price range patterns, share counts, and underwriter mentions.
2. **Pass 2: Structured LLM Extraction**
   Uses section-scoped prompts to extract business model summaries, use of proceeds, growth strategies, customer concentration, and notable competitive language.
3. **Pass 3: Validation and Reconciliation**
   Cross-checks numeric fields against nearby source text, ticker/exchange consistency, amendment chain consistency, and conflicting values across sections.

The filing parser identifies document boundaries, extracts plain text from HTML, preserves section anchors, and produces a deterministic section segmentation (e.g., prospectus summary, business, risk factors, use of proceeds, management, MD&A, financial statements).

## VII. AI Enrichment Layer

The AI layer is designed to operate on structured extracted fields, bounded filing sections, and explicit comparison contexts, rather than unstructured filings.

### Principles and Outputs

* **Grounding:** All LLM outputs must be grounded exclusively in provided inputs. If a data point is unavailable, the model must explicitly state "Not disclosed in filing."
* **No Invention:** The AI must never invent valuations, timing, or tickers.
* **Tone:** The language must be concise and institutional.
* **Quality Assurance (QA):** Before publishing, a support-check pass flags unsupported claims, verifies numeric references against structured fields, and stores source-section references in the output JSON.

### Core Deliverables

The AI layer generates:
* Issuer summaries
* Offering summaries
* Risk summaries (categorized risks, unusual risks, changes in language)
* Filing diff summaries (comparing current and previous filings for material changes in price range, share count, financial metrics, risk disclosures, etc.)
* First-look reports (investment-style memos)
* Weekly digests

## VIII. Workflow and Application Layer

The workflow layer provides the user interface and functionality for interacting with the intelligence system.

### Frontend Views

* **Dashboard:** Displays newly filed IPO candidates, amended filings, filings with material changes, watchlists, and recent reports.
* **Issuer Page:** Dedicated pages containing company overviews, filing timelines, offering snapshots, financial snapshots, risk summaries, the latest report, amendment history, and source documents.
* **Report Page:** Polished first-look memos with export options and source references.
* **Diff Page:** Side-by-side field comparisons showing what changed since the prior filing, with material changes highlighted.
* **Watchlists/Alerts Page:** Management interface for saved issuers, sector watchlists, and alert subscriptions.

### Landing Page Specification

The landing page is designed to perform four critical jobs: explain what IPO Radar AI is in one sentence, prove immediate value with live-looking IPO intelligence, show how the product works, and convert visitors into demos, trials, or sign-ups. The visual language should feel closer to an institutional research terminal (e.g., Bloomberg, CapIQ) than a generic SaaS or media site. 

**Design Language:** The interface should utilize a dark navy or charcoal base, off-white text, and muted blue or teal accents. Green and red should be used with restraint, strictly reserved for indicating market changes. Tables must be dense but elegant, cultivating a "terminal meets modern enterprise SaaS" aesthetic.

**Page Structure and Components (In Order):**

1. **Top Navigation:** Kept simple, featuring Product, Coverage, Reports, Pricing, Login, and a primary call-to-action (CTA) such as "Get Started" or "Start Free Trial". The platform is fully self-service; there is no demo-booking flow.
2. **Hero Section:** Immediately communicates that this is an IPO intelligence platform that monitors filings and produces reports.
   * *Headline:* "See the IPO before the market does."
   * *Subheadline:* "IPO Radar AI turns SEC filings into institutional-grade initiation reports—instantly."
   * *Visual:* A product mockup showing a live IPO dashboard, a company card, a filing timeline, a "What Changed" diff panel, and a mini first-look summary.
3. **Trust/Proof Bar:** A thin horizontal strip below the hero section featuring proof points: "Monitors S-1, S-1/A, F-1, F-1/A", "SEC-powered source ingestion", "Amendment tracking", "AI-generated first-look reports", and "Watchlists and alerts".
4. **"What's Happening Now" Market Snapshot Strip:** A productized market snapshot with live data cards such as "New Filings This Week", "Amendments Detected", "Likely Near-Term Launches", and "Most Material Filing Change".
5. **Airbnb-Style "Upcoming IPOs" Discovery Grid:** A highly visual, prominent section replacing traditional data tables with an engaging card-based layout inspired by Airbnb's property discovery experience.
   * *Visual Cards:* Each card features a high-quality, attractive image representing the company's industry or core business (4:3 aspect ratio). Images may be AI-generated or sourced from professional stock photography, but must visually convey the company's sector and business.
   * *Card Layout:* Three columns on desktop, two on tablet, one on mobile. Cards use rounded corners, subtle border styling, and hover effects (slight scale and shadow lift) for interactivity.
   * *Card Content:* Below the image, each card displays:
     - Company name (bold, prominent)
     - Sector badge (color-coded pill, e.g., purple for Quantum Computing, green for Biotech)
     - Filing status badge (color-coded: blue for Filed, amber for Amended, green for Priced)
     - Ticker and exchange overlay on the image (monospaced font)
     - A concise two-to-three sentence business description (truncated to two lines)
     - Metrics strip at the bottom: Deal Size, Proposed Price Range, and Filing Date (monospaced font)
   * *Interaction:* Clicking a card navigates the user to a dedicated IPO Detail Page (see below).

### IPO Detail Page Specification

Each company in the Upcoming IPOs grid links to a comprehensive IPO Detail Page. This page serves as the primary research destination for a specific filing, consolidating all available intelligence into a structured, scannable layout.

**Page Structure:**

1. **Hero Banner:** A full-width banner using the company's representative image with a gradient overlay fading into the page background. Overlaid elements include the company name, ticker/exchange, headquarters, founding year, sector badge, and filing status badge.
2. **Action Bar:** Positioned below the hero, featuring "Add to Watchlist" and "View Full Report" buttons, plus a "Back to IPO Radar" navigation link.
3. **Two-Column Layout (Desktop):**
   * *Main Content (Left, 2/3 width):* Contains the following sections in order:
     - **Business Overview:** Full narrative description of the company's business model, revenue channels, and competitive positioning. Includes CEO, employee count, and headquarters in a sub-grid.
     - **Key Financials:** Six-metric grid displaying Revenue, Net Income, Gross Margin, Cash on Hand, Total Debt, and Employees. All financial figures use monospaced typography.
     - **Use of Proceeds:** Narrative description of how IPO proceeds will be allocated.
     - **Key Risk Factors:** Numbered list of the most significant risk factors extracted from the filing.
     - **Competitive Landscape:** Narrative analysis of the company's competitive positioning and market opportunity.
   * *Sidebar (Right, 1/3 width):* Contains:
     - **Offering Summary:** Sticky card with Deal Size, Proposed Range, Exchange, Filing Date, and Lead Underwriters. Includes a "View SEC Filing" link.
     - **Filing History:** Timeline visualization showing each filing event (S-1, S-1/A) with dates and descriptions.
     - **Recent Developments:** Bulleted list of the most recent material company events.
4. **Responsive Behavior:** On mobile, the sidebar content stacks below the main content in a single column.
6. **Core Workflow Section ("How IPO Radar AI works"):** Differentiates the product through a four-step process:
   * *Detect:* Monitor new SEC IPO-related filings in real time.
   * *Structure:* Extract issuer, offering, financial, and risk data into a usable schema.
   * *Compare:* Identify what changed across amendments.
   * *Deliver:* Generate first-look reports, alerts, dashboards, and timelines.
7. **Product Feature Grid:** Six modernized feature cards emphasizing workflow: SEC Filing Monitor, Amendment Diff Engine, AI First-Look Reports, IPO Calendar Intelligence, Company Profiles, and Alerts & Watchlists.
8. **Secondary Data Modules:** Three specific data tables showcasing the platform's depth (complementing the visual Upcoming IPOs grid):
   * *Recently Filed:* Company, Filing Date, Form, Sector, HQ, First-Look Report Status.
   * *Recently Amended:* Company, Last Amendment Date, Key Change, Materiality, View Diff.
   * *Recently Priced:* Company, Offer Date, Deal Size, Current Price, Return from IPO.
9. **Sample First-Look Report:** A major conversion lever showing a polished preview with company overview, offering summary, key financial metrics, top risks, what changed, preliminary peer set, and key investor questions.
10. **"Why We're Different" Section:** Explicit positioning against traditional IPO sites. While others provide calendars, listings, and news, IPO Radar AI provides filing ingestion, structured extraction, amendment analysis, AI-generated reports, and workflow alerts.
11. **Target User Section:** Segments including Hedge funds/long-only investors, Family offices, Investment banks/ECM teams, Corporate development teams, and IR/advisory firms.
12. **Market Commentary/Insights:** Three cards for SEO and thought leadership: "This Week in IPOs", "Most Important Amendment This Week", and "Sector Activity Snapshot".
13. **Final CTA Block:** Focuses on self-service conversion (e.g., "Get Started Free", "Start Free Trial", "Create Account") with a secondary option to request a sample report. The platform is entirely self-service with no demo-booking or sales-assisted flow.
14. **Footer:** Standard links (Product, Coverage, Reports, Pricing, Contact, Terms, Privacy) and a disclaimer that SEC filings are monitored from official public sources.

**Design Language for Both Pages:** The interface uses a dark charcoal/navy base (background), slate card surfaces, teal (#2DD4BF) as the primary accent for interactive elements, and muted gold for premium highlights. Typography combines DM Sans for headings and body text with JetBrains Mono for all financial data and metrics. Green and red are reserved strictly for market data indicators.

**Strategic Positioning:** The landing page must remain narrowly focused around the differentiated wedge: *"We turn SEC IPO filings into structured, actionable intelligence."*

## IX. Security, Operations, and Documentation

The system prioritizes security and maintainability through strict operational guidelines and a comprehensive documentation stack.

### Security Priorities

* Authentication is required for all non-public pages.
* Administrative routes are protected separately.
* An audit log tracks reprocessing and manual mapping changes.
* Secrets are stored exclusively in environment/config files.
* Object storage access is mediated through signed URLs.
* Report generation is sanitized to prevent XSS/HTML injection.

### Operational Precautions

* Throttle SEC requests and cache aggressively.
* Store last-poll cursors/checkpoints.
* Avoid uncontrolled broad crawls.
* Utilize a dead-letter queue for repeated fetch failures.

### Documentation Stack

The repository maintains a layered documentation system to ensure consistency across the development team (including specialized AI agents):

* **`MEMORY.md`:** System-wide development standards (file-size targets, folder conventions, data layer separation).
* **`CLAUDE.md`:** Project-specific context (what IPO Radar AI is, stack details, architecture, active Request for Discussion [RFD] documents).
* **`_FRAGILE.md`:** Danger zones (auth flows, SEC polling logic, issuer deduplication, amendment linking, alerting logic, destructive admin actions).
* **`_NEXT_SESSION_MEMO.md`:** Session handoff notes (completed work, blockers, next tasks).
* **`_VOCABULARY.md`:** Canonical terms and semantics (e.g., issuer, filing, amendment, offering snapshot).
* **`SECURITY_REPORT.md`:** Timestamped security findings.
* **`REFACTOR.md`:** Code quality issues and refactoring queue.

### Team Operating Model

The development process utilizes specialized agents with gated permissions:
* **Primary Engineer:** Owns cross-codebase architecture.
* **Product Manager:** Maintains the roadmap and RFDs.
* **Coding Agents:** Specialized agents for specific domains (Collector, Parser, Workflow/UI, Reporting).
* **Review Agents:** Specialized agents for testing, code review, security, and performance.
* **Documentation Agent:** Maintains the documentation stack continuously.

## X. Implementation Roadmap

The project is structured around five key milestones:

1. **Milestone 1: SEC Ingestion Backbone**
   Deliver the SEC client, polling job, form-type filtering, raw filing persistence, filings table, and job queue.
2. **Milestone 2: Parsing Backbone**
   Deliver issuer canonicalization, section segmentation, offering extraction, amendment linking, and the issuer page shell.
3. **Milestone 3: AI Enrichment**
   Deliver issuer summaries, offering summaries, risk summaries, filing diff summaries, and first-look report drafts.
4. **Milestone 4: Workflow**
   Deliver the dashboard, watchlists, alerts, report pages, and the admin reprocess tool.
5. **Milestone 5: Premium Output**
   Deliver polished web reports, weekly digests, Markdown/PDF-ready exports, and the side-by-side diff viewer.
