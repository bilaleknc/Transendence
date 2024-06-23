from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import *
from django.http import JsonResponse
from game.models import Rooms

# Create your views here.
def index(request):
    #hello world return yap
    return HttpResponse("Hello, world. You're at the polls index.")

@api_view(['GET'])
@permission_classes([AllowAny])
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
        room_name = request.POST.get("room_name")
        if room_name:
            if Rooms.objects.filter(room_name=room_name).exists():
                return JsonResponse({"status": "error", "message": "Room name already exists"})
            # save room name to database
            Rooms.objects.create(room_name=room_name).save()
            return JsonResponse({"status": "success", "room_name": room_name})
        return JsonResponse({"status": "error", "message": "Room name is required"})
    return JsonResponse({"status": "error", "message": "Invalid request"})