export default class HTMLTepmlate {
	/**
	 * @param {String} fileName The name of any html file under the "templates" folder
	 */
	constructor(fileName) {
	  this.fileName = fileName;
	  this.textHTML = "";
	}
  
	async getContent() {
	  let response = await fetch(`./templates/${this.fileName}.html`)
	  let text = await response.text();
	  return text;
	}
  
	/**
	 * @param {HTMLElement} element
	 */
	bindingToElement(element) {
	  this.getContent()
		.then((res) => (element.innerHTML = res))
		.catch((err) => console.log(`ERROR [Component.innerHtml]: ${err}`));
	}
  }