import { z } from "zod";

export const IssuerSchema = z.object({
  name: z.string().optional(),
  cnpj: z.string().optional(),
  ie: z.string().optional(),
  address: z.string().optional(),
});

export const ItemSchema = z.object({
  description: z.string().optional(),
  code: z.string().optional(),
  qty: z.number().optional(),
  unit: z.string().optional(),
  total: z.number().optional(),
});

export const TotalsSchema = z.object({
  itemCount: z.number().optional(),
  grandTotal: z.number().optional(),
});

export const PaymentSchema = z.object({
  methodCode: z.string().optional(),
  methodLabel: z.string().optional(),
  amount: z.number().optional(),
});

export const MetadataSchema = z.object({
  accessKey: z.string().optional(),
  model: z.string().optional(),
  series: z.string().optional(),
  number: z.string().optional(),
  issuedAt: z.string().optional(),
  protocol: z.string().optional(),
  portalVersion: z.string().optional(),
});

export const NfcePortalResultSchema = z.object({
  source: z.literal("mg_portal_qrcode_html"),
  uf: z.literal("MG"),
  issuer: IssuerSchema,
  items: z.array(ItemSchema),
  totals: TotalsSchema,
  payments: z.array(PaymentSchema),
  meta: MetadataSchema,
});
