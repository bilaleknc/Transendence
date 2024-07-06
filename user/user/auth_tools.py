# user/auth_tools.py
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from datetime import timedelta
from django.db import models
from user.models import Profile

class Authenticator:
    @staticmethod
    def authenticate(username, password):
        user = authenticate(username=username, password=password)
        if user is None:
            raise AuthenticationFailed('Invalid credentials')
        return user

class TokenGenerator:
    @staticmethod
    def generate_token(user):
        token, created = Token.objects.get_or_create(user=user)
        print(created)
        
        user.profile.last_login = timezone.now()
        user.save()
        return token.key
