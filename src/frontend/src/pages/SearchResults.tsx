import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LoaderCircle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import RepoCard from '../components/RepoCard';
import UserCard from '../components/UserCard';
import TopicCard from '../components/TopicCard';
import type { Repo } from '../components/RepoCard';
import type { User } from '../components/UserCard';
import type { Topic } from '../components/TopicCard';
import SearchSidebar from '../components/SearchSidebar';
import SortDropdown from '../components/SortDropdown';

function SearchResults() {

  // Read search and filter parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const language = searchParams.get('lang') ?? '';
  const type = searchParams.get('type') ?? 'repositories';
  const sort = searchParams.get('sort') ?? '';
  const order = searchParams.get('order') ?? '';

  // Set the document title based on the search query
  useEffect(() => {
    document.title = query
      ? `Results for ${query} | Clonvix`
      : 'Search | Clonvix';
  }, [query]);

  // Ensure that the "type" parameter is always in the URL, defaulting to "repositories" if not
  useEffect(() => {
    if (!searchParams.has('type')) {
      const params = new URLSearchParams(searchParams);
      params.set('type', 'repositories');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Convert the URL sorting values into dropdown labels
  const sortLabels: Record<string, string> = {

    // Repository sorting options
    'stars-desc': 'Most stars',
    'stars-asc': 'Least stars',
    'forks-desc': 'Most forks',
    'forks-asc': 'Least forks',
    'updated-desc': 'Recently updated',

    // User sorting options
    'followers-desc': 'Most followers',
    'followers-asc': 'Least followers',
    'joined-desc': 'Newest members',
    'joined-asc': 'Oldest members',
    'repositories-desc': 'Most repositories',
    'repositories-asc': 'Least repositories',

  };

  const repoSortOptions = ['Best match', 'Most stars', 'Least stars', 'Most forks', 'Least forks', 'Recently updated'];
  const userSortOptions = ['Best match', 'Most followers', 'Least followers', 'Newest members', 'Oldest members', 'Most repositories', 'Least repositories'];
  const sortOptions = type === 'users' ? userSortOptions : repoSortOptions;

  const sortBy = sortLabels[`${sort}-${order}`] ?? 'Best match';

  // Store repository results and the total result count
  const [repos, setRepos] = useState<Repo[]>([]);
  const [totalRepos, setTotalRepos] = useState(0);

  // Store user results and the total user count
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Store topic results and the total topic count
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalTopics, setTotalTopics] = useState(0);

  // Get the total result count based on the selected type
  const totalResults = type === 'users' ? totalUsers : type === 'topics' ? totalTopics : totalRepos;

  // Manage loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the URL when a sorting option is selected
  function handleSortChange(option: string) {
    const params = new URLSearchParams(searchParams);

    // Convert dropdown selections to their corresponding URL sorting parameters
    const sortOptions: Record<string, { sort: string; order: string }> = {

      // Repository sorting options
      'Most stars': { sort: 'stars', order: 'desc' },
      'Least stars': { sort: 'stars', order: 'asc' },
      'Most forks': { sort: 'forks', order: 'desc' },
      'Least forks': { sort: 'forks', order: 'asc' },
      'Recently updated': { sort: 'updated', order: 'desc' },

      // User sorting options
      'Most followers': { sort: 'followers', order: 'desc' },
      'Least followers': { sort: 'followers', order: 'asc' },
      'Newest members': { sort: 'joined', order: 'desc' },
      'Oldest members': { sort: 'joined', order: 'asc' },
      'Most repositories': { sort: 'repositories', order: 'desc' },
      'Least repositories': { sort: 'repositories', order: 'asc' },

    };

    // Get the selected sorting values based on the dropdown option
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

    // Update the URL with the new sorting parameters
    setSearchParams(params);
  }

  // Fetch search results whenever the search or filters change
  useEffect(() => {
    // Don't make an API request if the search query is empty
    if (!query.trim()) {

      setRepos([]);
      setTotalRepos(0);

      setUsers([]);
      setTotalUsers(0);

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

    // Add the selected filters to the API request
    if (language) params.set('lang', language);
    if (type) params.set('type', type);
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);

    // Make the API request to the backend search endpoint
    fetch(`/api/github/search/?${params.toString()}`)

      .then((response) => {
        if (!response.ok) throw new Error('Search failed');
        return response.json();
      })
      
      .then((data) => {
        if (type === 'users') {

          // Set the full profile data for each user in the results
         return Promise.all(
            data.items.map((user: User) =>
              fetch(`/api/github/users/${user.login}/`)

                .then((response) => {
                  if (!response.ok) throw new Error('Failed to fetch user profile');
                  return response.json();
                })
            )

          ).then((profiles) => {

            setUsers(profiles);
            setTotalUsers(data.total_count);

          });

        } else if (type === 'topics') {
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

        setUsers([]);
        setTotalUsers(0);

        setTopics([]);
        setTotalTopics(0);

        setError('Search failed. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });

  // Run the request again when any of the search parameters changes
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
                : totalResults === 0
                  ? `No results found for "${query}"`
                  : `${totalResults.toLocaleString()} ${totalResults === 1 ? 'result' : 'results'} for "${query}"`}
            </h1>

            {/* Sort dropdown */}
            {query.trim() && (type === 'repositories' || type === 'users') && (
                <SortDropdown value={sortBy} onChange={handleSortChange} options={sortOptions} />
              )}
          </div>

          {/* Display errors and loading spinner */}
          {error && <div className="search-error">{error}</div>}

          {loading && (
            <div className="search-loading-overlay">
              <LoaderCircle className="search-spinner" size={40} />
            </div>
          )}

          {/* Display the search results */}
          <div className="flex flex-col gap-4">
            {type === 'users' ? users.map((user) => (
              <UserCard key={user.id} user={user} />
            )) : type === 'topics' ? topics.map((topic) => (
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
