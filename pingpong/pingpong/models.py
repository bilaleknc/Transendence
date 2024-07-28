from django.db import models
import uuid
    
class Rooms(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	room_name = models.CharField(max_length=255)
	players = models.IntegerField(default=0)
	player1 = models.CharField(max_length=255, null=True, blank=True)
	player2 = models.CharField(max_length=255, null=True, blank=True)
	class Meta:
		db_table = "rooms"
	