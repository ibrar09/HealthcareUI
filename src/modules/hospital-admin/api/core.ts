// Cross-cutting primitives with no dependencies of their own — every other
// file in this module may import from here, but this file imports nothing
// from its siblings. Kept deliberately tiny.

/** The mock "today" every seed date/time in this module is anchored around. */
export const TODAY = "2026-08-14";

/** Default actor recorded on an audit trail entry when no real signed-in user is threaded through. */
export const DEFAULT_ACTOR = "Zainab Qureshi";

export interface PersonName {
  given: string;
  family: string;
  prefix?: string;
  suffix?: string;
}

export function getFullName(name: PersonName): string {
  const base = [name.prefix, name.given, name.family].filter(Boolean).join(" ");
  return name.suffix ? `${base}, ${name.suffix}` : base;
}
