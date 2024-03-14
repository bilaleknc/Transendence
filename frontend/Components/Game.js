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
            <canvas id="game-canvas" width="100%" height="100%" ></canvas>
        </div>	
    </main>
`

class Game extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    const scriptElement = document.createElement('script');
    scriptElement.src = "../static/pingpong.js";
    scriptElement.type = "module";
    this.shadowRoot.appendChild(scriptElement);
  }
}

customElements.define('my-game', Game);