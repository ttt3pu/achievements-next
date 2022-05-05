export interface Post {
  id: string;
  steamId: number;
  title: string;
  content: string;
  idleGame: boolean;
  rating: number;
  yarikomiRating: number;
  subeomeDifficulty: number;
  subeomeDate: string;
  totalHours: number;
}
