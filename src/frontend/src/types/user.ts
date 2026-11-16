export interface User {
  id: number;
  login: string;
  name: string | null;
  display_name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  following: number;
  social_links: string[];
  public_repos: number;
}