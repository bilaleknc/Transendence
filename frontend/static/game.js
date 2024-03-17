import { Draw } from './draw.js';

export class Game {
	/**
	 * @param {Draw} lpaddle 
	 * @param {Draw} rpaddle 
	 * @param {Draw} ball 
	 * @param {Screen} screen 
	 */
	constructor(lpaddle, rpaddle, ball, screen) {
		this.lpaddle = lpaddle;
		this.rpaddle = rpaddle;
		this.ball = ball;
		this.screen = screen;
		this.rightPlyrScore = 0;
		this.leftPlyrScore = 0;
		this.maxScore = 5;
		this.animationFlag = false;
		this.beginPos = true;
		this.ready = false;
	}

	updateGameInterface(gameState) {
		if (gameState.score !== undefined)
   			screen.putScore(gameState.score);
		if (gameState['paddle_l'] !== undefined)
			this.lpaddle.y = gameState['paddle_l'] / 1000 * window.innerHeight;
		if (gameState['paddle_r'] !== undefined)
			this.rpaddle.y = gameState['paddle_r'] / 1000 * window.innerHeight;
		if (gameState['ball_x'] !== undefined)
			this.ball.x = gameState['ball_x'] / 1000 * window.innerWidth;
		if (gameState['ball_y'] !== undefined)
			this.ball.y = gameState['ball_y'] / 1000 * window.innerHeight;
		if (gameState['rightPlyrScore'] !== undefined)
			this.rightPlyrScore = gameState['rightPlyrScore'];
		if (gameState['leftPlyrScore'] !== undefined)
			this.leftPlyrScore = gameState['leftPlyrScore'];
	}


	isOpen() { return this.animationFlag; }
};
