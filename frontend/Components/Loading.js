class Loading extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="d-flex justify-content-center align-items-center bg-gradient" style="height: 100vh;">
                <div class="spinner-border" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
        `
    }
}

customElements.define('my-loading', Loading);