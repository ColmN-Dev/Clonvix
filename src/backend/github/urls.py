from django.urls import path

from . import views

urlpatterns = [
    path("search/", views.search_view, name="search-view"),
    path("users/<str:username>/", views.user_profile_view, name="user-profile-view"),
]