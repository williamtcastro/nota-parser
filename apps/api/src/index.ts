import { Elysia } from "elysia";
import { swaggerPlugin } from "./plugins/swagger";
import { healthRoutes } from "./routes/health.routes";
import { parseRoutes } from "./routes/parse.routes";

const app = new Elysia()
  .use(swaggerPlugin)
  .use(healthRoutes)
  .group("/api/v1", (app) => app.use(parseRoutes));

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
  console.log(`📚 API Documentation is available at http://${app.server?.hostname}:${app.server?.port}/swagger`);
});
