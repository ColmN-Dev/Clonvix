from django.core.cache import cache
from .models import RepositorySnapshot
from .github_client import search_repositories, search_topics, search_users, get_user_profile
from datetime import timedelta
from django.utils import timezone

# Keep search results for 5 minutes
SEARCH_CACHE_SECONDS = 60 * 5

# Keep trending results for 15 minutes
TRENDING_CACHE_SECONDS = 60 * 15

# Cache logic for repository, user, and topic searches, as well as detailed user profiles
# Each function checks if the results are already cached and returns them if available
# If not, it calls the GitHub API, caches the results, and then returns them

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

def cached_user_profile(username):
    """Return user profile data, using the cache when possible."""

    username = username.strip()

    # Create a unique cache key for the user profile
    cache_key = f"user_profile:{username.lower()}"

    # Check if the results are already cached
    cached = cache.get(cache_key)

    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = get_user_profile(username)

    # Cache the results for future requests
    cache.set(cache_key, data, SEARCH_CACHE_SECONDS)
    return data

# Trending repository logic determined by historical star growth
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