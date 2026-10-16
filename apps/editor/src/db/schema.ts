import { sql } from "drizzle-orm";
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import type { EmailThemeConfig, LoginThemeConfig } from "#/features/editor/shared/model/theme-config.ts";
import type { StoredAssets } from "#/features/themes/model/saved-theme.ts";

export const themes = pgTable(
    "themes",
    {
        id: uuid()
            .primaryKey()
            .default(sql`uuidv7()`),
        ownerSub: text("owner_sub").notNull(),
        name: text().notNull(),
        schemaVersion: integer("schema_version").notNull(),
        login: jsonb().$type<LoginThemeConfig>().notNull(),
        email: jsonb().$type<EmailThemeConfig>().notNull(),
        /**
         * The uploaded images, by slot. Only where each one is: the bytes live in
         * object storage under the recorded key.
         */
        assets: jsonb().$type<StoredAssets>().notNull().default({}),
        /** Bumped on every save; the client sends the one it loaded so a stale tab can't overwrite. */
        revision: integer().notNull().default(1),
        /** Unguessable token; non-null means "anyone with the link can read". */
        shareToken: text("share_token").unique(),
        createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    },
    table => [index("themes_owner_updated_idx").on(table.ownerSub, table.updatedAt.desc())],
);
