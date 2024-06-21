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
        return login_with_42(data_42.json()["login"], data_42.json()["email"], data_42.json()["first_name"], data_42.json()["last_name"], data_42.json()["image"]["link"])
    else:
        return Response({"error": "Access denied"}, status=400)


def login_with_42(username, email, first_name, last_name, image):
    user = User.objects.filter(email=email).first()
    if not user:
        user = User.objects.create_user(username=username, email=email)
        user.first_name = first_name
        user.last_name = last_name
        user.save()

        profile = Profile.objects.filter(user=user).first()
        if not profile:
            profile = Profile(user=user)
        profile.nickname = username
        profile.profile_picture = image
        profile.save()
    token = TokenGenerator.generate_token(user)
    print(token)
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
        # user        | {'id': '100206833384934867256', 'email': 'erenerdogan037@gmail.com', 'verified_email': True, 'name': 'Mustafa Eren Erdoğan', 'given_name': 'Mustafa Eren', 'family_name': 'Erdoğan', 'picture': 'https://lh3.googleusercontent.com/a/ACg8ocKKx0KFeVWboJlC4WQsBCi0W_i5RAA6dVSWFyjqznSC6o17QmHW6g=s96-c'}
        return login_with_google(data_google.json()["email"], data_google.json()["picture"], data_google.json()["given_name"], data_google.json()["family_name"])
    else:
        return Response({"error": "Access denied"}, status=400)


def login_with_google(email, image, name, surname):
    user = User.objects.filter(email=email).first()
    username = email.split("@")[0]
    if not user:
        user = User.objects.create_user(username=username, email=email)
        user.first_name = name
        user.last_name = surname
        user.save()
    profile = Profile.objects.filter(user=user).first()
    if not profile:
        profile = Profile(user=user)
    profile.profile_picture = image
    profile.save()
    token = TokenGenerator.generate_token(user)
    return Response({"token": token}, status=status.HTTP_200_OK)
