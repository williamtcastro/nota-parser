import { z } from "zod";
import { MgQrcodePortalAdapter } from "@/packages/adapters/mg/qrcode/index.ts";
import { NfcePortalResultSchema } from "@/packages/core/schema.ts";
import type { Context } from "elysia";

const SingleInputSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

const BatchInputSchema = z.object({
  urls: z.array(z.string().url("Must be a valid URL")).max(50, "Max batch size is 50"),
});

// Helper for parsing a single URL without HTTP context
async function processSingleUrl(url: string) {
  try {
    const adapter = new MgQrcodePortalAdapter();
    const html = await adapter.fetch(url);
    const rawResult = adapter.parse(html);
    return NfcePortalResultSchema.parse(rawResult);
  } catch (error: any) {
    console.error(`[PARSE_ERROR] for URL ${url}:`, error);
    return {
      error: error?.name === "PortalParseError" ? "Parsing failed" : "Internal server error",
      code: error?.code || "UNKNOWN_ERROR",
      message: error?.message || "Unknown error",
      url,
    };
  }
}

export class ParseController {
  static async parseNfce(context: Context) {
    const { body, set } = context;
    
    const parsedInput = SingleInputSchema.safeParse(body);
    if (!parsedInput.success) {
      set.status = 400;
      return {
        error: "Invalid input",
        details: parsedInput.error.format(),
      };
    }

    const { url } = parsedInput.data;
    const result = await processSingleUrl(url);

    if ('error' in result) {
       set.status = result.code === "UNKNOWN_ERROR" ? 500 : 422;
    }
    
    return result;
  }

  static async parseBatch(context: Context) {
    const { body, set } = context;
    
    const parsedInput = BatchInputSchema.safeParse(body);
    if (!parsedInput.success) {
      set.status = 400;
      return {
        error: "Invalid input",
        details: parsedInput.error.format(),
      };
    }

    const { urls } = parsedInput.data;
    
    // Process all URLs concurrently
    const results = await Promise.all(
      urls.map((url) => processSingleUrl(url))
    );

    return {
      processed: results.length,
      results
    };
  }
}
