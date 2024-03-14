import { Game } from './game.js';
import { Draw } from './draw.js';
import { Screen } from './screen.js';



const room_name = 'room1';
// const room_name = "{{ room.slug }}";  // Use the room name from the context
const gameSocket = new WebSocket('ws://127.0.0.1:8081/ws/socket-server/' + room_name + '/');


let screen = new Screen();

let pdlIceptionHeight = screen.getHghtOfPdlIncLoc();
let lpaddle = new Draw(10, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
let rpaddle = new Draw(screen.width - 30, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
let ball = new Draw(screen.width / 2, screen.height / 2, 20, 0, screen.ctx);

const message = {
	action: 'START',
	'player_name': 'PlayerName',
	// room id
	paddle_l: lpaddle,
	paddle_r: rpaddle,
	screen: screen,
	ball: ball,
};

gameSocket.onopen = function (e) {
	console.log("Connection established");
	sendMessage(message);
};

function reset() {
	ball.reset();
	lpaddle.reset();
	rpaddle.reset();
	dirX = 3.0;
	dirY = 0.0;
}
let game = new Game(lpaddle, rpaddle, ball, screen);



function keyDown() {
	document.addEventListener("keydown", (e) => {
		console.log("game.beginPos", game.beginPos);
		if (e.key == "Enter" && !game.beginPos) {
			movePlayer('ENTER');
			game.beginPos = false;
			game.animationFlag = true;
		}
		if (game.beginPos) {
			if (e.key == "Escape")
				reset()
			if (e.key == "Enter")
				movePlayer('ENTER');
			if (e.key == "w" || e.key == "W")
				movePlayer('UP');
			if (e.key == "s" || e.key == "S")
				movePlayer('DOWN');
			if (e.key == "ArrowUp")
				movePlayer('AUP');
			if (e.key == "ArrowDown")
				movePlayer('ADOWN');
		}
	})
};

function movePlayer(direction) {
	const message = {
		action: 'MOVE',
		direction: direction,
		player_name: 'PlayerName'
	};
	sendMessage(message);
}

keyDown();
let text = "Welcome";




async function loop() {
	screen.clear();
	if (game.animationFlag){
		console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1")
		game.animationFlag = false;
	}
	if (game.isOpen()) {
		if (game.rightPlyrScore == game.maxScore || game.leftPlyrScore == game.maxScore) {
			reset();
			game.animationFlag = false;
			game.beginPos = true;
		}
	} else {
		if (game.leftPlyrScore || game.rightPlyrScore)
			// text = game.rightPlyrScore < game.leftPlyrScore ? "Left player won!" : "Right player won!";
			;
	}
	screen.putScore(game.leftPlyrScore, game.rightPlyrScore);
	screen.putText(text, screen.width / 2, screen.height / 2 - 200);
	lpaddle.drawRect();
	rpaddle.drawRect();
	ball.drawArc();
	requestAnimationFrame(loop);
};

loop();

gameSocket.onmessage = function (e) {
	const data = JSON.parse(e.data);
	if (!data)
		return;
	if (data['game_state'] === 'waiting_for_players'){
		text = "Waiting for players";
		game.ready = false;
	}
	if (data === 'game_started'){
		game.animationFlag = true;
		game.ready = true;
	}
	if (data['type'] === 'update') {
		text = "";
		game.updateGameInterface(data);
	}
	if (data['type'] === 'game_over') {
		text = data['message'];
	}
	if (data['type'] === 'countdown'){
		console.log("Countdown");
		text = data['state'];
	}
};


gameSocket.onclose = function (e) {
	console.error(e);
	console.error('Chat socket closed unexpectedly');
};

function sendMessage(message) {
	gameSocket.send(JSON.stringify({
		'message': message
	}));
}

export default loop();


