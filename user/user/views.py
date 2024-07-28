import requests
from django.contrib.auth import authenticate
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
from user.models import Profile, Post
from django.utils import timezone
from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def api42(request):
    code = request.GET.get('code')
    return redirect(f"https://45.157.16.17:8082/api42?code={code}")

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_token(request):
    token_key = request.data.get('token', None)
    print(token_key)
    if not token_key:
        return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = Token.objects.get(key=token_key)
        print(timezone.now())
        print(token.user.profile.last_login)
        print(token.user.profile.last_login - timezone.now())
        if timezone.now() - token.user.profile.last_login > timedelta(hours=24):
            token.delete()
            return Response({"error": "Token expired"}, status=status.HTTP_400_BAD_REQUEST)
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
            refresh = RefreshToken.for_user(user)
            return Response({
				"success": "User registered successfully", 
				"token": token,
				"username": user.username,
				"refresh": str(refresh),
				"access": str(refresh.access_token),
			}, status=200)
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
        try:
            user = authenticate(username=username, password=password)
            print(user)
        except AuthenticationFailed as e:
            return Response({"detail": str(e)}, status=401)
        if user is None:
           return Response({"error": "Invalid creditional"}, status=401)
        print("authenticator'den sonra")
        twoFactor(user)
        print("twoFactor'den sonra")
        return Response({"success": "success", "ok": 1}, status=201)    

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

    profiles = Profile.objects.all()
    profile = Profile.objects.get(user=user)
    print("profile.profile_picture profile.profile_picture profile.profile_picture")
    print(profile.profile_picture)
    match_history = profile.match_history

    friends = []
    for friend in profile.friends.all():
        friend_is_active = False

        if timezone.now() - friend.last_activity > timedelta(minutes=1):
            friend_is_active = False
        else:
            friend_is_active = True

        friends.append({
            "username": friend.user.username,
            "fullname": friend.user.first_name + " " + friend.user.last_name,
            "image": friend.profile_picture,
            "active": friend_is_active
        })
    
    data = {
        "image": profile.profile_picture,
        "fullname": user.first_name + " " + user.last_name,
        "username": user.username,
        "email": user.email,
        "registered": user.date_joined,
        "matchHistory": profile.match_history,
        "instagram": profile.instagram,
        "linkedin": profile.linkedin,
        "friends": friends,
    }
    return Response(data, status=200)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    profile = Profile.objects.get(user=user)
    data = request.data
    if 'image' in data:
        profile.profile_picture = data['image']
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
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
@permission_classes([IsAuthenticated])
def member(request):
    user = request.user
    profile = Profile.objects.get(user=user)

    member_username = request.GET.get('username')
    member = User.objects.get(username=member_username)
    member_profile = Profile.objects.get(user=member)

    member_is_active = False

    if timezone.now() - member_profile.last_activity > timedelta(minutes=1):
        member_is_active = False
    else:
        member_is_active = True

    is_friend = False

    if member_profile in profile.friends.all():
        is_friend = True
    data = {
        "image": member_profile.profile_picture,
        "fullname": member.first_name + " " + member.last_name,
        "username": member.username,
        "email": member.email,
        "registered": member.date_joined,
        "matchHistory": member_profile.match_history,
        "instagram": member_profile.instagram,
        "linkedin": member_profile.linkedin,
        "active": member_is_active,
        "is_friend": is_friend
    }
    return Response(data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_friend(request):
    user = request.user
    friend_username = request.data.get('username')
    friend = User.objects.get(username=friend_username)
    profile = Profile.objects.get(user=user)
    friend_profile = Profile.objects.get(user=friend)
    profile.friends.add(friend_profile)
    return Response({"success": "Friend added successfully"}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def remove_friend(request):
    user = request.user
    friend_username = request.data.get('username')
    friend = User.objects.get(username=friend_username)
    profile = Profile.objects.get(user=user)
    friend_profile = Profile.objects.get(user=friend)
    profile.friends.remove(friend_profile)
    return Response({"success": "Friend removed successfully"}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getUser(request):
    users = User.objects.all()

    data = []
    for user in users:
        profile = Profile.objects.get(user=user)

        if timezone.now() - profile.last_activity > timedelta(minutes=1):
            is_active = False
        else:
            is_active = True
            
        data.append({
            "username": user.username,
            "fullname": user.first_name + " " + user.last_name,
            "email": user.email,
            "image": profile.profile_picture,
            "registered": user.date_joined,
            "is_active": is_active
        })
    data = sorted(data, key=lambda x: x['registered'], reverse=True)
    return Response(data, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getMatchHistory(request):
    profiles = Profile.objects.all()  
    data = []
    for profile in profiles:
        for match in profile.match_history:
            if match['winner'] == profile.user.username:
                data.append(match)
    data = sorted(data, key=lambda x: x['date'], reverse=True)
    return Response(data, status=200)

@api_view(['POST'])
@permission_classes([AllowAny])
def addMatchHistory(request):
    print(request.data)
    date = request.data.get('date')
    player1 = request.data.get('player1')
    player2 = request.data.get('player2')
    score = request.data.get('score')
    winner = request.data.get('winner')

    print ("ADD MATCH HISTORY")
    print(date, player1, player2, score, winner)
    
    if User.objects.filter(username=player1).exists():
        player1_user = User.objects.get(username=player1)
        player1_profile = Profile.objects.get(user=player1_user)
        player1_profile.match_history.append({
            "date": date,
            "player1": player1,
            "player2": player2,
            "score": score,
            "winner": winner
        })
        player1_profile.save()

    if User.objects.filter(username=player2).exists():
        player2_user = User.objects.get(username=player2)
        player2_profile = Profile.objects.get(user=player2_user)
        player2_profile.match_history.append({
            "date": date,
            "player1": player1,
            "player2": player2,
            "score": score,
            "winner": winner
        })
        player2_profile.save()
    return Response({"success": "Match history added successfully"}, status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_post(request):
    posts = Post.objects.all()
    posts = sorted(posts, key=lambda x: x.date, reverse=True)

    data = []
    for post in posts:
        data.append({
            "id": post.id,
            "username": post.username,
            "date": post.date,
            "message": post.message,
            "title": post.title,
            "location": post.location,
            "max_people": post.max_people,
            "applicants": post.applicants
        })
    return Response(data, status=200)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    try:
        user = request.user
        username = user.username
        date = request.data.get('date')
        message = request.data.get('message')
        title = request.data.get('title')
        location = request.data.get('location')
        max_people = request.data.get('max_people')

        # Hata ayıklama çıktıları
        print(f"Received data: {request.data}")
        print(f"User: {username}")
        print(f"Date: {date}, Message: {message}, Title: {title}, Location: {location}, Max People: {max_people}")

        post = Post(
            username=username,
            date=date,
            message=message,
            title=title,
            location=location,
            max_people=max_people
        )

        post.save()
        return Response({"success": "Post created successfully"}, status=200)
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_applicant(request):
    try:
        user = request.user
        post_id = request.data.get('post_id')
        post = Post.objects.get(id=post_id)
        applicant = user.username
        applicants = post.applicants
        if applicant in applicants:
            return Response({"error": "You have already applied for this post"}, status=400)
        applicants.append(applicant)
        post.applicants = applicants
        post.save()
        return Response({"success": "Applicant added successfully"}, status=200)
    except Exception as e:
        return Response({"error": str(e)}, status=400)