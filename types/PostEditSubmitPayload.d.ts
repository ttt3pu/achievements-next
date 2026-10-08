import { AchievementPost } from '@prisma/client';

export type PostEditSubmitPayload = Pick<
  AchievementPost,
  | 'steam_id'
  | 'image_url'
  | 'title'
  | 'total_hours'
  | 'rating'
  | 'yarikomi_rating'
  | 'difficulty_rating'
  | 'is_idle_game'
  | 'completed_at'
  | 'content'
>;
