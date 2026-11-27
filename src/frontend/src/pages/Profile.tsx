import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import type { ClonvixProfile } from '../types/clonvix_profile'
import { MapPin, Link as LinkIcon } from 'lucide-react'
import { socialIcons } from '../utils/socialIcons'

export function Profile() {
    const [profile, setProfile] = useState<ClonvixProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        document.title = `${profile?.username || 'Profile'} | Clonvix`
    }, [profile])

    useEffect(() => {
        const controller = new AbortController()

        // Fetch the user's profile data from the backend API
        const fetchProfile = async () => {
            try {
                const response = await fetch('/api/accounts/profile/', {
                    credentials: 'include',
                    signal: controller.signal
                })

                if (!response.ok) {
                    throw new Error(response.status === 401 ? 'You must be logged in to view your profile.' : 'Failed to fetch profile.')
                }

                const data: ClonvixProfile = await response.json()
                setProfile(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return
                setError(error instanceof Error ? error.message : 'Something went wrong.')

            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        fetchProfile()
        return () => controller.abort()
    }, [])

    if (loading) return <div className="page-status">Loading profile...</div>

    if (error) return <div className="error-message">{error}</div>

    if (!profile) return <div className="page-status">Profile not found.</div>

    return (
        <div className="profile-page">
            <div className="profile-layout">
                <aside className="profile-sidebar">
                    {profile && (
                        <>
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    <div className="profile-image-wrapper">
                                        <img
                                            src={profile.image}
                                            alt={`${profile.username}'s avatar`}
                                            onError={(e) => {
                                                e.currentTarget.onerror = null
                                                e.currentTarget.src = '/default.png'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="profile-identity">
                                    <h1>{profile.display_name || profile.username}</h1>
                                    <p>{profile.username}</p>
                                </div>
                            </div>

                            {profile.bio && (
                                <p className="profile-bio">{profile.bio}</p>
                            )}

                            <div className="profile-actions">
                                <Link to="/edit-profile" className="profile-action-link">
                                    Edit Profile
                                </Link>

                                <Link to="/account-settings" className="profile-action-link">
                                    Account Settings
                                </Link>
                            </div>

                            {profile.location && (
                                <div className="profile-location">
                                    <MapPin size={18} />
                                    <span>{profile.location}</span>
                                </div>
                            )}

                            {profile.website && (
                                <div className="social-link">
                                    <LinkIcon size={18} />
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer">
                                        <span>{profile.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                                    </a>
                                </div>
                            )}

                            {profile.social_links?.map((link) => {
                                const hostname = new URL(link.url).hostname.replace('www.', '')
                                const platform = hostname.split('.')[0]
                                const icon = socialIcons[link.provider.toLowerCase()] || socialIcons[platform]

                                const isX = hostname === 'x.com'
                                const displayUrl = isX
                                    ? `@${new URL(link.url).pathname.replace(/^\/|\/$/g, '')}`
                                    : link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

                                return (
                                    <div className="social-link" key={link.url}>
                                        {icon ? (
                                            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                                <path d={icon.path} />
                                            </svg>
                                        ) : (
                                            <LinkIcon size={18} />
                                        )}
                                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                                            <span>{displayUrl}</span>
                                        </a>
                                    </div>
                                )
                            })}
                        </>
                    )}
                </aside>
            </div>
        </div>
    )
}

export default Profile