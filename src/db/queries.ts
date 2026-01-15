import { getDb } from "./connection";
import type { AttachmentRow, HandleRow, MessageRow } from "./types";

const APPLE_EPOCH_OFFSET = 978307200;

/** Convert Unix timestamp to Apple nanosecond timestamp */
export function toAppleTimestamp(unix: number): number {
  return (unix - APPLE_EPOCH_OFFSET) * 1_000_000_000;
}

/** Convert Apple nanosecond timestamp to Unix timestamp */
export function fromAppleTimestamp(apple: number): number {
  return apple / 1_000_000_000 + APPLE_EPOCH_OFFSET;
}

export interface MessageQueryOptions {
  after?: Date;
  before?: Date;
  contact?: string;
  limit?: number;
  unread?: boolean;
  withAttachments?: boolean;
}

const BASE_MESSAGE_QUERY = `
SELECT
  m.ROWID,
  m.guid,
  m.text,
  datetime(m.date/1000000000 + 978307200, 'unixepoch', 'localtime') as date,
  CASE WHEN m.date_read > 0 THEN datetime(m.date_read/1000000000 + 978307200, 'unixepoch', 'localtime') ELSE NULL END as date_read,
  CASE WHEN m.date_delivered > 0 THEN datetime(m.date_delivered/1000000000 + 978307200, 'unixepoch', 'localtime') ELSE NULL END as date_delivered,
  CASE WHEN m.date_edited > 0 THEN datetime(m.date_edited/1000000000 + 978307200, 'unixepoch', 'localtime') ELSE NULL END as date_edited,
  CASE WHEN m.date_retracted > 0 THEN datetime(m.date_retracted/1000000000 + 978307200, 'unixepoch', 'localtime') ELSE NULL END as date_retracted,
  m.is_from_me,
  m.is_read,
  m.is_delivered,
  m.is_sent,
  m.service,
  m.is_audio_message,
  m.reply_to_guid,
  m.thread_originator_guid,
  m.associated_message_guid,
  m.associated_message_type,
  m.expressive_send_style_id,
  m.subject,
  m.cache_has_attachments,
  h.id as handle,
  h.service as handle_service,
  c.display_name as chat_name,
  c.chat_identifier
FROM message m
LEFT JOIN handle h ON m.handle_id = h.ROWID
LEFT JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
LEFT JOIN chat c ON cmj.chat_id = c.ROWID
`;

export function queryMessages(options: MessageQueryOptions = {}): MessageRow[] {
  const db = getDb();
  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options.after) {
    conditions.push("m.date >= ?");
    params.push(toAppleTimestamp(options.after.getTime() / 1000));
  }

  if (options.before) {
    conditions.push("m.date <= ?");
    params.push(toAppleTimestamp(options.before.getTime() / 1000));
  }

  if (options.contact) {
    conditions.push("(h.id LIKE ? OR c.display_name LIKE ? COLLATE NOCASE)");
    const pattern = `%${options.contact}%`;
    params.push(pattern, pattern);
  }

  if (options.unread) {
    conditions.push("m.is_read = 0 AND m.is_from_me = 0");
  }

  if (options.withAttachments) {
    conditions.push("m.cache_has_attachments = 1");
  }

  let query = BASE_MESSAGE_QUERY;
  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(" AND ")}`;
  }
  query += ` ORDER BY m.date DESC LIMIT ?`;
  params.push(options.limit ?? 20);

  return db.query(query).all(...params) as MessageRow[];
}

export function getAttachments(messageId: number): AttachmentRow[] {
  const db = getDb();
  const query = `
    SELECT
      a.ROWID,
      a.filename,
      a.mime_type,
      a.total_bytes,
      a.transfer_name,
      a.uti,
      a.is_sticker
    FROM attachment a
    JOIN message_attachment_join maj ON a.ROWID = maj.attachment_id
    WHERE maj.message_id = ?
  `;
  return db.query(query).all(messageId) as AttachmentRow[];
}

export function getAllHandles(): HandleRow[] {
  const db = getDb();
  const query = `
    SELECT DISTINCT
      h.ROWID,
      h.id,
      h.service
    FROM handle h
    WHERE h.id IS NOT NULL
    ORDER BY h.id
  `;
  return db.query(query).all() as HandleRow[];
}

export function getMessageByGuid(guid: string): MessageRow | null {
  const db = getDb();
  const query = `${BASE_MESSAGE_QUERY} WHERE m.guid = ?`;
  return (db.query(query).get(guid) as MessageRow) ?? null;
}
