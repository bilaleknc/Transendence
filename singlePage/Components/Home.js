class Home extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
            <div> 
                Home Page 
            </div>
        `;
  }
}

customElements.define("my-home", Home);
