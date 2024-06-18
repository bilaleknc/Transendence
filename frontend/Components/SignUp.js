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
			<button type="submit" class="btn">Üye Ol</button>
		</form>

            </div>
        </form>
    </div>
</div>
</div>
	  `;

      
	}
  
    async autoValue (){
        // username ve password değerlerini otomatik doldur
        const username = this.querySelector('#login-username').value;
        const email = this.querySelector('#register-email').value;
        const password = this.querySelector('#login-password').value;
        const password2 = this.querySelector('#register-password2').value;

        this.querySelector('#register-username').value = "eren";
        this.querySelector('#register-email').value = "eren@gmail.com";
        this.querySelector('#register-password').value = "123456";
        this.querySelector('#register-password2').value = "123456";
    }

	connectedCallback() {
		this.render();
        this.autoValue();
        this.querySelector('#login-toggle')
        .addEventListener('click', () => this.setAttribute('active', 'true'));
		this.querySelector('#register-toggle')
        .addEventListener('click', () => this.setAttribute('active', 'false'));
        this.querySelector('#login-42')
        .addEventListener('click', () => this.Api42Sign());
        this.querySelector('#login-google').addEventListener('click', () => this.googleSign())
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
		// if(getCookie("access_token"))
		// {
		// 	window.route({ target: { href: '/' } });
		// 	notify('Already logged in', 3, 'success')
		// }
		const todosArr = this.attributes.active.value;
		if (todosArr == "true") {
			this.querySelector('#login-form').style.display = "flex";
			this.querySelector('#register-form').style.display = "none";
		}else {
			this.querySelector('#login-form').style.display = "none";
			this.querySelector('#register-form').style.display = "flex";
		}
	}

    async Api42Sign() {
		const response = await fetch('https://localhost:8080/direct_42_login_page', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
			}
		});
		const data = await response.json();
		if (data.oauth_url) {
			window.location.href = data.oauth_url
		}
        // window.location.href = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-d18dddbdb080ff4297c863cacf173408025c2f1205a01ca72c0346749d360b59&redirect_uri=https%3A%2F%2F127.0.0.1%3A8082%2F&response_type=code";
    }

    // Google OAuth 2.0 ile giriş işlemi
    async  googleSign() {
        const googleClientId = '204922017437-i21jnhaels3usdqpacphkc8r093f4lq6.apps.googleusercontent.com';
        const redirectUri = 'https://127.0.0.1:8082';
        const scope = 'profile email';
        const responseType = 'token';
    
        // Google giriş penceresini aç
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
			body: JSON.stringify(
				{
					username: username,
					password: password
				})
		}).then(response => response.json())
		.then(data => {
			if (data.error) {
				alert(data.error);
			}else {
                const { token } = data;
                localStorage.setItem('access_token', token);
                console.log(localStorage.getItem('access_token'));
				alert('Logged in success');
				window.route({ target: { href: '/' } });
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
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const resData = await response.json();
            if (resData.error) {
                alert(resData.error, 3, 'error');
            } else {
                alert('Registered', 3, 'success');
                // window.route({ target: { href: '/' } });
				window.location.href = '/sign-up';
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}


customElements.define('my-signup', Signup);
