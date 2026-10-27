import requests
from django.conf import settings

GITHUB_API_URL = "https://api.github.com"


def search_repositories(query, page=1, per_page=10):
    """Search public GitHub repositories and return GitHub's JSON response."""
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
        f"{GITHUB_API_URL}/search/repositories",
        headers=headers,
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()