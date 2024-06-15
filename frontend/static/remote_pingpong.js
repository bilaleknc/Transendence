import { Game } from './game.js';
import { Draw } from './draw.js';
import { Screen } from './screen.js';



const room_name = 'room1';
// const room_name = "{{ room.slug }}";  // Use the room name from the context
const gameSocket = new WebSocket('ws://127.0.0.1:8081/ws/socket-server/' + room_name + '/');


let screen = new Screen();

function scale_value(value, input_min, input_max) {
    const output_min = 0;
    const output_max = 1000;

    // First, normalize the value to a range of 0 to 1
    const normalized_value = (value - input_min) / (input_max - input_min);

    // Then, scale the normalized value to the output range
    const output_value = output_min + normalized_value * (output_max - output_min);

    return output_value;
}

let pdlIceptionHeight = screen.getHghtOfPdlIncLoc();
let lpaddle = new Draw(10, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
let rpaddle = new Draw(screen.width - 30, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
let ball = new Draw(screen.width / 2, screen.height / 2, 20, 0, screen.ctx);

const message = {
    action: 'START',
    'player_name': 'PlayerName',
    // room id
    paddle_l: {
        _x: scale_value(lpaddle._x, 0, screen.width),
        _y: scale_value(lpaddle._y, 0, screen.height),
        _width: scale_value(lpaddle._width, 0, screen.width),
        _height: scale_value(lpaddle._height, 0, screen.height),
		_radius: scale_value(lpaddle._radius, 0, Math.max(screen.width, screen.height)),
		end: scale_value(lpaddle.end, 0, Math.max(screen.width, screen.height)),
		Rx: scale_value(lpaddle.Rx, 0, screen.width),
		Ry: scale_value(lpaddle.Ry, 0, screen.height),
		Rradius: scale_value(lpaddle.Rradius, 0, Math.max(screen.width, screen.height)),
		Rend: scale_value(lpaddle.Rend, 0, Math.max(screen.width, screen.height))
    },
    paddle_r: {
        _x: scale_value(rpaddle._x, 0, screen.width),
        _y: scale_value(rpaddle._y, 0, screen.height),
        _width: scale_value(rpaddle._width, 0, screen.width),
        _height: scale_value(rpaddle._height, 0, screen.height),
		_radius: scale_value(rpaddle._radius, 0, Math.max(screen.width, screen.height)),
		end: scale_value(rpaddle.end, 0, Math.max(screen.width, screen.height)),
		Rx: scale_value(rpaddle.Rx, 0, screen.width),
		Ry: scale_value(rpaddle.Ry, 0, screen.height),
		Rradius: scale_value(rpaddle.Rradius, 0, Math.max(screen.width, screen.height)),
		Rend: scale_value(rpaddle.Rend, 0, Math.max(screen.width, screen.height))
    },
    screen: {
        _width: scale_value(screen.width, 0, screen.width),
        _height: scale_value(screen.height, 0, screen.height),
		_ratio: 6,
    },
    ball: {
        _x: scale_value(ball._x, 0, screen.width),
        _y: scale_value(ball._y, 0, screen.height),
        _radius: scale_value(ball._radius, 0, Math.max(screen.width, screen.height)),
		end: scale_value(ball.end, 0, Math.max(screen.width, screen.height)),
		Rx: scale_value(ball.Rx, 0, screen.width),
		Ry: scale_value(ball.Ry, 0, screen.height),
		Rradius: scale_value(ball.Rradius, 0, Math.max(screen.width, screen.height)),
		Rend: scale_value(ball.Rend, 0, Math.max(screen.width, screen.height))
    },
};

gameSocket.onopen = function (e) {
	console.log('Chat socket connected');
	console.log("message",message);
	sendMessage(message);
}

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
			text = game.rightPlyrScore < game.leftPlyrScore ? "Left player won!" : "Right player won!";
			game.animationFlag = false;
			game.beginPos = true;
		}
	} else {
		if (game.leftPlyrScore || game.rightPlyrScore)
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


