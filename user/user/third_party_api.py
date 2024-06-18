import os
import random
from django.conf import settings
import requests
from django.contrib.auth.models import User
from rest_framework.response import Response
from user.serializers import RegisterWith42Serializer, UserSerializer
from user.utils import send_email
from user.auth_tools import Authenticator, TokenGenerator
from rest_framework import status

def connect_api_42(code):
    print("1!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    response = requests.post(f"https://api.intra.42.fr/oauth/token", data={
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': settings.UID_42,
        'client_secret': settings.SECRET_42,
        'redirect_uri': settings.REDIRECT_URI_42,
    })
    if response.status_code == 200:
        data_42 = requests.get(
            f"https://api.intra.42.fr/v2/me",
            headers={'Authorization': f'Bearer {response.json()["access_token"]}'}
        )
        print(data_42.json()["login"])
        return login_with_42(data_42.json()["login"], data_42.json()["email"], data_42.json()["image"]["link"])
    else:
        return Response({"error": "Access denied"}, status=400)


def login_with_42(username, email, image):
    user = User.objects.filter(email=email).first()
    print(user)
    token = TokenGenerator.generate_token(user)
    if not user:
        user = User.objects.create_user(username=username, email=email)
        user.save()
    return Response({"token": token}, status=status.HTTP_200_OK)

def connect_api_google(code):
    response = requests.post(f"https://oauth2.googleapis.com/token", data={
        'grant_type': 'authorization_code',
        'code': code,
        'client_id': settings.UID_GOOGLE,
        'client_secret': settings.SECRET_GOOGLE,
        'redirect_uri': settings.REDIRECT_URI_GOOGLE,
    })

    if response.status_code == 200:
        data_google = requests.get(
            f"https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token={response.json()['access_token']}"
        )
        print(data_google.json())
        return login_with_google(data_google.json()["email"], data_google.json()["name"], data_google.json()["picture"])
    else:
        return Response({"error": "Access denied"}, status=400)


def login_with_google(email, username, image):
    user = User.objects.filter(email=email).first()
    token = TokenGenerator.generate_token(user)
    if not user:
        user = User.objects.create_user(username=username, email=email)
        user.save()
    return Response({"token": token}, status=status.HTTP_200_OK)
