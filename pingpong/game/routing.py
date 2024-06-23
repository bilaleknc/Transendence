from django.urls import path
from . import consumers

websocket_urlpatterns = [
	    path('wss/socket-server/<str:room_name>/', consumers.GameConsumer.as_asgi()),
] 