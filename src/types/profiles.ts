
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  username: string | null;
  full_name: string | null;
  preferences?: Record<string, any>;
}
