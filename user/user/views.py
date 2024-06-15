import requests
from django.http import JsonResponse
from django.conf import settings
from user.utils import getUser
import threading
from rest_framework.response import Response
from user.serializers import RegisterSerializer, ChangePasswordSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import *
from user.auth_tools import Authenticator, TokenGenerator
from user.utils import *
from user.api_42 import connect_api_42


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data, status=201)


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


@api_view(['POST'])
def direct_42_login_page(request):
    oauth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.UID_42}&redirect_uri={settings.REDIRECT_URI_42}&response_type=code"

    return Response({"oauth_url": oauth_url}, status=200)


@api_view(['POST'])
def login_with_42(request, code):
    return connect_api_42(code)


def login_via_42(request):
    print()
    code = request.GET.get('code', '')
    print(code)
    if code:
        try:
            data = {
				'grant_type': 'authorization_code',
				'client_id': settings.UID_42,
				'client_secret': settings.SECRET_42,
				'code': code,
				'redirect_uri': settings.REDIRECT_URI_42
			}
            response = requests.post('https://api.intra.42.fr/oauth/token', data=data)
            data = response.json()
            print(data)
            if data and data.get('access_token'):
                user = getUser(data.get('access_token'))
                print(user)
                return JsonResponse({
                    'accessToken': data.get('access_token'),
                    'refreshToken': data.get('refresh_token'), 
                })
            return JsonResponse({'error': 'No token found'}, status=400)
        except requests.exceptions.RequestException as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'error': 'No code provided'}, status=400)