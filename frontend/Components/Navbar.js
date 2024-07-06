import triggerNavbar from "../ModulesJS/TriggerNavbar.js";

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
	  <nav class="navbar navbar-expand-xl navbar-dark bg-dark border-bottom">
	  <a class="navbar-brand nav-link" href="/">
		  <img src="../Public/logo.png" class="p-1 mx-3" width="120" height="50" alt="">
	  </a>
	  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
		  <span class="navbar-toggler-icon"></span>
	  </button>
	  <div class="collapse navbar-collapse navbarNavAltMarkup">
		
		  <ul class="navbar-nav">
			  <li class="nav-item active">
				  <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
			  </li>
			  <li class="nav-item">
				  <a class="nav-link" id="profile" href="/profile" style="display: none;">Profile</a>
			  </li>
			  <li class="nav-item">
				  <a class="nav-link" id="game" href="/game" style="display: none;">Game</a>
			  </li>
			  <li class="nav-item">
				  <a class="nav-link" id="authLink" href="/sign-up">Sign In/Sign Up</a>
			  </li>
		  </ul>
	  </div>
	  </div>
	  </nav>
	  `;
	  
  }

  static get observedAttributes() {
	return ['active'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
	this.render();
	}

  render() {
	const active = this.attributes.active.value;
	const authLink = this.querySelector("#authLink");
	if (active == "true") {
		authLink.textContent = "Logout";
		authLink.onclick = async function () {
			if (authLink.textContent === "Logout") {
				localStorage.removeItem('access_token');
				triggerNavbar();
			}
		};
		this.querySelector('#profile').style.display = "block";
		this.querySelector('#game').style.display = "block";
	}else {
		authLink.textContent = "Sign In/Sign Up";
		this.querySelector('#profile').style.display = "none";
		this.querySelector('#game').style.display = "none";
	}
  }
}

function encodeURIComponent42(string) {
  return encodeURIComponent(string).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

document.addEventListener('DOMContentLoaded', async function () {
	const authLink = this.querySelector("#authLink");
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      authLink.textContent = "Logout";
			authLink.onclick = async function () {
				if (authLink.textContent === "Logout") {
					localStorage.removeItem("access_token");
					authLink.textContent = "Sign In/Sign Up";
				}
			};
    } else {
      authLink.textContent = "Sign In/Sign Up";
      authLink.href = "/sign-up";
    }

	// const code = new URLSearchParams(window.location.search).get('code');
	// let response = "";
	// if (code) {
	// 	try {
	// 		if (window.location.href.includes("google"))
	// 			response =await fetch("https://127.0.0.1:8080/login_with_google?code=" + encodeURIComponent(code));
	// 		else
	// 			response = await fetch("https://127.0.0.1:8080/login_with_42?code=" + encodeURIComponent(code));
	// 		const data = await response.json();
	// 		if (data.token) {
	// 			localStorage.setItem('access_token', data.token);
	// 		}
	// 		// redirect to home page
	// 		window.route({ target: { href: '/' } });
	// 		document.querySelector("my-navbar", (e) => e.setAttribute('active', 'true'))
	// 	} catch (error) {
	// 		console.error('Error:', error);
	// 	}
	// }
});

customElements.define("my-navbar", Navbar);
