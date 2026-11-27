import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import type { ClonvixProfile, SocialLink } from '../types/clonvix_profile'
import { scrollToTop } from '../utils/scrollToTop'

function EditProfile() {
    const [profile, setProfile] = useState<ClonvixProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [bio, setBio] = useState('')
    const [location, setLocation] = useState('')
    const [website, setWebsite] = useState('')
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])
    const [message, setMessage] = useState('')
    const filteredSocialLinks = socialLinks.filter(link => link.provider.trim() && link.url.trim())
    const [selectedImage, setSelectedImage] = useState<File | null>(null)

      function handleNavigation() {
        scrollToTop()
    }

    useEffect(() => {
        if (!message && !error) return

        const timeout = window.setTimeout(() => {
            setMessage('')
            setError('')
        }, 5000)

        return () => window.clearTimeout(timeout)
    }, [message, error])

    useEffect(() => {
        document.title = `Edit Profile | Clonvix`
    }, [])

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
                    throw new Error('Failed to fetch profile.')
                }

                const data: ClonvixProfile = await response.json()
                scrollToTop()
                setProfile(data)
                setDisplayName(data.display_name || '')
                setBio(data.bio || '')
                setLocation(data.location || '')
                setWebsite(data.website || '')
                setSocialLinks(data.social_links || [])

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return
                setError(error instanceof Error ? error.message : 'Something went wrong.')
                scrollToTop()

            } finally {
                if (!controller.signal.aborted) setLoading(false)
            }
        }

        fetchProfile()
        return () => controller.abort()
    }, [])

    // Handle image upload
    async function handleImageUpload() {
        if (!selectedImage) return

        setError('')
        setMessage('')

        try {
        // Get CSRF token from the backend before making the PATCH request
            const csrfResponse = await fetch('/api/accounts/csrf/', {
                credentials: 'include',
            })

            if (!csrfResponse.ok) {
                throw new Error('Failed to get CSRF token.')
            }

            const csrfToken = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('csrftoken='))
                ?.split('=')[1]

            if (!csrfToken) {
                throw new Error('CSRF token not found.')
            }

            const formData = new FormData()
            formData.append('image', selectedImage)

            // Upload the image to the backend
            const response = await fetch('/api/accounts/profile/', {
                method: 'PATCH',
                headers: {
                    'X-CSRFToken': csrfToken || '',
                },
                credentials: 'include',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Image upload failed.')
            }

            scrollToTop()
            setProfile(data)
            setSelectedImage(null)
            setMessage('Profile picture updated successfully.')

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Image upload failed.')
            scrollToTop()
        }
    }

    // Update form fields when profile data is fetched
    const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setError('')
        setMessage('')

        try {
            // CSRF token
            await fetch('/api/accounts/csrf/', {
                credentials: 'include',
            })

            const csrfToken = document.cookie
                .split('; ')
                .find((cookie) => cookie.startsWith('csrftoken='))
                ?.split('=')[1]

            // Update profile
            const response = await fetch('/api/accounts/profile/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken || '',
                },
                credentials: 'include',
                body: JSON.stringify({
                    display_name: displayName,
                    bio,
                    location,
                    website,
                    social_links: filteredSocialLinks,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile.')
            }

            setProfile(data)
            setMessage('Profile updated successfully.')
            scrollToTop()

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong.')
            scrollToTop()
        }
    }

    if (loading) return <div className="page-status">Loading profile...</div>

    if (!profile) return <div className="page-status">Profile not found.</div>

    // Check if any changes have been made to the profile fields
    const hasChanges = profile && (
        displayName !== (profile.display_name || '') ||
        bio !== (profile.bio || '') ||
        location !== (profile.location || '') ||
        website !== (profile.website || '') ||
        JSON.stringify(socialLinks) !== JSON.stringify(profile.social_links || [])
    )

    return (
        <div className="edit-profile-page">
            <h1>Edit Profile</h1>

            {error && <p className="error-message auth-message">{error}</p>}
            {message && <p className="success-message auth-message">{message}</p>}

            <form className="edit-profile-form" onSubmit={handleSubmit}>

                <Link to="/profile">
                    <button type="button" className="back-link">
                    Back to Profile
                    </button>
                </Link>

                {/* Profile Picture Card */}
                <div className="profile-image-card">
                    <h2>Profile Picture</h2>
                    <div>
                        <label htmlFor="profile-image">Choose Profile Picture</label>
                        <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={(event) => setSelectedImage(event.target.files?.[0] || null)}
                        />

                        <button type="button" onClick={handleImageUpload} disabled={!selectedImage}>
                            Upload Picture
                        </button>
                    </div>
                </div>

                {/* Profile Information Card */}
                <div className="profile-information-card">
                    <h2>Profile Information</h2>
                    <div>
                        <label htmlFor="display-name">Display Name</label>
                        <input
                            id="display-name"
                            type="text"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            maxLength={50}
                        />
                    </div>

                    <div>
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(event) => setBio(event.target.value)}
                        />
                    </div>

                    <div>
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            type="text"
                            value={location}
                            onChange={(event) => setLocation(event.target.value)}
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label htmlFor="website">Website</label>
                        <input
                            id="website"
                            type="url"
                            value={website}
                            onChange={(event) => setWebsite(event.target.value)}
                        />
                    </div>

                    {/* Social Links Editor */}
                    <div className="social-links-editor">
                        <label>Social Links</label>

                        {socialLinks.map((link, index) => (
                            <div className="social-link-input" key={index}>
                                <input
                                    type="text"
                                    value={link.provider}
                                    placeholder="Platform (e.g. youtube, reddit, x)"
                                    onChange={(event) => {
                                        const updatedLinks = [...socialLinks]
                                        updatedLinks[index] = { ...link, provider: event.target.value }
                                        setSocialLinks(updatedLinks)
                                    }}
                                />

                                <input
                                    type="url"
                                    value={link.url}
                                    placeholder="https://..."
                                    onChange={(event) => {
                                        const updatedLinks = [...socialLinks]
                                        updatedLinks[index] = { ...link, url: event.target.value }
                                        setSocialLinks(updatedLinks)
                                    }}
                                />

                                <button
                                    type="button"
                                    onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            disabled={socialLinks.length >= 4}
                            onClick={() => setSocialLinks([...socialLinks, { provider: '', url: '' }])}
                        >
                            Add Social Link
                        </button>
                    </div>

                    <button type="submit" disabled={!hasChanges} onClick={handleNavigation}>
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProfile