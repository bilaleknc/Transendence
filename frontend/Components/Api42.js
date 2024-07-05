class Api extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
        <div class="d-flex flex-column justify-content-center align-items-center bg-gradient m-3" style="height: 100vh; gap: 20px;">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
        <div id="error-content">
                <my-error name="" content=""><my-error>
        </div>
        `
        this.render();
    }

    render() {
	    const code = new URLSearchParams(window.location.search).get('code');
        window.localStorage.setItem('code', encodeURIComponent(code));
        window.close();
    }

}

customElements.define('my-api', Api);