import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Check, ChevronDown, FolderGit2, Tag } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import RepoCard from '../components/RepoCard';
import type { Repo } from '../components/RepoCard';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const [repos, setRepos] = useState<Repo[]>([]);
  const [total, setTotal] = useState(0);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Best match');
  const sortRef = useRef<HTMLDivElement>(null);

  const sortOptions = ['Best match', 'Most stars', 'Recently updated'];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch new results whenever the URL search query changes.
  useEffect(() => {
    fetch(`/api/repositories/search/?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        setRepos(data.items);
        setTotal(data.total_count);
      });
  }, [query]);

  return (
    <section className="search-results-page">
      <div className="search-results-layout">
        <aside className="search-sidebar">
          <h2 className="search-sidebar-heading">Filter by</h2>

          <nav className="search-categories" aria-label="Search categories">
            <button className="search-category active">
              <FolderGit2 size={18} />
              <span>Repositories</span>
            </button>

            <button className="search-category">
              <Tag size={18} />
              <span>Topics</span>
            </button>
          </nav>

          <div className="search-language-filters">
            <h3>Languages</h3>
            <div className="search-language-list">
              {[
                { name: 'JavaScript', color: '#f1e05a' },
                { name: 'Python', color: '#3572A5' },
                { name: 'Java', color: '#b07219' },
                { name: 'TypeScript', color: '#3178c6' },
                { name: 'C++', color: '#f34b7d' },
                { name: 'C', color: '#555555' },
                { name: 'CSS', color: '#563d7c' },
                { name: 'Ruby', color: '#701516' },
                { name: 'Shell', color: '#89e051' },
                { name: 'Rust', color: '#dea584' },
                { name: 'HTML', color: '#e34c26' },
                { name: 'Kotlin', color: '#F18E33' },
                { name: 'Swift', color: '#ffac45' },
                { name: 'Go', color: '#00ADD8' },
                { name: 'C#', color: '#178600' },
                { name: 'PHP', color: '#4F5D95' },
              ].map((language) => (
                <button
                  key={language.name}
                  className="search-language-option"
                  type="button"
                >
                  <span
                    className="search-language-dot"
                    style={{ backgroundColor: language.color }}
                  />
                  <span>{language.name}</span>
                </button>
              ))}
            </div>
            
          </div>
        </aside>

        <main className="search-results-content">
          <div className="search-results-header">
            <SearchBar />
          </div>
          <div className="search-results-toolbar">
            <h1 className="font-bold text-2xl">
              {total.toLocaleString()} {total === 1 ? 'result' : 'results'} for "{query}"
            </h1>

            <div className="search-sort-container" ref={sortRef}>
              <button
                className="search-sort"
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                aria-expanded={isSortOpen}
              >
                Sort: {sortBy}
                <ChevronDown size={16} />
              </button>

              {isSortOpen && (
                <div className="search-sort-menu">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className="search-sort-option"
                      onClick={() => {
                        setSortBy(option);
                        setIsSortOpen(false);
                      }}
                    >
                      <span>{option}</span>
                      {sortBy === option && (
                        <Check size={16} className="search-sort-check" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {repos.map((repo) => (
              <RepoCard key={repo.id} repo={repo} />
            ))}
          </div>
        </main>
      </div>
    </section>
  );
}

export default SearchResults;
