import os
import random
from django.conf import settings
import requests
from django.contrib.auth.models import User
from rest_framework.response import Response
from user.serializers import RegisterWith42Serializer, UserSerializer
from user.utils import send_email



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
        return login_with_42(data_42.json()["login"], data_42.json()["email"], data_42.json()["image"]["link"])
    else:
        return Response({"error": "Access denied"}, status=400)


def login_with_42(username, email, image):
    if not User.objects.filter(email=email).exists():
        if User.objects.filter(username=username).exists():
            username = username + "_" + str(random.randint(1000, 9999))
        serializer = RegisterWith42Serializer(data={"username": username, "email": email})
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        serializer.save()
    user = User.objects.get(email=email)
    if user.profile.profile_picture == 'profile-pictures/default.jpeg':
        user.profile.save_image_from_url(image)
    user.profile.save()
    if user:
        send_email(user)
        return Response(data={'user': UserSerializer(user).data}, status=200)
    else:
        return Response(data={'error': 'User not found'}, status=404)
