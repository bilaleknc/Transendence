import requests
from django.http import JsonResponse
from django.conf import settings
import threading
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from user.serializers import RegisterSerializer, ChangePasswordSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import *
from user.auth_tools import Authenticator, TokenGenerator
from user.utils import *
from user.third_party_api import connect_api_42, connect_api_google
from rest_framework.exceptions import APIException
import json
from user.models import Profile


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    token_key = request.data.get('token', None)
    print(token_key)
    if not token_key:
        return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = Token.objects.get(key=token_key)
        return Response({"message": "Token is valid", "user": token.user.username}, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({"error": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([AllowAny])
def notActive(request):
    if request.method == 'POST':
        print("Ben buraya girdim notActive !!!!!!!!!!")
        print(request.data["username"])
        user = User.objects.get(username=request.data["username"])
        verificationCode = VerificationCode.objects.get(user=user.profile)
        if user.is_active == False:
            user.delete()
            verificationCode.delete()
        return Response({"success": "User delete"}, status=204)

@api_view(['POST'])
@permission_classes([AllowAny])
def otp(request):
    if request.method == 'POST':
        user = User.objects.get(username=request.GET.get('username'))
        code = request.GET.get('number')
        verificationCode = VerificationCode.objects.get(user=user.profile)
        print(verificationCode.code)
        print(code)
        if int(verificationCode.code) == int(code):
            token = TokenGenerator.generate_token(user)
            user.is_active = True
            user.save()
            return Response({"success": "User registered successfully", "token": token,}, status=200)
        else:
            return Response({"wrong": "Please check your mailbox for incoming mail"}, status=401)
    return Response({"success": "User registered successfully"}, status=204)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    if request.method == 'POST':
        # eğerki request.data'nin içindeki email ile birsi varsa ama o kişi aktif değilse o kişiyi sil
        if User.objects.filter(email=request.data['email']).exists():
            user = User.objects.get(email=request.data['email'])
            if user.is_active == False:
                user.delete()

        serializer = RegisterSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            print("serializer valid")
            user = serializer.save()
            generate_email(user)
            print("save'den sonra")
            return Response({"success": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        print(username, password)
        try:
            user = Authenticator.authenticate(username=username, password=password)
        except AuthenticationFailed as e:
            return Response({"detail": str(e)}, status=401)
        print("authenticator'den sonra")
        twoFactor(user)
        print("twoFactor'den sonra")
        return Response({"success": "logging on..."}, status=200)    
    return Response({"error": "Method not allowed"}, status=405)

@api_view(['POST'])
@permission_classes([AllowAny])
def send_verification_email(request):
    username = request.data['username']
    password = request.data['password']
    user = User.objects.get(username=username)
    if user is None or not user.check_password(password):
        raise AuthenticationFailed("Wrong Password or Username!")
    thread = threading.Thread(target=send_email, args=[user])
    thread.start()
    return Response(data={'message': 'Email sent successfully!'}, status=200)


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email_and_login(request):
    verification_code = request.data.get('verification_code')

    if not verification_code:
        return Response(data={'message': 'Verification code are required!'}, status=400)

    user, error_response = Authenticator.authenticate_user(verification_code)
    if error_response:
        return error_response
    twoFactor(user)
    return Response(data=response_data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    serializer = ChangePasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    password = request.data['old_password']
    new_password = request.data['new_password']
    new_password2 = request.data['new_password2']

    user = User.objects.get(username=request.user)
    if not user.check_password(raw_password=password):
        return Response({'error': 'password not match'}, status=400)
    elif new_password != new_password2:
        return Response({"new_password": "Password fields didn't match."}, status=400)
    else:
        user.set_password(new_password)
        user.save()
        return Response({'success': 'password changed successfully'}, status=200)


@api_view(['GET'])
@permission_classes([AllowAny])
def direct_42_login_page(request):
    oauth_url = 'https://api.intra.42.fr/oauth/authorize?client_id=' + settings.UID_42 + '&redirect_uri=' + settings.REDIRECT_URI_42 + '&response_type=code'
    return Response({"url": oauth_url}, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def direct_google_login_page(request):
    oauth_url = 'https://accounts.google.com/o/oauth2/auth?client_id=' + settings.UID_GOOGLE + '&redirect_uri=' + settings.REDIRECT_URI_GOOGLE + '&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile'
    return Response({"url": oauth_url}, status=200)


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def login_with_42(request):
    try:
        code = request.data.get('code') if request.method == 'POST' else request.GET.get('code')
        if not code:
            raise APIException("Code not provided")
        return connect_api_42(code)
    except Exception as e:
        print(e)
        return Response({"error": "Internal Server Error"}, status=500)
    except:
        return Response({"error": "An error occurred"}, status=500)


@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def login_with_google(request):
    try:
        code = request.data.get('code') if request.method == 'POST' else request.GET.get('code')
        if not code:
            raise APIException("Code not provided")
        return connect_api_google(code)
    except Exception as e:
        return Response({"error": "Internal Server Error"}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user
    allUsers = User.objects.all()
    
    profile = Profile.objects.get(user=user)
    
    data = {
        "image": profile.profile_picture,
        "fullname": user.first_name + " " + user.last_name,
        "username": user.username,
        "email": user.email,
        "registered": user.date_joined,
        "matchHistory": profile.match_history,
        "instagram": profile.instagram,
        "linkedin": profile.linkedin,
        "allUsers": [user.username for user in allUsers]
    }
    return Response(data, status=200)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile = Profile.objects.get(user=user)
    data = request.data
    if 'fullname' in data:
        profile.nickname = data['fullname']
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'password' in data:
        user.set_password(data['password'])
    if 'instagram' in data:
        profile.instagram = data['instagram']
    if 'linkedin' in data:
        profile.linkedin = data['linkedin']
    user.save()
    profile.save()
    return Response({"success": "Profile updated successfully"}, status=200)

@api_view(['GET'])
@permission_classes([AllowAny])
def member(request):
    username = request.GET.get('username')
    print(username)
    user = User.objects.get(username=username)
    profile = Profile.objects.get(user=user)
    data = {
        "image": profile.profile_picture,
        "fullname": user.first_name + " " + user.last_name,
        "username": user.username,
        "email": user.email,
        "registered": user.date_joined,
        "matchHistory": profile.match_history,
        "instagram": profile.instagram,
        "linkedin": profile.linkedin,
    }
    return Response(data, status=200)
