import {
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";

export interface DateRange {
  after: Date;
  before: Date;
}

/** Parse natural language date expressions into a date range */
export function parseDateExpression(expr: string): DateRange | null {
  const now = new Date();
  const lower = expr.toLowerCase().trim();

  // "last week" - past 7 days
  if (lower === "last week" || lower === "last-week") {
    return { after: subDays(now, 7), before: now };
  }

  // "this week" - start of current week to now
  if (lower === "this week" || lower === "this-week") {
    return { after: startOfWeek(now), before: now };
  }

  // "last month" - past 30 days
  if (lower === "last month" || lower === "last-month") {
    return { after: subDays(now, 30), before: now };
  }

  // "this month" - start of current month to now
  if (lower === "this month" || lower === "this-month") {
    return { after: startOfMonth(now), before: now };
  }

  // "last year" - past 365 days
  if (lower === "last year" || lower === "last-year") {
    return { after: subDays(now, 365), before: now };
  }

  // "this year" - start of current year to now
  if (lower === "this year" || lower === "this-year") {
    return { after: startOfYear(now), before: now };
  }

  // "last N days/weeks/months/years"
  const lastNMatch = lower.match(/^last\s+(\d+)\s+(day|week|month|year)s?$/);
  if (lastNMatch?.[1] && lastNMatch[2]) {
    const n = parseInt(lastNMatch[1], 10);
    const unit = lastNMatch[2];
    switch (unit) {
      case "day":
        return { after: subDays(now, n), before: now };
      case "week":
        return { after: subWeeks(now, n), before: now };
      case "month":
        return { after: subMonths(now, n), before: now };
      case "year":
        return { after: subYears(now, n), before: now };
    }
  }

  return null;
}

/** Parse a date string (ISO format or common formats) */
export function parseDate(str: string): Date | null {
  // Try ISO format first
  const isoDate = new Date(str);
  if (isValid(isoDate) && !Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common formats
  const formats = ["yyyy-MM-dd", "MM/dd/yyyy", "MM-dd-yyyy", "dd/MM/yyyy"];
  for (const fmt of formats) {
    const parsed = parse(str, fmt, new Date());
    if (isValid(parsed)) {
      return parsed;
    }
  }

  return null;
}

/** Format bytes to human readable */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}
