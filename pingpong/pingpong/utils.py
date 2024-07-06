import base64
import json
import requests

def move_player(paddle, direction):
	if direction == 'UP':
		paddle.position_y += 1
	elif direction == 'DOWN':
		paddle.position_y -= 1
	elif direction == 'AUP':
		paddle.position_x -= 1
	elif direction == 'ADOWN':
		paddle.position_x += 1
	paddle.save()
 
def update_score(player):
    player.score += 1
    player.save()


def extract_username_from_access_token(token):
	try:
		response = requests.get(f'https://45.157.16.17/getUser?token={token}')
		if response.status_code == 200:
			return response.json()['user']                                                                         
	except Exception as e:
		print(e)
