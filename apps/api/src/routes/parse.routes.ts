import { Elysia } from "elysia";
import { ParseController } from "../controllers/parse.controller";
import { ParseRouteDocs } from "../models/parse.model";

export const parseRoutes = new Elysia({ prefix: "/parse" })
  .post("/", ParseController.parseNfce, ParseRouteDocs);
