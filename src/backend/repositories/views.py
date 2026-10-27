import requests
from django.http import JsonResponse

from .services import cached_repository_search


def search_repositories_view(request):
    query = request.GET.get("q", "").strip()
    if not query:
        return JsonResponse({"error": "Missing search query."}, status=400)

    try:
        page = int(request.GET.get("page", 1))
    except ValueError:
        page = 1

    try:
        data = cached_repository_search(query, page=page)
    except requests.RequestException:
        return JsonResponse(
            {"error": "Could not reach GitHub. Try again shortly."}, status=502
        )

    return JsonResponse(data)
