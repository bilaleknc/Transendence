import Play from "../static/offline_pingpong.js";

class Game extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <main id="main-content" class="d-flex justify-content-center align-items-center bg-gradient" style="height: 70vh;">
                <div id="button-options" class="d-flex flex-column align-items-center w-100">
                    <h1> Game Options </h1>
                    <button id="two-player" class="btn btn-dark w-25 p-3 mt-2">Two Player</button>
                    <button id="remote" class="btn btn-dark w-25 p-3 mt-2">Remote Player</button>
                    <button id="tournament" class="btn btn-dark w-25 p-3 mt-2">Tournament</button>
                </div>
            </main>
            <div id="game-area">
            </div>	
        `;
        console.log("contr")
        window.gameEnd = false;
		this.querySelector('#two-player').addEventListener('click', () => this.twoPlayer());
        this.querySelector('#remote').addEventListener('click', () => this.remotePlayer());
    }

    disconnectedCallback() {
        const style = document.getElementById('pingpong-style');
		if (style) {
			style.remove();
		}
        window.gameEnd = true;
	}

    dsplNone(){
        const style = document.createElement('style');
        style.id = "pingpong-style";
        style.innerHTML = `
			#main-content { display: none !important; }
            my-navbar {	display: none !important; }
		`;
		document.head.appendChild(style);
    }

    twoPlayer() {
        this.dsplNone();
        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'game-canvas';
        canvasElement.width = "100%";
        canvasElement.height = "100%";
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
        const play = new Play();
        play.loop();
    }

    remotePlayer() {
        this.dsplNone();
        const canvasElement = document.createElement('canvas');
            canvasElement.id = 'game-canvas';
            canvasElement.width = "100%";
            canvasElement.height = "100%";

            // Append the canvas to the game-area div
            this.querySelector('#game-area').appendChild(canvasElement);

            // Create a style element
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

            // Append the style element to the shadow root
            this.appendChild(styleElement);

            // Load the pingpong.js script
            const scriptElement = document.createElement('script');
            scriptElement.id = "remotePlayer-script";
            scriptElement.src = "../static/remote_pingpong.js";
            scriptElement.type = "module";
            this.appendChild(scriptElement);
    }
}

customElements.define('my-game', Game);