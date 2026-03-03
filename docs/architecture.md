# Architecture Overview

This project follows a modular, adapter-based architecture. This allows the core parsing logic and interfaces to be agnostic of the specific state portal (MG, SP, RJ, etc.), meaning it can be easily extended in the future.

## Directory Structure

```text
nota-parser/
├── apps/
│   ├── agent/        # Standalone CLI agent entry point
│   └── api/          # Elysia Web API entry point
│       └── src/
│           ├── controllers/ # Business logic for parsing routes (Single & Batch)
│           ├── models/      # Swagger documentation definitions
│           ├── plugins/     # Elysia plugins (e.g., Swagger setup)
│           ├── routes/      # Route declarations
│           └── index.ts     # API server entry point
├── packages/
│   ├── adapters/     # Portal-specific implementations
│   │   └── mg/       # Minas Gerais state implementations
│   │       └── qrcode/ # Logic for parsing MG's QRCode HTML pages
│   │           ├── __fixtures__/ # Anonymized raw HTML files for integration testing
│   │           └── integration.test.ts # Exhaustive schema-validation tests
│   └── core/         # Shared domain types, schemas, and utils
├── docs/             # Project documentation
├── Dockerfile        # Multi-stage build for minimal standalone deployment
└── docker-compose.yml
```

## Core Components

### 1. The Core Package (`packages/core/`)
- **`types.ts`**: Contains abstract TypeScript interfaces (`Issuer`, `Item`, `NfcePortalResult`) that the rest of the application agrees upon.
- **`schema.ts`**: Exposes Zod schemas (`NfcePortalResultSchema`) used by the API and tests to validate the data at runtime.
- **`normalize.ts`**: Pure functions for data cleaning, such as transforming localized Brazilian currency (`R$ 1.234,56`) into standard floats (`1234.56`).

### 2. The Adapters (`packages/adapters/mg/qrcode/`)
Adapters encapsulate the fragile logic required to fetch and parse external portals.
- **`fetch.ts`**: Handles the HTTP request, mocking realistic headers to prevent being blocked by the state portal.
- **`dom.ts`**: Handles loading the raw HTML string safely into Cheerio.
- **`extract.ts`**: The core heuristics engine. Instead of relying on exact text matches (which break easily), this file uses DOM-anchored structural rules. For example, it locates the `Issuer` not by looking for a specific class name, but by finding the first 14-digit CNPJ pattern and navigating to its parent structural container.
- **`selectors.ts`**: A centralized location for broad CSS selectors used to chunk the HTML document into sections (e.g., Issuer block, Items block, Totals block).

### 3. Applications (`apps/`)
- **`api`**: Uses Elysia to expose the adapter over HTTP. Responsible for request/response lifecycle, HTTP status codes, and Zod validation.
- **`agent`**: A simple CLI wrapper to invoke the adapter from the terminal, useful for debugging or cron jobs.
