class Footer extends HTMLElement {
    constructor () {
        super();
        this.innerHTML = `
        <div class="container">
	<div class="row">
	  <us-about 
	  name="bilal" 
	  imgName="bilal.png"
	  linkedin="https://www.linkedin.com/in/bilalekinci/"
	  github="https://github.com/bilaleknc/"
	  ></us-about>
	  <us-about 
	  name="eren" 
	  imgName="eren.png"
	  linkedin="https://www.linkedin.com/in/eren-erdogan3/"
	  github="https://github.com/codewitheren"
	  ></us-about>
	  <us-about 
	  name="süleyman" 
	  imgName="suleyman.png"
	  linkedin="https://www.linkedin.com/in/suleymanakkus/"
	  github="https://github.com/sakkus42"
	  ></us-about>
	</div>
</div>
      `
    }
}

customElements.define('my-footer', Footer);