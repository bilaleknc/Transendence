import Play from "../static/offline_pingpong.js";
import RemoteGame from "../static/remote_pingpong.js";
import error from "../ModulesJS/ErrorUtils.js"
import WS from "../ModulesJS/WebSocket.js";

class GameArea extends HTMLElement {
    constructor() {
        super();
        this.time_id = null;
        this.innerHTML = `
            <div id="error-content">
                <my-error name="" content=""><my-error>
            </div>
            <div class="d-flex justify-content-center align-items-center" style="width: 100%; height: 100%;">
                <div id="game-area" style="width: 1200px; height: 800px;">
                </div>
			</div>
        `
        const canvasElement = document.createElement('canvas');
		canvasElement.id = 'game-canvas';
		canvasElement.width = '100';
		canvasElement.height = '100';
		this.querySelector('#game-area').appendChild(canvasElement);
		const styleElement = document.createElement('style');
		styleElement.textContent = `
		#game-canvas {
			background: #000;
			margin: 0 auto;
			padding: 0;
		    width: 100%;
			height: 100%;
			z-index: 1000;
		}
		`;

		this.appendChild(styleElement);
        const urlParams = new URLSearchParams(window.location.search);
        this.room = urlParams.get('room');
        this.player = urlParams.get('player');

        this.ws = null;
        this.game = null;

        if (this.room && this.player) {
            this.checkRoom()
            .then((data) => {
                if (data) {
                    this.setAttribute('remote', 'remote');
                }
            })
        } else {
            this.setAttribute('twoplayer', 'twoplayer');
            this.render();
        }
    };

    disconnectedCallback() {
        if (this.time_id != null) clearTimeout(this.time_id);
        this.ws?.socket?.close();
        if (this.game) {
            this.game.gameAnimation = false;
            clearInterval(this.game.keyDownInterval)
		}
    }

    async checkRoom() {
        try {
            const response = await fetch(`https://45.157.16.17:8081/get_rooms`);
            const data = await response.json();
            if (data.rooms.includes(this.room) == false) {
                this.time_id = setTimeout(() => {
                    window.route({ target: { href: '/remote-game' } });
                }, 4000);
                error.call(document, {"Error": "Room does not exited"}, 0)
                return false;
            }else {
                return true;
            }
        } catch (error) { return false; }
    }
    
    static get observedAttributes() {
        return ['remote', 'twoplayer'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
          this.render();
    }

    render() {        
        const remote = this.attributes.remote;
        const twoPlayer = this.attributes.twoplayer;
        if (twoPlayer) this.twoPlayer();
        if (remote) this.remotePlayer();
    }

    twoPlayer() {
        const play = new Play();
        play.loop();
    }

    remotePlayer() {
		this.ws = new WS(this.room, this.player);
        this.game = new RemoteGame(this.ws, this.room, this.player);
        this.game.waitOtherPlayer();
        // const remoteGame = new RemoteGame(this.room, this.player);
		// remoteGame.waitingForPlayers(this.room, this.player);
    }
};

customElements.define('my-area', GameArea);