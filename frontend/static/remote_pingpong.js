import { Game } from './game.js';
import { Draw } from './draw.js';
import { Screen } from './screen.js';

export default class RemoteGame {
	constructor(ws, roomName, playerNumber) {
		ws.receive = this.receive.bind(this);
		this.ws = ws;
		this.roomName = roomName;
		this.playerNumber = playerNumber;
		this.playerUserName = localStorage.getItem("username");
		this.screen = new Screen();

		this.pdlIceptionHeight = this.screen.getHghtOfPdlIncLoc();
		this.ball = new Draw(this.screen.width / 2, this.screen.height / 2, 20, 0, this.screen.ctx);
		this.lpaddle = new Draw(10, this.pdlIceptionHeight, 20, this.screen.paddleHeight(), this.screen.ctx);
		this.rpaddle = new Draw(this.screen.width - 30, this.pdlIceptionHeight, 20, this.screen.paddleHeight(), this.screen.ctx);

		this.player1 = null;
		this.player2 = null;

		this.flag = 0;

		this.directions = {
			"w": false,
			"s": false,
			"up": false,
			"down": false,
		};
		this.keyUpHandler = this.keyUp.bind(this);
		this.keyDownHandler = this.keyDown.bind(this);

		this.time_id = null;
		this.keyDownInterval = null;

		this.gameAnimation = true;
	}

	movePaddle(directions) {
		const time = new Date().getTime();

		const message = {
			type: 'MOVE_PADDLE',
			direction: directions,
			"time": time,
			player: localStorage.getItem("username")
		};
		this.ws.sendMessage(message);
	}

	keyUp(e) {
		if (this.ws.isOpen == false) return;
		// if (e.key == "Escape") this.reset();
		if (this.player1 == localStorage.getItem('username')) {
			if (e.key == "w" || e.key == "W") this.directions['w'] = false;
			if (e.key == "s" || e.key == "S") this.directions['s'] = false;
		} else {
			if (e.key == "ArrowUp") this.directions['up'] = false;
			if (e.key == "ArrowDown") this.directions['down'] = false;
		}
		clearInterval(this.keyDownInterval);
		this.keyDownInterval = null;
		this.movePaddle(this.directions);
	}

	keyDown(e) {
		if (this.ws.isOpen == false) return;
		if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
			e.preventDefault();
		}
		if (this.player1 == localStorage.getItem('username')) {
			if (e.key == "w" || e.key == "W") this.directions['w'] = true;
			if (e.key == "s" || e.key == "S") this.directions['s'] = true;
		} else {
			if (e.key == "ArrowUp") this.directions['up'] = true;
			if (e.key == "ArrowDown") this.directions['down'] = true;
		}
		// if (e.key == "Escape") this.reset();
		if (!this.keyDownInterval) {
			this.keyDownInterval = setInterval(() => {
				this.movePaddle(this.directions);
			}, 50); // 50 milisaniye aralıklarla hareketi güncelle
		}
	
	}

	receive() {
		if (this.ws.message?.action == 'game_over')
			clearInterval(this.timeRecive);
		if (this.ws.message?.action == 'countdown'){
			this.screen.clear();
			this.screen.putText("Welcome to Pingpong Game", this.screen.width / 2, this.screen.height / 2 - 100);
			this.screen.putText("Game Begin", this.screen.width / 2, this.screen.height / 2 - 50);
			this.screen.putText(this.ws.message.data, this.screen.width / 2, this.screen.height / 2);
		}
		if (this.ws.message?.action == 'game_started') {
			document.addEventListener('keydown', this.keyDownHandler);
			document.addEventListener('keyup', this.keyUpHandler);
			this.loop();
		}
		if (this.ws.message?.action == 'game_update') {
			this.lpaddle.y = this.ws.message.data['paddle_Ry'];
			this.rpaddle.y = this.ws.message.data['paddle_Ly'];
			this.ball.x = this.ws.message.data['ball_x'];
			this.ball.y = this.ws.message.data['ball_y'];
			this.score = this.ws.message.data['score'];
		}
		if (this.ws.message?.action == 'game_end') {
			document.removeEventListener('keydown', this.keyDownHandler);
			document.removeEventListener('keyup', this.keyUpHandler);
			this.gameAnimation = false
			this.ws.socket?.close();
			this.ws.socket = null;
		}
	}

	async loop() {
		this.screen.clear();
		if (this.score)
			this.screen.putScore(this.score.player1, this.score.player2, this.player1, this.player2);
		if (this.gameAnimation == false) {
			this.score = this.ws.message.data['score'];
			let player = this.score.player1 > this.score.player2 ? this.player1 : this.player2;
			let message = player == localStorage.getItem('username') ? `Congratulations ${localStorage.getItem('username')} :D` : `One more try, ${localStorage.getItem('username')} :/`
			this.screen.putText("Bye Bye", this.screen.width / 2, this.screen.height / 2 - 100);
			this.screen.putText(`Game End`, this.screen.width / 2, this.screen.height / 2 - 50);
			this.screen.putText(message, this.screen.width / 2, this.screen.height / 2);
			if (this.player1 == this.playerUserName && this.flag == 0){
				this.flag += 1;
				this.saveGameResult(new Date().getTime(), this.player1, this.player2, `${this.score.player1}-${this.score.player2}`, player);
			}
			setTimeout(() => {
        		window.route({ target: { href: '/' } });
			}, 4000);
			return;
		}
		this.lpaddle.drawRect();
		this.rpaddle.drawRect();
		this.ball.drawArc();
		requestAnimationFrame(this.loop.bind(this));
	}

	startMessage() {
		this.ws.sendMessage({
			type: 'START',
			playerNumber: this.playerNumber,
			player_name: localStorage.getItem("username"),
			paddle_l: this.lpaddle.getAllData(),
			paddle_r: this.rpaddle.getAllData(),
			ball: this.ball.getAllData(),
			screen: {
				_width: this.screen.width,
				_height: this.screen.height,
				_ratio: 6
			},
			"player1": {
				username: this.player1,
			},
			"player2": {
				username: this.player2,
			},
		});
	}

	async waitOtherPlayer() {
		try {
			const response = await fetch(`https://45.157.16.17:8081/check_room_status/${this.roomName}/${localStorage.getItem('username')}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			const data = await response.json();
			if (data['message'] === 'waiting') {
				// 1 saniye sonra tekrar kontrol et
				this.screen.clear();
				this.screen.putText("Welcome to Pingpong Game", this.screen.width / 2, this.screen.height / 2);
				this.screen.putText("Waiting Other Player...", this.screen.width / 2, this.screen.height / 2 + 50);
				this.time_id = setTimeout(() => this.waitOtherPlayer(this.roomName, this.playerNumber), 1000);
			} else if (data['message'] === 'start'){
				clearTimeout(this.time_id)
				this.player1 = data["player1"];
				this.player2 = data["player2"];
				this.ws.begin();
				this.startMessage();
			}
		} catch (error) {
			return;
			if (this.time_id == null)
				this.time_id = setTimeout(() => this.waitOtherPlayer(this.roomName, this.playerNumber), 1000);
		}
	}

	saveGameResult(date, player1, player2, score, winner) {
		if (player1 != this.playerUserName)
			return
		const data = {
			date: date,
			player1: player1,
			player2: player2,
			score: score,
			winner: winner
		};
	
		fetch('https://45.157.16.17:8080/add_match_history', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',

			},
			body: JSON.stringify(data),
		})
		.then(response => response.json())
		.then(data => {
			console.log('Success:', data);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
	}
}

// const roomName = "room1";
// const remoteGame = new RemoteGame(roomName);

// export default remoteGame;
