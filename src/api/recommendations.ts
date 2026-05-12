import api from '../config/api';

export interface RecommendedGame {
  id: string;
  name: string;
  background_image: string;
  rating: number;
  metacritic_rating: number | null;
  genres: string[];
  platforms: string[];
  release_date: string;
  score: number; // how many of user's preferred genres/tags matched
}

export interface RecommendationsResponse {
  data: RecommendedGame[];
  personalized: boolean; // false = cold-start fallback (new user)
}

export async function getRecommendations(
  limit = 10,
): Promise<RecommendationsResponse> {
  const res = await api.get('/recommendations', {
    params: { limit },
  });

  return res.data as RecommendationsResponse;
}
