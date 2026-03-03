import { expect, test, describe } from "bun:test";
import { IssuerSchema, ItemSchema } from "./schema";

describe("schemas", () => {
  describe("IssuerSchema", () => {
    test("should validate correct issuer", () => {
      const data = {
        name: "SUPERMERCADO LTDA",
        cnpj: "12345678000199",
        ie: "123456789",
        address: "RUA A, 123",
      };
      
      const result = IssuerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    test("should allow partial data", () => {
      const data = {
        name: "SUPERMERCADO LTDA",
      };
      
      const result = IssuerSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("ItemSchema", () => {
    test("should validate correct item", () => {
      const data = {
        description: "Biscoito",
        code: "123",
        qty: 2,
        unit: "UN",
        total: 10.5,
      };
      
      const result = ItemSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
    
    test("should fail on invalid types", () => {
      const data = {
        qty: "2", // Expected number
      };
      
      const result = ItemSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
