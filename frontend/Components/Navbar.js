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
				  <a class="nav-link" href="/sign-up">Sign In/Sign Up</a>
			  </li>
		  </ul>
	  </div>
	  </div>
	  </nav>
	  `;
	}
  
	connectedCallback() {
		//   this.querySelector('#signInLink').addEventListener('click', (e) => {
		// 	e.preventDefault();
		// 	// Burada OAuth işlemi için gerekli yönlendirme yapılabilir
		// 	// Örneğin:
		// 	window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d18dddbdb080ff4297c863cacf173408025c2f1205a01ca72c0346749d360b59&redirect_uri=https%3A%2F%2F127.0.0.1%3A8082%2Fuser%2F42api&response_type=code";
		
		// 	console.log('Redirect işlemi yapıldı.');

		// 	// const queryParams = new URLSearchParams(window.location.search);
		// 	// const code = queryParams.get('code');

		// });
	}
}
  
function encodeURIComponent42(string) {
	return encodeURIComponent(string).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16);
	});
}

document.addEventListener('DOMContentLoaded', async function () {
	const code = new URLSearchParams(window.location.search).get('code');
	if (code) {
		try {
			const response = await fetch("https://127.0.0.1:8080/42api?code=" + encodeURIComponent(code));
			const data = await response.json();
			console.log(data);
			if (data && data.message === 'Success') {
				localStorage.setItem('accessToken', data.access);
				localStorage.setItem('refreshToken', data.refresh);
			}
			// redirect to home page
			window.location.href = '/';
		} catch (error) {
			console.error('Error:', error);
		}
	}
});

customElements.define('my-navbar', Navbar);
