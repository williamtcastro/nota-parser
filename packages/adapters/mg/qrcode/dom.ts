import * as cheerio from 'cheerio';
import { PortalParseError } from '@/packages/core/types.ts';

export function loadHtml(html: string): cheerio.CheerioAPI {
  if (!html || html.trim() === '') {
    throw new PortalParseError("Empty HTML provided", "INVALID_HTML");
  }
  return cheerio.load(html);
}
