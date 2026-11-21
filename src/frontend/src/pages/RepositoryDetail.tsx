import { useParams, Link } from 'react-router'
import { useState, useEffect } from 'react'
import { Star, GitFork, Eye, CircleDot, RotateCcwClock, GitBranch, Tag, BookOpen } from 'lucide-react'
import type { Repository } from '../types/repository'
import type { RepositoryContent } from '../types/repository_content'
import type { RepositoryReadme } from '../types/readme'
import type { Commit, LatestCommit } from '../types/commit'
import type { Branch } from '../types/branch'
import type { TagCount } from '../types/tag'
import RepoSidebar from '../components/RepoSidebar'
import FileTreeRow from '../components/FileTreeRow'
import ReadmeContent from '../components/ReadmeContent'
import GithubIcon from '../components/GithubIcon'
import { timeAgo } from '../utils/timeAgo'

// Define the props for the RepositoryDetail component
interface RepositoryDetailProps {
  setLoading: (loading: boolean) => void
}

// Component to display detailed information about a specific GitHub repository
function RepositoryDetail({ setLoading }: RepositoryDetailProps) {

    // Extract the owner and repository name from the URL parameters
    const { owner, repo } = useParams()

    return (
        <RepositoryDetailContent
            key={`${owner ?? ''}/${repo ?? ''}`}
            owner={owner}
            repo={repo}
            setLoading={setLoading}
        />
    )
}

// Define the props for the RepositoryDetailContent component
interface RepositoryDetailContentProps {
    owner: string | undefined
    repo: string | undefined
    setLoading: (loading: boolean) => void
}

// Component to fetch and display detailed information about a specific GitHub repository
function RepositoryDetailContent({owner, repo, setLoading}: RepositoryDetailContentProps) {

    // State declarations for repository data and error handling
    const [repository, setRepository] = useState<Repository | null>(null)
    const [contents, setContents] = useState<RepositoryContent[]>([])
    const [readme, setReadme] = useState<RepositoryReadme | null>(null)
    const [totalCommits, setTotalCommits] = useState<number | null>(null)
    const [totalBranches, setTotalBranches] = useState<number | null>(null)
    const [totalTags, setTotalTags] = useState<number | null>(null)
    const [latestCommit, setLatestCommit] = useState<LatestCommit | null>(null)
    const [error, setError] = useState('')  

    // Sort contents to display directories before files
    const sortedContents = [...contents].sort((a, b) =>
    a.type === b.type ? 0 : a.type === 'dir' ? -1 : 1
    )

    const FILE_TREE_LIMIT = 25

    const visibleContents = sortedContents.slice(0, FILE_TREE_LIMIT)

    useEffect(() => {
        document.title = repository ? `${repository.full_name} | Clonvix` : 'Repository Details | Clonvix'
    }, [repository]) 

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        setLoading(true)

        // Fetch repository details from the backend API
        const fetchRepository = async () => {
            try {
            const response = await fetch(
                `/api/github/repository/${owner}/${repo}/`,
                {signal: controller.signal}
            )

            if (!response.ok) {
                throw new Error('Failed to fetch repository')
            }

            const data: Repository = await response.json()
            setRepository(data)

            } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                    return
                }

                setError('Failed to fetch repository details')

            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        fetchRepository()

        return () => {
            controller.abort()
        }

    }, [owner, repo, setLoading])

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        const fetchRepositoryContent = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/contents/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: RepositoryContent[] = await response.json()
                setContents(data)

            } catch {
                // Aborted or failed to fetch
            }
        }

        fetchRepositoryContent()

        return () => {
            controller.abort()
        }

    }, [owner, repo])

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        // Fetch repository README from the backend API
        const fetchRepositoryReadme = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/readme/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: RepositoryReadme = await response.json()
                setReadme(data)

            } catch {
                // Aborted or failed to fetch README content
            }
        }

        fetchRepositoryReadme()

        return () => {
            controller.abort()
        }

    }, [owner, repo])

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        // Fetch commit count from the backend API
        const fetchCommitCount = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/commits/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: Commit = await response.json()
                setTotalCommits(data.total_commits)

            } catch {
                // No commit count available, show button only if aborted or failed to fetch
            }
        }

        fetchCommitCount()

        return () => {
            controller.abort()
        }

    }, [owner, repo])

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        // Fetch branch count from the backend API
        const fetchBranchCount = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/branches/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: Branch = await response.json()
                setTotalBranches(data.total_branches)

            } catch {
                // No branch count available, show button only if aborted or failed to fetch
            }
        }

        fetchBranchCount()

        return () => {
            controller.abort()
        }

    }, [owner, repo])

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        // Fetch tag count from the backend API
        const fetchTagCount = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/tags/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: TagCount = await response.json()
                setTotalTags(data.total_tags)

            } catch {
                // No tag count available, show button only if aborted or failed to fetch
            }
        }

        fetchTagCount()

        return () => {
            controller.abort()
        }

    }, [owner, repo])

    useEffect(() => {

        if (!owner || !repo) return

        const controller = new AbortController()

        const fetchLatestCommit = async () => {
            try {
                const response = await fetch(
                    `/api/github/repository/${owner}/${repo}/latest-commit/`,
                    { signal: controller.signal }
                )

                if (!response.ok) return

                const data: LatestCommit | null = await response.json()
                setLatestCommit(data)

            } catch {
                // Aborted or failed to fetch
            }
        }

        fetchLatestCommit()

        return () => {
            controller.abort()
        }

    }, [owner, repo])

    if (error) {
    return <div className="error-message">{error}</div>
    }

    if (!repository) {
    return null
    }

    return (
        <div className="repository-detail-page">

            <div className="repository-header-container">

                <div className="repository-header-toolbar mt-1">

                    <div className="repository-header-title">

                        <h1>
                            <img
                                className="repository-header-avatar"
                                src={repository.owner.avatar_url}
                                alt={`${repository.owner.login} avatar`}
                            />
                            <Link to={`/${repository.owner.login}`}>
                            {repository.owner.login}
                            </Link>

                            <span className="repository-header-separator">/</span>

                            <Link to={`/${repository.owner.login}/${repository.name}`}>
                            {repository.name}
                            </Link>
                        </h1>

                        {repository.visibility === 'public' && (
                            <span className="repository-header-badge">Public</span>
                        )}

                        {repository.archived && (
                            <span className="repository-header-badge">Archived</span>
                        )}

                        <a
                        className="repository-header-github"
                        href={repository.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open repository on GitHub"
                        >
                        <GithubIcon size={30} />
                        </a>

                    </div>
                    
                    <div className="repository-header-stats">

                        <a
                        className="repository-header-issues"
                        href={`${repository.html_url}/issues`}
                        target="_blank"
                        rel="noopener noreferrer"
                        >
                        Issues
                        <CircleDot size={16} />
                        <span className="repository-issues-count">
                            {repository.open_issues_count}
                        </span>
                        </a>

                        <span className="repository-header-watchers">
                            Watchers
                            <Eye size={16} />
                            <span className="repository-watchers-count">
                                {repository.watchers_count}
                            </span>
                        </span>

                        <span className="repository-header-forks">
                            Forks
                            <GitFork size={16} />
                            <span className="repository-fork-count">
                                {repository.forks_count}
                            </span>
                        </span>

                        <span className="repository-header-stars">
                            Stars
                            <Star size={16} />
                            <span className="repository-star-count">
                                {repository.stargazers_count}
                            </span>
                        </span>

                    </div>

                </div>

            </div>

            <div className="repository-detail-layout">
                
                <main className="repository-main-content">
                    <div className="repository-main-toolbar">
                        <a
                            href={`${repository.html_url}/commits/${repository.default_branch}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="repository-commit-count">
                                <RotateCcwClock size={18} />
                                {totalCommits !== null
                                    ? `${totalCommits.toLocaleString()} ${totalCommits === 1 ? 'Commit' : 'Commits'}`
                                    : 'Commits'}
                            </span>
                        </a>

                        <a
                            href={`${repository.html_url}/branches`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="repository-branch-count">
                                <GitBranch size={18} />
                                {totalBranches !== null
                                    ? `${totalBranches.toLocaleString()} ${totalBranches === 1 ? 'Branch' : 'Branches'}`
                                    : 'Branches'}
                            </span>
                        </a>

                        <a
                            href={`${repository.html_url}/tags`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="repository-tag-count">
                                <Tag size={18} />
                                {totalTags !== null
                                    ? `${totalTags.toLocaleString()} ${totalTags === 1 ? 'Tag' : 'Tags'}`
                                    : 'Tags'}
                            </span>
                        </a>
                    </div>

                    <div className="repository-file-tree">
                        <div className="repository-file-tree-header">
                            {latestCommit && (
                                <div className="repository-latest-commit">
                                    <span className="repository-latest-commit-author">
                                        {latestCommit.author? (
                                            <Link
                                                to={`/${latestCommit.author.login}`}>
                                                <img
                                                    className="repository-latest-commit-author-avatar"
                                                    src={latestCommit.author.avatar_url}
                                                    alt={`${latestCommit.author.login} avatar`} 
                                                />
                                                <span className="repository-latest-commit-author-name">
                                                    {latestCommit.author.login}
                                                </span>
                                            </Link>
                                        ) : (
                                            latestCommit.commit.author.name
                                        )}
                                    </span>
                                    <a
                                        className="repository-latest-commit-message"
                                        href={latestCommit.html_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {latestCommit.commit.message.split('\n')[0]}
                                    </a>
                                    <span className="repository-latest-commit-time">
                                        {timeAgo(latestCommit.commit.author.date)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {owner && repo && visibleContents.map((item) => (
                            <FileTreeRow
                                key={item.path}
                                owner={owner}
                                repo={repo}
                                item={item}
                                fetchCommit
                            />
                        ))}

                        {sortedContents.length > FILE_TREE_LIMIT && (
                            <a
                                href={`${repository.html_url}/tree/${repository.default_branch}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="repository-file-tree-view-all"
                            >
                                View all files
                            </a>
                        )}
                    </div>
                    
                    {readme && (
                    <div className="repository-readme" id="readme">
                        <div className="repository-readme-header">
                            <div className="repository-readme-header-title">
                                <BookOpen size={18} />
                                <a
                                    href={readme.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="repository-readme-link"
                                >
                                    README
                                </a>
                            </div>
                        </div>

                        <div className="repository-readme-body">
                            <ReadmeContent content={readme.content} downloadUrl={readme.download_url} htmlUrl={readme.html_url} />
                        </div>
                    </div>
                    )}
                </main>

                <RepoSidebar repository={repository} setLoading={setLoading} />
            </div>

        </div>

    )
}

export default RepositoryDetail