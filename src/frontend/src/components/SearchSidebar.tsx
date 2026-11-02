import { BookBookmark, UsersRound, Hash, Check } from 'lucide-react';
import { useSearchParams } from 'react-router';
import GithubIcon from './GithubIcon';
import logo from '../assets/clonvix-logo.png';


function SearchSidebar() {

    // Get the current search parameters from the URL
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedType = searchParams.get('type') ?? 'repositories';
    const selectedLanguage = searchParams.get('lang') ?? '';

    // Function to handle category filter
    function handleCategoryChange(category: string) {
        const params = new URLSearchParams(searchParams);

        params.set('type', category);
        params.delete('page');
        params.delete('sort');
        params.delete('order');

        if (category === 'topics' || category === 'users') {
            params.delete('lang');
        }

        setSearchParams(params);
    }

    // Function to handle language filter
    function handleLanguageChange(language: string) {
        const params = new URLSearchParams(searchParams);

        if (selectedLanguage === language) {
            params.delete('lang');
        } else {
            params.set('lang', language);
        }

        params.delete('page');
        setSearchParams(params);
    }

    return (

        <aside className="search-sidebar">
          <h2 className="search-sidebar-heading">Filter by</h2>

          <nav className="search-categories" aria-label="Search categories">

            <button className={`search-category ${selectedType === 'repositories' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('repositories')}
            >
              <BookBookmark size={18} />
              <span>Repositories</span>
            </button>

            <button className={`search-category ${selectedType === 'users' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('users')}
            >
              <UsersRound size={18} />
              <span>Users</span>
            </button>

            <button className={`search-category ${selectedType === 'topics' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('topics')}
            >
              <Hash size={18} />
              <span>Topics</span>
            </button>

          </nav>
        
          {/* Language filters */}
          {selectedType === 'repositories' && (
            <div className="search-language-filters">
              <h3>Languages</h3>
                <div className="search-language-list">
                  {[
                    { name: 'Python', color: '#3572A5' },
                    { name: 'JavaScript', color: '#F1E05A' },
                    { name: 'TypeScript', color: '#3178C6' },
                    { name: 'HTML', color: '#E34C26' },
                    { name: 'CSS', color: '#663399' },
                    { name: 'Java', color: '#B07219' },
                    { name: 'Lua', color: '#000080' },
                    { name: 'Swift', color: '#F05138' },
                    { name: 'C++', color: '#F34B7D' },
                    { name: 'Elixir', color: '#6E4A7E' },
                    { name: 'Go', color: '#00ADD8' },
                    { name: 'Perl', color: '#0298C3' },
                    { name: 'Rust', color: '#DEA584' },
                    { name: 'Dart', color: '#00B4AB' },
                    { name: 'C#', color: '#7355DD' },
                    { name: 'Ruby', color: '#701516' },
                    { name: 'Kotlin', color: '#A97BFF' },
                    { name: 'R', color: '#198CE7' },
                    { name: 'Haskell', color: '#5E5086' },
                    { name: 'PHP', color: '#4F5D95' },
                    { name: 'PowerShell', color: '#012456' },
                    { name: 'Scala', color: '#DC322F' },
                    { name: 'C', color: '#555555' },
                    { name: 'Shell', color: '#89E051' },
                    { name: 'Makefile', color: '#427819' },
                    { name: 'Dockerfile', color: '#384D54' },
                  ].map((language) => (
                    <button
                      key={language.name}
                      className={`search-language-option ${selectedLanguage === language.name ? 'active' : ''}`}
                      type="button"
                      onClick={() => handleLanguageChange(language.name)}
                    >
                      <span
                        className="search-language-dot"
                        style={{ backgroundColor: language.color }}
                      />
                      <span>{language.name}</span>
                      {selectedLanguage === language.name && (
                        <Check size={16} className="search-language-check" />
                      )}
                    </button>
                  ))}
                </div>
            </div>
        )}

        {/* User type filters */}
        {selectedType === 'users' && (
          <div className="user-type-filters">
            <h3>User type</h3>
              <div className="user-type-list">
                <button className="user-type-option active" type="button">
                    <GithubIcon size={30} />
                    <span>GitHub</span>
                    <Check size={16} className="search-user-check" />
                </button>
                <button className="user-type-option clonvix-user-type-option" type="button">
                    <img src={logo} alt="Clonvix logo" className="clonvix-logo" />
                    <span>Clonvix</span>
                </button>
              </div>
          </div>
        )}
      </aside>

    );
}

export default SearchSidebar;