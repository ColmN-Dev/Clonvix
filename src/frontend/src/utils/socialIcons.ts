import { siYoutube, siInstagram, siTwitch, siMastodon, siFacebook, siTelegram, siDiscord, siBluesky, siX, siReddit, siGithub } from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'

// Mapping of social media providers to their corresponding Simple Icons
export const socialIcons: Record<string, SimpleIcon> = {
    youtube: siYoutube,
    instagram: siInstagram,
    twitch: siTwitch,
    mastodon: siMastodon,
    facebook: siFacebook,
    telegram: siTelegram,
    discord: siDiscord,
    bluesky: siBluesky,
    x: siX,
    reddit: siReddit,
    github: siGithub
}