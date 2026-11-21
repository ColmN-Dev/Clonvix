import requests
from django.conf import settings
import base64

GITHUB_API_URL = "https://api.github.com"

# ====================================================
# GitHub API Search Functions
# ==================================================

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

# ====================================================
# Repository Detail Functions
# ====================================================

def github_repository_response(endpoint, params=None):
    """Make an authenticated request to the GitHub API and return the response object."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }
    
    response = requests.get(
        f"{GITHUB_API_URL}/{endpoint}",
        headers=headers,
        params=params,
        timeout=10,
    )
    
    response.raise_for_status()
    return response

def github_repository_request(endpoint, params=None):
    """Make an authenticated request to the GitHub API and return the JSON response."""
    return github_repository_response(endpoint, params=params).json()

def get_repository(owner, repo):
    """Get a GitHub repository's details."""
    
    return github_repository_request(f"repos/{owner}/{repo}")

def get_repository_releases(owner, repo):
    """Get a GitHub repository's latest release, or None if it has none."""
    
    try:
        return github_repository_request(f"repos/{owner}/{repo}/releases/latest")
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            return None
        raise

def get_repository_deployments(owner, repo):
    """Get a GitHub repository's latest deployment, or None if it has none."""
    deployments = github_repository_request(f"repos/{owner}/{repo}/deployments", params={"per_page": 1},)
    
    return deployments[0] if deployments else None

def get_repository_contributors(owner, repo):
    """Get a GitHub repository's contributors."""
    return github_repository_request(f"repos/{owner}/{repo}/contributors", params={"per_page": 14},)

def get_repository_languages(owner, repo):
    """Get a GitHub repository's programming languages."""
    return github_repository_request(f"repos/{owner}/{repo}/languages")

def get_repository_count(owner, repo, resource):
    """Get the total number of commits, branches or tags via the Link header ."""
    try:
        response = github_repository_response(f"repos/{owner}/{repo}/{resource}", params={"per_page": 1})
    
    except requests.HTTPError as e:
        if e.response.status_code == 409:  # Repository is empty
            return 0
        return None
    except requests.RequestException: # Request failures and other exceptions
        return None
    
    last = response.links.get("last")
    if last:
        return int(last["url"].split("page=")[-1])
    
    return len(response.json())

def get_repository_commits(owner, repo):
    return get_repository_count(owner, repo, "commits")

def get_repository_branches(owner, repo):
    return get_repository_count(owner, repo, "branches")

def get_repository_tags(owner, repo):
    return get_repository_count(owner, repo, "tags")

def get_repository_latest_commit(owner, repo, path=None):
    """Get the latest commit for a repository or specific path."""
    try:
        params = {"per_page": 1}
        
        if path:
            params["path"] = path
        
        commits = github_repository_request(
            f"repos/{owner}/{repo}/commits", params=params
        )
    except requests.HTTPError as e:
        if e.response.status_code == 409:  # Repository is empty
            return None
        raise

    return commits[0] if commits else None

def get_repository_contents(owner, repo):
    """Get the contents of a GitHub repository."""
    return github_repository_request(f"repos/{owner}/{repo}/contents")

def get_repository_readme(owner, repo, path=None):
    """Get a GitHub repository's README, or None if it has none."""
    if path:
        endpoint = f"repos/{owner}/{repo}/contents/{path}"
    else:
        endpoint = f"repos/{owner}/{repo}/readme"

    try:
        data = github_repository_request(endpoint)
    except requests.HTTPError as e:
        if e.response.status_code == 404:
            return None
        raise
    
    # Decode the base64-encoded content of the README file
    content = base64.b64decode(data["content"]).decode("utf-8")

    return {
        "name": data["name"],
        "html_url": data["html_url"],
        "content": content,
        "download_url": data["download_url"],
    }

# ====================================================
#  Profile Functions
# ====================================================

def get_github_profile(username):
    """Get the contents of a GitHub profile."""
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

def get_github_social_accounts(username):
    """Get the social accounts linked to a GitHub profile."""

    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}/social_accounts",
        headers=headers,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

def get_github_profile_repositories(username):
    """Get the public repositories owned by a GitHub user or organisation."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    params = {
        "type": "owner",
        "sort": "updated",
        "direction": "desc",
        "per_page": 100,
    }

    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}/repos",
        headers=headers,
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

def get_github_profile_connections(username, relationship, page):
    """Get one page of the users who follow, or are followed by, a GitHub profile."""
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {settings.GITHUB_API_TOKEN}",
    }

    params = {
        "per_page": 20,
        "page": page,
    }

    response = requests.get(
        f"{GITHUB_API_URL}/users/{username}/{relationship}",
        headers=headers,
        params=params,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

# ====================================================
# Trending Repositories Function
# ====================================================

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