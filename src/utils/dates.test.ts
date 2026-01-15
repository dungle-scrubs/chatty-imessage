import { describe, expect, test } from "bun:test";
import { formatBytes, parseDate, parseDateExpression } from "./dates";

describe("parseDateExpression", () => {
  test("parses 'last week'", () => {
    const result = parseDateExpression("last week");
    expect(result).not.toBeNull();
    // Should return a range ending at "now" and starting 7 days before
    expect(result?.before.getTime()).toBeGreaterThan(result?.after.getTime() ?? 0);
  });

  test("parses 'last-week' (hyphenated)", () => {
    const result = parseDateExpression("last-week");
    expect(result).not.toBeNull();
  });

  test("parses 'last month'", () => {
    const result = parseDateExpression("last month");
    expect(result).not.toBeNull();
  });

  test("parses 'last year'", () => {
    const result = parseDateExpression("last year");
    expect(result).not.toBeNull();
  });

  test("parses 'last 15 days'", () => {
    const result = parseDateExpression("last 15 days");
    expect(result).not.toBeNull();
    // 15 days difference
    const diffMs = (result?.before.getTime() ?? 0) - (result?.after.getTime() ?? 0);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(15, 0);
  });

  test("parses 'last 2 weeks'", () => {
    const result = parseDateExpression("last 2 weeks");
    expect(result).not.toBeNull();
    const diffMs = (result?.before.getTime() ?? 0) - (result?.after.getTime() ?? 0);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeCloseTo(14, 0);
  });

  test("parses 'last 3 months'", () => {
    const result = parseDateExpression("last 3 months");
    expect(result).not.toBeNull();
  });

  test("returns null for invalid expression", () => {
    expect(parseDateExpression("invalid")).toBeNull();
    expect(parseDateExpression("tomorrow")).toBeNull();
    expect(parseDateExpression("")).toBeNull();
  });

  test("is case insensitive", () => {
    expect(parseDateExpression("LAST WEEK")).not.toBeNull();
    expect(parseDateExpression("Last Month")).not.toBeNull();
  });
});

describe("parseDate", () => {
  test("parses ISO date", () => {
    const result = parseDate("2026-01-15");
    expect(result).not.toBeNull();
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(0); // January
    expect(result?.getDate()).toBe(15);
  });

  test("parses ISO datetime", () => {
    const result = parseDate("2026-01-15T10:30:00");
    expect(result).not.toBeNull();
  });

  test("returns null for invalid date", () => {
    expect(parseDate("not a date")).toBeNull();
    expect(parseDate("")).toBeNull();
  });
});

describe("formatBytes", () => {
  test("formats bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(100)).toBe("100 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  test("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(10240)).toBe("10 KB");
  });

  test("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1572864)).toBe("1.5 MB");
  });

  test("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });
});
