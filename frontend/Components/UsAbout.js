class UsAbout extends HTMLElement {
	constructor() {
			super();
			this.classList.add('col-lg-4', 'col-md-6', 'mb-4');
			this.innerHTML = `
					<div class="card">
							<img 
									class="card-img-top rounded-circle mx-auto d-block mt-4 shadow"
									style="width: 150px;"
									src="../Public/${this.getAttribute("imgName")}"
									alt="${this.getAttribute("name")}"
							>
							<div class="card-body text-center">
									<h5 class="card-title">${this.getAttribute("name")}</h5>
									<p class="card-text">${this.getAttribute("role")}</p>
									<div class="social-links shadow">
											<a href="${this.getAttribute("linkedin")}" class="bi bi-linkedin m-2" target="_blank"></a>
											<a href="${this.getAttribute("github")}" class="bi bi-github m-2" target="_blank"></a>
									</div>
							</div>
					</div>
			`;
	}
}

customElements.define("us-about", UsAbout);
