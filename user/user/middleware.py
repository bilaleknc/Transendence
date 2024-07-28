from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User
import json

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # İlk olarak, request.body'yi okuyup bir değişkene kaydedin
        body_unicode = request.body.decode('utf-8')
        body_data = json.loads(body_unicode) if body_unicode else {}

        # request body'yi okuyup json verisine çevirdikten sonra kullanın
        if body_data and 'username' in body_data:
            print(body_data)
            try:
                user = User.objects.get(username=body_data['username'])
                user.profile.last_activity = timezone.now()
                user.save()
            except User.DoesNotExist:
                pass
        
        # İsteği işleyin ve cevabı alın
        response = self.get_response(request)
        
        print("!!!!asdasdsds!!!")
        
        return response
