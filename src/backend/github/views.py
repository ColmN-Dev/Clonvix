import requests
from django.http import JsonResponse

from .services import cached_repository_search, cached_user_search, cached_topic_search, cached_user_profile


# View to handle search requests
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
