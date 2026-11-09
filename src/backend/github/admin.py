from django.contrib import admin
from .models import RepositorySnapshot


@admin.register(RepositorySnapshot)
class RepositorySnapshotAdmin(admin.ModelAdmin):
    list_display = ("github_id", "star_count", "snapshot_date")
    list_filter = ("snapshot_date",)
    search_fields = ("github_id",)
    ordering = ("-snapshot_date",)