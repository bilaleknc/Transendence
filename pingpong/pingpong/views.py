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
        # get room name from request
        print("!!!!!!", request.data)
        
        room_name = request.data.get("room_name")
        if room_name:
            if Rooms.objects.filter(room_name=room_name).exists():
                return JsonResponse({"status": "error", "message": "Room name already exists"})
            # save room name to database
            Rooms.objects.create(room_name=room_name).save()
            return JsonResponse({"status": "success", "room_name": room_name})
        return JsonResponse({"status": "error", "message": "Room name is required"})
    return JsonResponse({"status": "error", "message": "Invalid request"})

            
@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def join_room(request, room_name):
    if request.method == 'POST':
        room = get_object_or_404(Rooms, room_name=room_name)
        if room.players < 2:
            room.players += 1
            room.save()
            if room.players == 2:
                return JsonResponse({'status': 'start'})
            else:
                return JsonResponse({'status': 'waiting'})
        else:
            return JsonResponse({'status': 'error', 'message': 'Room is full'})
        
@api_view(['GET'])
@permission_classes([AllowAny])
@csrf_exempt
def leave_room(request, room_name):
	if request.method == 'GET':
		room = get_object_or_404(Rooms, room_name=room_name)
		if room.players > 0:
			room.players -= 1
			room.save()
			print("Odadan biri ayrıldı")
			return JsonResponse({'status': 'success'})
		else:
			return JsonResponse({'status': 'error', 'message': 'Room is empty'})

@csrf_exempt
def check_room_status(request, room_name):
    if request.method == 'GET':
        room = get_object_or_404(Rooms, room_name=room_name)
        if room.players == 2:
            return JsonResponse({'status': 'start'})
        else:
            return JsonResponse({'status': 'waiting'})