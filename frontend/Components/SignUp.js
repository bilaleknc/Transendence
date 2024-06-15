class Signup extends HTMLElement {
	constructor() {
	  super();
	  this.innerHTML = `
		<div id="sign-page">
    <div class="container">
        <div class="toggle-buttons">
            <button id="login-toggle" class="toggle-btn active">Giriş Yap</button>
            <button id="register-toggle" class="toggle-btn">Üye Ol</button>
        </div>
        <div class="form-container">
            <form id="login-form" class="form active">
                <h2>Giriş Yap</h2>
                <div class="input-group">
                    <label for="login-username">Kullanıcı Adı</label>
                    <input type="text" id="login-username" required>
                </div>
                <div class="input-group">
                    <label for="login-password">Şifre</label>
                    <input type="password" id="login-password" required>
                </div>
                <button type="submit" class="btn">Giriş Yap</button>
                <div class="social-login">
                    <button id= "login-42" type="button" class="btn social-btn">42 API ile Giriş Yap</button>
                    <button id= "google-login" type="button" class="btn social-btn" >Google ile Giriş Yap</button>
                    <div class="g-signin2" data-onsuccess="onSignIn"></div>
                </div>
            </form>
            <form id="register-form" class="form">
                <h2>Üye Ol</h2>
                <div class="input-group">
                    <label for="register-username">Kullanıcı Adı</label>
                    <input type="text" id="register-username" required>
                </div>
                <div class="input-group">
                    <label for="register-password">Şifre</label>
                    <input type="password" id="register-password" required>
                </div>
                <button type="submit" class="btn">Üye Ol</button>
            </div>
        </form>
    </div>
</div>
</div>
	  `;

      
	}
  
	connectedCallback() {
		this.render();
        this.querySelector('#login-toggle')
        .addEventListener('click', () => this.setAttribute('active', 'true'));
		this.querySelector('#register-toggle')
        .addEventListener('click', () => this.setAttribute('active', 'false'));
        this.querySelector('#login-42')
        .addEventListener('click', () => this.Api42Sign());

	}

	static get observedAttributes() {
		return ['active'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		this.render();
	}

	render() {
		const todosArr = this.attributes.active.value;
		if (todosArr == "true") {
			this.querySelector('#login-form').style.display = "flex";
			this.querySelector('#register-form').style.display = "none";
		}else {
			this.querySelector('#login-form').style.display = "none";
			this.querySelector('#register-form').style.display = "flex";
		}
	}

    Api42Sign() {
        // Burada OAuth işlemi için gerekli yönlendirme yapılabilir
        // Örneğin:
        window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d18dddbdb080ff4297c863cacf173408025c2f1205a01ca72c0346749d360b59&redirect_uri=https%3A%2F%2F127.0.0.1%3A8082%2Fuser%2F42api&response_type=code";

        // const queryParams = new URLSearchParams(window.location.search);
        // const code = queryParams.get('code');
    }

    googleSign() {
        
    }
}


customElements.define('my-signup', Signup);
