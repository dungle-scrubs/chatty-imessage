# chatty-imessage

CLI for reading and sending iMessages on macOS.

## Running

```bash
# Using bun directly
~/.bun/bin/bun run ~/dev/chatty-imessage/src/index.ts <command>

# Or with an alias (add to ~/.zshrc)
alias chatty='~/.bun/bin/bun run ~/dev/chatty-imessage/src/index.ts'
```

## Commands

### List messages
```bash
chatty list                          # Last 20 messages
chatty list --from "John"            # Filter by contact name (resolves via Contacts.app)
chatty list --from "+1234567890"     # Filter by phone number
chatty list --last-week              # Last 7 days
chatty list --last "15 days"         # Last N days
chatty list --with-attachments       # Only messages with attachments
chatty list --unread                 # Only unread messages
chatty list --json                   # Output as JSON
chatty list -v                       # Verbose (delivery times, effects)
```

### Send messages
```bash
chatty send "+1234567890" "Hello"    # Send by phone
chatty send "John Doe" "Hello"       # Resolve name via Contacts.app
```

### List contacts
```bash
chatty contacts                      # All contacts with name resolution
chatty contacts --no-resolve         # Fast (no Contacts.app lookup)
chatty contacts --json               # JSON output
```

## Architecture

- `src/db/` - SQLite queries against `~/Library/Messages/chat.db`
- `src/contacts/` - Contacts.app lookup via AppleScript
- `src/commands/` - CLI command implementations
- `src/utils/` - Date parsing, output formatting

## Notes

- Requires Full Disk Access permission for the terminal to read chat.db
- Requires Automation permission for Messages.app to send
- Contact name resolution uses AppleScript (slower but accurate)
- Apple timestamps are nanoseconds since 2001-01-01
