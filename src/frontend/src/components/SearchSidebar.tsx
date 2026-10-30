import { FolderGit2, Tag } from 'lucide-react';

function SearchSidebar() {

    return (

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
        
          {/* Language filters */}
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

    );
}

export default SearchSidebar;