import error from "../ModulesJS/ErrorUtils.js";
import triggerNavbar from "../ModulesJS/TriggerNavbar.js";

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
                <div id="error-content">
                    <my-error name="" content=""><my-error>
                </div>
                <button type="submit" class="btn">Giriş Yap</button>
                <div class="social-login">
                    <button id= "login-42" type="button" class="btn social-btn">42 API ile Giriş Yap</button>
                    <button id= "login-google" type="button" class="btn social-btn" >Google ile Giriş Yap</button>
                    <div class="g-signin2" data-onsuccess="onSignIn"></div>
                </div>
            </form>
		<form id="register-form" class="form">
			<h2>Üye Ol</h2>
			<div class="input-group">
				<label for="register-username">Kullanıcı Adı</label>
				<input type="text" id="register-username" name="username" required>
			</div>
			<div class="input-group">
				<label for="register-email">Email</label>
				<input type="email" id="register-email" name="email" required>
			</div>
			<div class="input-group">
				<label for="register-password">Şifre</label>
				<input type="password" id="register-password" name="password" required>
			</div>
			<div class="input-group">
				<label for="register-password2">Şifre Tekrar</label>
				<input type="password" id="register-password2" name="password2" required>
			</div>
            <div id="error-content">
                <my-error name="" content=""><my-error>
            </div>
			<button type="submit" class="btn">Üye Ol</button>
		</form>

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
        .addEventListener('click', () => this.ApiRemoteSign('42'));
        this.querySelector('#login-google').addEventListener('click', () => this.ApiRemoteSign('google'))
		this.querySelector('#login-form').addEventListener('submit', (e) => this.login(e));
		this.querySelector('#register-form').addEventListener('submit', (e) => this.register(e));
	}

	static get observedAttributes() {
		return ['active'];
	}

	attributeChangedCallback(name, oldValue, newValue){
		this.render();
	}

    // Giriş yap ve Üye ol formunu göster
	render() {
        const isActive = this.getAttribute('active') === 'true';
    
        if (isActive) {
            this.querySelector('#login-toggle').classList.add('active');
            this.querySelector('#register-toggle').classList.remove('active');
    
            this.querySelector('#login-form').classList.add('active');
            this.querySelector('#register-form').classList.remove('active');
        } else {
            this.querySelector('#login-toggle').classList.remove('active');
            this.querySelector('#register-toggle').classList.add('active');
    
            this.querySelector('#login-form').classList.remove('active');
            this.querySelector('#register-form').classList.add('active');
        }
    }

	// 42 API ve Google API ile giriş işlemi
	async ApiRemoteSign(provider) {
		let url = ''
		if (provider === '42')
			url = 'https://localhost:8080/direct_42_login_page';
		else
            url = 'https://localhost:8080/direct_google_login_page';
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
			}
		});
		const data = await response.json();
		if (data.url) {			
            console.log(data.url)
            var newWindow = window.open(data.url, '_blank');
            triggerNavbar();
		}
	}

    // Google OAuth 2.0 ile giriş işlemi
    async  googleSign() {
        const googleClientId = '204922017437-i21jnhaels3usdqpacphkc8r093f4lq6.apps.googleusercontent.com';
        const redirectUri = 'https://127.0.0.1:8082';
        const scope = 'profile email';
        const responseType = 'token';
    
        const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
        const googleWindow = window.open(authUrl, '_target');
    }

	async login(e) {
		e.preventDefault();
		const username = this.querySelector('#login-username').value;
		const password = this.querySelector('#login-password').value;

		fetch('https://localhost:8080/login', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
				'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
			},
			body: JSON.stringify({
					username: username,
					password: password
				})
		}).then(response => response.json())
		.then(data => {
			if (data.success) {
                error.call(this, data, 0);
                this.innerHTML = `<my-loading page="login" username="${username}""></my-loading>`
			}else {
                error.call(this, data, 0);
            }
		}).catch((error) => {
            console.error('Error:', error);
        });
	}

    async register(e) {
        e.preventDefault();
        console.log("register");
    
        const username = this.querySelector('#register-username').value;
        const email = this.querySelector('#register-email').value;
        const password = this.querySelector('#register-password').value;
        const password2 = this.querySelector('#register-password2').value;
    
        try {
            const response = await fetch('https://localhost:8080/register', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password,
                    password2: password2,
                })
            });
            
            const resData = await response.json();
            
            if (!response.ok) {
                error.call(this, resData, 1);
                return;
            }
            console.log(resData);
            error.call(this, resData, 1);
            this.innerHTML = `<my-loading page="register" username="${username}" password="${password}"></my-loading>`
        } catch (error) {
            console.log('Error:', error);
        }
    }

    
}


customElements.define('my-signup', Signup);
