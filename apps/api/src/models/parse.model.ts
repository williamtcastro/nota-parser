import { t } from "elysia";

export const ParseRouteDocs = {
  body: t.Object({
    url: t.String({
      format: "uri",
      description: "The complete URL of the NFC-e QRCode portal page",
      default: "https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=...",
    }),
  }),
  detail: {
    tags: ['NFC-e Parser'],
    summary: "Parse a single NFC-e QRCode URL",
    description: "Fetches and structurally parses an NFC-e from the MG portal.",
  },
};

export const ParseBatchRouteDocs = {
  body: t.Object({
    urls: t.Array(
      t.String({
        format: "uri",
        description: "The complete URL of the NFC-e QRCode portal page",
      }),
      {
        maxItems: 50,
        description: "An array of up to 50 URLs to parse concurrently.",
        default: ["https://portalsped.fazenda.mg.gov.br/portalnfce/sistema/qrcode.xhtml?p=..."]
      }
    ),
  }),
  detail: {
    tags: ['NFC-e Parser'],
    summary: "Parse multiple NFC-e QRCode URLs in batch",
    description: "Concurrently fetches and structurally parses multiple NFC-e URLs from the MG portal. Returns a mix of successful results and individual error messages.",
  },
};
