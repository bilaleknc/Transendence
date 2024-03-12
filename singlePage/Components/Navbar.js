const template = document.createElement("template");

template.innerHTML = `

`;

export default class Navbar extends HTMLElement {
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    
    
    let clone = template.content.cloneNode(true);
    this.root.appendChild(clone);
  }
}

customElements.define("my-navbar", Navbar);
