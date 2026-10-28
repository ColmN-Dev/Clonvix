export interface Repo {
  id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  updated_at: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
}

// Present the repository metadata returned by the search API as a compact result card.
function RepoCard({ repo }: { repo: Repo }) {
  return (
    <article className="repo-card">
      <div className="repo-card-header">
        <img
          className="repo-card-avatar"
          src={repo.owner.avatar_url}
          alt={`${repo.owner.login} avatar`}
        />
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
          {repo.full_name}
        </a>
      </div>

      <p>{repo.description ? repo.description : 'No description available.'}</p>

      <div className="repo-card-topics">
        {repo.topics.map((topic) => (
          <span key={topic}>{topic}</span>
        ))}
      </div>

      <div className="repo-card-footer">
        <span>{repo.language ? repo.language : 'No language'}</span>
        <span>•</span>
        <span>{repo.stargazers_count.toLocaleString()} {repo.stargazers_count === 1 ? 'star' : 'stars'}</span>
        <span>•</span>
        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
    </article>
  );
}

export default RepoCard;