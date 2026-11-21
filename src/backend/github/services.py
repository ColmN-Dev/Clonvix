from django.core.cache import cache
from .models import RepositorySnapshot
from .github_client import search_repositories, search_topics, search_users
from .github_client import get_repository, get_repository_releases, get_repository_deployments, get_repository_contributors, get_repository_languages
from .github_client import get_repository_commits, get_repository_branches, get_repository_tags, get_repository_latest_commit, get_repository_contents, get_repository_readme
from .github_client import get_github_profile, get_github_social_accounts, get_github_profile_repositories, get_github_profile_connections
from datetime import timedelta
from django.utils import timezone
from concurrent.futures import ThreadPoolExecutor

# Keep search results for 5 minutes
SEARCH_CACHE_SECONDS = 60 * 5

# Keep repository details for 10 minutes
REPOSITORY_CACHE_SECONDS = 60 * 10

# Keep profile info for 10 minutes
PROFILE_CACHE_SECONDS = 60 * 10

# Keep trending results for 15 minutes
TRENDING_CACHE_SECONDS = 60 * 15

# ===================================================
# Search Caching Logic
# ===================================================

def cached_repository_search(query, page=1, per_page=10, language=None, sort=None, order=None):
    """Return repository search results, using the cache when possible."""
    
    query = query.strip()
    
    # Create a unique cache key based on the search parameters
    cache_key = f"repo_search:{query.lower()}:{page}:{per_page}:{language}:{sort}:{order}"

    # Check if the results are already cached
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = search_repositories(query, page=page, per_page=per_page, language=language, sort=sort, order=order)
    
    # Cache the results for future requests
    cache.set(cache_key, data, SEARCH_CACHE_SECONDS)
    
    return data

def cached_user_search(query, page=1, per_page=10, sort=None, order=None):
    """Return user search results, using the cache when possible."""

    query = query.strip()

    # Create a unique cache key for the user search
    cache_key = f"user_search:{query.lower()}:{page}:{per_page}:{sort}:{order}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = search_users(query, page=page, per_page=per_page, sort=sort, order=order)

    # Cache the results for future requests
    cache.set(cache_key, data, SEARCH_CACHE_SECONDS)
    
    return data

def cached_topic_search(query, page=1, per_page=10):
    """Return topic search results, using the cache when possible."""

    query = query.strip()

    # Create a unique cache key for the topic search
    cache_key = f"topic_search:{query.lower()}:{page}:{per_page}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = search_topics(query, page=page, per_page=per_page)

    # Cache the results for future requests
    cache.set(cache_key, data, SEARCH_CACHE_SECONDS)
    
    return data

# ===================================================
# Repository Detail Caching Logic
# ===================================================

def cached_repository_detail(owner, repo):
    """Return repository detail data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository detail
    cache_key = f"repo_detail:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository(owner, repo)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_releases(owner, repo):
    """Return repository releases data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository releases
    cache_key = f"repo_releases:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key, "miss")

    if cached != "miss":
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_releases(owner, repo)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_deployments(owner, repo):
    """Return repository deployments data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository deployments
    cache_key = f"repo_deployments:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key, "miss")
    
    if cached != "miss":
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_deployments(owner, repo)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_contributors(owner, repo):
    """Return repository contributors data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository contributors
    cache_key = f"repo_contributors:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_contributors(owner, repo)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_languages(owner, repo):
    """Return repository languages data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository languages
    cache_key = f"repo_languages:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)
    
    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_languages(owner, repo)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_commits(owner, repo):
    """Return repository commit count, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository commit count
    cache_key = f"repo_commits:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_commits(owner, repo)

    # Only cache data with commit counts, one or more, to avoid caching empty results
    if data is not None:
        cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)

    return data

def cached_repository_branches(owner, repo):
    """Return repository branch count, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository branch count
    cache_key = f"repo_branches:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_branches(owner, repo)

    # Only cache data with branch counts, one or more, to avoid caching empty results
    if data is not None:
        cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)

    return data

def cached_repository_tags(owner, repo):
    """Return repository tag count, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository tag count
    cache_key = f"repo_tags:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_tags(owner, repo)

    # Only cache data with tag counts, one or more, to avoid caching empty results
    if data is not None:
        cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)

    return data

def cached_repository_latest_commit(owner, repo, path=None):
    """Return repository latest commit data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()
    path = path.strip() if path else None

    # Create a unique cache key for the repository latest commit
    cache_key = f"repo_latest_commit:{owner.lower()}:{repo.lower()}:path{path or 'None'}"

    # Check if the results are already cached
    cached = cache.get(cache_key, "miss")

    if cached != "miss":
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_latest_commit(owner, repo, path=path)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_contents(owner, repo):
    """Return repository contents data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()

    # Create a unique cache key for the repository contents
    cache_key = f"repo_contents:{owner.lower()}:{repo.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_contents(owner, repo)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)
    
    return data

def cached_repository_readme(owner, repo, path=None):
    """Return repository README data, using the cache when possible."""

    owner = owner.strip()
    repo = repo.strip()
    
    cache_path = path or "root"
    
    # Create a unique cache key for the repository README
    cache_key = f"repo_readme:{owner.lower()}:{repo.lower()}:{cache_path.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key, "miss")

    if cached != "miss":
        return cached

    # Call the GitHub API and cache the results
    data = get_repository_readme(owner, repo, path=path)

    # Cache the results for future requests
    cache.set(cache_key, data, REPOSITORY_CACHE_SECONDS)

    return data

# ===================================================
# Profile caching logic
# ===================================================

def cached_github_profile(username):
    """Return profile data, using the cache when possible."""

    username = username.strip()

    # Create a unique cache key for the profile
    cache_key = f"github_profile:{username.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_github_profile(username)
    
    # Call the GitHub API to get social accounts and add them to the profile data
    data["social_links"] = get_github_social_accounts(username)

    # Cache the results for future requests
    cache.set(cache_key, data, PROFILE_CACHE_SECONDS)
    
    return data

def cached_github_profile_repositories(username):
    """Return public repositories, using the cache when possible."""

    username = username.strip()

    # Create a unique cache key for the user's repositories
    cache_key = f"github_repositories:{username.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_github_profile_repositories(username)

    # Cache the results for future requests
    cache.set(cache_key, data, PROFILE_CACHE_SECONDS)

    return data

def cached_github_profile_connections(username, relationship, page):
    """Return followers or following with full profiles, using the cache when possible."""

    username = username.strip()

    # Create a unique cache key for the followers or following page
    cache_key = f"github_{relationship}:{username.lower()}:{page}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API to get the list of users
    users = get_github_profile_connections(username, relationship, page)

    # Get the usernames of the followers or following and fetch their full profiles concurrently
    logins = []
    for user in users:
        logins.append(user["login"])
    
    # Use ThreadPoolExecutor to fetch the full profiles concurrently
    with ThreadPoolExecutor(max_workers=10) as executor:
        data = list(executor.map(get_github_profile, logins))

    # Cache the results for future requests
    cache.set(cache_key, data, PROFILE_CACHE_SECONDS)

    return data

# ===================================================
# Trending repository logic
# =================================================

def get_trending_repositories(date_range="daily"):
    """Return trending repositories for the selected date range."""
    
    # Set the number of days to compare.
    if date_range == "daily":
        days = 1
    elif date_range == "weekly":
        days = 7
    elif date_range == "monthly":
        days = 30
    else:
        raise ValueError("Invalid date range.")
    
    # Calculate the current and historical dates
    today = timezone.localdate()
    start_date = today - timedelta(days=days)
    
    # Fetch current and historical snapshots from the database
    current_snapshots = RepositorySnapshot.objects.filter(snapshot_date=today)
    historical_snapshots = RepositorySnapshot.objects.filter(snapshot_date=start_date)
    
    trending_repositories = []
    
    for current in current_snapshots:
        # Find the corresponding historical snapshot
        historical = historical_snapshots.filter(github_id=current.github_id).first()
        
        if historical:
            # Calculate the star growth
            star_growth = current.star_count - historical.star_count
            
            # Append the repository data and star growth
            trending_repositories.append({
                "github_id": current.github_id,
                "star_count": current.star_count,
                "snapshot_date": current.snapshot_date,
                "star_growth": star_growth,
                "full_name": current.full_name,
                "description": current.description,
                "html_url": current.html_url,
                "forks_count": current.forks_count,
                "language": current.language,
            })
            
    # Sort the repositories by star growth in descending order
    trending_repositories.sort(
        key=lambda repo: repo["star_growth"],
        reverse=True
    )
    
    return trending_repositories[:10]

def cached_trending_repositories(date_range="daily"):
    """Return trending repositories, using the cache when possible."""

    cache_key = f"trending_repositories:{date_range}"

    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    data = get_trending_repositories(date_range=date_range)

    cache.set(cache_key, data, TRENDING_CACHE_SECONDS)

    return data