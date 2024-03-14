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

	async def countdown(self):
		for i in range(3, 0, -1):
			await self.channel_layer_group_send('countdown', str(i))
			await asyncio.sleep(1)

	async def game_loop(self):
		connected_players = len(self.channel_layer.groups.get(self.room_group_name, set()))
		if connected_players < 2:
			await self.channel_layer_group_send('waiting_for_players')
		else:
			await self.countdown()
			await self.channel_layer_group_send('game_status','game_started')
			while connected_players == 2:
				if self.pong.game_over == False and self.pong.ready == True:
					game_state = self.pong.get_game_state()
					await self.channel_layer_group_send('game_status' , game_state)
					if self.pong.game_over:
						self.channel_layer_group_send('game_status', 'game_over')
				await asyncio.sleep(0.05)

	async def receive(self, text_data):
		data = json.loads(text_data)
		message = data.get('message')
		if message:
			if message['action'] == 'START':
				self.pong.startWithInitialValues(message)
			elif message['direction']:
				self.pong.update_paddle_position(message)

	def create_game_instance(self):
		if self.room_name not in self.game_instances:
			self.game_instances[self.room_name] = PingPong()
		return self.game_instances[self.room_name]

	async def game_message(self, event):
		message = event['message']
		await self.send(text_data=json.dumps(message))
    
	async def channel_layer_group_send(self, state, message=None):
		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'game_message',
				'game_state': state,
				'message': message
			}
		)