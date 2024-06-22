export class Screen {
	constructor() {
		let shadowRoot = document.querySelector('my-game');
		this._canvas = document.querySelector("canvas");
		this._ctx = this._canvas.getContext("2d");
		this._canvas.width = window.innerWidth;
		this._canvas.height = window.innerHeight;
		this._ratio = 6;
		this._width = window.innerWidth;
		this._height = window.innerHeight;
	}

	get width() { return this._width };
	get height() { return this._height };
	get ctx() { return this._ctx };

	set ratio(number) { this._ratio = number };

	resize() {
		this._canvas.height = window.innerHeight;
		this._canvas.width = window.innerWidth;
	}
	/** 
	 * paddellarımızın başlangıç konumlarını hesaplamak için bu fonksiyon lazım 
	 * h / 2 = 150, paddleH = 50 ise başlangıç konumu 125 olması lazım. */

	getHghtOfPdlIncLoc() { return (this.height / 2) - (this.paddleHeight() / 2) } 

	/**
	 * Bir paddlemızın boyunu ekrana oranla hesaplama yapıyor.
	 */
	paddleHeight() { return this.height / this._ratio; };

	putText(text, x, y) {
		this._ctx.font = "30px Arial";
		this._ctx.textAlign = "center";
		this._ctx.fillText(text, x, y);
	};

	putScore(plyrLeft, plyrRight) {
		this._ctx.font = "30px Arial";
		this._ctx.textAlign = "justify";
		this._ctx.fillText(`${plyrLeft}-${plyrRight}`, this.width / 2, this.paddleHeight());
	};

	clear() { this._ctx.clearRect(0, 0, this.width, this.height); };
};