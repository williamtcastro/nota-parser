import { type PortalAdapter, type NfcePortalResult, PortalParseError } from '@/packages/core/types.ts';
import { fetchPortalPage } from './fetch';
import { loadHtml } from './dom';
import { extractIssuer, extractItems, extractTotals, extractPayments, extractMetadata } from './extract';

export class MgQrcodePortalAdapter implements PortalAdapter {
  async fetch(url: string): Promise<string> {
    return fetchPortalPage(url);
  }

  parse(html: string): NfcePortalResult {
    const $ = loadHtml(html);

    try {
      const issuer = extractIssuer($);
      const items = extractItems($);
      const totals = extractTotals($);
      const payments = extractPayments($);
      const meta = extractMetadata($);

      return {
        source: "mg_portal_qrcode_html",
        uf: "MG",
        issuer,
        items,
        totals,
        payments,
        meta
      };
    } catch (error) {
      if (error instanceof PortalParseError) {
        throw error;
      }
      throw new PortalParseError(`Unexpected parse error: ${error instanceof Error ? error.message : String(error)}`, "STRUCTURE_NOT_FOUND");
    }
  }
}
