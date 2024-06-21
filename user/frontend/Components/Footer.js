class Footer extends HTMLElement {
	constructor() {
			super();
			this.innerHTML = `
					<div class="container mt-5">
							<div class="row">
									<us-about 
											name="Bilal Ekinci" 
											role="Software Developer"
											imgName="bilal.png"
											linkedin="https://www.linkedin.com/in/bilalekinci/"
											github="https://github.com/bilaleknc/"
									></us-about>
									<us-about 
											name="Mustafa Eren Erdoğan" 
											role="Software Developer"
											imgName="eren.png"
											linkedin="https://www.linkedin.com/in/eren-erdogan3/"
											github="https://github.com/codewitheren"
									></us-about>
									<us-about 
											name="Süleyman Akkuş" 
											role="Software Developer"
											imgName="suleyman.png"
											linkedin="https://www.linkedin.com/in/suleymanakkus/"
											github="https://github.com/sakkus42"
									></us-about>
							</div>
					</div>
			`;
	}
}

customElements.define('my-footer', Footer);
