import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

export const swaggerPlugin = new Elysia({ name: "plugin.swagger" }).use(
  swagger({
    documentation: {
      info: {
        title: "MG NFC-e Portal API",
        version: "1.0.0",
        description: "API for extracting structural data from MG NFC-e QRCodes.",
      },
    },
  })
);
