import { expect, test, describe } from "bun:test";
import fs from "fs/promises";
import path from "path";
import { MgQrcodePortalAdapter } from "./index";
import { NfcePortalResultSchema } from "@/packages/core/schema";

describe("MgQrcodePortalAdapter - Integration Tests", () => {
  const adapter = new MgQrcodePortalAdapter();

  test("should correctly parse the BMP test case from HTML fixture", async () => {
    // Read the locally saved HTML fixture
    const htmlPath = path.join(import.meta.dir, "__fixtures__", "bmp.html");
    const html = await fs.readFile(htmlPath, "utf-8");

    // Parse it using the adapter
    const result = adapter.parse(html);

    // Ensure it strictly passes the Zod schema validation
    const parsed = NfcePortalResultSchema.parse(result);

    // Validate Issuer
    expect(parsed.issuer.name).toBe("BMP UTILIDADES DOMeSTICAS SA");
    expect(parsed.issuer.cnpj).toBe("00000000000000");
    expect(parsed.issuer.ie).toBe("000000000");

    // Validate Totals
    expect(parsed.totals.itemCount).toBe(13);
    expect(parsed.totals.grandTotal).toBe(300.82);

    // Validate Payments
    expect(parsed.payments.length).toBe(1);
    expect(parsed.payments[0]?.methodCode).toBe("03");
    expect(parsed.payments[0]?.methodLabel).toBe("Cartão de Crédito");
    expect(parsed.payments[0]?.amount).toBe(300.82);

    // Validate Meta
    expect(parsed.meta.accessKey).toBe("00000000000000000000000000000000000000000000");
    expect(parsed.meta.model).toBe("65");
    expect(parsed.meta.series).toBe("108");
    expect(parsed.meta.number).toBe("00000");
  });

  test("should correctly parse the CEMA test case from HTML fixture", async () => {
    // Read the locally saved HTML fixture
    const htmlPath = path.join(import.meta.dir, "__fixtures__", "cema.html");
    const html = await fs.readFile(htmlPath, "utf-8");

    // Parse it using the adapter
    const result = adapter.parse(html);

    // Ensure it strictly passes the Zod schema validation
    const parsed = NfcePortalResultSchema.parse(result);

    // Validate Issuer
    expect(parsed.issuer.name).toBe("(32)CEMA CENTRAL MINEIRA ATACADISTA LTDA");
    expect(parsed.issuer.cnpj).toBe("00000000000000");
    expect(parsed.issuer.ie).toBe("000000000");

    // Validate Totals
    expect(parsed.totals.itemCount).toBe(15);
    expect(parsed.totals.grandTotal).toBe(100.47);

    // Validate Payments
    expect(parsed.payments.length).toBe(1);
    expect(parsed.payments[0]?.methodCode).toBe("99");
    expect(parsed.payments[0]?.methodLabel).toBe("Outros");
    expect(parsed.payments[0]?.amount).toBe(100.47);

    // Validate Items
    expect(parsed.items.length).toBe(15);
    expect(parsed.items[0]?.description).toBe("ALFACE CRESPA HIDROPONICA UN");
    expect(parsed.items[0]?.code).toBe("113563");
    expect(parsed.items[0]?.qty).toBe(1);
    expect(parsed.items[0]?.unit).toBe("UN");
    expect(parsed.items[0]?.total).toBe(4.48);

    // Validate fractional weight item
    expect(parsed.items[5]?.description).toBe("BATATA BOLINHA kg");
    expect(parsed.items[5]?.qty).toBe(0.36);
    expect(parsed.items[5]?.unit).toBe("KG");
    expect(parsed.items[5]?.total).toBe(1.26);

    // Validate Meta
    expect(parsed.meta.accessKey).toBe("00000000000000000000000000000000000000000000");
  });
});
