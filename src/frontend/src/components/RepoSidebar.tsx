import type { Release } from '../types/release'
import type { Deployment } from '../types/deployment'
import type { Contributor } from '../types/contributor'
import type { Languages } from '../types/language'
import type { Repository } from '../types/repository'
import { Activity, Link as LinkIcon, BookOpen, GitFork, Tags, CircleCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { timeAgo } from '../utils/timeAgo'

interface RepoSidebarProps {
  repository: Repository
  setLoading: (loading: boolean) => void
}

function RepoSidebar({ repository, setLoading }: RepoSidebarProps) {

    // State for repository sidebar data fetched from the GitHub API
    const [release, setRelease] = useState<Release | null>(null)
    const [deployment, setDeployment] = useState<Deployment | null>(null)
    const [contributors, setContributors] = useState<Contributor[]>([])
    const [languages, setLanguages] = useState<Languages>({})

    // Define language colors for the language bar
    const languageColors: Record<string, string> = {
        JavaScript: '#F1E05A',
        Python: '#3572A5',
        TypeScript: '#3178C6',
        Java: '#B07219',
        HTML: '#E34C26',
        CSS: '#663399',
        'C#': '#7355DD',
        PHP: '#4F5D95',
        'C++': '#F34B7D',
        C: '#555555',
        Go: '#00ADD8',
        Rust: '#DEA584',
        Ruby: '#701516',
        Shell: '#89E051',
        'Jupyter Notebook': '#DA5B0B',
        Astro: '#FF5A03',
        SCSS: '#C6538C',
        Kotlin: '#A97BFF',
        Swift: '#F05138',
        SQL: '#E38C00',
        Dart: '#00B4AB',
        PowerShell: '#012456',
        Lua: '#000080',
        R: '#198CE7',
        Scala: '#DC322F',
        Perl: '#0298C3',
        Assembly: '#6E4C13',
        Elixir: '#6E4A7E',
        XML: '#0060AC',
        Haskell: '#5E5086',
        Dockerfile: '#384D54',
        Makefile: '#427819',
    }

    useEffect(() => {

        const controller = new AbortController()

        setLoading(true)

        // Fetch the latest release for the repository
        const fetchRelease = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${repository.owner.login}/${repository.name}/releases/`,
                    {signal: controller.signal}
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch release')
                }

                const data: Release | null = await response.json()
                setRelease(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return
                }

                setRelease(null)
                
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchRelease()

        return () => {
            controller.abort()
        }

    }, [repository.owner.login, repository.name, setLoading])

    useEffect(() => {

        const controller = new AbortController()

        setLoading(true)

        // Fetch the deployments for the repository
        const fetchDeployment = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${repository.owner.login}/${repository.name}/deployments/`,
                    {signal: controller.signal}
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch deployments')
                }

                const data: Deployment | null = await response.json()
                setDeployment(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return
                }

                setDeployment(null)
                
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchDeployment()

        return () => {
            controller.abort()
        }

    }, [repository.owner.login, repository.name, setLoading])

    useEffect(() => {

        const controller = new AbortController()

        setLoading(true)

        // Fetch the contributors for the repository
        const fetchContributors = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${repository.owner.login}/${repository.name}/contributors/`,
                    {signal: controller.signal}
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch contributors')
                }

                const data: Contributor[] = await response.json()
                setContributors(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return
                }

                setContributors([])
                
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchContributors()

        return () => {
            controller.abort()
        }

    }, [repository.owner.login, repository.name, setLoading])

    useEffect(() => {

        const controller = new AbortController()

        setLoading(true)

        // Fetch the languages for the repository
        const fetchLanguages = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${repository.owner.login}/${repository.name}/languages/`,
                    { signal: controller.signal }
                )

                if (!response.ok) {
                    throw new Error('Failed to fetch languages')
                }

                const data: Languages = await response.json()
                setLanguages(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return
                }

                setLanguages({})
                
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchLanguages()

        return () => {
            controller.abort()
        }

    }, [repository.owner.login, repository.name, setLoading])

    const homepageUrl = repository.homepage
        ? /^https?:\/\//i.test(repository.homepage)
            ? repository.homepage 
            : `https://${repository.homepage}`
        : null

    return (
        <aside className="repository-sidebar">

            <div className="repository-sidebar-section-first">

                <h2 className="repository-sidebar-title">About</h2>

                <p className="repository-sidebar-description">
                    {repository.description ?? 'No description available.'}
                </p>

                {homepageUrl && (
                    <a
                        className="repository-sidebar-homepage"
                        href={homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <LinkIcon size={16} />
                        <span>{homepageUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '')}</span>
                    </a>
                )}

                {repository.topics?.length > 0 && (
                    <div className="repository-sidebar-topics">
                        {repository.topics.map((topic) => (
                            <Link to={`/topics/${topic}`}>
                                {topic}
                            </Link>
                        ))}
                    </div>
                )}

                <a
                href="#readme"
                className="repository-sidebar-readme"
                >
                <BookOpen size={16} />
                Readme
                </a>

                <a
                href={`${repository.html_url}/activity`}
                target="_blank"
                rel="noopener noreferrer"
                className="repository-sidebar-activity"
                >
                <Activity size={16} />
                Activity
                </a>

                <a
                href={`${repository.html_url}/forks`}
                target="_blank"
                rel="noopener noreferrer"
                className="repository-sidebar-forks"
                >
                <GitFork size={16} />
                Forks
                </a>

            </div>

            {release && (
            <div className="repository-sidebar-section">
                <h2 className="repository-sidebar-title-link">
                    <a
                        href={`${repository.html_url}/releases`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Releases
                    </a>
                </h2>

                <a
                    className="repository-sidebar-release"
                    href={release.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className="repository-sidebar-release-link">
                        <Tags size={16} />
                        <span>{release.name || release.tag_name}</span>
                    </span>

                    <span className="repository-sidebar-release-badge">
                        Latest
                    </span>

                    <span className="repository-sidebar-release-date">
                        {timeAgo(release.published_at)}
                    </span>
                </a>

                <a
                    className="repository-sidebar-release-all"
                    href={`${repository.html_url}/releases`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View all releases
                </a>
            </div>
            )}

            {deployment && (
            <div className="repository-sidebar-section">
                <h2 className="repository-sidebar-title-link">
                    <a
                        href={`${repository.html_url}/deployments`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Deployments
                    </a>
                </h2>

                <div className="repository-sidebar-deployment">
                    <a
                        className="repository-sidebar-deployment-env"
                        href={`${repository.html_url}/deployments/${encodeURIComponent(deployment.environment)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <CircleCheck size={16} />
                        {deployment.environment}
                    </a>

                    <span className="repository-sidebar-deployment-date">
                        {timeAgo(deployment.created_at)}
                    </span>
                </div>
            </div>
            )}

            {contributors.length > 0 && (
            <div className="repository-sidebar-section">
                <h2 className="repository-sidebar-title-link">
                    <a
                        href={`${repository.html_url}/graphs/contributors`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Contributors
                    </a>
                </h2>

                <div className="repository-sidebar-contributors">
                    {contributors.map((contributor) => (
                        <div
                            key={contributor.id}
                            className={contributors.length === 1 ? 'repository-sidebar-contributor' : ''}
                        >
                            <Link
                                to={`/${contributor.login}`}
                                title={contributor.login}
                            >
                                <img
                                    className="repository-sidebar-contributor-avatar"
                                    src={contributor.avatar_url}
                                    alt={`${contributor.login} avatar`}
                                />
                            </Link>

                            {contributors.length === 1 && (
                                <Link
                                    to={`/${contributor.login}`}
                                    title={contributor.login}
                                >
                                    {contributor.login}
                                </Link>
                            )}
                        </div>
                    ))}
                </div>

                <a
                    className="repository-sidebar-contributors-all"
                    href={`${repository.html_url}/graphs/contributors`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View all contributors
                </a>
            </div>
            )}

            {Object.keys(languages).length > 0 && (
                <div className="repository-sidebar-section-last">
                    <h2 className="repository-sidebar-title">Languages</h2>

                    <div className="repository-sidebar-language-bar">
                        {Object.entries(languages).map(([language, bytes]) => {
                            const totalBytes = Object.values(languages).reduce((total, value) => total + value, 0)

                            const percentage = (bytes / totalBytes) * 100

                            return (
                                <div
                                    key={language}
                                    className="repository-sidebar-language-bar-segment"
                                    style={{width: `${percentage}%`, backgroundColor: languageColors[language] || '#8b949e'}}
                                />
                            )
                        })}
                    </div>

                    <div className="repository-sidebar-languages">
                        {Object.entries(languages).filter(([, bytes]) => {
                            const totalBytes = Object.values(languages).reduce((total, value) => total + value, 0)

                            return (bytes / totalBytes) * 100 >= 0.5
                        })
                        .map(([language, bytes]) => {
                            const totalBytes = Object.values(languages).reduce((total, value) => total + value, 0)

                            const percentage = (bytes / totalBytes) * 100

                            return (
                                <div key={language} className="repository-sidebar-language">
                                    <span
                                        className="repository-sidebar-language-dot"
                                        style={{ backgroundColor: languageColors[language] || '#8b949e' }}
                                    />
                                    <span>{language}</span>
                                    <span className="repository-sidebar-language-percentage">
                                        {percentage.toFixed(1)}%
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

        </aside>
    )
}

export default RepoSidebar
