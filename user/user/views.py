import requests
from django.http import JsonResponse
from django.conf import settings
from user.utils import getUserbyPlatform
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



# def register(request):
#     serializer = RegisterSerializer(data=request.data)
#     serializer.is_valid(raise_exception=True)
#     serializer.save()
#     return Response(data={'message': 'User created successfully!'}, status=201)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    if request.method == 'POST':
        serializer = RegisterSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            print("serializer valid")
            user = serializer.save()
            print("save'den sonra")
            return Response({"success": "User registered successfully"}, status=201)
        return Response(serializer.errors, status=400)

@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    if request.method == 'POST':
        username = request.data.get('username')
        password = request.data.get('password')
        
        try:
            user = Authenticator.authenticate(username=username, password=password)
        except AuthenticationFailed as e:
            return Response({"detail": str(e)}, status=401)
        token = TokenGenerator.generate_token(user)
        print(token)
        
        return Response({"token": token}, status=200)    

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

    response_data = TokenGenerator.generate_tokens(user)
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
		print("request!!!", request)		
		code = request.data.get('access_token') if request.method == 'POST' else request.GET.get('code')
		if not code:
			raise APIException("Code not provided")
		return connect_api_google(code)
	except Exception as e:
		print(e)
		return Response({"error": "Internal Server Error"}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def direct_42_login_page(request):
    oauth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.UID_42}&redirect_uri={settings.REDIRECT_URI_42}&response_type=code"

    return Response({"oauth_url": oauth_url}, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def direct_google_login_page(request):

	oauth_url = f"https://accounts.google.com/o/oauth2/auth?client_id={settings.UID_GOOGLE}&redirect_uri={settings.REDIRECT_URI_GOOGLE}&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email"

	return Response({"oauth_url": oauth_url}, status=200)




@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def game(request):
    if request.method == 'GET':
        auth_header = request.headers.get('Authorization')
        print("!!!!!!!!!!!!!!!!!11Auth header: ")
        if auth_header is not None:
            try:
                token_key = auth_header.split(' ')[1]
                print("Gelen token: ", token_key)
                token = Token.objects.get(key=token_key)
                print("Geçerli mi: ", token)
                if token_key == token.key:
                    return Response({"message": "Game started successfully!"}, status=status.HTTP_200_OK)
                else:
                    return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
            except Token.DoesNotExist:
                return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"error": "Token is missing"}, status=status.HTTP_401_UNAUTHORIZED)

    elif request.method == 'POST':
        return Response({"message": "Game action processed"}, status=status.HTTP_200_OK)
