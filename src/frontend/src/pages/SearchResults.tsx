import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import SearchBar from '../components/SearchBar';
import RepoCard from '../components/RepoCard';
import type { Repo } from '../components/RepoCard';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [repos, setRepos] = useState<Repo[]>([]);
  const [total, setTotal] = useState(0);

  // Fetch new results whenever the URL search query changes.
  useEffect(() => {
    fetch(`/api/repositories/search/?q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        setRepos(data.items);
        setTotal(data.total_count);
      });
  }, [query]);

  return (
    <section className="search-results-page">
      <SearchBar />
      <h1 className="mt-4 font-bold text-2xl">{total.toLocaleString()} {total === 1 ? 'result' : 'results'} for "{query}"</h1>
      {/* Render each repository using the reusable RepoCard component.no */}
        <div className="mt-4 flex flex-col gap-4">
        {repos.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
        ))}
        </div>
    </section>
  );
}

export default SearchResults;