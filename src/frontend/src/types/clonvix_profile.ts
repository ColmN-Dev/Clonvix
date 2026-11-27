export interface ClonvixProfile {
    username: string;
    display_name: string;
    bio: string;
    image: string;
    location: string;
    website: string;
    social_links: SocialLink[];
}

export interface SocialLink {
    provider: string;
    url: string;
}