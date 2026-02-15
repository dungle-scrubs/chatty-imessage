# Contributing

## Development Setup

1. Install [Bun](https://bun.sh)
2. Install [gitleaks](https://github.com/gitleaks/gitleaks) for pre-commit secret scanning:
   ```bash
   brew install gitleaks
   ```
3. Clone and install:
   ```bash
   git clone https://github.com/dungle-scrubs/chat-imessage.git
   cd chat-imessage
   bun install
   ```

Pre-commit hooks (secret scan, typecheck, lint, tests) install automatically via Husky.

## Making Changes

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run checks: `bun run check && bun test`
5. Commit using [conventional commits](#commit-messages)
6. Push and open a Pull Request

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/)
for automated changelog generation via release-please.

| Prefix | Purpose | Version Bump |
|--------|---------|-------------|
| `feat:` | New feature | minor |
| `fix:` | Bug fix | patch |
| `docs:` | Documentation only | none |
| `chore:` | Maintenance | none |
| `refactor:` | Code change (no behavior change) | none |
| `perf:` | Performance improvement | none |
| `test:` | Adding/updating tests | none |
| `feat!:` or `BREAKING CHANGE:` | Breaking change | major |

Examples:

```
feat: add message search by content
fix: handle missing attachment paths gracefully
docs: update installation instructions
```

## Code Style

- **Formatter/Linter:** [Biome](https://biomejs.dev/) — run `bun run check` before committing
- **TypeScript:** Strict mode enabled, use `import type` for type-only imports
- **Comments:** JSDoc on all exported functions; explain *why*, not *what*

## Testing

```bash
bun test
```

Tests live next to source files (`*.test.ts`). Focus on logic with edge cases
and error paths — skip ceremony tests for trivial code.

## License

By contributing, you agree that your contributions will be licensed under the
MIT License.
