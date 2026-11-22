import { MapPin, BookBookmark, UsersRound } from 'lucide-react'
import type { GithubUser } from '../types/github_profile'
import { Link } from 'react-router'
import { formatCount } from '../utils/formatCount'

// Display the developer metadata returned by the GitHub API as a compact result card.
function UserCard({ user }: { user: GithubUser }) {
  return (
    <article className="user-card">
      <div className="user-card-header">
        <img
          className="user-card-avatar"
          src={user.avatar_url}
          alt={`${user.login} avatar`}
        />
        {user.name && (
          <Link to={`/${user.login}`} className="user-display-name">
              {user.name}
          </Link>
        )}
        <Link to={`/${user.login}`}>
            {user.login}
        </Link>
      </div>

      {user.bio && <p className="user-card-bio">{user.bio}</p>}

        <div className="user-card-footer">
          {user.location && (
            <>
              <span className="flex items-center gap-1 user-card-location">
                <MapPin size={16} />
                <span className="user-card-location-text">{user.location}</span>
              </span>
              <span>•</span>
            </>
          )}

          <span className="flex items-center gap-1">
            <BookBookmark size={16} />
            {formatCount(user.public_repos)}
          </span>

          <span>•</span>

          <span className="flex items-center gap-1">
            <UsersRound size={16} />
            {formatCount(user.followers)}
          </span>
        </div>
    </article>
  );
}

export default UserCard;