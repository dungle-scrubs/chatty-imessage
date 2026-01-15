import { Command } from "commander";
import { resolveContactNames } from "../contacts/resolver";
import { getAllHandles } from "../db/queries";
import { formatContact } from "../utils/format";

export const contactsCommand = new Command("contacts")
  .description("List all contacts from message history")
  .option("--json", "Output as JSON")
  .option("--no-resolve", "Skip contact name resolution (faster)")
  .action(async (options) => {
    const handles = getAllHandles();

    if (handles.length === 0) {
      console.log("No contacts found in message history.");
      return;
    }

    // Resolve names if requested
    let nameMap = new Map<string, string | null>();
    if (options.resolve !== false) {
      console.log(`Resolving ${handles.length} contacts from Contacts.app...`);
      const identifiers = handles.map((h) => h.id);
      nameMap = await resolveContactNames(identifiers);
    }

    if (options.json) {
      const output = handles.map((h) => ({
        id: h.id,
        service: h.service,
        name: nameMap.get(h.id) ?? null,
      }));
      console.log(JSON.stringify(output, null, 2));
    } else {
      for (const handle of handles) {
        const name = nameMap.get(handle.id) ?? null;
        console.log(formatContact(handle.id, handle.service, name));
      }
    }
  });
