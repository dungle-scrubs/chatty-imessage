/** Raw message row from SQLite */
export interface MessageRow {
  ROWID: number;
  guid: string;
  text: string | null;
  date: string;
  date_read: string | null;
  date_delivered: string | null;
  date_edited: string | null;
  date_retracted: string | null;
  is_from_me: 0 | 1;
  is_read: 0 | 1;
  is_delivered: 0 | 1;
  is_sent: 0 | 1;
  service: string;
  is_audio_message: 0 | 1;
  reply_to_guid: string | null;
  thread_originator_guid: string | null;
  associated_message_guid: string | null;
  associated_message_type: number;
  expressive_send_style_id: string | null;
  subject: string | null;
  cache_has_attachments: 0 | 1;
  handle: string | null;
  handle_service: string | null;
  chat_name: string | null;
  chat_identifier: string | null;
}

/** Raw attachment row from SQLite */
export interface AttachmentRow {
  ROWID: number;
  filename: string | null;
  mime_type: string | null;
  total_bytes: number;
  transfer_name: string | null;
  uti: string | null;
  is_sticker: 0 | 1;
}

/** Raw handle row from SQLite */
export interface HandleRow {
  ROWID: number;
  id: string;
  service: string;
}

/** Tapback reaction types */
export const TAPBACK_TYPES: Record<number, { emoji: string; action: string }> = {
  2000: { emoji: "❤️", action: "loved" },
  2001: { emoji: "👍", action: "liked" },
  2002: { emoji: "👎", action: "disliked" },
  2003: { emoji: "😂", action: "laughed at" },
  2004: { emoji: "‼️", action: "emphasized" },
  2005: { emoji: "❓", action: "questioned" },
  // Remove reactions (3000-3005) just remove the corresponding 2000-2005
};

/** Expressive send style mappings */
export const EXPRESSIVE_STYLES: Record<string, string> = {
  "com.apple.MobileSMS.expressivesend.impact": "Slam",
  "com.apple.MobileSMS.expressivesend.loud": "Loud",
  "com.apple.MobileSMS.expressivesend.gentle": "Gentle",
  "com.apple.MobileSMS.expressivesend.invisibleink": "Invisible Ink",
};
