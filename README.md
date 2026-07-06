# Quotation Backend

Node.js/Express backend for the Quotation Management System. Handles quotation CRUD operations, AI-assisted quotation drafting (via Gemini), and approval notifications (via n8n webhooks).

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MySQL
- **AI Provider:** Google Gemini API
- **Automation:** n8n (webhook-based notifications)

## Project Structure

```
quotationbackend/
├── config/
│   └── db.config.js              # MySQL connection setup
├── middleware/
│   ├── functions.js              # Shared helpers (encrypt/decrypt, date formatting)
│   ├── sendmail.js               # Email utility
│   └── auth.js                   # Auth middleware
├── models/
│   └── quotations.js             # Quotation DB operations + AI draft generation
├── services/
│   ├── geminiService.js          # Gemini API integration
│   └── quotationValidation.js    # AI response validation & sanitization
├── src/
│   └── prompts/
│       └── quotation-draft.md    # AI prompt template (Bahrain BHD pricing rules)
├── routes/
│   └── quotations.js             # Express routes
├── tests/
│   ├── quotationValidation.test.js
│   └── quotationCalculations.test.js
├── n8n-workflows/
│   └── quotation-approved-notification.json   # Exported n8n workflow
├── .env                          # Environment variables (not committed)
├── app.js                        # Express app, middleware, routes, server startup
└── package.json
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=db_quotation

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# n8n Webhook (fired when a quotation status changes to Approved)
N8N_APPROVAL_WEBHOOK_URL=https://your-instance.app.n8n.cloud/webhook/quotation-approved

# App base URL (used to build "View Quotation" links in notifications)
APP_BASE_URL=https://yourapp.com
```

**Never commit `.env` to version control.** No API keys are exposed to the frontend — all AI and webhook calls are made server-side only.

### 3. Database connection — local vs. live (SSL)

The live deployment runs on a free-tier hosted MySQL instance that **requires SSL** to connect successfully. A local MySQL install typically does **not** use SSL, so the same connection config can't be used unchanged in both places.

In `config/db.config.js`:

- **Running against the live/hosted DB:** keep SSL enabled —
  ```javascript
  ssl: {
    rejectUnauthorized: true
  }
  ```
- **Running against a local MySQL instance:** remove (or comment out) the `ssl` block entirely, or the connection will fail.

The repository currently has the **live DB credentials** filled in for convenience. If you're running this locally, update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `.env` (or directly in `db.config.js`, depending on how it's wired) to point at your local MySQL instance, and remove the `ssl` block as described above.

### 4. Run the server

**Local development** (auto-restarts on file changes):
```bash
npm start
```
This runs `nodemon app`.

**Production (e.g. Render):** the platform should run the app directly with Node, not nodemon:
```bash
node app.js
```
On Render, set this explicitly as the **Start Command** in the service settings, rather than relying on the default `npm start`.

### 5. Port configuration

The server listens on `process.env.PORT` if set, falling back to `5200` otherwise:
```javascript
const port = process.env.PORT || 5200;
```
This means no manual port changes are needed between environments — Render assigns `PORT` automatically in production, and local development falls back to `5200` with no extra configuration.

## API Routes

All routes are mounted under `/api/v1`:

| Route prefix | Purpose |
|---|---|
| `/api/v1/auth` | Login/authentication |
| `/api/v1/clients` | Client CRUD |
| `/api/v1/quotations` | Quotation CRUD |
| `/api/v1/ai-logs` | AI request/response history |

AI-assisted drafting specifically: `POST /api/v1/quotations/ai-draft`

## Key Features

### AI-Assisted Quotation Drafting

- Endpoint: `POST /api/v1/quotations/ai-draft`
- Takes a short project description (e.g. *"Private dining catering for 10 guests"*) and returns a structured JSON draft: suggested line items, quantities, estimated hours, and unit prices.
- **Pricing is based on Bahrain (BHD) market rates** — see `src/prompts/quotation-draft.md` for the full prompt and pricing rules.
- **If the AI is not confident about a price, it returns `null`** for `unitprice` and `totalprice` rather than inventing a number. The frontend displays these as "TBD" so a human can fill them in.
- All AI output is validated server-side (`services/quotationValidation.js`) before being returned to the frontend — malformed items, invalid quantities, or negative prices are sanitized or rejected.
- The AI call is never made from the frontend. No API key is ever exposed to the browser.

### Approval Notifications (n8n)

- When a quotation's status changes to **Approved** (`iStatus = 2`), the backend fires a webhook to n8n (`N8N_APPROVAL_WEBHOOK_URL`).
- n8n sends a client-facing email and/or a Slack/Discord notification.
- The webhook call is **non-blocking** — if n8n is unreachable or times out, the quotation update still saves successfully; the failure is logged, not surfaced to the user.
- The exported n8n workflow JSON is included at `n8n-workflows/quotation-approved-notification.json` — import this into your own n8n instance to reproduce the notification flow. You'll need to reconnect your own SMTP/Slack/Discord credentials after import (credentials are never stored in the exported JSON).

### Error Handling

- **AI call failure** (network error, Gemini API error, empty response): returns a `502` with a user-friendly message; never crashes the request.
- **Invalid AI JSON**: caught and rejected before reaching the database.
- **n8n webhook failure**: caught and logged; does not block the quotation save.
- **Prompt template missing**: returns a `500` with a clear server configuration error, rather than a silent failure.

## Testing

```bash
npm test
```

Basic unit tests cover:
- **Total calculation** — `quantity × unitprice`, and summing item totals into a grand total, including null-price handling.
- **AI response validation** — ensures null prices are preserved (never invented), invalid quantities are corrected, and malformed responses are rejected before they reach the database.

## Notes on Currency

All prices are in **BHD (Bahraini Dinar)**, which uses 3 decimal places (the fils is 1/1000 BHD), not 2 like USD. Calculations throughout the backend round to 3 decimal places accordingly.


