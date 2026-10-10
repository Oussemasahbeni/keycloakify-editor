import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { serverEnv } from "#/config/env.ts";

import * as schema from "./schema.ts";

const sql = neon(serverEnv.DATABASE_URL);
export const db = drizzle(sql, { schema });
