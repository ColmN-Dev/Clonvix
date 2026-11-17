import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import RepoCard from '../components/RepoCard'
import type { Repo } from '../components/RepoCard'
import Pagination from '../components/Pagination'
import { scrollToTop } from '../utils/scrollToTop'

type TopicDetailProps = {
    loading: boolean;
    setLoading: (loading: boolean) => void;
};

function TopicDetail({ loading, setLoading }: TopicDetailProps) {
    const { topic } = useParams<{ topic: string }>()

    // Get the current page number from the URL
    const [searchParams, setSearchParams] = useSearchParams()
    const currentPage = Math.max(1, Number(searchParams.get('page')) || 1)
    const perPage = 10
    const hasTopic = (topic?.trim().length ?? 0) > 0;

    // Store repository results and total count
    const [repos, setRepos] = useState<Repo[]>([])
    const [totalRepos, setTotalRepos] = useState(0)

    // Format the topic page heading for display
    const formattedTopic = topic ? topic.charAt(0).toUpperCase() + topic.slice(1) : ''

    // Calculate the total number of pages, maximum 100 pages
    const totalPages = Math.min(Math.ceil(totalRepos / perPage), 100);

    // Handle error state
    const [error, setError] = useState('')

    // Update the URL when a new page is selected
    function handlePageChange(page: number) {
        const params = new URLSearchParams(searchParams);
        params.set('page', String(page));
        setError('');
        setSearchParams(params);
        scrollToTop();
    }

    // Fetch repositories whenever the topic or page changes
    useEffect(() => {
        if (!hasTopic) return

        const controller = new AbortController()

        async function fetchRepositories() {
            setLoading(true)

            const params = new URLSearchParams({
            q: `topic:${topic}`,
            page: String(currentPage),
            type: 'repositories',
            })

            try {
            const response = await fetch(
                `/api/github/search/?${params.toString()}`,
                { signal: controller.signal }
            )

            if (!response.ok) {
                throw new Error('Search failed')
            }

            const data = await response.json()

            setRepos(data.items)
            setTotalRepos(data.total_count)
            setError('')
            } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return
            }

            setRepos([])
            setTotalRepos(0)
            setError('Could not load topic repositories. Please try again.')
            } finally {
            if (!controller.signal.aborted) {
                setLoading(false)
            }
            }
        }

        fetchRepositories()

        return () => {
            controller.abort()
        }
    }, [topic, currentPage, hasTopic, setLoading])

    return (
        <section className="search-results-page">
            <main className="search-results-content topic-detail-content mt-1">
                <div className="search-results-toolbar">
                    <h1 className={`font-bold text-2xl ${!hasTopic ? 'flex-1 flex items-center justify-center' : ''}`}>
                    {!hasTopic
                        ? 'Select a topic to see repositories'
                        : loading
                        ? `Loading repositories for ${formattedTopic}...`
                        : totalRepos === 0
                            ? `No repositories found for ${formattedTopic}`
                            : `${totalRepos.toLocaleString()} ${totalRepos === 1 ? 'repository' : 'repositories'} for ${formattedTopic}`}
                    </h1>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="flex flex-col gap-4">
                {repos.map((repo) => (
                    <RepoCard key={repo.id} repo={repo} />
                ))}
                </div>

                {!loading && !error && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
                )}
            </main>
        </section>
    )
}

export default TopicDetail