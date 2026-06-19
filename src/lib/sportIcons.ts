// Emoji glyphs per sport. Keyed by seeded slug, with a fallback for unknowns
// and a secondary lookup on the sport's `icon` field. No external dependency.

const BY_SLUG: Record<string, string> = {
  "male-football": "⚽",
  "female-football": "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  "table-tennis": "🏓",
  athletics: "🏃",
  marathon: "🏅",
  swimming: "🏊",
  chess: "♟️",
  scrabble: "🔤",
  ludo: "🎲",
  efootball: "🎮",
  "cod-mobile": "🎮",
  "indoor-games": "🎯",
};

const BY_ICON: Record<string, string> = {
  soccer: "⚽",
  basketball: "🏀",
  volleyball: "🏐",
  "table-tennis": "🏓",
  running: "🏃",
  swimming: "🏊",
  chess: "♟️",
  scrabble: "🔤",
  dice: "🎲",
  gamepad: "🎮",
  board: "🎯",
};

export const FALLBACK_SPORT_ICON = "🏆";

/** Returns a glyph for a sport. Tries slug, then the sport's icon name, else 🏆. */
export function sportIcon(slug: string, iconName?: string | null): string {
  return BY_SLUG[slug] ?? (iconName ? BY_ICON[iconName] : undefined) ?? FALLBACK_SPORT_ICON;
}
