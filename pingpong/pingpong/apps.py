from django.apps import AppConfig

class PingpongConfig(AppConfig):
    name = 'pingpong'

    def ready(self):
        # Place your startup code here
        from pingpong.models import Rooms
        Rooms.objects.all().delete()
        print("All rooms have been deleted.")
