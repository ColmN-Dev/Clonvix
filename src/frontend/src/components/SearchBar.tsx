import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { Search } from 'lucide-react';

function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // search logic to be implemented here
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <Search className="search-bar-icon" size={20} aria-hidden="true" />
      <input
        type="search"
        className="search-bar-input"
        placeholder="Search GitHub Repositories..."
        aria-label="Search GitHub Repositories"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

export default SearchBar;