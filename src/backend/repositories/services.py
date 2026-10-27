from django.core.cache import cache

from .github_client import search_repositories

# Keep results for 5 minutes
CACHE_SECONDS = 60 * 5


def cached_repository_search(query, page=1, per_page=10):
    """Return repository search results, using the cache when possible."""
    query = query.strip()
    cache_key = f"repo_search:{query.lower()}:{page}:{per_page}"

    # Cancel the api call if there is cached data
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # Call the GitHub API and cache the results
    data = search_repositories(query, page=page, per_page=per_page)
    cache.set(cache_key, data, CACHE_SECONDS)
    return data