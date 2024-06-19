class UsAbout extends HTMLElement {
	constructor() {
	  super();
	  this.classList.add('col')
	  this.innerHTML = `
		<div class="d-flex flex-column p-2 align-items-start">
			<img 
			class="rounded-circle m-4 img-fluid"
			style="width: 100px;"
			src="../Public/${this.getAttribute("imgName")}"
			alt="${this.getAttribute("name")}"
			>
  
			<p>
			  ${this.getAttribute("about") 
			  ? this.getAttribute("about") 
			  : this.getAttribute('name').toLocaleUpperCase() 
			  + "<br> Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."}
			</p>
		  <div class="d-flex align-items-start">
			<a href="${this.getAttribute("linkedin")}" class="bi bi-linkedin p-2"></a>
			<a style="color: black;" href="${this.getAttribute("github")}" class="bi bi-github p-2"></a>
		  </div>
		</div>
	  `;
	}
  }
  
  customElements.define("us-about", UsAbout);