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
import Pagination from '../components/Pagination';

function SearchResults() {

  // Get the search parameters from the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const language = searchParams.get('lang') ?? '';
  const type = searchParams.get('type') ?? 'repositories';
  const sort = searchParams.get('sort') ?? '';
  const order = searchParams.get('order') ?? '';
  const currentPage = Math.max(1, Number(searchParams.get('page')) || 1);
  const perPage = 10;
  const hasQuery = query.trim().length > 0;

  // Set the document title based on the selected search type
  useEffect(() => {
    document.title = `${type === 'repositories' ? 'Repository' : type === 'users' ? 'User' : 'Topic'} search results | Clonvix`;
  }, [type]);

  // Ensure that the "type" parameter is always in the URL, defaulting to "repositories" if not
  useEffect(() => {
    if (!searchParams.has('type')) {
      const params = new URLSearchParams(searchParams);
      params.set('type', 'repositories');
      setSearchParams(params, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Available sorting options for repositories and users
  const sortOptions = [
    // Repository sorting options
    { label: 'Most stars', sort: 'stars', order: 'desc', type: 'repositories' },
    { label: 'Least stars', sort: 'stars', order: 'asc', type: 'repositories' },
    { label: 'Most forks', sort: 'forks', order: 'desc', type: 'repositories' },
    { label: 'Least forks', sort: 'forks', order: 'asc', type: 'repositories' },
    { label: 'Recently updated', sort: 'updated', order: 'desc', type: 'repositories' },

    // User sorting options
    { label: 'Most followers', sort: 'followers', order: 'desc', type: 'users' },
    { label: 'Least followers', sort: 'followers', order: 'asc', type: 'users' },
    { label: 'Newest members', sort: 'joined', order: 'desc', type: 'users' },
    { label: 'Oldest members', sort: 'joined', order: 'asc', type: 'users' },
    { label: 'Most repositories', sort: 'repositories', order: 'desc', type: 'users' },
    { label: 'Least repositories', sort: 'repositories', order: 'asc', type: 'users' },
  ];

  // Separate sorting options for repositories and users, default to 'Best match'
  const repoSortOptions = ['Best match'];
  const userSortOptions = ['Best match'];

  // Separate sorting options by search type
  sortOptions.forEach(option => {
    if (option.type === 'repositories') {
      repoSortOptions.push(option.label);
    } else if (option.type === 'users') {
      userSortOptions.push(option.label);
    }
  });

  // Determine the appropriate sorting options based on the selected type
  const dropdownSortOptions = type === 'users' ? userSortOptions : repoSortOptions;
  const selectedSort = sortOptions.find(option => option.sort === sort && option.order === order && option.type === type);
  const sortBy = selectedSort ? selectedSort.label : 'Best match';

  // Store repository results and the total result count
  const [repos, setRepos] = useState<Repo[]>([]);
  const [totalRepos, setTotalRepos] = useState(0);

  // Store user results and the total user count
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Store topic results and the total topic count
  const [topics, setTopics] = useState<Topic[]>([]);
  const [totalTopics, setTotalTopics] = useState(0);

  // Select the total result count for the current search type
  const totalResults = !hasQuery ? 0 : type === 'users' ? totalUsers : type === 'topics' ? totalTopics : totalRepos;

  // Only display results when a search query exists
  const visibleRepos = hasQuery ? repos : [];
  const visibleUsers = hasQuery ? users : [];
  const visibleTopics = hasQuery ? topics : [];

  // Calculate the total number of pages, maximum 100 pages
  const totalPages = Math.min(Math.ceil(totalResults / perPage), 100);

  // Manage loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the URL when a new page is selected
  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update the URL when a sorting option is selected
  function handleSortChange(option: string) {
    const params = new URLSearchParams(searchParams);

    // Find the chosen sorting option based on the label and type
    const chosenSort = sortOptions.find(sortOption => sortOption.label === option && sortOption.type === type);

    // Add the selected sorting values, or remove them for Best match
    if (chosenSort) {
      params.set('sort', chosenSort.sort);
      params.set('order', chosenSort.order);
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
    if (!hasQuery) {
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    // Build the API request URL
    const params = new URLSearchParams({
      q: query,
      page: String(currentPage),
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

          // Fetch full profile details for each user
         return Promise.all(
            data.items.map((user: User) =>
              fetch(`/api/github/users/${user.login}/`)
                .then((response) => {
                  if (!response.ok) return null;
                  return response.json();
                })
                .catch(() => null)
            )
          ).then((profiles) => {
            setUsers(profiles.filter(profile => profile !== null));
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
  }, [query, language, type, sort, order, currentPage]);

  return (
    <section className="search-results-page">
      <div className="search-results-layout">

        <SearchSidebar />

        <main className="search-results-content">
          <div className="search-results-header">
            <SearchBar />
          </div>

          <div className="search-results-toolbar">
            <h1 className={`font-bold text-2xl ${!hasQuery ? 'flex-1 flex items-center justify-center' : ''}`}>
              {!hasQuery
                ? 'Enter a search term to see results'
                : loading
                  ? `Searching for ${query}...`
                  : totalResults === 0
                    ? `No results found for ${query}`
                    : `${totalResults.toLocaleString()} ${totalResults === 1 ? 'result' : 'results'} for ${query}`}
            </h1>

            {/* Sort dropdown */}
            {hasQuery && (type === 'repositories' || type === 'users') && (
                <SortDropdown value={sortBy} onChange={handleSortChange} options={dropdownSortOptions} />
              )}
          </div>

          {/* Display the current error or loading state */}
          {error && <div className="search-error">{error}</div>}

          {loading && (
            <div className="search-loading-overlay">
              <LoaderCircle className="search-spinner" size={40} />
            </div>
          )}

          {/* Display the search results */}
          <div className="flex flex-col gap-4">
            {type === 'users' ? visibleUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            )) : type === 'topics' ? visibleTopics.map((topic) => (
              <TopicCard key={topic.name} topic={topic} />
            ))
            : visibleRepos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>

          {/* Pagination */}
          {!loading && !error && hasQuery && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}

        </main>
      </div>
    </section>
  );
}

export default SearchResults;