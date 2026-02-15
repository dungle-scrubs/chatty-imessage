/** Escape special characters for safe embedding in AppleScript string literals */
export function escapeAppleScript(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
