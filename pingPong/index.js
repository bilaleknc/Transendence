class Draw {
    constructor (x, y, radius, end, ctx, color = "white") {
        this._x = x;
        this._y = y;
        this._radius = radius;
        this._end = end;
        this._color = color;
        this.ctx = ctx;
        this._width;     // canvas genişliği;
        this._height;    // canvas boyu;

        this.Rx = this._x;
        this.Ry = this._y;
        this.Rradius = this._radius;
        this.Rend = this._end;
    };

    set x(number) {
        this._x = number
    };
    
    set y(number) {
        this._y = number
    };

    set end(number) {
        this._end = number;
    }

    get x()         { return this._x };
    get y()         { return this._y };
    get radius()    { return this._radius; }
    get end()       { return this._end };

    reset() {
        this._x = this.Rx; 
        this._y = this.Ry; 
        this._radius = this.radius; 
        this._end = this.Rend; 
    }

    drawRect() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this._color;
        this.ctx.fillRect(this._x, this._y, this._radius, this._end);
        
    }

    drawArc() {
        this.ctx.beginPath();
        this.ctx.fillStyle = this._color;
        this.ctx.arc(this._x, this._y, this._radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
};

class Screen {
    constructor(tagName = "canvas", width = window.innerWidth, height = window.innerHeight, ratio = 6) {
        this._canvas = document.querySelector(tagName);
        this._ctx = this._canvas.getContext("2d");
        this._canvas.width = width;
        this._canvas.height = height;
        this._ratio = ratio;
        this._width = width;
        this._height = height;
    }

    get width()         { return this._width };
    get height()        { return this._height };
    get ctx()           { return this._ctx };

    set width(number)         { 
        this._width = number;
        this._canvas.width = number
    };
    set height(number)        {  
        this._height = number 
        this._canvas.height = number;
    };

    
    set ratio(number)   { this._ratio = number };


    /** 
     * paddellarımızın başlangıç konumlarını hesaplamak için bu fonksiyon lazım 
     * h / 2 = 150, paddleH = 50 ise başlangıç konumu 125 olması lazım. */
    getHghtOfPdlIncLoc()    { return (this.height / 2) - (this.paddleHeight() / 2) }  
    /**
     * Bir paddlemızın boyunu ekrana oranla hesaplama yapıyor.
     */
    paddleHeight()         { return this.height / this._ratio; };

    putText(text, x, y) {
        this._ctx.font = "30px Arial";
        this._ctx.textAlign = "center";
        this._ctx.fillText(text, x, y);
    };

    putScore(plyrLeft, plyrRight) {
        this._ctx.font = "30px Arial";
        this._ctx.textAlign = "justify";
        this._ctx.fillText(`${plyrLeft}-${plyrRight}`, this.width / 2, 90);
    };

    clear() { this._ctx.clearRect(0, 0, this.width, this.height); };
};

class Game {
    /**
     * @param {Draw} leftPaddle 
     * @param {Draw} rightPaddle 
     * @param {Draw} ball 
     * @param {Screen} screen 
     */
    constructor(leftPaddle, rightPaddle, ball, screen) {
        this.leftPaddle = leftPaddle;
        this.rightPaddle = rightPaddle;
        this.ball = ball;
        this.screen = screen;
        this.i = 0;

        this.speedPlayer = 15;
        this.speedBall = 6;
        this.animationFlag = false;
        this.beginPos = true;
        this.key = {
            "enter":        false,
            "arrowUp":      false,
            "arrowDown":    false,
            "w":            false,
            "s":            false,
        }
        this.leftPlyrScore = 0;
        this.rightPlyrScore = 0;
        this.maxScore = 2;
        this.dirX = 2.0;
        this.dirY = 0.0;
    
        this.keyDown();
        this.keyUp();
    }

    inception() {
        this.screen.clear();
        if (this.leftPlyrScore || this.rightPlyrScore) {
            let text = this.rightPlyrScore < this.leftPlyrScore ? "Left player won!" : "Right player won!";
            this.screen.putText(text, this.screen.width / 2, 40);
            this.screen.putScore(this.leftPlyrScore, this.rightPlyrScore);
        }
        this.screen.putText("Press enter to start the game", this.screen.width / 2, this.screen.height / 2 - 35)
        this.leftPaddle.drawRect();
        this.rightPaddle.drawRect();
        this.ball.drawArc();
    }

    begin() {
        game.keyCntrl();
        this.screen.clear();
        if (this.rightPlyrScore == this.maxScore || this.leftPlyrScore == this.maxScore) {
            this.#reset();
            this.animationFlag = false;
            this.beginPos = true;
        }
        else {
            this.screen.putScore(this.leftPlyrScore, this.rightPlyrScore);
            this.#moveTheBall();
        }
        this.leftPaddle.drawRect();
        this.rightPaddle.drawRect();
        this.ball.drawArc();
    }

    #reset() {
        this.ball.reset();
        this.rightPaddle.reset();
        this.leftPaddle.reset();
        this.dirX = 2.0;
        this.dirY = 0.0;
    }

    #fillMap(paddle, left) {
        let array; 

        if (left) {
            array = [-45, -30, -15, 0, 0, 15, 30, 45];
        } else {
            array = [-135, -150, -165, 180, 180, 165, 150, 135];
        }
        let divided = [];
        let paddleDiv = (this.screen.paddleHeight() + this.ball.radius) / 8;
        let y = paddle.y;
        for (let i = 0; i < 8; i++, y += paddleDiv) {
            divided[i] = Math.floor(y);
        }
        let res = new Map();
        let i = 0, key = -3;
        while ( i < 8) {
            res.set(key, {
                degree: array[i],
                area: divided[i],
            });
            i++, key++;
        }
        return res;
    }

    /**
     * @param {Draw} paddle 
     */
    #calculateCollision(paddle, left) {
        let moment = 2.75;
        let parserMap = this.#fillMap(paddle, left);    
        
        let element;
        for (let el of parserMap) {
            if (this.ball.y <= el[1].area) {
                element = el;
                break;
            }
            element = el;
        }
        
        let degree = element[1].degree + element[1].area - this.ball.y;
        let radyan = degree * (Math.PI / 180);
        this.dirX = Math.cos(radyan) * moment;
        this.dirY = Math.sin(radyan) * moment;
    }

    #checkPaddleCollision(paddle, left) {
        if (left && this.ball.x <= paddle.x + paddle.radius + this.ball.radius && this.ball.x >= paddle.x - paddle.radius + this.ball.radius)
            ;
        else if (!left && this.ball.x >= paddle.x - this.ball.radius && this.ball.x <= paddle.x + paddle.radius + this.ball.radius)
            ;
        else
            return false;
        if(this.ball.y <= paddle.y + this.screen.paddleHeight() + this.ball.radius && this.ball.y >= paddle.y - this.ball.radius) {
            return true;
        }
        return false;
    }

    
    #moveTheBall() {
        //üst ve alt duvara çarpma durumunun kontrolü
        if (this.ball.y - this.ball.radius  <= 0){
            this.dirY = Math.abs(this.dirY);
        } else if (this.ball.y + this.ball.radius >= this.screen.height) {
            this.dirY = -Math.abs(this.dirY);
        }

        // paddellara çarpma durumunun & sayı olma durumu
        if (this.ball.x + this.ball.radius < 0) {
            this.#reset();
            this.rightPlyrScore++;
        } else if (this.ball.x - this.ball.radius > this.screen.width) {
            this.#reset();
            this.leftPlyrScore++;
        } else if (this.#checkPaddleCollision(this.leftPaddle, 1)) {
            console.log("as");
            this.#calculateCollision(this.leftPaddle, 1);
        } else if (this.#checkPaddleCollision(this.rightPaddle, 0)) {
            this.#calculateCollision(this.rightPaddle, 0);
        }
        this.ball.x += this.speedBall * this.dirX;
        this.ball.y += this.speedBall * this.dirY;
        
    }

    keyCntrl() {
        if (this.beginPos)
            return;
        let height = this.screen.height;
        if (this.key["w"] && this.leftPaddle.y - this.speedPlayer >= 0)
            this.leftPaddle.y -= this.speedPlayer;
        if (this.key["s"] && this.leftPaddle.y + this.speedPlayer <= height - this.screen.paddleHeight())
            this.leftPaddle.y = this.leftPaddle.y + this.speedPlayer;
        if (this.key["arrowUp"] && this.rightPaddle.y - this.speedPlayer >= 0)
            this.rightPaddle.y = this.rightPaddle.y - this.speedPlayer;
        if (this.key["arrowDown"] && this.rightPaddle.y + this.speedPlayer <= height - this.screen.paddleHeight())
            this.rightPaddle.y = this.rightPaddle.y + this.speedPlayer;
    }

    keyDown() {
        document.addEventListener("keydown", (e) => {
            if (e.key == "Enter" && this.beginPos){
                this.beginPos = false;
                this.animationFlag = true;
                this.rightPlyrScore = 0;
                this.leftPlyrScore = 0;
            }
            if (e.key == "Escape")
                this.#reset()
            if (e.key == "w")
                this.key["w"] = true;
            if (e.key == "s")
                this.key["s"] = true;
            if (e.key == "ArrowUp")
                this.key["arrowUp"] = true;
            if (e.key == "ArrowDown")
                this.key["arrowDown"] = true;
        });
    }

    keyUp() {
        document.addEventListener("keyup", (e) => {
            if (e.key == "w")
                this.key["w"] = false;
            if (e.key == "s")
                this.key["s"] = false;
            if (e.key == "ArrowUp")
                this.key["arrowUp"] = false;
            if (e.key == "ArrowDown")
                this.key["arrowDown"] = false;
        });
    }

    isOpen() { return this.animationFlag; }    
};

function setup() {

}

let screen = new Screen();

let pdlIceptionHeight = screen.getHghtOfPdlIncLoc();
let leftPpddl = new Draw(10, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
let rightPddl = new Draw(screen.width - 30, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
let ball = new Draw(screen.width / 2, screen.height / 2, 20, 0, screen.ctx);

let game = new Game(leftPpddl, rightPddl, ball, screen);


function loop() {
    if (game.isOpen()) {
        game.begin();
    } else {
        console.log("selam");
        game.inception();
    }
    requestAnimationFrame(loop);
};

loop();

window.addEventListener("resize", () => {
    screen = new Screen();
    pdlIceptionHeight = screen.getHghtOfPdlIncLoc();
    leftPpddl = new Draw(10, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
    rightPddl = new Draw(screen.width - 30, pdlIceptionHeight, 20, screen.paddleHeight(), screen.ctx);
    ball = new Draw(screen.width / 2, screen.height / 2, 20, 0, screen.ctx);
    game = new Game(leftPpddl, rightPddl, ball, screen);

})

const chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/');

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const message = data['message'];
    // Handle incoming message
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

// Send message to server
function sendMessage(message) {
    chatSocket.send(JSON.stringify({
        'message': message
    }));
}