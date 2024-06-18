# user/auth_tools.py
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import AuthenticationFailed

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
        return token.key
