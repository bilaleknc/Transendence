from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User

class UpdateLastActivityMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response


    def __call__(self, request):
        print("HELLO FROM MIDDLEWARE")
        if request.user:
            response = self.get_response(request)
            print(request.user)
            if request.user.username:
                profile = User.objects.get(username=request.user.username).profile
                profile.last_activity = timezone.now()
                print(profile.last_activity)
                profile.save()
                print('Profile last activity updated for user: ', request.user.username)
        return response

