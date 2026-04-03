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

The SEC's `data.sec.gov` APIs provide access to company submissions and XBRL data. The system utilizes these official sources while adhering to fair-access compliance requirements.

### Official Data Sources

* **Submissions API (`data.sec.gov/submissions/CIK##########.json`):** Returns a filer's submission history and metadata. Used for issuer history refresh, timeline enrichment, and detecting amendments for tracked issuers.
* **Raw EDGAR Archives:** Provides direct access to raw `.txt`, index pages, and filing directories via accession-number-based paths. Used for original raw filing capture, section parsing, and preserving canonical source documents.
* **Daily/Full Indexes:** Provided in HTML/XML/JSON formats. Essential for discovering new filings without prior knowledge of the issuer CIK. Used for polling new S-1/F-1/S-1A/F-1A filings.
* **XBRL APIs:** Used selectively for financial normalization and cross-checking extracted figures.

### Fair-Access Compliance

The SEC client implementation must strictly adhere to the following rules:
* Throttle requests below 10 requests per second globally.
* Identify the application with a clear User-Agent (e.g., `IPO Radar AI/0.1 (contact: [email])`).
* Implement jittered exponential backoff on 429/403/5xx errors.
* Aggressively cache responses (submissions JSON, index files, metadata) and avoid re-fetching raw documents.

### Ingestion Flow

The collector pipeline follows this sequence:
1. Poll SEC daily/full indexes every 15 minutes.
2. Filter for target form types (S-1, S-1/A, F-1, F-1/A).
3. For each new accession number: create a pending filing record, fetch the index page and raw filing text/HTML, store the raw payloads in object storage, and enqueue a parsing job.
4. Once the issuer is known and canonicalized, fetch the submissions JSON to backfill the prior filing chain if necessary.

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

The landing page is designed to convert visitors into demos, trials, or sign-ups by proving immediate value with live-looking IPO intelligence. It should feel closer to an institutional research terminal (e.g., Bloomberg, CapIQ) than a generic SaaS or media site.

**Design Language:** Dark navy/charcoal base, off-white text, muted blue/teal accents, restrained use of green/red for market changes, dense but elegant tables.

**Page Structure (Final Order):**
1. Top Navigation (Product, Coverage, Reports, Pricing, Login, CTA)
2. Hero Section ("See the IPO before the market does.")
3. Trust/Proof Bar (Monitors S-1/F-1, SEC-powered, AI-generated reports)
4. "What's happening now" Market Snapshot Strip (Live data cards: New Filings, Amendments, Likely Launches, Material Changes)
5. Core Workflow Section ("How IPO Radar AI works": Detect, Structure, Compare, Deliver)
6. Product Feature Grid (SEC Filing Monitor, Amendment Diff Engine, AI First-Look Reports, IPO Calendar Intelligence, Company Profiles, Alerts & Watchlists)
7. Data Modules (Upcoming IPOs, Recently Filed, Recently Amended, Recently Priced)
8. Sample First-Look Report (Conversion lever)
9. "Why we're different" Section (Positioning against traditional IPO sites)
10. Target User Section (Hedge funds, family offices, investment banks, corporate development)
11. Market Commentary/Insights (Weekly updates)
12. Final CTA Block (Book a Demo, Join Early Access)
13. Footer

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
