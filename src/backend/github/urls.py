from django.urls import path

from . import views

urlpatterns = [
    path("search/", views.search_view, name="search-view"),
    path("repository/<str:owner>/<str:repo>/", views.repository_detail_view, name="repository-detail-view"),
    path("repository/<str:owner>/<str:repo>/commits/", views.repository_commits_view, name="repository-commits-view"),
    path("repository/<str:owner>/<str:repo>/branches/", views.repository_branches_view, name="repository-branches-view"),
    path("repository/<str:owner>/<str:repo>/tags/", views.repository_tags_view, name="repository-tags-view"),
    path("repository/<str:owner>/<str:repo>/latest-commit/", views.repository_latest_commit_view, name="repository-latest-commit-view"),
    path("repository/<str:owner>/<str:repo>/contents/", views.repository_contents_view, name="repository-contents-view"),
    path("repository/<str:owner>/<str:repo>/readme/", views.repository_readme_view, name="repository-readme-view"),
    path("repository/<str:owner>/<str:repo>/releases/", views.repository_releases_view, name="repository-releases-view"),
    path("repository/<str:owner>/<str:repo>/deployments/", views.repository_deployments_view, name="repository-deployments-view"),
    path("repository/<str:owner>/<str:repo>/contributors/", views.repository_contributors_view, name="repository-contributors-view"),
    path("repository/<str:owner>/<str:repo>/languages/", views.repository_languages_view, name="repository-languages-view"),
    path("users/<str:username>/", views.user_profile_view, name="user-profile-view"),
    path("trending/", views.trending_repositories_view, name="trending-repositories-view"),
]