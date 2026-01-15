import chalk from "chalk";
import type { AttachmentRow, MessageRow } from "../db/types";
import { EXPRESSIVE_STYLES, TAPBACK_TYPES } from "../db/types";
import { formatBytes } from "./dates";

export interface FormattedMessage {
  row: MessageRow;
  contactName: string | null;
  attachments: AttachmentRow[];
}

/** Get service badge */
function serviceBadge(service: string): string {
  switch (service?.toLowerCase()) {
    case "imessage":
      return chalk.blue("[iMessage]");
    case "sms":
      return chalk.green("[SMS]");
    case "rcs":
      return chalk.magenta("[RCS]");
    default:
      return chalk.gray(`[${service}]`);
  }
}

/** Get attachment icon based on mime type */
function attachmentIcon(mimeType: string | null, isSticker: boolean): string {
  if (isSticker) return "🏷️";
  if (!mimeType) return "📎";
  if (mimeType.startsWith("image/")) return "📷";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  return "📎";
}

export interface FormatOptions {
  verbose?: boolean;
  showId?: boolean;
}

/** Format a single message for display */
export function formatMessage(
  msg: FormattedMessage,
  options: FormatOptions | boolean = false,
): string {
  // Support legacy boolean argument for verbose
  const opts: FormatOptions = typeof options === "boolean" ? { verbose: options } : options;
  const { row, contactName, attachments } = msg;
  const lines: string[] = [];

  // Direction indicator
  const direction = row.is_from_me ? chalk.cyan("→") : chalk.yellow("←");

  // Sender/recipient display
  const contact = contactName ?? row.handle ?? "Unknown";
  const sender = row.is_from_me ? chalk.cyan("Me") : chalk.yellow(contact);

  // Date
  const date = chalk.gray(row.date ?? "");

  // Read status indicator (for incoming messages)
  const readIndicator = !row.is_from_me && !row.is_read ? chalk.red("●") : "";

  // Service badge
  const service = opts.verbose ? ` ${serviceBadge(row.service)}` : "";

  // Message ID (show if requested or if message has attachments)
  const showId = opts.showId || attachments.length > 0;
  const idPrefix = showId ? chalk.dim(`[${row.ROWID}] `) : "";

  // Build first line
  let line1 = `${idPrefix}${readIndicator}${date}  ${sender} ${direction}`;
  if (row.is_from_me && contactName) {
    line1 += ` ${chalk.dim(contact)}`;
  }
  line1 += service;

  // Check if this is a tapback/reaction
  if (row.associated_message_type >= 2000 && row.associated_message_type < 4000) {
    const tapback = TAPBACK_TYPES[row.associated_message_type];
    if (tapback) {
      lines.push(`${line1}  ${tapback.emoji} ${tapback.action}`);
      return lines.join("\n");
    }
  }

  lines.push(line1);

  // Message text
  if (row.text) {
    let text = row.text;
    // Edited indicator
    if (row.date_edited) {
      text += chalk.dim(" (edited)");
    }
    // Retracted indicator
    if (row.date_retracted) {
      text = chalk.strikethrough(chalk.dim("Message unsent"));
    }
    lines.push(`  ${text}`);
  }

  // Audio message indicator
  if (row.is_audio_message) {
    lines.push(`  🎤 ${chalk.dim("Voice message")}`);
  }

  // Expressive style
  if (opts.verbose && row.expressive_send_style_id) {
    const style = EXPRESSIVE_STYLES[row.expressive_send_style_id];
    if (style) {
      lines.push(`  ${chalk.dim(`Sent with ${style} effect`)}`);
    }
  }

  // Attachments
  for (const att of attachments) {
    const icon = attachmentIcon(att.mime_type, att.is_sticker === 1);
    const name = att.transfer_name ?? att.filename?.split("/").pop() ?? "attachment";
    const size = att.total_bytes > 0 ? chalk.dim(`(${formatBytes(att.total_bytes)})`) : "";
    lines.push(`  ${icon} ${chalk.underline(name)} ${size}`);
  }

  // Verbose: delivery info
  if (opts.verbose && row.is_from_me) {
    if (row.date_delivered) {
      lines.push(`  ${chalk.dim(`Delivered: ${row.date_delivered}`)}`);
    }
    if (row.date_read) {
      lines.push(`  ${chalk.dim(`Read: ${row.date_read}`)}`);
    }
  }

  return lines.join("\n");
}

/** Format messages as JSON */
export function formatMessagesJson(messages: FormattedMessage[]): string {
  return JSON.stringify(
    messages.map(({ row, contactName, attachments }) => ({
      id: row.ROWID,
      guid: row.guid,
      text: row.text,
      date: row.date,
      isFromMe: row.is_from_me === 1,
      isRead: row.is_read === 1,
      service: row.service,
      contact: contactName ?? row.handle,
      handle: row.handle,
      chatName: row.chat_name,
      attachments: attachments.map((a) => ({
        filename: a.filename,
        mimeType: a.mime_type,
        size: a.total_bytes,
        originalName: a.transfer_name,
      })),
    })),
    null,
    2,
  );
}

/** Format contacts list */
export function formatContact(handle: string, service: string, name: string | null): string {
  const displayName = name ? chalk.bold(name) : chalk.dim("(no name)");
  const badge = serviceBadge(service);
  return `${displayName}  ${chalk.gray(handle)}  ${badge}`;
}
