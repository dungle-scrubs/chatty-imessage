import { $ } from "bun";
import chalk from "chalk";
import { Command } from "commander";
import { getDb } from "../db/connection";

export const openCommand = new Command("open")
  .description("Open an attachment file")
  .argument("<message-id>", "Message ROWID (from list output)")
  .option("--list", "List attachments without opening")
  .option("-a, --attachment <index>", "Open specific attachment (1-based index)", "1")
  .action(async (messageId, options) => {
    const db = getDb();
    const query = `
      SELECT
        a.ROWID,
        a.filename,
        a.mime_type,
        a.total_bytes,
        a.transfer_name
      FROM attachment a
      JOIN message_attachment_join maj ON a.ROWID = maj.attachment_id
      WHERE maj.message_id = ?
    `;

    const attachments = db.query(query).all(parseInt(messageId, 10)) as {
      ROWID: number;
      filename: string | null;
      mime_type: string | null;
      total_bytes: number;
      transfer_name: string | null;
    }[];

    if (attachments.length === 0) {
      console.log(`No attachments found for message ${messageId}`);
      return;
    }

    if (options.list) {
      console.log(`Attachments for message ${messageId}:\n`);
      attachments.forEach((a, i) => {
        const name = a.transfer_name ?? a.filename?.split("/").pop() ?? "unknown";
        const path = a.filename?.replace("~", process.env.HOME ?? "~") ?? "(no path)";
        console.log(`  ${i + 1}. ${chalk.bold(name)}`);
        console.log(`     Type: ${a.mime_type ?? "unknown"}`);
        console.log(`     Size: ${a.total_bytes} bytes`);
        console.log(`     Path: ${chalk.dim(path)}`);
        console.log();
      });
      return;
    }

    const idx = parseInt(options.attachment, 10) - 1;
    if (idx < 0 || idx >= attachments.length) {
      console.error(
        chalk.red(`Invalid attachment index. Message has ${attachments.length} attachment(s).`),
      );
      return;
    }

    const attachment = attachments[idx];
    if (!attachment || !attachment.filename) {
      console.error(chalk.red("Attachment has no file path."));
      return;
    }

    const path = attachment.filename.replace("~", process.env.HOME ?? "~");
    console.log(chalk.dim(`Opening: ${path}`));

    try {
      await $`open ${path}`;
    } catch (err) {
      console.error(chalk.red("Failed to open file:"), err);
    }
  });
