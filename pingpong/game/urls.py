from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('get_rooms', views.get_rooms),
    path('create_room', views.create_room),
]