from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from github.models import RepositorySnapshot

class Command(BaseCommand):
    help = "Removes old repository snapshots from the database."

    def handle(self, *args, **options):
        
        # Calculate the cutoff date for snapshots to be deleted (older than 30 days)
        cutoff = timezone.localdate() - timedelta(days=30)

        # Delete snapshots older than the cutoff date
        deleted, _ = RepositorySnapshot.objects.filter(snapshot_date__lt=cutoff).delete()

        # Success message indicating how many snapshots were deleted in the terminal
        self.stdout.write(self.style.SUCCESS(f"Successfully deleted {deleted} repository snapshots older than {cutoff}."))