import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import RepoCard from '../components/RepoCard';
import TopicCard from '../components/TopicCard';
import type { Repo } from '../components/RepoCard';
import type { Topic } from '../components/TopicCard';
import SearchSidebar from '../components/SearchSidebar';
import SortDropdown from '../components/SortDropdown';

function SearchResults() {

  useEffect(() => {
    document.title = query
      ? `Results for ${query} | Clonvix`
      : 'Search | Clonvix';
  }, []);

  // Read search and filter parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const language = searchParams.get('lang') ?? '';
  const type = searchParams.get('type') ?? 'repositories';
  const sort = searchParams.get('sort') ?? '';
  const order = searchParams.get('order') ?? '';

  // Convert the URL sorting values into dropdown labels
  const sortLabels: Record<string, string> = {
    'stars-desc': 'Most stars',
    'stars-asc': 'Least stars',
    'forks-desc': 'Most forks',
    'forks-asc': 'Least forks',
    'updated-desc': 'Recently updated',
  };

  const sortBy = sortLabels[`${sort}-${order}`] ?? 'Best match';

  // Store repository results and the total result count
  const [repos, setRepos] = useState<Repo[]>([]);
  const [totalRepos, setTotalRepos] = useState(0);
  
  // Store topic results and the total topic count
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalTopics, setTotalTopics] = useState(0);

  // Manage loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the URL when a sorting option is selected
  function handleSortChange(option: string) {
    const params = new URLSearchParams(searchParams);

    const sortOptions: Record<string, { sort: string; order: string }> = {
      'Most stars': { sort: 'stars', order: 'desc' },
      'Least stars': { sort: 'stars', order: 'asc' },
      'Most forks': { sort: 'forks', order: 'desc' },
      'Least forks': { sort: 'forks', order: 'asc' },
      'Recently updated': { sort: 'updated', order: 'desc' },
    };

    const selectedSort = sortOptions[option];

    // Add the selected sorting values, or remove them for Best match
    if (selectedSort) {
      params.set('sort', selectedSort.sort);
      params.set('order', selectedSort.order);
    } else {
      params.delete('sort');
      params.delete('order');
    }

    // Reset pagination when sorting changes
    params.delete('page');

    setSearchParams(params);
  }

  // Fetch repositories whenever the search or filters change
  useEffect(() => {
    // Don't make an API request if the search query is empty
    if (!query.trim()) {
      setRepos([]);
      setTotalRepos(0);
      setTopics([]);
      setTotalTopics(0);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    // Build the API request URL
    const params = new URLSearchParams({
      q: query,
      page: '1',
    });

    if (language) params.set('lang', language);
    if (type) params.set('type', type);
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);

    fetch(`/api/github/search/?${params.toString()}`)
      .then((response) => {
        if (!response.ok) throw new Error('Search failed');
        return response.json();
      })
      .then((data) => {
        if (type === 'topics') {
          setTopics(data.items);
          setTotalTopics(data.total_count);
        } else {
          setRepos(data.items);
          setTotalRepos(data.total_count);
        }
      })
      .catch(() => {
        setRepos([]);
        setTotalRepos(0);
        setTopics([]);
        setTotalTopics(0);
        setError('Search failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });

  // Run the request again when any search parameter changes
  }, [query, language, type, sort, order]);

  return (
    <section className="search-results-page">
      <div className="search-results-layout">

        <SearchSidebar />

        <main className="search-results-content">
          <div className="search-results-header">
            <SearchBar />
          </div>

          <div className="search-results-toolbar">
            <h1 className={`font-bold text-2xl ${!query.trim() ? 'flex-1 flex items-center justify-center' : ''}`}>
              {!query.trim()
                ? 'Enter a search term to see results'
                : (type === 'topics' ? totalTopics : totalRepos) === 0
                  ? `No results found for "${query}"`
                  : `${(type === 'topics' ? totalTopics : totalRepos).toLocaleString()} ${(type === 'topics' ? totalTopics : totalRepos) === 1 ? 'result' : 'results'} for "${query}"`}
            </h1>

            {/* Sort dropdown */}
            {query.trim() && type === 'repositories' && (
                <SortDropdown value={sortBy} onChange={handleSortChange} />
              )}
          </div>

          {/* Display errors and loading spinner */}
          {error && <div className="search-error">{error}</div>}

          {loading && (
            <div className="search-loading-overlay">
              <Loader2 className="search-spinner" size={40} />
            </div>
          )}

          <div className="flex flex-col gap-4">
            {type === 'topics' ? topics.map((topic) => (
              <TopicCard key={topic.name} topic={topic} />
            ))
            : repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

        </main>
      </div>
    </section>
  );
}

export default SearchResults;
