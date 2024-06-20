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
from user.models import Profile
import string


def connect_api_42(code):
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
        return login_with_42(data_42.json())
    else:
        return Response({"error": "Access denied"}, status=400)

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
        return login_with_google(data_google.json()["email"], data_google.json()["picture"])
    else:
        return Response({"error": "Access denied"}, status=400)

# {'id': 148038, 'email': 'biekinci@student.42istanbul.com.tr', 'login': 'biekinci', 'first_name': 'Bilal', 'last_name': 'Ekinci',
# 'usual_full_name': 'Bilal Ekinci', 'usual_first_name': None, 'url': 'https://api.intra.42.fr/v2/users/biekinci', 'phone': 'hidden',
# 'displayname': 'Bilal Ekinci', 'kind': 'student', 'image': {'link': 'https://cdn.intra.42.fr/users/8e3625d440ae6f8eaa32bbcd3855c57d/biekinci.jpg'
# , 'versions': {'large': 'https://cdn.intra.42.fr/users/33bf8e4c071e7076c057ac7f37451933/large_biekinci.jpg', 
# 'medium': 'https://cdn.intra.42.fr/users/2d35134cbf80b55f0eb867b7c30bb223/medium_biekinci.jpg', 


# login
# email
# usual_full_name
# 'image': {'link': 'https://cdn.intra.42.fr/users/8e3625d440ae6f8eaa32bbcd3855c57d/biekinci.jpg'}


def login_with_42(data: dict) -> Response:
	
    user = User.objects.filter(email=data["email"]).first()
    if not user:
        user = User.objects.create_user(username=data["login"], email=data["email"])
        user.first_name = data["first_name"]
        user.last_name = data["last_name"]
        user.save()
    nickname = data["login"]
    while Profile.objects.filter(nickname=data["login"]).exists():
        suffix = ''.join(random.choices(string.ascii_lowercase + string.digits, k=4))
        nickname = f"{data['username']}{suffix}"
    profile = Profile.objects.create(user=user, nickname=nickname)
    profile.profile_picture = data["image"]["link"]
    print(data["image"]["link"])
    profile.save()
    token = TokenGenerator.generate_token(user)
    return Response({"token": token}, status=status.HTTP_200_OK)

def login_with_google(email, image):
    user = User.objects.filter(email=email).first()
    if not user:
        user = User.objects.create_user(username=email, email=email)
        user.save()
    token = TokenGenerator.generate_token(user)
    return Response({"token": token}, status=status.HTTP_200_OK)
