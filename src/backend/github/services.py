from django.core.cache import cache

from .github_client import search_repositories, search_topics

# Keep results for 5 minutes
CACHE_SECONDS = 60 * 5


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
    cache.set(cache_key, data, CACHE_SECONDS)
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
    cache.set(cache_key, data, CACHE_SECONDS)
    return data