const template = document.createElement('template');

template.innerHTML = `
    <main id="main-content" class="align-items-center justify-content-center">
        <div id="game-area"></div>	
    </main>
`;

class Game extends HTMLElement {
    constructor() {
        super();

		this.attachShadow({ mode: 'open' });

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Create a new button
        const remote = document.createElement('button');
        remote.id = 'remote';
		remote.className = 'btn btn-primary align-items-center justify-content-center';
        remote.textContent = 'Play Remote Play';

		const multiplayer = document.createElement('button');
		multiplayer.id = 'multiplayer-button';
		multiplayer.className = 'btn btn-primary align-items-center justify-content-center';
		multiplayer.textContent = 'Play Multiplayer';

        // Append the new button to the shadow root
        this.shadowRoot.appendChild(remote);
		this.shadowRoot.appendChild(multiplayer);

		this.shadowRoot.querySelector('#multiplayer-button').addEventListener('click', () => {
			const canvasElement = document.createElement('canvas');
			canvasElement.id = 'game-canvas';
			canvasElement.width = "100%";
			canvasElement.height = "100%";
			this.shadowRoot.querySelector('#game-area').appendChild(canvasElement);

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

			this.shadowRoot.appendChild(styleElement);

			const scriptElement = document.createElement('script');
			scriptElement.src = "../static/offline_pingpong.js";
			scriptElement.type = "module";
			this.shadowRoot.appendChild(scriptElement);
		});


        // Set up an event listener for the new button
        this.shadowRoot.querySelector('#remote').addEventListener('click', () => {
            // Create the canvas
            const canvasElement = document.createElement('canvas');
            canvasElement.id = 'game-canvas';
            canvasElement.width = "100%";
            canvasElement.height = "100%";

            // Append the canvas to the game-area div
            this.shadowRoot.querySelector('#game-area').appendChild(canvasElement);

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
            this.shadowRoot.appendChild(styleElement);

            // Load the pingpong.js script
            const scriptElement = document.createElement('script');
            scriptElement.src = "../static/remote_pingpong.js";
            scriptElement.type = "module";
            this.shadowRoot.appendChild(scriptElement);
        });



    }
}

customElements.define('my-game', Game);
