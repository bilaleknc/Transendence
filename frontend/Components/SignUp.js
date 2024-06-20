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
            <div id="error">
				<label id="error-msg"></label>
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
        this.querySelector('#register-email').value = "seyitakkus44@gmail.com";
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
		const todosArr = this.attributes.active.value;
		if (todosArr == "true") {
			this.querySelector('#login-form').style.display = "flex";
			this.querySelector('#register-form').style.display = "none";
		}else {
			this.querySelector('#login-form').style.display = "none";
			this.querySelector('#register-form').style.display = "flex";
		}
	}

	// 42 API ve Google API ile giriş işlemi
	async ApiRemoteSign(provider) {
		let url = ''
		if (provider === '42')
			url = 'https://localhost:8080/direct_42_login_page';
		else
            url = 'https://localhost:8080/direct_google_login_page';
		console.log(url);
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
			}
		});
		console.log(url);
		const data = await response.json();
		console.log(data);
		alert(data)
		if (data.url) {
			// bu url'istek at ve code'u al
			
			window.location.href = data.url
		}
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
			body: JSON.stringify({
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
            // hata parserleme yapılmamış login kontrolleri yapılması lazım.
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
        let json = JSON.stringify({
            username: username,
            email: email,
            password: password,
            password2: password2,
        })

        !await this.checkMail(json)
        // try {
        //     const response = await fetch('https://localhost:8080/register', {
        //         method: 'POST',
        //         headers: {
        //             'Accept': 'application/json',
        //             'Content-Type': 'application/json',
        //             'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
        //         },
        //         body: json
        //     });
    
        //     if (!response.ok) {
        //         throw new Error('Network response was not ok');
        //     }
    
        //     const resData = await response.json();
        //     if (resData.error) {
        //         alert(resData.error, 3, 'error');
        //     } else {
        //         alert('Registered', 3, 'success');
        //         // window.route({ target: { href: '/' } });
        //         // window.location.href = '/sign-up';
        //     }
        // } catch (error) {
        //     console.error('Error:', error);
        // }     
    }

    async checkMail(json) {
        try {
            const response = await fetch('https://localhost:8080/checkMail', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
                },
                body: json
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const data = await response.json();
            console.log(data);
            this.innerHTML = `<my-loading page="register" data='${JSON.stringify(json)}' ></my-loading>`
            return true;
        } catch (error) { console.error(error) } 
        return false;
    }
}


customElements.define('my-signup', Signup);
