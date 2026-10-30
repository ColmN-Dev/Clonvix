import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import RepoCard from '../components/RepoCard';
import type { Repo } from '../components/RepoCard';
import SearchSidebar from '../components/SearchSidebar';
import SortDropdown from '../components/SortDropdown';


function SearchResults() {
  // Search term from the url
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';

  // Results and total from the API
  const [repos, setRepos] = useState<Repo[]>([]);
  const [total, setTotal] = useState(0);

  // Sort option state
  const [sortBy, setSortBy] = useState('Best match');

  // Spinner and error message
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch new results whenever the url query changes and prevent fetching when the query is empty
  useEffect(() => {
    if (!query.trim()) {
      setRepos([]);
      setTotal(0);
      setLoading(false);
      setError('');
      return;
    }
    setLoading(true);
    setError('');

    fetch(`/api/repositories/search/?q=${encodeURIComponent(query)}`)
      .then((response) => {
        if (!response.ok) throw new Error('Search failed');
        return response.json();
      })
      .then((data) => {
        setRepos(data.items);
        setTotal(data.total_count);
      })
      .catch(() => {
        setRepos([]);
        setTotal(0);
        setError('Search failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  // Dependency array to refetch results when the query changes
  }, [query]);

  // Create a copy of the repos array to sort without mutating the original state
  const sortedRepos = [...repos];

// Sort the results based on the selected sort option (best match is default)
if (sortBy === 'Most stars') {
  sortedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
} else if (sortBy === 'Least stars') {
  sortedRepos.sort((a, b) => a.stargazers_count - b.stargazers_count);
} else if (sortBy === 'Most forks') {
  sortedRepos.sort((a, b) => b.forks_count - a.forks_count);
} else if (sortBy === 'Least forks') {
  sortedRepos.sort((a, b) => a.forks_count - b.forks_count);
} else if (sortBy === 'Recently updated') {
  sortedRepos.sort(
    (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  );
}

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
              {query.trim()
                ? `${total.toLocaleString()} ${total === 1 ? 'result' : 'results'} for "${query}"`
                : 'No results found'}
            </h1>

            {/* Sort dropdown */}
            {query.trim() && ( <SortDropdown value={sortBy} onChange={setSortBy} /> )}

          </div>

          {/* Error and loading states */}
          {error && <div className="search-error">{error}</div>}
          {loading && <div className="search-loading-overlay"><Loader2 className="search-spinner" size={40} /></div>}

          {/* Repo cards */}
          <div className="flex flex-col gap-4">
            {sortedRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}

export default SearchResults;