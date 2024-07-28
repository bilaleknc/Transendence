from channels.generic.websocket import AsyncWebsocketConsumer
from .PingPong import PingPong
import json
import asyncio
import time
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class GameConsumer(AsyncWebsocketConsumer):
    game_instances = {}
    player_count = 0

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"game_{self.room_name}"
        self.channel_layer = get_channel_layer()
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.get_connected_players()
        await self.accept()
        self.pong = self.create_game_instance()
        self.loopFlag = True
        asyncio.ensure_future(self.game_loop())
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        await self.decrement_room_players()
        if self.pong:
            await self.delete_room()

    @database_sync_to_async
    def decrement_room_players(self):
        from pingpong.views import Rooms
        room = get_object_or_404(Rooms, room_name=self.room_name)
        if room.players > 0:
            room.players -= 1
            room.save()
            self.player_count -= 1
            self.loopFlag = False
            if room.players == 0:
                self.delete_game_instance()

    @database_sync_to_async
    def delete_room(self):
        from pingpong.views import Rooms
        room = get_object_or_404(Rooms, room_name=self.room_name)
        room.delete()
        self.delete_game_instance()

    @database_sync_to_async
    def get_connected_players(self):
        from pingpong.views import Rooms
        room = get_object_or_404(Rooms, room_name=self.room_name)
        self.player_count = room.players

    @database_sync_to_async
    def getUsers(self):
        from pingpong.views import Rooms
        room = get_object_or_404(Rooms, room_name=self.room_name)
        return { "player1": room.player1, "player2": room.player2, "players": room.players }

    async def countdown(self, event=None):
        for i in range(3, 0, -1):
            await self.send_group_message('countdown', str(i))
            await asyncio.sleep(1)

    def create_game_instance(self):
        if self.room_name not in self.game_instances:
            self.game_instances[self.room_name] = PingPong()
        return self.game_instances[self.room_name]

    def delete_game_instance(self):
        if self.room_name in self.game_instances:
            del self.game_instances[self.room_name]
            self.pong = None

    async def game_loop(self):
        await self.countdown()
        await self.send_group_message('game_started', '')
        while self.loopFlag and not self.pong.finish:
            current_time = time.time()
            message = self.pong.game_state()
            await self.send_group_message('game_update', message)
            while time.time() - current_time < 1 / 60:
                await asyncio.sleep(0)
        if self.pong.finish or self.player_count == 0:
            await self.send_group_message('game_end', self.pong.game_state())
            await self.delete_room()

    async def send_group_message(self, event: str, message: str = None) -> None:
        """Send a message to the group."""
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'message': {
                    'action': event,
                    'data': message
                }
            }
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get('message')
        if message['type'] == 'MOVE_PADDLE':
            self.pong.move_paddle(message.get('direction'))
        if message['type'] == 'START':
            self.pong.start(message)

    async def game_message(self, event):
        message = event['message']
        try:
            await self.send(text_data=json.dumps(message))
        except Exception as e:
            print(e)
