import triggerNavbar from "../ModulesJS/TriggerNavbar.js";

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
	<nav class="navbar navbar-expand-xl navbar-dark border-bottom">
    <a class="navbar-brand nav-link" href="/">
        <img src="../Public/logo.png" class="p-1 mx-3" width="120" height="50" alt="">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target=".navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse navbarNavAltMarkup">
        <ul class="navbar-nav ml-auto">
            <li class="nav-item">
                <a class="nav-link" id="home" href="/">Home <span class="sr-only">(current)</span></a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="profile" href="/profile" style="display: none;">Profile</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="social-media" href="/social-media" style="display: none;">Social Media</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="game" href="/game" style="display: none;">Game</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" id="authLink" href="/sign-up">Sign In/Sign Up</a>
            </li>
        </ul>
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
		this.querySelector('#social-media').style.display = "block";
		this.querySelector('#profile').style.display = "block";
		this.querySelector('#game').style.display = "block";
	}else {
		authLink.textContent = "Sign In/Sign Up";
		this.querySelector('#social-media').style.display = "none";
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
});

customElements.define("my-navbar", Navbar);
