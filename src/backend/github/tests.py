from unittest.mock import patch
from django.core.cache import cache
from django.test import TestCase, override_settings, RequestFactory
from django.db import IntegrityError, transaction
from datetime import date
from .models import RepositorySnapshot
from .github_client import search_repositories, get_repository, get_repository_releases, get_github_profile, get_trending_repositories
import json


class RepositorySnapshotTests(TestCase):

    def test_create_repository_snapshot(self):
        snapshot = RepositorySnapshot.objects.create(
            github_id=123456,
            star_count=1500,
            snapshot_date=date(2026, 11, 23),
            full_name="example/repository",
            description="Example repository",
            html_url="https://github.com/example/repository",
            forks_count=100,
            language="Python"
        )

        self.assertEqual(snapshot.github_id, 123456)
        self.assertEqual(snapshot.star_count, 1500)
        self.assertEqual(snapshot.snapshot_date, date(2026, 11, 23))
        self.assertEqual(snapshot.description, "Example repository")
        self.assertEqual(snapshot.full_name, "example/repository")

    def test_prevent_duplicate_daily_snapshots(self):
        RepositorySnapshot.objects.create(
            github_id=123456,
            star_count=1500,
            snapshot_date=date(2026, 11, 23)
        )

        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                RepositorySnapshot.objects.create(
                    github_id=123456,
                    star_count=1600,
                    snapshot_date=date(2026, 11, 23)
                )

    def test_allow_snapshots_on_different_dates(self):
        RepositorySnapshot.objects.create(
            github_id=123456,
            star_count=1500,
            snapshot_date=date(2026, 11, 23)
        )

        snapshot = RepositorySnapshot.objects.create(
            github_id=123456,
            star_count=1600,
            snapshot_date=date(2026, 11, 24)
        )

        self.assertEqual(RepositorySnapshot.objects.count(), 2)

    def test_optional_fields_can_be_empty(self):
        snapshot = RepositorySnapshot.objects.create(
            github_id=123456,
            star_count=1500,
            snapshot_date=date(2026, 11, 23)
        )

        self.assertIsNone(snapshot.description)
        self.assertIsNone(snapshot.full_name)
        self.assertIsNone(snapshot.html_url)
        self.assertIsNone(snapshot.language)
        
@override_settings(GITHUB_API_TOKEN="test-token")
class GitHubClientTests(TestCase):

    @patch("github.github_client.requests.get")
    def test_search_repositories(self, mock_get):
        expected_data = {"items": [{"full_name": "django/django"}]}
        mock_get.return_value.json.return_value = expected_data

        result = search_repositories(
            "django",
            page=2,
            per_page=5,
            language="Python",
            sort="stars",
            order="desc",
        )

        self.assertEqual(result, expected_data)
        mock_get.assert_called_once()

        args, kwargs = mock_get.call_args
        self.assertEqual(
            args[0],
            "https://api.github.com/search/repositories"
        )
        self.assertEqual(
            kwargs["params"],
            {
                "q": "django language:Python",
                "page": 2,
                "per_page": 5,
                "sort": "stars",
                "order": "desc",
            },
        )

    @patch("github.github_client.requests.get")
    def test_get_repository(self, mock_get):
        expected_data = {
            "full_name": "django/django",
            "stargazers_count": 80000,
        }
        mock_get.return_value.json.return_value = expected_data

        result = get_repository("django", "django")

        self.assertEqual(result, expected_data)
        mock_get.assert_called_once()

    @patch("github.github_client.requests.get")
    def test_get_repository_releases_returns_none_when_not_found(self, mock_get):
        import requests

        mock_response = mock_get.return_value
        mock_response.raise_for_status.side_effect = requests.HTTPError(
            response=type("Response", (), {"status_code": 404})()
        )

        result = get_repository_releases("django", "django")

        self.assertIsNone(result)

    @patch("github.github_client.requests.get")
    def test_get_github_profile(self, mock_get):
        expected_data = {
            "login": "octocat",
            "name": "The Octocat",
            "public_repos": 8,
        }
        mock_get.return_value.json.return_value = expected_data

        result = get_github_profile("octocat")

        self.assertEqual(result, expected_data)
        mock_get.assert_called_once()

@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
)
class CachingTests(TestCase):

    def setUp(self):
        cache.clear()

    @patch("github.services.search_repositories")
    def test_repository_search_uses_cache(self, mock_search):
        from .services import cached_repository_search

        expected_data = {"items": [{"full_name": "django/django"}]}
        mock_search.return_value = expected_data

        first_result = cached_repository_search("django")
        second_result = cached_repository_search("django")

        self.assertEqual(first_result, expected_data)
        self.assertEqual(second_result, expected_data)
        mock_search.assert_called_once()

    @patch("github.services.get_repository")
    def test_repository_detail_uses_cache(self, mock_get):
        from .services import cached_repository_detail

        expected_data = {"full_name": "django/django"}
        mock_get.return_value = expected_data

        first_result = cached_repository_detail("django", "django")
        second_result = cached_repository_detail("django", "django")

        self.assertEqual(first_result, expected_data)
        self.assertEqual(second_result, expected_data)
        mock_get.assert_called_once()

    @patch("github.services.get_github_social_accounts")
    @patch("github.services.get_github_profile")
    def test_github_profile_uses_cache(self, mock_profile, mock_social):
        from .services import cached_github_profile

        mock_profile.return_value = {"login": "octocat"}
        mock_social.return_value = []

        first_result = cached_github_profile("octocat")
        second_result = cached_github_profile("octocat")

        self.assertEqual(first_result, second_result)
        mock_profile.assert_called_once_with("octocat")
        mock_social.assert_called_once_with("octocat")

    @patch("github.services.get_trending_repositories")
    def test_trending_repositories_uses_cache(self, mock_trending):
        from .services import cached_trending_repositories

        expected_data = [{"full_name": "django/django"}]
        mock_trending.return_value = expected_data

        first_result = cached_trending_repositories(date_range="daily")
        second_result = cached_trending_repositories(date_range="daily")

        self.assertEqual(first_result, expected_data)
        self.assertEqual(second_result, expected_data)
        mock_trending.assert_called_once_with(date_range="daily")

class GitHubViewTests(TestCase):

    def setUp(self):
        self.factory = RequestFactory()

    def test_search_view_returns_400_without_query(self):
        from .views import search_view

        request = self.factory.get("/api/github/search/")

        response = search_view(request)

        self.assertEqual(response.status_code, 400)

    @patch("github.views.cached_repository_search")
    def test_search_view_returns_repository_results(self, mock_search):
        from .views import search_view

        expected_data = {"items": [{"full_name": "django/django"}]}
        mock_search.return_value = expected_data

        request = self.factory.get(
            "/api/github/search/",
            {"q": "django", "type": "repositories"},
        )

        response = search_view(request)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected_data)
        mock_search.assert_called_once()

    @patch("github.views.cached_repository_detail")
    def test_repository_detail_view_returns_data(self, mock_detail):
        from .views import repository_detail_view

        expected_data = {"full_name": "django/django"}
        mock_detail.return_value = expected_data

        request = self.factory.get("/api/github/django/django/")

        response = repository_detail_view(request, "django", "django")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(json.loads(response.content), expected_data)
        mock_detail.assert_called_once_with("django", "django")

    def test_trending_view_returns_400_for_invalid_range(self):
        from .views import trending_repositories_view

        request = self.factory.get(
            "/api/github/trending/",
            {"range": "invalid"},
        )

        response = trending_repositories_view(request)

        self.assertEqual(response.status_code, 400)