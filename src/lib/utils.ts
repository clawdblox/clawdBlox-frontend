export function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

const NPC_AVATARS = ['🧙‍♂️', '⚔️', '🍺', '🏹', '🛡️', '🧝‍♀️', '🐉', '👑', '🎭', '🔮', '🗡️', '🏰'];

export function getNpcAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash |= 0;
  }
  return NPC_AVATARS[Math.abs(hash) % NPC_AVATARS.length];
}

/** OCEAN trait keys in canonical display order. */
export const OCEAN_KEYS = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

export type OceanKey = typeof OCEAN_KEYS[number];

export interface OceanDataPoint {
  trait: string;
  value: number;
  fullMark?: number;
}

/**
 * Build a radar-chart-ready dataset from a personality record.
 * The `short` format produces single-letter labels (O, C, E, A, N);
 * the `full` format produces full trait names.
 */
export function buildOceanData(
  personality: Record<string, number>,
  format: 'short' | 'full' = 'full',
): OceanDataPoint[] {
  return OCEAN_KEYS.map((key) => ({
    trait: format === 'short' ? key.charAt(0).toUpperCase() : key.charAt(0).toUpperCase() + key.slice(1),
    value: personality[key] ?? 0,
    fullMark: 1,
  }));
}
