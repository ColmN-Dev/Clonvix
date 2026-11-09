from django.db import models

class RepositorySnapshot(models.Model):
    github_id = models.BigIntegerField()
    star_count = models.PositiveIntegerField()
    snapshot_date = models.DateField()
    full_name = models.CharField(max_length=255, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    html_url = models.URLField(null=True, blank=True)
    forks_count = models.PositiveIntegerField(default=0)
    language = models.CharField(max_length=100, null=True, blank=True)
    
    class Meta:
            constraints = [
                models.UniqueConstraint(fields=['github_id', 'snapshot_date'], name='unique_repository_daily_snapshot')
            ]
