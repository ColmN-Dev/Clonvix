export interface GithubUser {
  type: 'User';
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
  twitter_username: string | null;
  blog: string | null;
  social_links: GithubSocialLink[];
  public_repos: number;
}

export interface GithubOrganization {
  type: 'Organization';
  id: number;
  login: string;
  name: string | null;
  display_name: string | null;
  avatar_url: string;
  html_url: string;
  location: string | null;
  followers: number;
  blog: string | null;
  twitter_username: string | null;
  social_links: GithubSocialLink[];
  public_repos: number;
}

export interface GithubSocialLink {
  provider: string;
  url: string;
}

export type GithubProfile = GithubUser | GithubOrganization;