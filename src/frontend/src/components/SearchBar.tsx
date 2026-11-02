import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Search } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';

function SearchBar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Default type: repositories, if not specified in the URL
  const type = searchParams.get('type') ?? 'repositories';

  // Search form submission
  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    // Navigate to the search results page with the query and the selected type
    navigate(`/search?q=${encodeURIComponent(trimmed)}&type=${type}`);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <Search className="search-bar-icon" size={20} aria-hidden="true" />
      <input
        type="search"
        className="search-bar-input"
        placeholder="Search GitHub..."
        aria-label="Search GitHub"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

export default SearchBar;