import { resolve } from "path";
import makeKnex from "knex";

const dbPath = resolve(process.env.DB_PATH);

export const knex = makeKnex({
  client: "better-sqlite3",
  connection: {
    filename: dbPath,
    readonly: true,
  },
  useNullAsDefault: true,
  // debug: true,
  pool: { min: 1, max: 1 },
});

export const getBanner = (cmd) => `
// Generated by scripts/sql-type.mjs
// Rerun \`pnpm ${cmd}\` to regenerate this file.
`;
