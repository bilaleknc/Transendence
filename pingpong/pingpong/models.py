from django.db import models
import uuid
    
class Rooms(models.Model):
	id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
	room_name = models.CharField(max_length=100)
	players = models.IntegerField(default=0)
	player1 = models.CharField(max_length=100, default="")
	player2 = models.CharField(max_length=100, default="")
	class Meta:
		db_table = "rooms"
	