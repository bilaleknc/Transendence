class Error extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div class="alert">
                <strong></strong> <label><label>
            </div>
        `
        this.render();
    }

    static get observedAttributes() {
		return ['name', 'content'];
	}

    get name()      { return this.getAttribute("name"); }
	set name(value) { this.setAttribute("name", value); }

    get content()       { return this.getAttribute("content"); }
	set content(value)  { this.setAttribute("content", value); }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName.toLowerCase() === 'name' && newVal.toLowerCase() != 'success') {
            this.querySelector('div').classList.add('alert-danger');
            this.querySelector('strong').textContent = "Error";
        }else if (attrName.toLowerCase() === 'name') {
            this.querySelector('div').classList.remove('alert-danger');
            this.querySelector('div').classList.add('alert-success');
            this.querySelector('strong').textContent = "Success";
        }
        if (attrName.toLowerCase() === 'content') {
            this.querySelector('label').textContent = newVal;
        }
    }

    render() {
        const name  = this.getAttribute('name');
        const content  = this.getAttribute('content');
        this.setAttribute('name', name);
        this.setAttribute('content', content);
    }
}

customElements.define('my-error', Error);