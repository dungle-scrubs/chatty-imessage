import { $ } from "bun";
import chalk from "chalk";
import { Command } from "commander";
import { resolveIdentifierFromName } from "../contacts/resolver";

function escapeAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export const sendCommand = new Command("send")
  .description("Send a message via iMessage/SMS")
  .argument("<recipient>", "Phone number, email, or contact name")
  .argument("<message>", "Message text to send")
  .option("--service <service>", "Force service (iMessage or SMS)", "iMessage")
  .action(async (recipient, message, options) => {
    let identifier = recipient;

    // Check if recipient looks like a phone number or email
    const isPhone = /^[\d+\-() ]+$/.test(recipient);
    const isEmail = recipient.includes("@");

    // If it doesn't look like a phone or email, try to resolve it as a name
    if (!isPhone && !isEmail) {
      console.log(chalk.dim(`Looking up "${recipient}" in Contacts...`));
      const resolved = await resolveIdentifierFromName(recipient);
      if (resolved) {
        identifier = resolved;
        console.log(chalk.dim(`Found: ${identifier}`));
      } else {
        console.error(chalk.red(`Could not find contact "${recipient}" in Contacts.app`));
        process.exit(1);
      }
    }

    const escapedMessage = escapeAppleScript(message);
    const escapedIdentifier = escapeAppleScript(identifier);

    const script = `
      tell application "Messages"
        set targetService to 1st account whose service type = ${options.service === "SMS" ? "SMS" : "iMessage"}
        set targetBuddy to participant "${escapedIdentifier}" of targetService
        send "${escapedMessage}" to targetBuddy
      end tell
    `;

    // Simpler approach that usually works
    const simpleScript = `tell application "Messages" to send "${escapedMessage}" to buddy "${escapedIdentifier}"`;

    try {
      await $`osascript -e ${simpleScript}`;
      console.log(chalk.green(`✓ Message sent to ${identifier}`));
    } catch (_err) {
      // Try the more explicit approach
      try {
        await $`osascript -e ${script}`;
        console.log(chalk.green(`✓ Message sent to ${identifier}`));
      } catch (err2) {
        console.error(chalk.red("Failed to send message:"), err2);
        console.log(chalk.dim("\nMake sure:"));
        console.log(chalk.dim("  1. Messages.app is signed in"));
        console.log(chalk.dim("  2. The recipient is a valid iMessage/SMS contact"));
        console.log(chalk.dim("  3. Terminal has permission to control Messages.app"));
        process.exit(1);
      }
    }
  });
