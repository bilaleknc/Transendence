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
		  <form class="mr-3" style="width: 250px;">
			  <input type="search" class="form-control rounded" placeholder="Find a friend"
			  aria-label="Search" aria-describedby="search-addon" />
		  </form>
		  <ul class="navbar-nav">
			  <li class="nav-item active">
				  <a class="nav-link" href="/">Home <span class="sr-only">(current)</span></a>
			  </li>
			  <li class="nav-item">
				  <a class="nav-link" href="/game">Game</a>
			  </li>
			  <li class="nav-item">
				  <a class="nav-link" href="/live-chat">Live Chat</a>
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

  connectedCallback() {
    const authLink = this.querySelector("#authLink");
    const accessToken = localStorage.getItem("access_token");
    if (accessToken) {
      console.log("accessToken:", accessToken);
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
  }
}

function encodeURIComponent42(string) {
  return encodeURIComponent(string).replace(/[!'()*]/g, function (c) {
    return "%" + c.charCodeAt(0).toString(16);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  const code = new URLSearchParams(window.location.search).get("code");
  if (code) {
    try {
      const response = await fetch(
        "https://127.0.0.1:8080/login_with_42?code=" + encodeURIComponent(code)
      );
      const data = await response.json();
	    console.log(data);
      if (data.token) {
        localStorage.setItem("accessToken", data.token);
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Error:", error);
    }
  }
});

customElements.define("my-navbar", Navbar);
