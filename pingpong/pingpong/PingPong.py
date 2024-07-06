import math

import base64
import json

class Game:
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.leftPaddle = 1.0
		self.rightPaddle = 1.0
		self.ball = 1.0
		self.screen = 1.0
		self.leftPlyrScore = 0
		self.rightPlyrScore = 0
		self.maxScore = 5
		self.dirX = 2.0
		self.dirY = 0.0
		self.speedBall = 4.0
		self.speedPlayer = 20.0
		self.beginPos = True
		self.animationFlag = False
		self.game_over = False

  
class Paddle:
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._x = 0.0
		self._y = 0.0
		self._radius = 0.0
		self.end = 0.0
		self.Rx = 0.0
		self.Ry = 0.0
		self.Rradius = 0.0
		self.Rend = 0.0

class Ball:
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._x = 0.0
		self._y = 0.0
		self._radius = 0.0
		self.Rx = 0.0
		self.Ry = 0.0

class Screen:
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self._width = 0.0
		self._height = 0.0
		self._ratio = 0.0
		
	def paddleHeight(self):
		if self._ratio == 0:
			return 0
		return self._height / self._ratio
	def getHghtOfPdlIncLoc(self):
		return (self._height / 2) - (self.paddleHeight() / 2)

class Player:
    def __init__(self, playerNumber):
        self.playerNumber = playerNumber
        self.username = None
  
  
class PingPong:
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

		self.paddle_r = Paddle()
		self.paddle_l = Paddle()
		self.screen = Screen()
		self.ball = Ball()
		self.game = Game()
		self.player1 = None
		self.player2 = None
  
		self.speedPlayer = 100
		self.ready = False
		self.game_over = False
  
		self.dir_x = 3
		self.dir_y = 1
  
		self.text = ""
		self.player1 = ""
		self.player2 =  ""
  

	def start_with_initial_values(self, message: dict) -> None:
		"""Initialize game objects with initial values from the message."""
		self._update_paddle_from_message(message)
		self._update_screen_from_message(message)
		self._update_ball_from_message(message)
		self.ready = True


	def update_paddle_position(self, message: dict ) -> None:
		"""Update the position of the paddles based on the input direction."""
		direction = message.get('direction')
		net_height = self.screen._height - self.screen.paddleHeight()
		if  self.game_over and direction == 'ENTER':
			self.reset()
			self.game.leftPlyrScore = 0
			self.game.rightPlyrScore = 0
			self.dir_x = 3
			self.dir_y = 1

		if direction in ['UP', 'DOWN']:
			self._move_paddle(self.paddle_l, direction, net_height)
		elif direction in ['AUP', 'ADOWN']:
			self._move_paddle(self.paddle_r, direction, net_height)

	def _move_paddle(self, paddle, direction: str, net_height: int) -> None:
		"""Move a paddle up or down within the screen boundaries."""
		if direction in ['UP', 'AUP']:
			new_y = max(0, paddle._y - self.speedPlayer)
		else:
			new_y = min(net_height, paddle._y + self.speedPlayer)
		paddle._y = new_y

	async def disconnect(self, close_code: int) -> None:		
		"""Notify players that the game is over."""
		self.notify_players('leave', 'Player has left the game')
 
	def fill_map(self, paddle, left: bool) -> dict:
		"""Fill a dictionary with the degree and area of the paddle."""
		angles = [-45, -30, -15, 0, 0, 15, 30, 45] if left else [-135, -150, -165, 180, 180, 165, 150, 135]
		paddle_div = (self.screen.paddleHeight() + self.ball._radius) / 8
		y_positions = [math.floor(paddle._y + i * paddle_div) for i in range(8)]

		return {i - 3: {'degree': angle, 'area': y} for i, (angle, y) in enumerate(zip(angles, y_positions))}


	def check_paddle_collision(self, paddle, left: bool) -> bool:
		"""Check if the ball collides with a paddle."""
		ball_x, ball_y = self.ball._x, self.ball._y
		paddle_x, paddle_y = paddle._x, paddle._y

		within_x_range = (left and ball_x - paddle._radius <= paddle_x + self.ball._radius + 30 or \
      			not left and paddle_x - self.ball._radius <= ball_x <= paddle_x + paddle._radius + 30)
		within_y_range = (paddle_y - self.ball._radius <= ball_y <= paddle_y + self.screen.paddleHeight() + self.ball._radius)
 
		return within_x_range and within_y_range


	def calculate_collision(self, paddle, left: bool) -> None:
		"""Calculate the direction of the ball after a collision with a paddle."""
		parser_map = self.fill_map(paddle, left)
		moment = 2.75
		
		for key, value in parser_map.items():
			if self.ball._y <= value['area']:
				element = value
				break
			element = value

		degree = element['degree'] + element['area'] - self.ball._y
		radian = degree * (math.pi / 180)

		self.dir_x = math.cos(radian) * moment
		self.dir_y = math.sin(radian) * moment

	def reset(self) -> None:
		"""Reset the game to its initial state."""
		self.ball._x = self.screen._width / 2
		self.ball._y = self.screen._height / 2
		self.paddle_l._y = self.paddle_l.Ry
		self.paddle_r._y = self.paddle_r.Ry
		self.game_over = False
		self.ready = True
		self.dir_x = 3
		self.dir_y = 1
  
	def move_the_ball(self) -> None:
		"""Move the ball and check for collisions."""
		if self.ball._y - self.ball._radius <= 0: # top wall collision
			self.dir_y = abs(self.dir_y)
		elif self.ball._y + self.ball._radius >= self.screen._height:
			self.dir_y = -abs(self.dir_y)
   
		if self.ball._x + self.ball._radius < 0:
			self.reset()
			self.game.rightPlyrScore += 1
		elif self.ball._x - self.ball._radius > self.screen._width:
			self.reset()
			self.game.leftPlyrScore += 1
		elif self.check_paddle_collision(self.paddle_l, 1):
			self.calculate_collision(self.paddle_l, 1)
		elif self.check_paddle_collision(self.paddle_r, 0):
			self.calculate_collision(self.paddle_r, 0)


	def get_game_state(self) -> dict:
		"""Return the current state of the game."""
		if self.game.leftPlyrScore >= self.game.maxScore:
			self.game_over = True
			self.text = "Player 1 wins"
		elif self.game.rightPlyrScore >= self.game.maxScore:
			self.game_over = True
			self.text = "Player 2 wins"
   
		self.move_the_ball()
		self.ball._x += self.game.speedBall * self.dir_x
		self.ball._y += self.game.speedBall * self.dir_y
		return {
			'type': 'update',
			'ball_x': self.ball._x,
			'ball_y': self.ball._y,
			'paddle_l': int(self.paddle_l._y),
			'paddle_r': int(self.paddle_r._y),
			'leftPlyrScore': self.game.leftPlyrScore,
			'rightPlyrScore': self.game.rightPlyrScore
		}

	def _update_screen_from_message(self, message: dict) -> None:
		"""Update screen values from the message."""
		self.screen._height = message['screen']['_height']
		self.screen._width = message['screen']['_width']
		self.screen._ratio = message['screen']['_ratio']

	def _update_ball_from_message(self, message: dict) -> None:
		"""Update ball values from the message."""
		self.ball._x = message['ball']['_x']
		self.ball._y = message['ball']['_y']
		self.ball._radius = message['ball']['_radius']
		self.ball.Rx = message['ball']['Rx']
		self.ball.Ry = message['ball']['Ry']
	
	def _update_paddle_from_message(self, message: dict) -> None:
		"""Update paddle values from the message."""
		paddles = ['paddle_l', 'paddle_r']
		for side in paddles:
			paddle = getattr(self, side)
			paddle._x = message[side]['_x']
			paddle._y = message[side]['_y']
			paddle._radius = message[side]['_radius']
			paddle.end = message[side]['end']
			paddle.Rx = message[side]['Rx']
			paddle.Ry = message[side]['Ry']
			paddle.Rradius = message[side]['Rradius']
			paddle.Rend = message[side]['Rend']
 
 
	def paddlefunc(self, message):
		self.paddle_l._x = message['paddle_l']['_x']
		self.paddle_l._y = message['paddle_l']['_y']
		self.paddle_l._radius = message['paddle_l']['_radius']
		self.paddle_l.end = message['paddle_l']['end']
		self.paddle_l.Rx = message['paddle_l']['Rx']
		self.paddle_l.Ry = message['paddle_l']['Ry']
		self.paddle_l.Rradius = message['paddle_l']['Rradius']
		self.paddle_l.Rend = message['paddle_l']['Rend']
		self.paddle_r._x = message['paddle_r']['_x']
		self.paddle_r._y = message['paddle_r']['_y']
		self.paddle_r._radius = message['paddle_r']['_radius']
		self.paddle_r.end = message['paddle_r']['end']
		self.paddle_r.Rx = message['paddle_r']['Rx']
		self.paddle_r.Ry = message['paddle_r']['Ry']
		self.paddle_r.Rradius = message['paddle_r']['Rradius']
		self.paddle_r.Rend = message['paddle_r']['Rend']
  
  


	def fill_map(self, paddle, left):
		array = [-45, -30, -15, 0, 0, 15, 30, 45] if left else [-135, -150, -165, 180, 180, 165, 150, 135]
		divided = []
		paddle_div = (self.screen.paddleHeight() + self.ball._radius) / 8
		y = paddle._y
		for _ in range(8):
			divided.append(math.floor(y))
			y += paddle_div
		res = {}
		for i, key, j in zip(range(8), range(-3, 5), range(8)):
			res[key] = {'degree': array[i], 'area': divided[j]}
		return res


	def check_paddle_collision(self, paddle, left):
		ball_x = self.ball._x
		ball_y = self.ball._y
		paddle_x = paddle._x
		paddle_y = paddle._y

		if left and ball_x <= paddle_x + paddle._radius + self.ball._radius + 30 and ball_x >= paddle_x - paddle._radius + self.ball._radius:
			pass;
		elif not left and ball_x + 30 >= paddle_x - self.ball._radius and ball_x <= paddle_x + paddle._radius + self.ball._radius:
			pass;
		else:
			return False
		if ball_y <= paddle_y + self.screen.paddleHeight() + self.ball._radius and ball_y >= paddle_y - self.ball._radius:
			return True
		return False

	def calculate_collision(self, paddle, left):
		parser_map = self.fill_map(paddle, left)
		moment = 2.75
		element = None
		for el in parser_map.items():
			if self.ball._y <= el[1]['area']:
				element = el
				break
			element = el
		degree = element[1]['degree'] + element[1]['area'] - self.ball._y
		radian = degree * (math.pi / 180)
		self.dir_x = math.cos(radian) * moment
		self.dir_y = math.sin(radian) * moment


	def reset(self):
		self.ball._x = self.screen._width / 2
		self.ball._y = self.screen._height / 2
		self.paddle_l._y = self.paddle_l.Ry
		self.paddle_r._y = self.paddle_r.Ry
		self.game_over = False
		self.dir_x = 3
		self.dir_y = 1



# class PingPong:
# 	def __init__(self, *args, **kwargs):
# 		super().__init__(*args, **kwargs)

# 		self.paddle_r = Paddle()
# 		self.paddle_l = Paddle()
# 		self.screen = Screen()
# 		self.ball = Ball()
# 		self.game = Game()
  
# 		self.speedPlayer = 100
# 		self.ready = False
# 		self.game_over = False
  
# 		self.dir_x = 3
# 		self.dir_y = 1
  
# 		self.text = ""
  
  
	# def startWithInitialValues(self, message):
	# 	self.paddlefunc(message)
	# 	self.screenfunc(message)
	# 	self.ballfunc(message)
	# 	self.ready = True


# 	def update_paddle_position(self, message):
# 		direction = message.get('direction')
# 		net_height = self.screen._height - self.screen.paddleHeight()
# 		if  self.game_over and direction == 'ENTER':
# 			self.reset()
# 			self.game.leftPlyrScore = 0
# 			self.game.rightPlyrScore = 0
# 			self.dir_x = 3
# 			self.dir_y = 1
# 		if direction == 'UP':
# 			if self.paddle_l._y - self.speedPlayer >= 0:
# 				self.paddle_l._y -= self.speedPlayer
# 			else:
# 				self.paddle_l._y = 0
# 		elif direction == 'DOWN':
# 			if self.paddle_l._y + self.speedPlayer <= net_height:
# 				self.paddle_l._y += self.speedPlayer
# 			else:
# 				self.paddle_l._y = net_height
# 		elif direction == 'AUP':
# 			if self.paddle_r._y - self.speedPlayer >= 0:
# 				self.paddle_r._y -= self.speedPlayer
# 			else:
# 				self.paddle_r._y = 0
# 		elif direction == 'ADOWN':
# 			if self.paddle_r._y + self.speedPlayer <= net_height:
# 				self.paddle_r._y += self.speedPlayer
# 			else:
# 				self.paddle_r._y = net_height


# 	async def disconnect(self, close_code):
# 		self.notify_players('leave', 'Player has left the game')
  
# 	def fill_map(self, paddle, left):
# 		array = [-45, -30, -15, 0, 0, 15, 30, 45] if left else [-135, -150, -165, 180, 180, 165, 150, 135]
# 		divided = []
# 		paddle_div = (self.screen.paddleHeight() + self.ball._radius) / 8
# 		y = paddle._y
# 		for _ in range(8):
# 			divided.append(math.floor(y))
# 			y += paddle_div
# 		res = {}
# 		for i, key, j in zip(range(8), range(-3, 5), range(8)):
# 			res[key] = {'degree': array[i], 'area': divided[j]}
# 		return res



# 	def check_paddle_collision(self, paddle, left):
# 		ball_x = self.ball._x
# 		ball_y = self.ball._y
# 		paddle_x = paddle._x
# 		paddle_y = paddle._y

# 		if left and ball_x <= paddle_x + paddle._radius + self.ball._radius + 30 and ball_x >= paddle_x - paddle._radius + self.ball._radius:
# 			pass;
# 		elif not left and ball_x + 30 >= paddle_x - self.ball._radius and ball_x <= paddle_x + paddle._radius + self.ball._radius:
# 			pass;
# 		else:
# 			return False
# 		if ball_y <= paddle_y + self.screen.paddleHeight() + self.ball._radius and ball_y >= paddle_y - self.ball._radius:
# 			return True
# 		return False



# 	def calculate_collision(self, paddle, left):
# 		parser_map = self.fill_map(paddle, left)
# 		moment = 2.75
# 		element = None
# 		for el in parser_map.items():
# 			if self.ball._y <= el[1]['area']:
# 				element = el
# 				break
# 			element = el
# 		degree = element[1]['degree'] + element[1]['area'] - self.ball._y
# 		radian = degree * (math.pi / 180)
# 		self.dir_x = math.cos(radian) * moment
# 		self.dir_y = math.sin(radian) * moment

# 	def reset(self):
# 		self.ball._x = self.screen._width / 2
# 		self.ball._y = self.screen._height / 2
# 		self.paddle_l._y = self.paddle_l.Ry
# 		self.paddle_r._y = self.paddle_r.Ry
# 		self.game_over = False
# 		self.dir_x = 3
# 		self.dir_y = 1

  
# 	def move_the_ball(self):
# 		if self.ball._y - self.ball._radius <= 0:
# 			self.dir_y = abs(self.dir_y)
# 		elif self.ball._y + self.ball._radius >= self.screen._height:
# 			self.dir_y = -abs(self.dir_y)
# 		if self.ball._x + self.ball._radius < 0:
# 			self.reset()
# 			self.game.rightPlyrScore += 1
# 		elif self.ball._x - self.ball._radius > self.screen._width:
# 			self.reset()
# 			self.game.leftPlyrScore += 1
# 		elif self.check_paddle_collision(self.paddle_l, 1):
# 			self.calculate_collision(self.paddle_l, 1)
# 		elif self.check_paddle_collision(self.paddle_r, 0):
# 			self.calculate_collision(self.paddle_r, 0)


# 	def get_game_state(self):
# 		if self.game.leftPlyrScore >= self.game.maxScore:
# 			self.game_over = True
# 			self.text = "Player 1 wins"
# 		elif self.game.rightPlyrScore >= self.game.maxScore:
# 			self.game_over = True
# 			self.text = "Player 2 wins"
# 		self.move_the_ball()
# 		self.ball._x += self.game.speedBall * self.dir_x
# 		self.ball._y += self.game.speedBall * self.dir_y
# 		game_state = {
# 			'type': 'update',
# 			'ball_x': self.ball._x,
# 			'ball_y': self.ball._y,
# 			'paddle_l': self.paddle_l._y,
# 			'paddle_r': self.paddle_r._y,
# 			'leftPlyrScore': self.game.leftPlyrScore,
# 			'rightPlyrScore': self.game.rightPlyrScore
# 		}
# 		return game_state

# 	def screenfunc(self, message):
# 		self.screen._height = message['screen']['_height']
# 		self.screen._width = message['screen']['_width']
# 		self.screen._ratio = message['screen']['_ratio']
	
# 	def ballfunc(self, message):
# 		self.ball._x = message['ball']['_x']
# 		self.ball._y = message['ball']['_y']
# 		self.ball._radius = message['ball']['_radius']
# 		self.ball.Rx = message['ball']['Rx']
# 		self.ball.Ry = message['ball']['Ry']

# 	def paddlefunc(self, message):
# 		self.paddle_l._x = message['paddle_l']['_x']
# 		self.paddle_l._y = message['paddle_l']['_y']
# 		self.paddle_l._radius = message['paddle_l']['_radius']
# 		self.paddle_l.end = message['paddle_l']['end']
# 		self.paddle_l.Rx = message['paddle_l']['Rx']
# 		self.paddle_l.Ry = message['paddle_l']['Ry']
# 		self.paddle_l.Rradius = message['paddle_l']['Rradius']
# 		self.paddle_l.Rend = message['paddle_l']['Rend']
# 		self.paddle_r._x = message['paddle_r']['_x']
# 		self.paddle_r._y = message['paddle_r']['_y']
# 		self.paddle_r._radius = message['paddle_r']['_radius']
# 		self.paddle_r.end = message['paddle_r']['end']
# 		self.paddle_r.Rx = message['paddle_r']['Rx']
# 		self.paddle_r.Ry = message['paddle_r']['Ry']
# 		self.paddle_r.Rradius = message['paddle_r']['Rradius']
# 		self.paddle_r.Rend = message['paddle_r']['Rend']
