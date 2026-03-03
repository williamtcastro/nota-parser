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
    summary: "Parse NFC-e QRCode URL",
    description: "Fetches and structurally parses an NFC-e from the MG portal.",
  },
};
