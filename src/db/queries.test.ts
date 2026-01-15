import { describe, expect, test } from "bun:test";
import { fromAppleTimestamp, toAppleTimestamp } from "./queries";

const APPLE_EPOCH_OFFSET = 978307200;

describe("toAppleTimestamp", () => {
  test("converts Unix timestamp to Apple timestamp", () => {
    // 2026-01-15 00:00:00 UTC
    const unix = 1768435200;
    const apple = toAppleTimestamp(unix);

    // Apple timestamp should be nanoseconds since 2001-01-01
    const expectedSeconds = unix - APPLE_EPOCH_OFFSET;
    const expectedNanos = expectedSeconds * 1_000_000_000;

    expect(apple).toBe(expectedNanos);
  });

  test("handles Apple epoch start (2001-01-01)", () => {
    const appleEpochUnix = APPLE_EPOCH_OFFSET;
    const apple = toAppleTimestamp(appleEpochUnix);
    expect(apple).toBe(0);
  });

  test("handles dates before Apple epoch", () => {
    const unix = 0; // 1970-01-01
    const apple = toAppleTimestamp(unix);
    expect(apple).toBeLessThan(0);
  });
});

describe("fromAppleTimestamp", () => {
  test("converts Apple timestamp to Unix timestamp", () => {
    // Some Apple nanosecond timestamp
    const appleNanos = 790_000_000_000_000_000n;
    const unix = fromAppleTimestamp(Number(appleNanos));

    // Should be seconds since 1970-01-01
    expect(unix).toBeGreaterThan(APPLE_EPOCH_OFFSET);
  });

  test("converts 0 to Apple epoch", () => {
    const unix = fromAppleTimestamp(0);
    expect(unix).toBe(APPLE_EPOCH_OFFSET);
  });

  test("roundtrip conversion preserves timestamp", () => {
    const originalUnix = 1768435200; // 2026-01-15
    const apple = toAppleTimestamp(originalUnix);
    const backToUnix = fromAppleTimestamp(apple);

    expect(backToUnix).toBe(originalUnix);
  });
});
