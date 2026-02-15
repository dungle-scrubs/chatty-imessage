# chat-imessage

[![CI](https://github.com/dungle-scrubs/chat-imessage/actions/workflows/ci.yml/badge.svg)](https://github.com/dungle-scrubs/chat-imessage/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/chat-imessage)](https://www.npmjs.com/package/chat-imessage)

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
- [Bun](https://bun.sh) runtime
- Full Disk Access permission (for reading `~/Library/Messages/chat.db`)
- Automation permission for Messages.app (for sending)

## Installation

### npm (recommended)

```bash
npm install -g chat-imessage
```

> Requires [Bun](https://bun.sh) runtime — the tool uses `bun:sqlite` for database access.

### From source

```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Clone and build
git clone https://github.com/dungle-scrubs/chat-imessage.git
cd chat-imessage
bun install

# Option A: Build standalone binary to ~/.local/bin
bun run build
./scripts/install.sh

# Option B: Run directly without building
bun run src/index.ts list --last-week
```

If using the install script, ensure `~/.local/bin` is in your PATH:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

## Usage

### List messages

```bash
# Last 20 messages (default)
chat list

# Last 100 messages from the past week
chat list --last-week -n 100

# Messages from a specific contact
chat list --from "John Doe"
chat list --from "+1234567890"

# Natural language date filters
chat list --last "15 days"
chat list --this-month

# Filter options
chat list --unread
chat list --with-attachments

# Output as JSON
chat list --json

# Verbose mode (delivery times, effects)
chat list -v
```

### Send messages

```bash
# By phone number
chat send "+1234567890" "Hello!"

# By contact name (resolves via Contacts.app)
chat send "John Doe" "Hey there"

# Force SMS instead of iMessage
chat send "+1234567890" "SMS message" --service SMS
```

### View contacts

```bash
# List all contacts with name resolution
chat contacts

# Fast mode (no name lookup)
chat contacts --no-resolve

# JSON output
chat contacts --json
```

### Open attachments

```bash
# List attachments for a message (ID shown in list output)
chat open 299025 --list

# Open first attachment
chat open 299025

# Open specific attachment
chat open 299025 -a 2
```

## Permissions Setup

1. **Full Disk Access**: System Settings → Privacy & Security → Full Disk Access → Add your terminal app
2. **Automation**: First time you send a message, macOS will prompt for permission to control Messages.app

## Known Limitations

- **macOS only** — uses macOS-specific paths and AppleScript
- **Requires Bun** — uses `bun:sqlite` (not Node.js compatible)
- **Read-only database** — cannot modify message history, only read
- **Contact resolution latency** — each contact lookup spawns an osascript process
- **No group chat sending** — send command works with individual recipients only

## Development

```bash
bun test          # Run tests
bun run lint      # Lint
bun run format    # Format
bun run check     # Type check + lint
```

Pre-commit hooks run automatically: secret scan, typecheck, lint, and tests.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, commit conventions,
and code style guidelines.

## License

MIT

## Roadmap

- [ ] Add group chat support for sending
- [ ] Add `--watch` mode for real-time message monitoring
- [ ] Add message search by content
- [ ] Add export to various formats (CSV, JSON file)
- [ ] Add attachment downloading/copying
- [ ] Cache contact resolutions to disk for faster startup
