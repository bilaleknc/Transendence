import Play from "../static/offline_pingpong.js";
import RemoteGame from "../static/remote_pingpong.js";

class Game extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <main id="main-content" class="d-flex justify-content-center align-items-center bg-gradient vh-100 pb-10">
                <div id="button-options" class="d-flex flex-column align-items-center w-50">
                    <h1 class="mb-3">Game Options</h1>
                    <button id="two-player" class="btn btn-dark w-25 p-3 mt-2">Two Player</button>
                    <button id="remote" class="btn btn-dark w-25 p-3 mt-2">Remote Player</button>
                    <button id="tournament" class="btn btn-dark w-25  p-3 mt-2">Tournament</button>
                </div>
            </main>
			<div class="d-flex justify-content-center align-items-center" style="height=800px;">
            	<div id="game-area" class="d-none"></div>
			</div>
        `;
        window.gameEnd = false; 
        this.querySelector('#two-player').addEventListener('click', () => window.route( {target: { href: '/game-area'}} ));
        this.querySelector('#remote').addEventListener('click', () => window.route( {target: { href: '/remote-game'}} ));
		this.querySelector('#tournament').addEventListener('click', () => {
            window.route({ target: { href: '/tournament' } });
        });
    }

    disconnectedCallback() {
        const style = document.getElementById('pingpong-style');
        if (style) {
            style.remove();
        }
        window.gameEnd = true;
    }

	dsplNone(flag) {
        const style = document.createElement('style');
        style.id = "pingpong-style";
		if (1) {
			style.innerHTML = `
				#main-content { display: none !important; }
			`;
		} else {
			style.innerHTML = `
				#main-content { display: none !important; }
				#room-list {display: none !important;}
			`;
		}
        document.head.appendChild(style);
    }

    twoPlayer() {
        this.dsplNone(0);
		this.initializeGameArea();
        const play = new Play();
        play.loop();
    }

    async remotePlayer() {
        this.dsplNone(1);
        // document.getElementById('room-list').style.display = 'block';
		document.getElementById('room-list').classList.remove('d-none');
        await this.fetchRooms();
    }

	async leaveRoom(room) {
		try {
			const response = await fetch(`https://45.157.16.17:8081/leave_room/${room}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			const data = await response.json();
			if (data.status === 'success')
				this.fetchRooms();
		} catch (error) {
			return;
		}
	}

    startGame(roomName, playerNumber) {
		this.dsplNone();
		this.initializeGameArea();
        const remoteGame = new RemoteGame(roomName);
		remoteGame.waitingForPlayers(roomName, playerNumber);
    }

	initializeGameArea(){
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
		this.querySelector('#game-area').classList.remove('d-none');
	}

	// startTournament(){
	// 	this.displayNone();
	// 	const tournament = new Tournament();
	// 	tournament.start();
	// }
}

customElements.define('my-game', Game);
