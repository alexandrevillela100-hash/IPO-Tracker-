# IPO Radar AI

**AI-powered IPO intelligence platform** that transforms SEC filings into institutional-grade initiation reports.

Monitor S-1 and F-1 filings, track amendments, and get AI-generated first-look research — all from the primary source.

---

## Features

| Feature | Description |
|---------|-------------|
| **SEC EDGAR Integration** | Real-time ingestion of S-1, S-1/A, F-1, and F-1/A filings with SIC-to-sector mapping |
| **AI First-Look Reports** | LLM-powered initiation reports using verified SEC financial data only — no hallucinated figures |
| **Filing Diff Engine** | Side-by-side comparison of filing amendments highlighting material changes |
| **IPO Calendar** | Track filing timelines, expected pricing dates, and market windows |
| **Company Profiles** | Comprehensive issuer pages with business overview, financials, and risk analysis |
| **Watchlists & Alerts** | Custom watchlists with real-time alerts for new filings and amendments |
| **Stripe Billing** | Free, Pro ($49/mo), and Enterprise tiers with checkout and subscription management |
| **Command Palette** | Quick search across companies, filings, and sectors via Cmd+K |

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Wouter, Framer Motion |
| **Backend** | Express 4, tRPC 11, Node.js |
| **Database** | MySQL/TiDB via Drizzle ORM (6 tables, full migration history) |
| **Auth** | Email/password with bcrypt hashing + JWT sessions |
| **Payments** | Stripe (checkout sessions, webhooks, subscription lifecycle) |
| **AI** | LLM integration for report generation with structured SEC data input |
| **Data Source** | SEC EDGAR EFTS + Submissions API |
| **Testing** | Vitest (72 tests across auth, EDGAR, watchlist, alerts, Stripe) |

## Design System — Dark Terminal Luxe

The platform uses a premium data-dense aesthetic: deep charcoal backgrounds, teal primary accent, gold highlights, DM Sans for UI copy, JetBrains Mono for code and data, subtle grain overlay, and radial gradient hero effects.

## Project Structure

```
client/                  # React frontend
  src/
    pages/               # 25+ page components
    components/          # Shared UI components (Navbar, Footer, AppShell, etc.)
    lib/                 # tRPC client, sector utilities
    hooks/               # Custom React hooks
server/                  # Express + tRPC backend
  edgar/                 # SEC EDGAR API client module
  stripe/                # Stripe billing integration
  db.ts                  # Database query helpers
  routers.ts             # All tRPC procedures
  edgarIngestion.ts      # SEC filing ingestion pipeline
drizzle/                 # Database schema & migrations
shared/                  # Shared types and constants
docs/                    # Documentation and specifications
  specs/                 # Original product specs and wireframes
```

## Pages

**Public Marketing:** Home, IPO Discovery, IPO Calendar, Sectors, Company Comparison, Filing Diff Viewer, Market Commentary, Pricing, About, Contact, Legal (Terms/Privacy), Sample Report

**Authenticated App Shell:** IPO Calendar, IPO News, IPO Stats, Screens (filterable tables)

**User Dashboard:** Watchlist, Alerts, Saved Reports, Account Settings

## Database Schema

Six tables managed via Drizzle ORM:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with email/password auth and role-based access |
| `companies` | SEC-registered companies with CIK, SIC codes, and sector mapping |
| `filings` | S-1/F-1 filings with form type, dates, and financial data |
| `emailSignups` | Email list signups from the marketing site |
| `watchlistItems` | User watchlist entries linked to companies |
| `userAlerts` | User alert preferences and notification history |

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## Environment Variables

The application requires the following environment variables (configured via the hosting platform):

- `DATABASE_URL` — MySQL/TiDB connection string
- `JWT_SECRET` — Session signing secret
- `STRIPE_SECRET_KEY` — Stripe API secret key (for billing)
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook verification secret

## Testing

The project includes 72 tests across 7 test files:

```bash
pnpm test
```

Coverage spans: authentication (email/password register, login, logout), SEC EDGAR API integration (EFTS search, submissions), watchlist and alerts CRUD, Stripe billing procedures, and data integrity checks.

## License

MIT
