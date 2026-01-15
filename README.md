# chatty-imessage

CLI tool for reading and sending iMessages on macOS. Reads message history directly from the Messages database and sends via AppleScript.

## Features

- Query messages by date range, contact, or natural language expressions ("last week", "last 15 days")
- Filter by unread messages or messages with attachments
- Resolve contact names from Contacts.app
- Send messages to phone numbers, emails, or contact names
- Open attachments directly from CLI
- JSON output for scripting

## Requirements

- macOS (tested on macOS 14+)
- [Bun](https://bun.sh) runtime (for building only - not needed to run)
- Full Disk Access permission (for reading `~/Library/Messages/chat.db`)
- Automation permission for Messages.app (for sending)

## Installation

```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Clone and install dependencies
git clone https://github.com/yourusername/chatty-imessage.git
cd chatty-imessage
bun install

# Build and install to ~/.local/bin
bun run build
./scripts/install.sh
```

Make sure `~/.local/bin` is in your PATH. Add to `~/.zshrc` if not:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Development mode

Run directly without building:

```bash
bun run src/index.ts list --last-week
```

## Usage

### List messages

```bash
# Last 20 messages (default)
chatty list

# Last 100 messages from the past week
chatty list --last-week -n 100

# Messages from a specific contact
chatty list --from "John Doe"
chatty list --from "+1234567890"

# Natural language date filters
chatty list --last "15 days"
chatty list --this-month

# Filter options
chatty list --unread
chatty list --with-attachments

# Output as JSON
chatty list --json

# Verbose mode (delivery times, effects)
chatty list -v
```

### Send messages

```bash
# By phone number
chatty send "+1234567890" "Hello!"

# By contact name (resolves via Contacts.app)
chatty send "John Doe" "Hey there"

# Force SMS instead of iMessage
chatty send "+1234567890" "SMS message" --service SMS
```

### View contacts

```bash
# List all contacts with name resolution
chatty contacts

# Fast mode (no name lookup)
chatty contacts --no-resolve

# JSON output
chatty contacts --json
```

### Open attachments

```bash
# List attachments for a message (ID shown in list output)
chatty open 299025 --list

# Open first attachment
chatty open 299025

# Open specific attachment
chatty open 299025 -a 2
```

## Permissions Setup

1. **Full Disk Access**: System Settings → Privacy & Security → Full Disk Access → Add your terminal app
2. **Automation**: First time you send a message, macOS will prompt for permission to control Messages.app

## Known Limitations

- **macOS only** - Uses macOS-specific paths and AppleScript
- **Read-only database** - Cannot modify message history, only read
- **Contact resolution latency** - Each contact lookup spawns an osascript process
- **No group chat sending** - Send command works with individual recipients only

## Development

### Setup

```bash
# Install gitleaks for pre-commit secret scanning
brew install gitleaks
```

### Commands

```bash
bun test          # Run tests
bun run lint      # Lint
bun run format    # Format
bun run check     # Type check + lint
```

Pre-commit hooks run automatically: secret scan, typecheck, lint, and tests.

## Contributing

1. Fork the repository
2. Install gitleaks (`brew install gitleaks`)
3. Create a feature branch
4. Run `bun run check` before committing
5. Submit a pull request

## License

MIT

## Roadmap

- [ ] Add group chat support for sending
- [ ] Add `--watch` mode for real-time message monitoring
- [ ] Add message search by content
- [ ] Add export to various formats (CSV, JSON file)
- [ ] Add attachment downloading/copying
- [ ] Cache contact resolutions to disk for faster startup
