import { Game } from './game.js';
import { Draw } from './draw.js';
import { Screen } from './screen.js';

class RemoteGame {
	constructor(roomName) {
		this.roomName = roomName;
		this.gameSocket = null;
		this.screen = null;
		this.lpaddle = null;
		this.rpaddle = null;
		this.ball = null;
		this.game = null;
		this.text = "Welcome";
		this.message = "";
	}

	start(roomName) {
		this.gameSocket = new WebSocket(`wss://127.0.0.1:8081/wss/socket-server/${roomName}/`);
		this.screen = new Screen();
		this.screen.start();

		this.pdlIceptionHeight = this.screen.getHghtOfPdlIncLoc();
		this.lpaddle = new Draw(10, this.pdlIceptionHeight, 20, this.screen.paddleHeight(), this.screen.ctx);
		this.rpaddle = new Draw(this.screen.width - 30, this.pdlIceptionHeight, 20, this.screen.paddleHeight(), this.screen.ctx);
		this.ball = new Draw(this.screen.width / 2, this.screen.height / 2, 20, 0, this.screen.ctx);

		this.game = new Game(this.lpaddle, this.rpaddle, this.ball, this.screen);
		this.game.beginPos = true;
		this.game.animationFlag = false;
		this.game.ready = false;
		this.game.maxScore = 3;

		this.initializeSocket();
		this.addKeyListeners();
		this.loop();
	}

	scale_value(value, input_min, input_max) {
		const output_min = 0;
		const output_max = 1000;
		const normalized_value = (value - input_min) / (input_max - input_min);
		return output_min + normalized_value * (output_max - output_min);
	}

	createStartMessage() {
		return {
			action: 'START',
			'player_name': 'PlayerName',
			paddle_l: this.getPaddleData(this.lpaddle),
			paddle_r: this.getPaddleData(this.rpaddle),
			screen: this.getScreenData(),
			ball: this.getBallData(this.ball)
		};
	}

	getPaddleData(paddle) {
		return {
			_x: this.scale_value(paddle._x, 0, this.screen.width),
			_y: this.scale_value(paddle._y, 0, this.screen.height),
			_width: this.scale_value(paddle._width, 0, this.screen.width),
			_height: this.scale_value(paddle._height, 0, this.screen.height),
			_radius: this.scale_value(paddle._radius, 0, Math.max(this.screen.width, this.screen.height)),
			end: this.scale_value(paddle.end, 0, Math.max(this.screen.width, this.screen.height)),
			Rx: this.scale_value(paddle.Rx, 0, this.screen.width),
			Ry: this.scale_value(paddle.Ry, 0, this.screen.height),
			Rradius: this.scale_value(paddle.Rradius, 0, Math.max(this.screen.width, this.screen.height)),
			Rend: this.scale_value(paddle.Rend, 0, Math.max(this.screen.width, this.screen.height))
		};
	}

	getBallData(ball) {
		return {
			_x: this.scale_value(ball._x, 0, this.screen.width),
			_y: this.scale_value(ball._y, 0, this.screen.height),
			_radius: this.scale_value(ball._radius, 0, Math.max(this.screen.width, this.screen.height)),
			end: this.scale_value(ball.end, 0, Math.max(this.screen.width, this.screen.height)),
			Rx: this.scale_value(ball.Rx, 0, this.screen.width),
			Ry: this.scale_value(ball.Ry, 0, this.screen.height),
			Rradius: this.scale_value(ball.Rradius, 0, Math.max(this.screen.width, this.screen.height)),
			Rend: this.scale_value(ball.Rend, 0, Math.max(this.screen.width, this.screen.height))
		};
	}

	getScreenData() {
		return {
			_width: this.scale_value(this.screen.width, 0, this.screen.width),
			_height: this.scale_value(this.screen.height, 0, this.screen.height),
			_ratio: 6
		};
	}

	initializeSocket() {
		this.gameSocket.onopen = (e) => {
			console.log('Chat socket connected');
			console.log("message", this.message);
			this.sendMessage(this.message);
		};

		this.gameSocket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (!data)
				return;
			this.handleSocketMessage(data);
		};

		this.gameSocket.onclose = (e) => {
			console.error('Chat socket closed unexpectedly', e);
		};
	}

	handleSocketMessage(data) {
		if (data['game_state'] === 'waiting_for_players') {
			this.text = "Waiting for players";
			this.game.ready = false;
		}
		if (data['game_state'] === 'game_started') {
			this.game.animationFlag = true;
			this.game.ready = true;
		}
		if (data['type'] === 'update') {
			this.text = "";
			this.game.updateGameInterface(data);
		}
		if (data['type'] === 'game_over') {
			this.text = data['message'];
		}
		if (data['type'] === 'countdown') {
			this.text = data['state'];
		}
	}

	sendMessage(message) {
		this.gameSocket.send(JSON.stringify({ 'message': message }));
	}

	addKeyListeners() {
		document.addEventListener("keydown", (e) => {
			if (e.key == "Enter" && !this.game.beginPos) {
				this.movePlayer('ENTER');
				this.game.beginPos = false;
				this.game.animationFlag = true;
			}
			if (this.game.beginPos) {
				if (e.key == "Escape") this.reset();
				if (e.key == "Enter") this.movePlayer('ENTER');
				if (e.key == "w" || e.key == "W") this.movePlayer('UP');
				if (e.key == "s" || e.key == "S") this.movePlayer('DOWN');
				if (e.key == "ArrowUp") this.movePlayer('AUP');
				if (e.key == "ArrowDown") this.movePlayer('ADOWN');
			}
		});
		// // Sayfa kapatıldığında veya yenilendiğinde WebSocket'i kapat
		// window.addEventListener('beforeunload', this.close.bind(this));
		// window.addEventListener('unload', this.close.bind(this));
	}

	movePlayer(direction) {
		const message = {
			action: 'MOVE',
			direction: direction,
			player_name: 'PlayerName'
		};
		this.sendMessage(message);
	}

	reset() {
		this.ball.reset();
		this.lpaddle.reset();
		this.rpaddle.reset();
		this.game.dirX = 3.0;
		this.game.dirY = 0.0;
	}

	async loop() {
		this.screen.clear();
		if (this.game.animationFlag) {
			this.game.animationFlag = false;
		}
		if (this.game.isOpen()) {
			if (this.game.rightPlyrScore == this.game.maxScore || this.game.leftPlyrScore == this.game.maxScore) {
				this.reset();
				this.text = this.game.rightPlyrScore < this.game.leftPlyrScore ? "Left player won!" : "Right player won!";
				this.game.animationFlag = false;
				this.game.beginPos = true;
			}
		}
		this.screen.putScore(this.game.leftPlyrScore, this.game.rightPlyrScore);
		this.screen.putText(this.text, this.screen.width / 2, this.screen.height / 2 - 200);
		this.lpaddle.drawRect();
		this.rpaddle.drawRect();
		this.ball.drawArc();
		requestAnimationFrame(this.loop.bind(this));
	}

	async waitingForPlayers(roomName) {
		this.text = "Waiting for players";
		try {
			const response = await fetch(`https://127.0.0.1:8081/check_room_status/${roomName}/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			const data = await response.json();

			if (data['status'] === 'waiting') {
				this.text = "Waiting for players";
				// 1 saniye sonra tekrar kontrol et
				setTimeout(() => this.waitingForPlayers(roomName), 2000);
			} else if (data['status'] === 'start') {
				this.start(roomName);
			}
		} catch (error) {
			console.error('Error fetching room status:', error);
			// 1 saniye sonra tekrar kontrol et
			setTimeout(() => this.waitingForPlayers(roomName), 2000);
		}
	}

	close() {
		if (this.gameSocket) {
			this.gameSocket.close();
		}
	}
}

const roomName = "room1";
const remoteGame = new RemoteGame(roomName);

export default remoteGame;
