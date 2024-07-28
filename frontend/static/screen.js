export class Screen {
	constructor() {
		this._ratio = 6;
		this._canvas = document.querySelector("#game-canvas");
		this._ctx = this._canvas.getContext("2d");
		
		this._canvas.width = 1200;
		this._canvas.height = 800;
		this._width = this._canvas.width;
		this._height = this._canvas.height;	
	}

	get width() { return this._width };
	get height() { return this._height };
	get ctx() { return this._ctx };

	set ratio(number) { this._ratio = number };

	/** 
	 * paddellarımızın başlangıç konumlarını hesaplamak için bu fonksiyon lazım 
	 * h / 2 = 150, paddleH = 50 ise başlangıç konumu 125 olması lazım. */

	getHghtOfPdlIncLoc() { return (this.height / 2) - (this.paddleHeight() / 2) } 

	/**
	 * Bir paddlemızın boyunu ekrana oranla hesaplama yapıyor.
	 */
	paddleHeight() { return this.height / this._ratio; };

	putText(text, x, y) {
		this._ctx.fillStyle = "white";
		this._ctx.font = "30px Arial";
		this._ctx.textAlign = "center";
		this._ctx.fillText(text, x, y);
	};

	putScore(plyrLeft, plyrRight, player1, player2) {
		this._ctx.font = "30px Arial";
		this._ctx.textAlign = "justify";
		if (!player1 && !player2) {
			player1 = "", player2 = "";
		}
		this._ctx.fillText(`${player1 + "	" + plyrLeft}-${plyrRight + "	" + player2}`, this.width / 2, this.paddleHeight());
	};

	clear() { this._ctx.clearRect(0, 0, this.width, this.height); };
};