import { MapPin, BookBookmark, UsersRound } from 'lucide-react';

export interface User {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  followers: number;
  public_repos: number;
}

// Display the developer metadata returned by the GitHub API as a compact result card.
function UserCard({ user }: { user: User }) {
  return (
    <article className="user-card">
      <div className="user-card-header">
        <img
          className="user-card-avatar"
          src={user.avatar_url}
          alt={`${user.login} avatar`}
        />
        {user.name && (
          <a
            href={user.html_url}
            target="_blank" rel="noopener noreferrer"
            className="user-display-name"
          >
            {user.name}
          </a>
        )}
        <a href={user.html_url} target="_blank" rel="noopener noreferrer">
          {user.login}
        </a>
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
            {user.public_repos.toLocaleString()}
          </span>

          <span>•</span>

          <span className="flex items-center gap-1">
            <UsersRound size={16} />
            {user.followers.toLocaleString()}
          </span>
        </div>
    </article>
  );
}

export default UserCard;