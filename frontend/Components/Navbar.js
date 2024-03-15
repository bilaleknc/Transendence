class Navbar extends HTMLElement {
	constructor() {
	  super();
	  this.innerHTML = `
	  <nav class="navbar navbar-expand-xl navbar-dark bg-dark border-bottom">
	  <a class="navbar-brand" href="/">
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
			  <li class="nav-item dropdown">
				  <li class="nav-item dropdown">
					  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					  <span class="bi bi-person"></span>
					  </a>
					  <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
						  <a class="dropdown-item" href="#" id="signInLink">Sign In</a>
						  <a class="dropdown-item" href="/sign-up">Sign Up</a>
					  </div>
				  </li>
			  </li>
		  </ul>
	  </div>
	  </div>
	  </nav>
	  `;
	}
  
	connectedCallback() {
	  this.querySelector('#signInLink').addEventListener('click', (e) => {
		e.preventDefault();
		// Burada OAuth işlemi için gerekli yönlendirme yapılabilir
		// Örneğin:
		window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d18dddbdb080ff4297c863cacf173408025c2f1205a01ca72c0346749d360b59&redirect_uri=https%3A%2F%2F127.0.0.1%3A8080%2F42api%2F&response_type=code";
	});
	}
  }
  
  customElements.define('my-navbar', Navbar);
  