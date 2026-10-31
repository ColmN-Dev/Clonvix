import requests
from django.http import JsonResponse

from .services import cached_repository_search, cached_topic_search


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
    
    # Validate sorting parameters
    allowed_sorts = {
        "stars": ["asc", "desc"],
        "forks": ["asc", "desc"],
        "updated": ["desc"],
    }
    
    sort = request.GET.get("sort") or None
    order = request.GET.get("order") or None

    if sort not in allowed_sorts or order not in allowed_sorts[sort]:
        sort = None
        order = None

    try:
        data = cached_repository_search(query, page=page, language=language, sort=sort, order=order)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."}, status=502
        )

    return JsonResponse(data)
