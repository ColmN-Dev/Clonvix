from django.db import models

class RepositorySnapshot(models.Model):
    github_id = models.BigIntegerField()
    star_count = models.PositiveIntegerField()
    snapshot_date = models.DateField()
    
class Meta:
        constraints = [
            models.UniqueConstraint(fields=['github_id', 'snapshot_date'], name='unique_repository_daily_snapshot')
        ]
