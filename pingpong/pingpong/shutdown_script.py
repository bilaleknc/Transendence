import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pinpong.settings')
django.setup()

from pinpong.models import Rooms  # Adjust the import path according to your project structure

def delete_rooms():
    Rooms.objects.all().delete()
    print("All rooms have been deleted.")

if __name__ == "__main__":
    delete_rooms()