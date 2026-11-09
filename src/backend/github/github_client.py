import requests
from django.conf import settings

GITHUB_API_URL = "https://api.github.com"


def search_repositories(query, page=1, per_page=10, language=None, sort=None, order=None):
    """Search public GitHub repositories and return GitHub's JSON response."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }
    params = {
        "q": f"{query} language:{language}" if language else query,
        "page": page,
        "per_page": per_page,
        "sort": sort,
        "order": order,
    }

    response = requests.get(
        f"{GITHUB_API_URL}/search/repositories",
        headers=headers,
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

def search_users(query, page=1, per_page=10, sort=None, order=None):
    """Search GitHub for users and return the API response."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    params = {
        "q": query,
        "page": page,
        "per_page": per_page,
        "sort": sort,
        "order": order,
    }

    response = requests.get(
        f"{GITHUB_API_URL}/search/users",
        headers=headers,
        params=params,
        timeout=10,
    )

    response.raise_for_status()
    return response.json()

def search_topics(query, page=1, per_page=10):
    """Search GitHub for topics and return the API response."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    params = {
        "q": query,
        "page": page,
        "per_page": per_page,
    }

    response = requests.get(
        f"{GITHUB_API_URL}/search/topics",
        headers=headers,
        params=params,
        timeout=10,
    )

    response.raise_for_status()
    return response.json()

def get_user_profile(username):
    """Get a GitHub user's profile information."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}",
        headers=headers,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

def get_trending_repositories(page=1, per_page=100):
    """Fetch public repositories, minimum 1,000 stars."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    params = {
        "q": "stars:>=1000",
        "page": page,
        "per_page": per_page,
        "sort": "stars",
        "order": "desc",
    }

    response = requests.get(
        f"{GITHUB_API_URL}/search/repositories",
        headers=headers,
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()