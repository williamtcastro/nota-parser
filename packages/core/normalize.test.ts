import { expect, test, describe } from "bun:test";
import { parseCurrency, parseQuantity, cleanText } from "./normalize";

describe("normalize", () => {
  describe("parseCurrency", () => {
    test("should parse valid currency values", () => {
      expect(parseCurrency("100,50")).toBe(100.5);
      expect(parseCurrency("1.234,56")).toBe(1234.56);
      expect(parseCurrency("R$ 50,00")).toBe(50.0);
      expect(parseCurrency("10")).toBe(10.0);
    });

    test("should return undefined for invalid or empty values", () => {
      expect(parseCurrency(undefined)).toBeUndefined();
      expect(parseCurrency("")).toBeUndefined();
      expect(parseCurrency("invalid")).toBeUndefined();
    });
  });

  describe("parseQuantity", () => {
    test("should parse valid quantity values", () => {
      expect(parseQuantity("1,000")).toBe(1.0);
      expect(parseQuantity("10,5")).toBe(10.5);
      expect(parseQuantity("2")).toBe(2.0);
    });

    test("should return undefined for invalid or empty values", () => {
      expect(parseQuantity(undefined)).toBeUndefined();
      expect(parseQuantity("")).toBeUndefined();
    });
  });

  describe("cleanText", () => {
    test("should clean and trim text", () => {
      expect(cleanText("  hello   world  ")).toBe("hello world");
      expect(cleanText(`test \n \t string`)).toBe("test string");
    });

    test("should return undefined for empty or undefined inputs", () => {
      expect(cleanText(undefined)).toBeUndefined();
      expect(cleanText("")).toBeUndefined();
      expect(cleanText("   ")).toBeUndefined();
    });
  });
});
