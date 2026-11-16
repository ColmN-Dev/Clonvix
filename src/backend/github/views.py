import requests
from django.http import JsonResponse

from .services import cached_repository_branches, cached_repository_commits, cached_repository_readme, cached_repository_tags, cached_repository_latest_commit, cached_repository_contents
from .services import cached_repository_detail, cached_repository_releases, cached_repository_languages, cached_repository_contributors, cached_repository_deployments
from .services import  cached_repository_search, cached_user_search, cached_topic_search, cached_user_profile, cached_trending_repositories


# ====================================================
# Search Views
# ====================================================

def search_view(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return JsonResponse({"error": "Missing search query."}, status=400)

    # Ensure valid pagination parameters
    try:
        page = int(request.GET.get("page", 1))
        if page < 1:
            page = 1
    except ValueError:
        page = 1
        
    search_type = request.GET.get("type", "repositories")
    
    # Validate sort and order parameters for repository and user dropdowns
    repo_sort = {
        "stars": ["asc", "desc"],
        "forks": ["asc", "desc"],
        "updated": ["desc"],
    }
    
    user_sort = {
        "followers": ["asc", "desc"],
        "joined": ["asc", "desc"],
        "repositories": ["asc", "desc"],
    }
    
    sort = request.GET.get("sort") or None
    order = request.GET.get("order") or None

    # Validate sort and order parameters based on search type
    if search_type == "repositories":
        if sort not in repo_sort or order not in repo_sort[sort]:
            sort = None
            order = None
    elif search_type == "users":
        if sort not in user_sort or order not in user_sort[sort]:
            sort = None
            order = None

    if search_type == "users":
        try:
            data = cached_user_search(query, page=page, sort=sort, order=order)
        except requests.RequestException:
            return JsonResponse(
                {"error": "Could not reach GitHub. Try again shortly."}, status=502
            )
            
        return JsonResponse(data)
    
    if search_type == "topics":
        try:
            data = cached_topic_search(query, page=page)
        except requests.RequestException:
            return JsonResponse(
                {"error": "Could not reach GitHub. Try again shortly."}, status=502
            )
            
        return JsonResponse(data)
    
    if search_type != "repositories":
        return JsonResponse({"error": "Invalid search type."}, status=400)
    
    language = request.GET.get("lang") or None

    try:
        data = cached_repository_search(query, page=page, language=language, sort=sort, order=order)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."}, status=502
        )

    return JsonResponse(data)

# ====================================================
# Repository Detail Views
# ====================================================

def repository_detail_view(request, owner, repo):
    """View to handle requests for a repository's details."""
    
    if not owner or not repo:
        return JsonResponse({"error": "Missing owner or repository name."}, status=400)
    
    try:
        data = cached_repository_detail(owner, repo)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."}, status=502
        )

    return JsonResponse(data)

def repository_releases_view(request, owner, repo):
    """View to handle requests for a repository's releases."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )

    try:
        data = cached_repository_releases(owner, repo)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."},
            status=502
        )

    return JsonResponse(data, safe=False)

def repository_deployments_view(request, owner, repo):
    """View to handle requests for a repository's latest deployment."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )

    try:
        data = cached_repository_deployments(owner, repo)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."},
            status=502
        )

    return JsonResponse(data, safe=False)

def repository_contributors_view(request, owner, repo):
    """View to handle requests for a repository's contributors."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )

    try:
        data = cached_repository_contributors(owner, repo)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."},
            status=502
        )

    return JsonResponse(data, safe=False)

def repository_languages_view(request, owner, repo):
    """View to handle requests for a repository's programming languages."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )

    try:
        data = cached_repository_languages(owner, repo)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."},
            status=502
        )

    return JsonResponse(data, safe=False)

def repository_commits_view(request, owner, repo):
    """View to handle requests for a repository's total number of commits."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )
    
    data = cached_repository_commits(owner, repo)

    return JsonResponse({"total_commits": data})

def repository_branches_view(request, owner, repo):
    """View to handle requests for a repository's total number of branches."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )
    
    data = cached_repository_branches(owner, repo)

    return JsonResponse({"total_branches": data})

def repository_tags_view(request, owner, repo):
    """View to handle requests for a repository's total number of tags."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )
    
    data = cached_repository_tags(owner, repo)

    return JsonResponse({"total_tags": data})

def repository_latest_commit_view(request, owner, repo):
    """View to handle latest commits for a repository or specific path."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )
        
    path = request.GET.get("path")
    
    data = cached_repository_latest_commit(owner, repo, path=path)

    return JsonResponse(data, safe=False)

def repository_contents_view(request, owner, repo):
    """View to handle requests for a repository's contents."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )
    
    data = cached_repository_contents(owner, repo)

    return JsonResponse(data, safe=False)

def repository_readme_view(request, owner, repo):
    """View to handle requests for a repository's README."""

    if not owner or not repo:
        return JsonResponse(
            {"error": "Missing owner or repository name."},
            status=400
        )
    
    data = cached_repository_readme(owner, repo)

    if data is None:
        return JsonResponse({"error": "README not found."}, status=404)

    return JsonResponse(data)

# ====================================================
# User Profile Views
# ====================================================

def user_profile_view(request, username):
    """View to handle requests for a user's profile."""
    
    if not username:
        return JsonResponse({"error": "Missing username."}, status=400)
    
    try:
        data = cached_user_profile(username)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."}, status=502
        )

    return JsonResponse(data)

# ====================================================
## Trending Repositories View
# ====================================================

def trending_repositories_view(request):
    """View to handle requests for trending repositories."""
    
    date_range = request.GET.get("range", "daily")
    
    if not date_range:
        date_range = "daily"

    try:
        data = cached_trending_repositories(date_range=date_range)
    except ValueError:
        return JsonResponse(
            {"error": "Invalid date range."}, status=400
        )

    return JsonResponse(data, safe=False)