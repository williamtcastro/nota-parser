export interface Issuer {
  name?: string;
  cnpj?: string;
  ie?: string;
  address?: string;
}

export interface Item {
  description?: string;
  code?: string;
  qty?: number;
  unit?: string;
  total?: number;
}

export interface Totals {
  itemCount?: number;
  grandTotal?: number;
}

export interface Payment {
  methodCode?: string;
  methodLabel?: string;
  amount?: number;
}

export interface Metadata {
  accessKey?: string;
  model?: string;
  series?: string;
  number?: string;
  issuedAt?: string;
  protocol?: string;
  portalVersion?: string;
}

export interface NfcePortalResult {
  source: "mg_portal_qrcode_html";
  uf: "MG";

  issuer: Issuer;
  items: Item[];
  totals: Totals;
  payments: Payment[];
  meta: Metadata;
}

export interface PortalAdapter {
  fetch(url: string): Promise<string>;
  parse(html: string): NfcePortalResult;
}

export class PortalParseError extends Error {
  code:
    | "INVALID_HTML"
    | "STRUCTURE_NOT_FOUND"
    | "ISSUER_NOT_FOUND"
    | "ITEMS_NOT_FOUND"
    | "TOTALS_NOT_FOUND";

  constructor(message: string, code: PortalParseError["code"]) {
    super(message);
    this.name = "PortalParseError";
    this.code = code;
  }
}
