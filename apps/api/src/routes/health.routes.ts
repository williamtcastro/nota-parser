import { Elysia } from "elysia";

export const healthRoutes = new Elysia()
  .get("/", () => ({ status: "ok", message: "MG NFC-e Portal API" }), {
    detail: {
      tags: ['Health'],
      summary: "Health Check",
      description: "Check if the API is running.",
    }
  });
