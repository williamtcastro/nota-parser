# Development Guidelines

## Adding a New State Adapter

If you need to add support for a new state (e.g., SP), follow these steps:

1. **Create the Directory**
   Create a new folder inside `packages/adapters/`:
   ```bash
   mkdir -p packages/adapters/sp/qrcode
   ```

2. **Implement the `PortalAdapter` Interface**
   Ensure your adapter class implements the `PortalAdapter` interface defined in `packages/core/types.ts`.
   
   ```typescript
   import { PortalAdapter, NfcePortalResult } from '../../../core/types';

   export class SpQrcodePortalAdapter implements PortalAdapter {
     async fetch(url: string): Promise<string> {
       // Custom SP fetch logic
     }

     parse(html: string): NfcePortalResult {
       // Custom SP Cheerio parsing logic
     }
   }
   ```

3. **Update Schemas (If Necessary)**
   If the new state exposes different types of data, update the base schemas in `packages/core/schema.ts` to make those fields optional, or use union types.

## Writing Parsers

When writing the parsing logic in `extract.ts`, keep the following rules in mind:

- **Avoid Literal Labels**: Do not parse based on exact Portuguese wording (`"Total a pagar:"`). Instead, look for structural signals (e.g., the last bolded number in the totals table).
- **Use Regex Carefully**: Use Regex to extract patterns like CNPJs or codes, but never run a Regex against the entire document body. Always scope it to a specific DOM node using Cheerio (`$.text()`).
- **Fail Gracefully**: If a specific non-critical element (like an item's unit of measure) cannot be found, return `undefined` for that field rather than throwing an error, so the rest of the receipt can still be parsed.

## Testing Your Extractors

Because HTML layouts change, you must write tests for your extraction functions.

1. **Grab Real HTML**: Capture a raw HTML file from the portal and isolate the block you are trying to parse.
2. **Mock the DOM**: In your test file (e.g., `extract.test.ts`), load the isolated HTML snippet into Cheerio.
3. **Verify Edge Cases**: Ensure your extractors handle missing elements or slightly altered structures gracefully.
