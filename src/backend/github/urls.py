from django.urls import path

from . import views

urlpatterns = [
    path("search/", views.search_view, name="search-view"),
    path("users/<str:username>/", views.user_profile_view, name="user-profile-view"),
    path("trending/", views.trending_repositories_view, name="trending-repositories-view"),
]