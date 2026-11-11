from django.core.management.base import BaseCommand
from django.utils import timezone

from github.github_client import get_trending_repositories
from github.models import RepositorySnapshot


class Command(BaseCommand):
    help = "Fetches trending repositories from GitHub and saves their star counts as snapshots."

    def handle(self, *args, **kwargs):
        """Fetch trending repositories and save their star counts as snapshots."""

        # Get today's date for the repository snapshots.
        today = timezone.localdate()
        
        # Track the number of new snapshots created
        collected = 0

        # Loop through the first 5 pages of trending repositories
        for page in range(1, 6):  
            data = get_trending_repositories(page=page, per_page=100)

            # Extract the repository results from GitHub's response
            repositories = data.get("items", [])
            
            if not repositories:
                break

            # Process each repository returned by GitHub
            for repo in repositories:
                github_id = repo.get("id")
                star_count = repo.get("stargazers_count")

                # Update or create a snapshot for the repository
                _, created = RepositorySnapshot.objects.update_or_create(
                    github_id=github_id,
                    snapshot_date=today,
                    defaults={
                        "star_count": star_count,
                        "full_name": repo.get("full_name"),
                        "description": repo.get("description"),
                        "html_url": repo.get("html_url"),
                        "forks_count": repo.get("forks_count", 0),
                        "language": repo.get("language"),
                    }
                )

                # Only count snapshots that were newly created
                if created:
                    collected += 1

        # Display the collection results in the terminal
        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully collected {collected} repository snapshots for {today}."
            )
        )