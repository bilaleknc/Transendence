from channels.generic.websocket import AsyncWebsocketConsumer
from .PingPong import PingPong
import json
import asyncio
import json
import time

class GameConsumer(AsyncWebsocketConsumer):
	game_instances = {}

	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f"game_{self.room_name}"
		await self.channel_layer.group_add(self.room_group_name, self.channel_name)
		await self.accept()
		self.pong = self.create_game_instance()
		asyncio.ensure_future(self.game_loop())
  
	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(self.room_group_name,self.channel_name)
		if self.room_name in self.game_instances:
			del self.game_instances[self.room_name]

	async def countdown(self):
		for i in range(5, 0, -1):
			await self.send_group_message('game_status', f'countdown_{i}')
			await asyncio.sleep(1)

	async def game_loop(self) -> None:
		"""Main game loop that sends game state to players."""
		while True:
			connected_players = len(self.channel_layer.groups.get(self.room_group_name, set()))
			if connected_players < 2:
				await self.send_group_message('game_status', 'waiting_for_players')
			else:
				await self.countdown()
				await self.send_group_message('game_status', 'game_started')
				while connected_players == 2:
					if not self.pong.game_over and self.pong.ready:
						game_state = self.pong.get_game_state()
						await self.send_group_message('game_status', game_state)
						if self.pong.game_over:
							await self.send_group_message('game_status', 'game_over')
					await asyncio.sleep(0.05)
			await asyncio.sleep(1)
    
	async def receive(self, text_data: str) -> None:
		"""Receive and process messages from players."""
		data = json.loads(text_data)
		message = data.get('message')
		print("!!!!!!!!!!!!", message)
		if message:
			action = message['action']
			direction = message['direction']
			if action == 'START':
				self.pong.start_with_initial_values(message)
			elif direction:
				self.pong.update_paddle_position(message)

	def create_game_instance(self) -> PingPong:
		if self.room_name not in self.game_instances:
			self.game_instances[self.room_name] = PingPong()
		return self.game_instances[self.room_name]

	async def game_message(self, event: dict) -> None:
		"""Send a game message to the WebSocket."""
		message = event['message']
		await self.send(text_data=json.dumps(message))
    
	async def send_group_message(self, event: str, message: str) -> None:
		"""Send a message to the group."""
		await self.channel_layer.group_send(
         self.room_group_name,
         {
			'type': 'game_message',
			'game_state': event,
			'message': message
		}
	)
  
