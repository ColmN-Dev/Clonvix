import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type SortDropdownProps = {
  value: string;
  onChange: (option: string) => void;
};

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const sortOptions = ['Best match', 'Most stars', 'Least stars', 'Most forks', 'Least forks', 'Recently updated'];

  // Close sort menu when clicking outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-sort-container" ref={sortRef}>
      <button
        className="search-sort"
        type="button"
        onClick={() => setIsSortOpen(!isSortOpen)}
        aria-expanded={isSortOpen}
      >
        Sort by: {value}
        <ChevronDown size={16} />
      </button>

      {/* Sort options menu */}
      {isSortOpen && (
        <div className="search-sort-menu">
          {sortOptions.map((option) => (
            <button
              key={option}
              type="button"
              className="search-sort-option"
              onClick={() => {
                onChange(option);
                setIsSortOpen(false);
              }}
            >
              <span>{option}</span>
              {value === option && (
                <Check size={16} className="search-sort-check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortDropdown;