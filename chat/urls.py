from django.urls import path 
from . import views 

urlpatterns = [
    path('', views.chat),
    path('<str:room_name>/', views.room),
]