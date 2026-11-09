import { BookBookmark, Star, GitFork } from 'lucide-react';

// Define the data needed for each trending repository
export interface TrendingRepo {
  github_id: number;
  full_name: string;
  description: string | null;
  html_url: string;
  star_count: number;
  forks_count: number;
  language: string | null;
  star_growth: number;
}
// Define the props for the TrendingCard component
export type TrendingCardProps = {
  repo: TrendingRepo;
  dateRange: "daily" | "weekly" | "monthly";
};

// Display the details of a trending repository as a card component
function TrendingCard({ repo, dateRange }: TrendingCardProps) {
  const dateRangeLabel = dateRange === "daily"
    ? "today"
    : dateRange === "weekly"
      ? "this week"
      : "this month";

  return (
    <article className="trending-card">
      {/* Header */}
      <div className="trending-card-header">
        <BookBookmark size={20} />
        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
          {repo.full_name}
        </a>
      </div>

      {/* Description */}
      <p className="trending-card-description">
        {repo.description ?? 'No description available.'}
      </p>

      {/* Repository metadata and star growth */}
      <div className="trending-card-footer">
        <div className="trending-card-metadata">
          <span>
            {repo.language && (
              <span className={`language-dot language-${repo.language}`} />
            )}
            {repo.language ?? 'No language'}
          </span>
          <span><Star size={16} /> {repo.star_count.toLocaleString()}</span>
          <span><GitFork size={16} /> {repo.forks_count.toLocaleString()}</span>
        </div>
        <span className="trending-card-growth">
          <Star size={16} />
          <span>
            {repo.star_growth.toLocaleString()} stars {dateRangeLabel}
          </span>
        </span>
      </div>
    </article>
  );
}

export default TrendingCard;