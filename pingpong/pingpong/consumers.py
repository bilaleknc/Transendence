from channels.generic.websocket import AsyncWebsocketConsumer
from .PingPong import PingPong
import json
import asyncio
import json
import time
from django.shortcuts import get_object_or_404
from channels.db import database_sync_to_async
class GameConsumer(AsyncWebsocketConsumer):
	game_instances = {}

	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f"game_{self.room_name}"
		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)
		await self.accept()
		self.pong = self.create_game_instance()
		asyncio.ensure_future(self.game_loop())
	
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
		await self.decrement_room_players()

	@database_sync_to_async
	def decrement_room_players(self):
		from pingpong.views import Rooms
  
		room = get_object_or_404(Rooms, room_name=self.room_name)
		if room.players > 0:
			room.players -= 1
			room.save()

	async def countdown(self, event=None):
		for i in range(5, 0, -1):
			await self.send_group_message('countdown', str(i))
			await asyncio.sleep(1)

	async def game_loop(self):
		connected_players = len(self.channel_layer.groups.get(self.room_group_name, set()))
		if connected_players < 2:
			await self.send_group_message('waiting_for_players')
		else:
			await self.countdown()
			await self.send_group_message('game_started','')
			while connected_players == 2:
				if self.pong.game_over == False and self.pong.ready == True:
					game_state = self.pong.get_game_state()
					# print("game_state", game_state)
					await self.send_group_message('game_status' , game_state)
					print("game_state", game_state)
					if self.pong.game_over:
						self.send_group_message('game_over', '')
				await asyncio.sleep(0.05)
    
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
		if message:
			if message['action'] == 'START':
				self.pong.start_with_initial_values(message)
			elif message['direction']:
				self.pong.update_paddle_position(message)

	def create_game_instance(self):
		if self.room_name not in self.game_instances:
			self.game_instances[self.room_name] = PingPong()
		return self.game_instances[self.room_name]


	async def game_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))
    


# class GameConsumer(AsyncWebsocketConsumer):
# 	game_instances = {}

# 	async def connect(self):
# 		self.room_name = self.scope['url_route']['kwargs']['room_name']
# 		self.room_group_name = f"game_{self.room_name}"
# 		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
# 		await self.accept()
# 		self.pong = self.create_game_instance()
# 		asyncio.ensure_future(self.game_loop())
  
# 	async def disconnect(self, close_code):
# 		from pingpong.views import Rooms
		
# 		await self.channel_layer.group_discard(self.room_group_name,self.channel_name)
# 		# roomdaki kişi sayısını azalt
# 		if self.room_name in self.game_instances:
# 			Rooms.objects.filter(room_name=self.room_name).delete()

# 	async def countdown(self):
# 		for i in range(5, 0, -1):
# 			await self.send_group_message('countdown', f'countdown_{i}')
# 			await asyncio.sleep(1)

# 	async def game_loop(self) -> None:
# 		"""Main game loop that sends game state to players."""
# 		while True:
# 			connected_players = len(self.channel_layer.groups.get(self.room_group_name, set()))
# 			if connected_players < 2:
# 				await self.send_group_message('game_status', 'waiting_for_players')
# 			else:
# 				print("Game started")
# 				await self.countdown()
# 				await self.send_group_message('game_status', 'game_started')
# 				while connected_players == 2:
# 					if not self.pong.game_over:
# 						game_state = self.pong.get_game_state()
# 						await self.send_group_message('game_status', game_state)
# 						if self.pong.game_over:
# 							await self.send_group_message('game_status', 'game_over')
# 					await asyncio.sleep(0.05)
# 			await asyncio.sleep(1)
    
# 	async def receive(self, text_data: str) -> None:
# 		"""Receive and process messages from players."""
# 		data = json.loads(text_data)
# 		message = data.get('message')
# 		print("!!!!!!!!!!!!", message)
# 		if message:
# 			action = message['action']
# 			direction = message['direction']
# 			if action == 'START':
# 				self.pong.start_with_initial_values(message)
# 			elif direction:
# 				self.pong.update_paddle_position(message)

# 	def create_game_instance(self) -> PingPong:
# 		if self.room_name not in self.game_instances:
# 			self.game_instances[self.room_name] = PingPong()
# 		return self.game_instances[self.room_name]

# 	async def game_message(self, event: dict) -> None:
# 		"""Send a game message to the WebSocket."""
# 		message = event['message']
# 		await self.send(text_data=json.dumps(message))
    

  
