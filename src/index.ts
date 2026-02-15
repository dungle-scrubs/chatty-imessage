#!/usr/bin/env bun
import { program } from "commander";
import { contactsCommand } from "./commands/contacts";
import { listCommand } from "./commands/list";
import { openCommand } from "./commands/open";
import { sendCommand } from "./commands/send";
import { ChatDbError, closeDb } from "./db/connection";

// x-release-please-version
const VERSION = "0.1.0";

program.name("chat").description("CLI for reading and sending iMessages").version(VERSION);

program.addCommand(listCommand);
program.addCommand(sendCommand);
program.addCommand(contactsCommand);
program.addCommand(openCommand);

// Cleanup on exit
process.on("exit", () => {
  closeDb();
});

// Handle errors gracefully
process.on("uncaughtException", (err) => {
  if (err instanceof ChatDbError) {
    console.error(`\x1b[31mError:\x1b[0m ${err.message}`);
    process.exit(1);
  }
  throw err;
});

program.parse();
