import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CHAT_DB_PATH = join(homedir(), "Library/Messages/chat.db");

let db: Database | null = null;

export class ChatDbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatDbError";
  }
}

/**
 * Get or lazily open a read-only connection to the Messages SQLite database.
 * Throws ChatDbError with actionable messages when the database is missing or inaccessible.
 * @returns Open Database handle (singleton — reused across calls)
 * @throws {ChatDbError} If database file is missing or Full Disk Access is not granted
 */
export function getDb(): Database {
  if (!db) {
    if (!existsSync(CHAT_DB_PATH)) {
      throw new ChatDbError(
        `Messages database not found at ${CHAT_DB_PATH}\n` +
          "Make sure you're running on macOS with Messages.app configured.",
      );
    }

    try {
      db = new Database(CHAT_DB_PATH, { readonly: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("SQLITE_CANTOPEN") || msg.includes("unable to open")) {
        throw new ChatDbError(
          `Cannot open Messages database. Grant Full Disk Access to your terminal:\n` +
            "System Settings → Privacy & Security → Full Disk Access",
        );
      }
      throw new ChatDbError(`Failed to open Messages database: ${msg}`);
    }
  }
  return db;
}

/** Close the database connection if open. Safe to call multiple times. */
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
