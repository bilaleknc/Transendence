from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from rest_framework.permissions import *
from rest_framework.decorators import api_view, permission_classes
from pingpong.models import Rooms
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from .models import Rooms
from .consumers import GameConsumer
import json

# Create your views here.
def index(request):
    #hello world return yap
    return HttpResponse("Hello, world. You're at the polls index.")

@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def get_rooms(request):
	if request.method == "GET":
		rooms = Rooms.objects.all()
		room_list = []
		for room in rooms:
			room_list.append(room.room_name)
		return JsonResponse({"rooms": room_list})
	return JsonResponse({"status": "error", "message": "Invalid request"})


@api_view(['POST'])
@permission_classes([AllowAny])
def create_room(request):
    if request.method == "POST":
        room_name = request.data.get("room_name")
        if not room_name.isalnum():
            return JsonResponse({"status": "error", "message": "Room name must be alphanumeric"})
        if room_name:
            if Rooms.objects.filter(room_name=room_name).exists():
                return JsonResponse({"status": "success", "message": "Room name already exists"})
            # save room name to database
            Rooms.objects.create(room_name=room_name).save()
            return JsonResponse({"status": "success", "room_name": room_name})
        return JsonResponse({"status": "error", "message": "Room name is required"})
    return JsonResponse({"status": "error", "message": "Invalid request"})

  
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def join_room(request):
    # alfanumaric olmayan karakterlerin kontrolü yapılmalı ve sql injection önlenmeli
    print("saddsdsadsa")
    data = json.loads(request.body.decode('utf-8'))
    if data.get('room').isalnum() == False:
        return JsonResponse({'status': 'error', 'message': 'Room name must be alphanumeric'})
    if data.get('username') == '':
        return JsonResponse({'status': 'error', 'message': 'Username is required'})
    if request.method == 'POST':
        room_name = data.get('room')
        username = data.get('username')
        
        room = Rooms.objects.filter(room_name=room_name).first()
        if room:
            if username in [room.player1, room.player2]:
                print(f"username already exits {username}")
                return JsonResponse({'error': 'username already exits'})
            elif room.players < 2:
                if room.players == 0:
                      room.player1 = username
                else:
                      room.player2 = username
                room.players += 1
                room.save()
                if room.players == 2:
                    return JsonResponse({'status': 'success', 'message': 'start'})
                else:
                    return JsonResponse({'status': 'success', 'message': 'waiting'})
            else:
                return JsonResponse({'status': 'error', 'message': 'Room is full'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Room does not exist'})
        
@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def leave_room(request, room_name, username):
	try:
		if request.method == 'GET':
			room = Rooms.objects.get(room_name=room_name)
			if room and room.players > 0:
				room.players -= 1
				if room.player1 == username:
					room.player1 = None
				elif room.player2 == username:
					room.player2 = None
				room.save()
				print("Odadan biri ayrıldı")
				return JsonResponse({'status': 'success'})
			else:
				return JsonResponse({'status': 'error', 'message': 'Room is empty'})
	except Exception as e:
		print(e)
		return JsonResponse({'status': 'error', 'message': 'An error occured'})

@csrf_exempt
def check_room_status(request, room_name, username):
    if request.method == 'GET':
        room = get_object_or_404(Rooms, room_name=room_name)
        if (room.players != 2) and (room.player1 and room.player2) and (room.player1 == username or room.player2 == username):
              room.players += 1
        if room.players == 2:
            return JsonResponse({
                'status': 'success',
                'message': 'start',
                'player1': room.player1,
                'player2': room.player2
            })
        else:
            return JsonResponse({'status': 'success', 'message': 'waiting'})