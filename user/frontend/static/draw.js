export class Draw {
	constructor(x, y, radius, end, ctx) {
		this._x = x;
		this._y = y;
		this._radius = radius;
		this.end = end;
		this._color = "white"; 
		this.ctx = ctx;
		this._width;
		this._height;

		this.Rx = this._x;
		this.Ry = this._y;
		this.Rradius = this._radius;
		this.Rend = this.end;
	};

	set x(number) {
		this._x = number
	};

	set y(number) {
		this._y = number
	};

	get x() { return this._x };
	get y() { return this._y };
	get radius() { return this._radius; }

	reset() {
		this._x = this.Rx;
		this._y = this.Ry;
		this._radius = this.radius;
		this.end = this.Rend;
	}

	drawRect() {
		this.ctx.beginPath();
		this.ctx.fillStyle = this._color;
		this.ctx.fillRect(this._x, this._y, this._radius, this.end);
	}

	drawArc() {
		this.ctx.beginPath();
		this.ctx.fillStyle = this._color;
		this.ctx.arc(this._x, this._y, this._radius, 0, 2 * Math.PI);
		this.ctx.fill();
	}
};
