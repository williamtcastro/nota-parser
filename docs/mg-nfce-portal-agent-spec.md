# MG NFC-e QRCode Portal Agent

## Specification & Abstract Implementation (HTML-Structure Driven)

Target endpoint example:

https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=...

This document defines:

-   Parsing strategy
-   DOM-anchored extraction rules
-   Abstract adapter interfaces
-   Stability constraints
-   Failure modes
-   Output schema

The implementation must rely on **HTML structure and semantic
attributes**, NOT visible text labels, to reduce breakage if wording
changes.

------------------------------------------------------------------------

# 1. Objective

Build an agent and API that:

1.  Fetches the NFC-e QRCode portal page (MG).
2.  Extracts structured data directly from HTML DOM.
3.  Produces a normalized JSON object.
4.  Avoids fragile text-based parsing.
5.  Serves this functionality via a fast Web API using Elysia.

------------------------------------------------------------------------

# 2. Constraints

-   No official JSON API.
-   Page is XHTML-based (JSF / PrimeFaces style structure).
-   Content is server-rendered.
-   Layout may change visually; structural grouping tends to remain
    stable.

------------------------------------------------------------------------

# 3. Architecture

    nota-parser/
      apps/
        agent/
          src/index.ts
        api/
          src/
            controllers/
            models/
            plugins/
            routes/
            index.ts

    packages/
      core/
        types.ts
        normalize.ts
        schema.ts
      adapters/
        mg/
          qrcode/
            fetch.ts
            dom.ts
            extract.ts
            selectors.ts
            index.ts
            __fixtures__/
            integration.test.ts

    docs/
      architecture.md
      development.md
    
    Dockerfile
    docker-compose.yml

------------------------------------------------------------------------

# 4. Parsing Strategy (HTML-Driven)

## 4.1 General Approach

1.  Load HTML with Cheerio (or JSDOM).
2.  Work from structural containers.
3.  Identify sections by:
    -   container hierarchy
    -   repeated block patterns
    -   sibling grouping
    -   table layouts
4.  Avoid regex over raw body text.
5.  Avoid reliance on Portuguese labels.

------------------------------------------------------------------------

# 5. Extraction Rules

## 5.1 Issuer Block

Structural detection:

-   First container containing a 14-digit numeric sequence (CNPJ).
-   Extract first strong/heading element as issuer name.
-   Extract CNPJ via numeric pattern.
-   Extract IE from same container.
-   Extract address from sibling block.

Abstract:

``` ts
function extractIssuer($: CheerioAPI): Issuer
```

------------------------------------------------------------------------

## 5.2 Items List

Structural detection:

-   Repeated block groups.
-   Each group contains a details block with a "(Código: X)" pattern.

Rules:

-   Description = previous sibling block.
-   Code = numeric inside parentheses.
-   Quantity = first numeric in block.
-   Unit = short uppercase token.
-   Total = last currency-like numeric in block.

Abstract:

``` ts
function extractItems($: CheerioAPI): Item[]
```

------------------------------------------------------------------------

## 5.3 Totals Section

Structural detection:

-   Container after items block.
-   First integer = item count.
-   Last currency-like numeric = grand total.

Abstract:

``` ts
function extractTotals($: CheerioAPI): Totals
```

------------------------------------------------------------------------

## 5.4 Payments Section

Structural detection:

-   Repeated pattern of:
    -   Currency numeric
    -   Two-digit method code
    -   Label text

Abstract:

``` ts
function extractPayments($: CheerioAPI): Payment[]
```

------------------------------------------------------------------------

## 5.5 Metadata Section

Structural detection:

-   Bottom container with numeric sequences.
-   Model = 2-digit number.
-   Series and number follow.
-   Date pattern: dd/mm/yyyy hh:mm:ss.
-   Protocol = long numeric token.
-   Version = decimal pattern.

Abstract:

``` ts
function extractMetadata($: CheerioAPI): Metadata
```

------------------------------------------------------------------------

# 6. Output Schema

``` ts
interface NfcePortalResult {
  source: "mg_portal_qrcode_html";
  uf: "MG";

  issuer: {
    name?: string;
    cnpj?: string;
    ie?: string;
    address?: string;
  };

  items: Array<{
    description?: string;
    code?: string;
    qty?: number;
    unit?: string;
    total?: number;
  }>;

  totals: {
    itemCount?: number;
    grandTotal?: number;
  };

  payments: Array<{
    methodCode?: string;
    methodLabel?: string;
    amount?: number;
  }>;

  meta: {
    model?: string;
    series?: string;
    number?: string;
    issuedAt?: string;
    protocol?: string;
    portalVersion?: string;
  };
}
```

------------------------------------------------------------------------

# 7. Adapter Interface

``` ts
export interface PortalAdapter {
  fetch(url: string): Promise<string>;
  parse(html: string): NfcePortalResult;
}
```

Concrete implementation:

``` ts
export class MgQrcodePortalAdapter implements PortalAdapter {}
```

------------------------------------------------------------------------

# 8. Normalization Rules

-   Convert currency to decimal numbers.
-   Convert date to ISO.
-   Trim whitespace.
-   Remove duplicated spaces.
-   Preserve raw values optionally.

------------------------------------------------------------------------

# 9. Stability Strategy

-   Do not rely on literal Portuguese labels.
-   Use numeric patterns and DOM adjacency.
-   Maintain HTML fixtures for regression testing.
-   Fail fast if core structural elements missing.

------------------------------------------------------------------------

# 10. Error Handling

``` ts
class PortalParseError extends Error {
  code:
    | "INVALID_HTML"
    | "STRUCTURE_NOT_FOUND"
    | "ISSUER_NOT_FOUND"
    | "ITEMS_NOT_FOUND"
    | "TOTALS_NOT_FOUND";
}
```

------------------------------------------------------------------------

# 11. Testing Strategy

-   Store real HTML snapshots.
-   Unit test each extractor independently.
-   Snapshot full parsed object.
-   Detect structural drift early.

------------------------------------------------------------------------

# 12. Summary

This specification defines a DOM-anchored parsing strategy for the MG
NFC-e QRCode portal page.

The implementation must treat the page as structured XHTML and avoid
fragile text-based extraction.
