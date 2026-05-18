export type User = {
  id: string;
  username: string;
  email: string;
  token?: string;
  avatar_url?: string | null;
  display_name?: string | null;
  profile?: {
    avatar_url?: string | null;
    display_name?: string | null;
    tag?: string | null;
    bio?: string | null;
    followers_count?: number;
    following_count?: number;
    games_count?: number;
    joined_at?: string | null;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
};
