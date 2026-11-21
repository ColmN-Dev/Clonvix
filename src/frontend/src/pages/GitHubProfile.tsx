import { useParams, Link, useSearchParams } from 'react-router'
import { useState, useEffect } from 'react'
import { MapPin, UsersRound, Link as LinkIcon, BookBookmark, Star, GitFork } from 'lucide-react'
import { siYoutube, siInstagram, siTwitch, siMastodon, siFacebook, siTelegram, siDiscord, siBluesky, siX, siReddit } from 'simple-icons'
import type { SimpleIcon } from 'simple-icons'
import type { GithubProfile, GithubUser } from '../types/github_profile'
import type { ProfileReadme } from '../types/readme'
import ReadmeContent from '../components/ReadmeContent'
import Dropdown from '../components/Dropdown'
import UserCard from '../components/UserCard'
import Pagination from '../components/Pagination'
import { timeAgo } from '../utils/timeAgo'

// Mapping of social media providers to their corresponding Simple Icons
const socialIcons: Record<string, SimpleIcon> = {
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
}

interface GithubProfileRepo {
    id: number
    name: string
    full_name: string
    html_url: string
    visibility: string
    description: string | null
    topics: string[]
    language: string | null
    stargazers_count: number
    forks_count: number
    pushed_at: string
}

// Define the props for the GitHubProfile component
interface GitHubProfileProps {
    setLoading: (loading: boolean) => void
}

// Component to extract the username and pass data to the profile content component
function GitHubProfile({ setLoading }: GitHubProfileProps) {
    const { username = 'ColmN-Dev' } = useParams()

    return (
        <GitHubProfileContent
            key={username}
            username={username}
            setLoading={setLoading}
        />
    )
}

// Define the props for the GitHubProfileContent component
interface GitHubProfileContentProps {
    username: string
    setLoading: (loading: boolean) => void
}

// Component to fetch and display GitHub profile information
function GitHubProfileContent({ username, setLoading }: GitHubProfileContentProps) {

    // State declarations for profile pages
    const [profile, setProfile] = useState<GithubProfile | null>(null)
    const [readme, setReadme] = useState<ProfileReadme | null>(null)
    const [repos, setRepos] = useState<GithubProfileRepo[]>([])
    const [error, setError] = useState('')
    const [users, setUsers] = useState<GithubUser[]>([])
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = searchParams.get('tab')
    const page = Number(searchParams.get('page') || 1)

    // Total number of followers or following, used to work out the number of pages
    const totalUsers = tab === 'followers' ? profile?.followers : profile?.type === 'User' ? profile?.following : 0
    const totalPages = Math.ceil((totalUsers ?? 0) / 20)

    // Change the page in the address and keep the current tab
    const handlePageChange = (newPage: number) => {
        setSearchParams({ tab: tab ?? '', page: String(newPage) })
    }

    type SortOption = 'updated' | 'stars' | 'name'

    const [sortOption, setSortOption] = useState<SortOption>('updated')

    // Sort repositories based on the selected option
    const sortedRepos = [...repos].sort((a, b) => {
        // Sort by star count in descending order
        if (sortOption === 'stars') {
            return b.stargazers_count - a.stargazers_count
        }

        // Sort repository names alphabetically
        if (sortOption === 'name') {
            // Assign a sorting priority based on the first character
            const getNameCategory = (name: string) => {
                if (/^[^a-z0-9]/i.test(name)) return 0
                if (/^\d/.test(name)) return 1
                return 2
            }

            const aCategory = getNameCategory(a.name)
            const bCategory = getNameCategory(b.name)

            // Sort by category when repository names start differently
            if (aCategory !== bCategory) {
                return aCategory - bCategory
            }

            // Sort alphabetically within each category
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        }

        // Default: Sort by last pushed date in descending order
        return b.pushed_at.localeCompare(a.pushed_at)
    })

    // Limit the displayed repositories to 10
    const REPOS_PER_PAGE = 10
    const displayedRepos = sortedRepos.slice(0, REPOS_PER_PAGE)

    // Define the sorting options for the dropdown menu
    const sortOptions = [
        { label: 'Last updated', value: 'updated' },
        { label: 'Stars', value: 'stars' },
        { label: 'A–Z', value: 'name' }
    ]

    useEffect(() => {
        document.title = `${username} | Clonvix`
    }, [username])

    useEffect(() => {
        const controller = new AbortController()

        setLoading(true)

        // Fetch GitHub profile data from the backend API
        const fetchProfile = async () => {
            try {
                const response = await fetch(
                    `/api/github/users/${username}/`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch GitHub profile')
                }

                const data: GithubProfile = await response.json()
                setProfile(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') return

                setError('Failed to fetch GitHub profile')

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchProfile()

        return () => controller.abort()

    }, [username, setLoading])

    useEffect(() => {
        const controller = new AbortController()

        // Fetch GitHub profile README from the backend API
        const fetchProfileReadme = async () => {
            try {
                const response = await fetch(
                    `/api/github/users/${username}/readme/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: ProfileReadme = await response.json()
                setReadme(data)

            } catch {
                // Aborted or failed to fetch profile README
            }
        }

        fetchProfileReadme()

        return () => controller.abort()

    }, [username])

    useEffect(() => {
        const controller = new AbortController()

        // Fetch GitHub profile repositories from the backend API
        const fetchProfileRepos = async () => {
            try {
                const response = await fetch(
                    `/api/github/users/${username}/repos/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: GithubProfileRepo[] = await response.json()
                setRepos(data)

            } catch {
                // Aborted or failed to fetch profile repositories
            }
        }

        fetchProfileRepos()

        return () => controller.abort()

    }, [username])

    useEffect(() => {
        // Only fetch when the followers or following tab is open
        if (tab !== 'followers' && tab !== 'following') return

        const controller = new AbortController()

        setLoading(true)

        // Fetch GitHub profile followers or following from the backend API
        const fetchProfileUsers = async () => {
            try {
                const response = await fetch(
                    `/api/github/users/${username}/${tab}/?page=${page}`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: GithubUser[] = await response.json()
                setUsers(data)

            } catch {
                // Aborted or failed to fetch profile followers or following
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchProfileUsers()

        return () => controller.abort()

    }, [username, tab, page, setLoading])

    if (error) {
        return (
            <div className="error-message">{error}</div>
        )
    }

    return (
        <div className="profile-page">
            <div className="profile-layout">

                <aside className="profile-sidebar">
                {profile && (
                    <>
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <a href={profile.html_url} target="_blank" rel="noopener noreferrer">
                                <img
                                src={profile.avatar_url}
                                alt={`${profile.login}'s avatar`}
                                />
                            </a>
                        </div>

                        <div className="profile-identity">
                            <h1>{profile.name || profile.login}</h1>
                            <p>{profile.login}</p>
                        </div>
                    </div>

                    {profile.type === 'User' && profile.bio && (
                        <p className="profile-bio">{profile.bio}</p>
                    )}

                    {profile.followers !== undefined && (
                        <div className="profile-connections mb-2">
                            <UsersRound size={18} />
                            <Link to="?tab=followers" className="profile-followers">
                                <strong>{profile.followers.toLocaleString()}</strong> followers
                            </Link>
                            {profile.type === 'User' && (<span>•</span>)}
                            {profile.type === 'User' && (
                                <Link to="?tab=following" className="profile-following">
                                    <strong>{profile.following.toLocaleString()}</strong> following
                                </Link>
                            )}
                        </div>
                    )}

                    {profile.location && (
                        <div className="profile-location">
                            <MapPin size={18} />
                            <span>{profile.location}</span>
                        </div>
                    )}

                    {profile.blog && (
                        <div className="social-link">
                            <LinkIcon size={18} />
                            <a href={profile.blog} target="_blank" rel="noopener noreferrer" className="social-link">
                                <span>{profile.blog.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</span>
                            </a>
                        </div>
                    )}

                    {/* Display social links with platform icons and formatted URLs */}
                    {profile.social_links?.map((link) => {
                        const hostname = new URL(link.url).hostname.replace('www.', '')
                        const platform = hostname.split('.')[0]
                        const icon = socialIcons[link.provider.toLowerCase()] || socialIcons[platform]

                        {/* Replace x.com with just the username for better readability */}
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

                <main className="profile-content">
                    {tab === 'followers' || tab === 'following' ? (
                        <section className="profile-users">
                            <div className="profile-users-header">
                            <UsersRound size={18} />
                            <h2>{tab === 'followers' ? 'Followers' : 'Following'}</h2>
                            <a href={`/${username}`} className="profile-users-back">
                                Back to profile
                            </a>
                            </div>
                            <div className="profile-users-grid">
                                {users.map((user) => (
                                    <UserCard key={user.login} user={user} />
                                ))}
                            </div>
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </section>
                    ) : (
                        <>
                            {profile && readme && (
                                <section className="profile-readme">
                                    <div className="profile-readme-header">
                                        {profile.login}
                                        <span className="profile-readme-filename-separator">/</span>
                                        README
                                        <span className="profile-readme-filename">.md</span>
                                    </div>

                                    <div className="profile-readme-body repository-readme-body">
                                        <ReadmeContent
                                            content={readme.content}
                                            downloadUrl={readme.download_url}
                                            htmlUrl={readme.html_url}
                                        />
                                    </div>
                                </section>
                            )}

                            <section className="profile-repositories">
                                <div className="profile-repositories-header">
                                    <BookBookmark size={18} />
                                    {profile && (
                                        <h2 className="profile-repositories-title">
                                            <a 
                                                href={`${profile.html_url}?tab=repositories`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                Repositories
                                            </a>
                                        </h2>
                                    )}  
                                    <span className="profile-repositories-dropdown">
                                        <Dropdown
                                            label="Sort:"
                                            value={sortOption}
                                            onChange={(option) => setSortOption(option as SortOption)}
                                            options={sortOptions}
                                        />
                                    </span>
                                </div>

                                <div className="profile-repositories-grid">
                                    {displayedRepos.map((repo) => (
                                        <article className="repo-card profile-repo-card" key={repo.id}>
                                            <div className="repo-card-header profile-repo-card-header">
                                                <Link to={`/${username}/${repo.name}`}>
                                                {repo.name}
                                                </Link>
                                                <span className="repo-visibility">{repo.visibility}</span>
                                            </div>

                                            <p className="repo-card-description">
                                                {repo.description || 'No description available.'}
                                            </p>

                                            <div className="repo-card-topics">
                                                {repo.topics.map((topic) => (
                                                <Link to={`/topics/${topic}`} key={topic} className="repo-card-topic">
                                                    {topic}
                                                </Link>
                                                ))}
                                            </div>

                                            <div className="repo-card-footer">
                                                <span className="flex items-center gap-2">
                                                {repo.language && (
                                                    <span
                                                    className={`language-dot language-${repo.language}`} />
                                                )}
                                                {repo.language ?? ''}
                                                </span>
                                                {repo.stargazers_count > 0 && (
                                                    <span className="flex items-center gap-1">
                                                    <Star size={16} />{repo.stargazers_count.toLocaleString()}
                                                    </span>
                                                )}
                                                {repo.forks_count > 0 && (
                                                    <span className="flex items-center gap-1">
                                                    <GitFork size={16} />{repo.forks_count.toLocaleString()}
                                                    </span>
                                                )}
                                                <span className="repo-card-updated">Updated {timeAgo(repo.pushed_at)}</span>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </section>
                        </>
                    )}
                </main>

            </div>
        </div>
    )
}

export default GitHubProfile