import { $ } from "bun";

/** In-memory cache of resolved contact names */
const nameCache = new Map<string, string | null>();

/** Lookup a contact name from Contacts.app by phone or email */
export async function resolveContactName(identifier: string): Promise<string | null> {
  if (nameCache.has(identifier)) {
    return nameCache.get(identifier) ?? null;
  }

  const name = await lookupInContacts(identifier);
  nameCache.set(identifier, name);
  return name;
}

async function lookupInContacts(identifier: string): Promise<string | null> {
  // Determine if this is a phone number or email
  const isPhone = /^[\d+\-() ]+$/.test(identifier);

  const script = isPhone
    ? `
      tell application "Contacts"
        set matchingPeople to (every person whose value of phones contains "${escapeAppleScript(identifier)}")
        if (count of matchingPeople) > 0 then
          return name of item 1 of matchingPeople
        end if
        return ""
      end tell
    `
    : `
      tell application "Contacts"
        set matchingPeople to (every person whose value of emails contains "${escapeAppleScript(identifier)}")
        if (count of matchingPeople) > 0 then
          return name of item 1 of matchingPeople
        end if
        return ""
      end tell
    `;

  try {
    const result = await $`osascript -e ${script}`.text();
    const name = result.trim();
    return name || null;
  } catch {
    return null;
  }
}

/** Lookup contact by name, return phone/email identifier */
export async function resolveIdentifierFromName(name: string): Promise<string | null> {
  const script = `
    tell application "Contacts"
      set matchingPeople to (every person whose name contains "${escapeAppleScript(name)}")
      if (count of matchingPeople) > 0 then
        set p to item 1 of matchingPeople
        -- Try phone first
        if (count of phones of p) > 0 then
          return value of item 1 of phones of p
        end if
        -- Fall back to email
        if (count of emails of p) > 0 then
          return value of item 1 of emails of p
        end if
      end if
      return ""
    end tell
  `;

  try {
    const result = await $`osascript -e ${script}`.text();
    const identifier = result.trim();
    return identifier || null;
  } catch {
    return null;
  }
}

/** Batch resolve multiple identifiers (more efficient) */
export async function resolveContactNames(
  identifiers: string[],
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const uncached = identifiers.filter((id) => !nameCache.has(id));

  // Resolve uncached identifiers in parallel (with concurrency limit)
  const BATCH_SIZE = 10;
  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    const resolved = await Promise.all(batch.map(resolveContactName));
    batch.forEach((id, idx) => {
      nameCache.set(id, resolved[idx] ?? null);
    });
  }

  // Return all results
  for (const id of identifiers) {
    results.set(id, nameCache.get(id) ?? null);
  }
  return results;
}

function escapeAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Clear the name cache */
export function clearCache(): void {
  nameCache.clear();
}
