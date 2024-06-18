import uuid
from django.db import models

class Stats2(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    total_games = models.IntegerField(default=1)
    total_wins = models.IntegerField(default=0)
    total_losses = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    new_field = models.IntegerField(default=0)  # Geçici olarak ekleyin
    
    class Meta:
        db_table = 'stats2'