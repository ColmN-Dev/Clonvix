from django.urls import path

from . import views

urlpatterns = [
    path("search/", views.search_view, name="search"),
    path("repository/<str:owner>/<str:repo>/", views.repository_detail_view, name="repository-detail"),
    path("repository/<str:owner>/<str:repo>/commits/", views.repository_commits_view, name="repository-commits"),
    path("repository/<str:owner>/<str:repo>/branches/", views.repository_branches_view, name="repository-branches"),
    path("repository/<str:owner>/<str:repo>/tags/", views.repository_tags_view, name="repository-tags"),
    path("repository/<str:owner>/<str:repo>/latest-commit/", views.repository_latest_commit_view, name="repository-latest-commit"),
    path("repository/<str:owner>/<str:repo>/contents/", views.repository_contents_view, name="repository-contents"),
    path("repository/<str:owner>/<str:repo>/readme/", views.repository_readme_view, name="repository-readme"),
    path("repository/<str:owner>/<str:repo>/releases/", views.repository_releases_view, name="repository-releases"),
    path("repository/<str:owner>/<str:repo>/deployments/", views.repository_deployments_view, name="repository-deployments"),
    path("repository/<str:owner>/<str:repo>/contributors/", views.repository_contributors_view, name="repository-contributors"),
    path("repository/<str:owner>/<str:repo>/languages/", views.repository_languages_view, name="repository-languages"),
    path("trending/", views.trending_repositories_view, name="trending-repositories"),
    path("users/<str:username>/", views.github_profile_view, name="github-profile"),
    path("users/<str:username>/readme/", views.github_profile_readme_view, name="github-profile-readme"),
    path("users/<str:username>/repos/", views.github_profile_repositories_view, name="github-profile-repos"),
    path("users/<str:username>/followers/", views.github_profile_connections_view, {"relationship": "followers"}, name="github-profile-followers"),
    path("users/<str:username>/following/", views.github_profile_connections_view, {"relationship": "following"}, name="github-profile-following"),
]