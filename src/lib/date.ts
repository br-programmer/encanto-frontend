/**
 * Date display helpers.
 *
 * Backend stores instants in UTC (timestamptz, ISO strings with `Z`) and
 * calendar dates as naive `YYYY-MM-DD`. These helpers render both correctly
 * in a target IANA timezone (defaults to Ecuador) regardless of where the
 * code runs (browser, SSR in UTC, etc.).
 */

export const DEFAULT_TIMEZONE = "America/Guayaquil";
const LOCALE = "es-EC";

const CALENDAR_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type DateValue = Date | string | null | undefined;

interface NaiveDate {
    instant: Date;
    timeZone: "UTC";
}
interface InstantDate {
    instant: Date;
    timeZone?: undefined;
}
type ParsedDate = NaiveDate | InstantDate | null;

/**
 * Parse any value into a Date instant plus the timezone in which it should be
 * formatted. For naive `YYYY-MM-DD` strings the anchor is noon UTC and the
 * formatter is forced to UTC so the output is the same calendar day in any
 * inhabited timezone.
 */
function parse(value: DateValue): ParsedDate {
    if (!value) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : { instant: value };
    }
    if (CALENDAR_DATE_RE.test(value)) {
        const [y, mo, d] = value.split("-").map(Number);
        return {
            instant: new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)),
            timeZone: "UTC",
        };
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : { instant: d };
}

export type DateStyle = "short" | "medium" | "long" | "full";
export type DateTimeStyle = "short" | "medium" | "long" | "full";

const DATE_STYLES: Record<DateStyle, Intl.DateTimeFormatOptions> = {
    short: { day: "2-digit", month: "short", year: "2-digit" },
    medium: { day: "numeric", month: "short", year: "numeric" },
    long: { day: "2-digit", month: "long", year: "numeric" },
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
};

const DATE_TIME_STYLES: Record<DateTimeStyle, Intl.DateTimeFormatOptions> = {
    short: {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    },
    medium: {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    },
    long: {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    },
    full: {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    },
};

function format(
    value: DateValue,
    options: Intl.DateTimeFormatOptions,
    tz: string,
): string {
    const parsed = parse(value);
    if (!parsed) return "—";
    return new Intl.DateTimeFormat(LOCALE, {
        ...options,
        timeZone: parsed.timeZone ?? tz,
    }).format(parsed.instant);
}

/** Format a date in the target timezone (default: Ecuador). */
export function formatDate(
    value: DateValue,
    style: DateStyle = "medium",
    tz: string = DEFAULT_TIMEZONE,
): string {
    return format(value, DATE_STYLES[style], tz);
}

/** Format date + time in the target timezone. */
export function formatDateTime(
    value: DateValue,
    style: DateTimeStyle = "medium",
    tz: string = DEFAULT_TIMEZONE,
): string {
    return format(value, DATE_TIME_STYLES[style], tz);
}

/** Format only the time portion (HH:MM) in the target timezone. */
export function formatTime(
    value: DateValue,
    tz: string = DEFAULT_TIMEZONE,
): string {
    return format(
        value,
        { hour: "2-digit", minute: "2-digit", hour12: false },
        tz,
    );
}

/** Format only the month name (uppercase, Spanish) in the target timezone. */
export function formatMonthName(
    value: DateValue,
    tz: string = DEFAULT_TIMEZONE,
): string {
    return format(value, { month: "long" }, tz).toUpperCase();
}

/** Format day + month, no year. Example: "1 de mayo". */
export function formatDayMonth(
    value: DateValue,
    tz: string = DEFAULT_TIMEZONE,
): string {
    return format(value, { day: "numeric", month: "long" }, tz);
}

/** Serialize a Date to `YYYY-MM-DD` using its local components. */
export function toDateString(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

/** Parse a `YYYY-MM-DD` string into a local Date at midnight (for date pickers). */
export function fromDateString(s: string): Date {
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
}

/** Today's calendar date in `tz`, as YYYY-MM-DD. */
export function todayInTz(tz: string = DEFAULT_TIMEZONE): string {
    const t = partsInTz(new Date(), tz);
    return `${t.year}-${String(t.month).padStart(2, "0")}-${String(t.day).padStart(2, "0")}`;
}

/** Days between two YYYY-MM-DD calendar dates (b - a). Negative if b is before a. */
export function daysBetween(a: string, b: string): number {
    const [ay, am, ad] = a.split("-").map(Number);
    const [by, bm, bd] = b.split("-").map(Number);
    const aUtc = Date.UTC(ay, am - 1, ad);
    const bUtc = Date.UTC(by, bm - 1, bd);
    return Math.round((bUtc - aUtc) / 86400000);
}

/** Add `days` to a YYYY-MM-DD calendar date and return the resulting YYYY-MM-DD. */
export function addDays(calendarDate: string, days: number): string {
    const [y, m, d] = calendarDate.split("-").map(Number);
    const next = new Date(Date.UTC(y, m - 1, d) + days * 86400000);
    return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
}

/** Return the components of `instant` as seen in `tz`. Useful to ask "what date is it in Ecuador right now?". */
export function partsInTz(
    instant: Date | number = new Date(),
    tz: string = DEFAULT_TIMEZONE,
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).formatToParts(instant instanceof Date ? instant : new Date(instant));
    const get = (type: string) =>
        Number(parts.find((p) => p.type === type)!.value);
    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: get("hour"),
        minute: get("minute"),
        second: get("second"),
    };
}

/**
 * Build a UTC ISO string from a wall-clock date/time interpreted in `tz`.
 *
 * Independent of the runtime's local timezone, so it produces the same instant
 * whether called from a browser in Quito, an SSR worker in UTC, or a phone in
 * Madrid. Use this whenever you need to anchor a wall-clock value (like
 * "valid until end of May 2 in Ecuador") to a fixed moment.
 *
 * Example: `toUtcInstant(2026, 5, 2, 10, 0, 0, "America/Guayaquil")`
 *   → `"2026-05-02T15:00:00.000Z"`  (10:00 EC = 15:00 UTC)
 */
export function toUtcInstant(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
    tz: string = DEFAULT_TIMEZONE,
): string {
    // First, treat the wall-clock as if it were UTC.
    const asIfUtc = Date.UTC(year, month - 1, day, hour, minute, second);
    // Compute how that instant is rendered in the target tz, then back-calc
    // the offset that the tz applies at that moment.
    const tzParts = partsInTz(new Date(asIfUtc), tz);
    const tzAsIfUtc = Date.UTC(
        tzParts.year,
        tzParts.month - 1,
        tzParts.day,
        tzParts.hour,
        tzParts.minute,
        tzParts.second,
    );
    const offsetMs = tzAsIfUtc - asIfUtc;
    return new Date(asIfUtc - offsetMs).toISOString();
}

/**
 * Same as `toUtcInstant` but takes a `Date` and reuses its calendar/time
 * components (year/month/day/hour/minute), interpreting them in `tz`.
 *
 * Useful when a date picker hands you a `Date` constructed with local
 * components — the components carry the user's intent regardless of what
 * the runtime's TZ is.
 */
export function toUtcInstantFromDate(
    date: Date,
    tz: string = DEFAULT_TIMEZONE,
): string {
    return toUtcInstant(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        tz,
    );
}
