import setup from '../static/pingpong.js'
const template = document.createElement('template');

template.innerHTML = `
    <style>
        body{
            margin: 0; padding: 0;
            overflow: hidden;
            align-items: center;
            text-align: center;
        }
        canvas {
            background: #000;
            margin: 0; padding: 0;
            width: 100%;
            z-index: 1000;
        }
    </style>

    <main id="main-content">
        <div id="game-area">
            <canvas id="game-canvas" width="700" height="500"></canvas>
        </div>	
    </main>
`
class Game extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    setup();
  }
}

customElements.define('my-game', Game);