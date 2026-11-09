import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

type DropdownProps = {
  label: string;
  value: string;
  onChange: (option: string) => void;
  options: { label: string; value: string }[];
};

function Dropdown({ label, value, onChange, options }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="search-sort-container" ref={dropdownRef}>
      <button
        className="search-sort"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {label} {options.find(option => option.value === value)?.label}
        <ChevronDown size={16} />
      </button>

      {/* Dropdown options menu */}
      {isOpen && (
        <div className="search-sort-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className="search-sort-option"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span>{option.label}</span>
              {value === option.value && (
                <Check size={16} className="search-sort-check" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;