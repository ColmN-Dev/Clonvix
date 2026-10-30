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

    );
}

export default SearchSidebar;