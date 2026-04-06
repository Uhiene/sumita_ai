import Database from "better-sqlite3";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, "../../sumita.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS wrapped_apis (
    id TEXT PRIMARY KEY,
    endpoint_url TEXT NOT NULL,
    price TEXT NOT NULL,
    stellar_address TEXT NOT NULL,
    stellar_secret TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    api_id TEXT NOT NULL,
    amount TEXT NOT NULL,
    from_address TEXT,
    tx_hash TEXT,
    created_at INTEGER NOT NULL
  );
`);

export default db;
