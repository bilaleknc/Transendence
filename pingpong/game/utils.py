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