import math

import base64
import json
import requests
from datetime import datetime, timedelta
from random import randrange
import time



class Player:
	def __init__(self, playerNumber, username):
		self.playerNumber = playerNumber
		self.username = username

	def __str__(self):
		return f"Player number: {self.playerNumber}, User: {self.username}"
  
  
class PingPong:
	def __init__(self) -> None:
		self.player1 = None
		self.player2 = None
		self.paddle_l = None
		self.paddle_r = None
		self.ball = None
		self.screen = None
		self.playerName = None
		self.updateTime = time.time()

		self.player1Score = 0
		self.player2Score = 0
		self.maxScore = 5

		self.finish = False

		self.speedBall = 2.5
		self.speedPlayer = 40

		directions = self.randomDirection()
		self.dir_x = directions["dir_x"]
		self.dir_y = directions["dir_y"]
	
	def start(self, message):
		self.ball = message['ball']
		self.paddle_r = message['paddle_r']
		self.paddle_l = message['paddle_l']
		self.screen = message['screen']
		self.player1 = message["player1"]
		self.player2 = message["player2"]

	def move_paddle(self, message) -> None:
		if message['w'] == True:
			self.paddle_l['_y'] = max(0, self.paddle_l["_y"] - self.speedPlayer)
		if message['s'] == True:
			self.paddle_l['_y'] = min(self.screen['_height'] - self.paddleHeight(), self.paddle_l["_y"] + self.speedPlayer)
		if message['up'] == True:
			self.paddle_r['_y'] = max(0, self.paddle_r["_y"] - self.speedPlayer)
		if message['down'] == True:
			self.paddle_r['_y'] = min(self.screen['_height'] - self.paddleHeight(), self.paddle_r["_y"] + self.speedPlayer)
		

	def paddleHeight(self):
		if self.screen["_ratio"] == 0:
			return 0
		return self.screen["_height"] / self.screen["_ratio"]

	def getHghtOfPdlIncLoc(self):
		return (self._height / 2) - (self.paddleHeight() / 2)
	
	def fill_map(self, paddle, left):
		array = [-45, -30, -15, 0, 0, 15, 30, 45] if left else [-135, -150, -165, 180, 180, 165, 150, 135]
		divided = []
		paddle_div = (self.paddleHeight() + self.ball["_radius"]) / 8
		y = paddle["_y"]
		for _ in range(8):
			divided.append(math.floor(y))
			y += paddle_div
		res = {}
		for i, key, j in zip(range(8), range(-3, 5), range(8)):
			res[key] = {'degree': array[i], 'area': divided[j]}
		return res

	def calculate_collision(self, paddle, left):
		parser_map = self.fill_map(paddle, left)
		moment = 2.75
		element = None
		for el in parser_map.items():
			if self.ball["_y"] <= el[1]['area']:
				element = el
				break
			element = el
		degree = element[1]['degree'] + element[1]['area'] - self.ball["_y"]
		radian = degree * (math.pi / 180)
		self.dir_x = math.cos(radian) * moment
		self.dir_y = math.sin(radian) * moment

	def check_paddle_collision(self, paddle, left: bool) -> bool:
		"""Check if the ball collides with a paddle."""
		ball_x, ball_y = self.ball["_x"], self.ball["_y"]
		paddle_x, paddle_y = paddle["_x"], paddle["_y"]

		within_x_range = (left and ball_x - paddle["_radius"] <= paddle_x + self.ball["_radius"] + 30 or \
      			not left and paddle_x - self.ball["_radius"] <= ball_x <= paddle_x + paddle["_radius"] + 30)
		within_y_range = (paddle_y - self.ball["_radius"] <= ball_y <= paddle_y + self.paddleHeight() + self.ball["_radius"])
		return within_x_range and within_y_range

	def move_the_ball(self) -> None:
		"""Move the ball and check for collisions."""
		if self.ball["_y"] - self.ball["_radius"] <= 0: # top wall collision
			self.dir_y = abs(self.dir_y)
		elif self.ball["_y"] + self.ball["_radius"] >= self.screen["_height"]:
			self.dir_y = -abs(self.dir_y)
   
		if self.ball["_x"] + self.ball["_radius"] < 0:
			self.reset()
			self.player2Score += 1
		elif self.ball["_x"] - self.ball["_radius"] > self.screen["_width"]:
			self.reset()
			self.player1Score += 1
		elif self.check_paddle_collision(self.paddle_l, 1):
			self.calculate_collision(self.paddle_l, 1)
		elif self.check_paddle_collision(self.paddle_r, 0):
			self.calculate_collision(self.paddle_r, 0)

	def game_state(self) -> dict:
		if (self.player1Score == self.maxScore or self.player2Score == self.maxScore):
			self.finish = True
		self.move_the_ball()
		self.ball['_x'] +=  self.dir_x * self.speedBall
		self.ball['_y'] +=  self.dir_y * self.speedBall
		return {
			"ball_x": self.ball['_x'],
			"ball_y": self.ball['_y'],
			"paddle_Ry": self.paddle_l['_y'],
			"paddle_Ly": self.paddle_r['_y'],
			"score": {
				"player1": self.player1Score,
				"player2": self.player2Score,
			}
		}
	
	def reset(self):
		self.ball["_x"] = self.screen["_width"] / 2
		self.ball["_y"] = self.screen["_height"] / 2
		self.paddle_l["_y"] = self.paddle_l["Ry"]
		self.paddle_r["_y"] = self.paddle_r["Ry"]
		self.game_over = False
		directions = self.randomDirection()
		self.dir_x = directions["dir_x"]
		self.dir_y = directions["dir_y"]
	
	def randomDirection(self):
		i_random = randrange(4)
		result = None
		if i_random == 0:
			result = { "dir_x": 1.5, "dir_y": 1 }
		elif i_random == 1:
			result = { "dir_x": -1.5, "dir_y": 1 }
		elif i_random == 2:
			result = { "dir_x": -1.5, "dir_y": -1 }
		else:
			result = { "dir_x": 1.5, "dir_y": -1 }
		return result