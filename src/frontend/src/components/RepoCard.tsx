import { Star } from 'lucide-react'
import { Link } from 'react-router'
import { timeAgo } from '../utils/timeAgo';
import { formatCount } from '../utils/formatCount'

export interface Repo {
  id: number;
  full_name: string;
  name: string;
  owner_login: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
  };
}

// Display the repository metadata returned by the search API as a compact result card.
function RepoCard({ repo }: { repo: Repo }) {
  return (
    <article className="repo-card">
      <div className="repo-card-header">
        <img
          className="repo-card-avatar"
          src={repo.owner.avatar_url}
          alt={`${repo.owner.login} avatar`}
        />
        <Link to={`/${repo.owner.login}/${repo.name}`}>
          {repo.owner.login}/{repo.name}
        </Link>
      </div>

      <p className="repo-card-description">{repo.description ? repo.description : 'No description available.'}</p>

      <div className="repo-card-topics">
        {repo.topics.map((topic) => (
          <Link to={`/topics/${topic}`} key={topic} className="repo-card-topic">
            {topic}
          </Link>
        ))}
      </div>

      <div className="repo-card-footer">
        <span className="flex items-center gap-2">
          {repo.language && (
            <span
              className={`language-dot language-${repo.language}`} />
          )}
          {repo.language ?? 'No language'}
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Star size={16} />{formatCount(repo.stargazers_count)}
        </span>
        <span>•</span>
        <span className="repo-card-updated">Updated {timeAgo(repo.pushed_at)}</span>
      </div>
    </article>
  );
}

export default RepoCard;