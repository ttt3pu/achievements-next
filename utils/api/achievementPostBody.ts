import type { AchievementPostInput } from './achievementPost';
import { validSteamImageUrl } from '../steamImage';

function integer(value: unknown, minimum = 0): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= minimum && value <= 2147483647;
}

export function parseAchievementPostBody(body: unknown): AchievementPostInput | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const input = body as Record<string, unknown>;
  if (
    !integer(input.steam_id, 1) ||
    typeof input.title !== 'string' ||
    !input.title.trim() ||
    typeof input.content !== 'string' ||
    !integer(input.total_hours) ||
    !integer(input.rating) ||
    !integer(input.yarikomi_rating) ||
    !integer(input.difficulty_rating) ||
    typeof input.is_idle_game !== 'boolean' ||
    typeof input.completed_at !== 'string'
  )
    return null;
  const date = new Date(input.completed_at);
  if (Number.isNaN(date.getTime())) return null;
  const image = input.image_url == null ? null : validSteamImageUrl(input.image_url);
  if (input.image_url != null && !image) return null;
  return {
    steam_id: input.steam_id,
    title: input.title,
    content: input.content,
    total_hours: input.total_hours,
    rating: input.rating,
    yarikomi_rating: input.yarikomi_rating,
    difficulty_rating: input.difficulty_rating,
    is_idle_game: input.is_idle_game,
    completed_at: date,
    image_url: image,
  };
}
