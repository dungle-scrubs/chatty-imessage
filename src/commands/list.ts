import chalk from "chalk";
import { Command } from "commander";
import { resolveContactNames, resolveIdentifierFromName } from "../contacts/resolver";
import { getAttachments, type MessageQueryOptions, queryMessages } from "../db/queries";
import { parseDate, parseDateExpression } from "../utils/dates";
import {
  type FormatOptions,
  type FormattedMessage,
  formatMessage,
  formatMessagesJson,
} from "../utils/format";

export const listCommand = new Command("list")
  .description("List messages with optional filters")
  .option("-n, --limit <number>", "Number of messages to show", "20")
  .option("--from <contact>", "Filter by sender name, phone, or email")
  .option("--date <date>", "Show messages from a specific date (YYYY-MM-DD)")
  .option("--after <date>", "Show messages after this date")
  .option("--before <date>", "Show messages before this date")
  .option("--last-week", "Show messages from the last 7 days")
  .option("--last-month", "Show messages from the last 30 days")
  .option("--last-year", "Show messages from the last 365 days")
  .option("--this-week", "Show messages from start of this week")
  .option("--this-month", "Show messages from start of this month")
  .option("--this-year", "Show messages from start of this year")
  .option("--last <expr>", 'Natural date expression (e.g., "15 days", "2 weeks")')
  .option("--unread", "Show only unread messages")
  .option("--with-attachments", "Show only messages with attachments")
  .option("--json", "Output as JSON")
  .option("-v, --verbose", "Show more details (delivery times, effects)")
  .action(async (options) => {
    const queryOpts: MessageQueryOptions = {
      limit: parseInt(options.limit, 10),
      unread: options.unread,
      withAttachments: options.withAttachments,
    };

    // Handle natural language dates
    if (options.lastWeek) {
      const range = parseDateExpression("last week");
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    } else if (options.lastMonth) {
      const range = parseDateExpression("last month");
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    } else if (options.lastYear) {
      const range = parseDateExpression("last year");
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    } else if (options.thisWeek) {
      const range = parseDateExpression("this week");
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    } else if (options.thisMonth) {
      const range = parseDateExpression("this month");
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    } else if (options.thisYear) {
      const range = parseDateExpression("this year");
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    } else if (options.last) {
      const range = parseDateExpression(`last ${options.last}`);
      if (range) {
        queryOpts.after = range.after;
        queryOpts.before = range.before;
      }
    }

    // Handle explicit date filters
    if (options.date) {
      const date = parseDate(options.date);
      if (date) {
        queryOpts.after = new Date(date.setHours(0, 0, 0, 0));
        queryOpts.before = new Date(date.setHours(23, 59, 59, 999));
      }
    }
    if (options.after) {
      const date = parseDate(options.after);
      if (date) queryOpts.after = date;
    }
    if (options.before) {
      const date = parseDate(options.before);
      if (date) queryOpts.before = date;
    }

    // Contact filter - try to resolve name to identifier if it doesn't look like a phone/email
    if (options.from) {
      const isPhone = /^[\d+\-() ]+$/.test(options.from);
      const isEmail = options.from.includes("@");

      if (!isPhone && !isEmail) {
        // Try to resolve the name to a phone/email
        console.log(chalk.dim(`Looking up "${options.from}" in Contacts...`));
        const identifier = await resolveIdentifierFromName(options.from);
        if (identifier) {
          console.log(chalk.dim(`Found: ${identifier}`));
          queryOpts.contact = identifier;
        } else {
          // Fall back to searching by the name itself (might match chat_name or partial handle)
          queryOpts.contact = options.from;
        }
      } else {
        queryOpts.contact = options.from;
      }
    }

    // Query messages
    const messages = queryMessages(queryOpts);

    if (messages.length === 0) {
      console.log("No messages found matching the criteria.");
      return;
    }

    // Collect unique handles for batch resolution
    const handles = [...new Set(messages.map((m) => m.handle).filter(Boolean))] as string[];
    const nameMap = await resolveContactNames(handles);

    // Build formatted messages with attachments
    const formatted: FormattedMessage[] = messages.map((row) => ({
      row,
      contactName: row.handle ? (nameMap.get(row.handle) ?? null) : null,
      attachments: row.cache_has_attachments ? getAttachments(row.ROWID) : [],
    }));

    if (options.json) {
      console.log(formatMessagesJson(formatted));
    } else {
      const formatOpts: FormatOptions = { verbose: options.verbose };
      // Print messages (oldest first for reading order, or reverse for chat order)
      const reversed = [...formatted].reverse();
      for (const msg of reversed) {
        console.log(formatMessage(msg, formatOpts));
        console.log(); // blank line between messages
      }
    }
  });
