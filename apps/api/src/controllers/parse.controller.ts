import { z } from "zod";
import { MgQrcodePortalAdapter } from "@/packages/adapters/mg/qrcode/index.ts";
import { NfcePortalResultSchema } from "@/packages/core/schema.ts";
import type { Context } from "elysia";

const InputSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

export class ParseController {
  static async parseNfce(context: Context) {
    const { body, set } = context;
    
    // 1. Validate Input using Zod
    const parsedInput = InputSchema.safeParse(body);
    if (!parsedInput.success) {
      set.status = 400;
      return {
        error: "Invalid input",
        details: parsedInput.error.format(),
      };
    }

    const { url } = parsedInput.data;

    try {
      const adapter = new MgQrcodePortalAdapter();
      const html = await adapter.fetch(url);
      const rawResult = adapter.parse(html);

      // 2. Validate Output using Zod
      const validatedResult = NfcePortalResultSchema.parse(rawResult);

      return validatedResult;
    } catch (error: any) {
      console.error("[PARSE_ERROR]", error);

      if (error?.name === "PortalParseError") {
        set.status = 422;
        return {
          error: "Parsing failed",
          code: error.code,
          message: error.message,
        };
      }

      if (error instanceof z.ZodError) {
        set.status = 500;
        return {
          error: "Schema validation failed for adapter output",
          details: error.format(),
        };
      }

      set.status = 500;
      return {
        error: "Internal server error",
        message: error?.message || "Unknown error",
      };
    }
  }
}
