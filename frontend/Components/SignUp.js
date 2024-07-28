import error from "../ModulesJS/ErrorUtils.js";

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
                        <h2 class="text-center">Giriş Yap</h2>
                        <div class="input-group">
                            <label for="login-username">Kullanıcı Adı</label>
                            <input type="text" id="login-username" required autocomplete="username">
                        </div>
                        <div class="input-group">
                            <label for="login-password">Şifre</label>
                            <input type="password" id="login-password" required autocomplete="current-password">
                        </div>
                        <div id="error-content">
                            <my-error name="" content=""><my-error>
                        </div>
                        <button type="submit" class="btn" id="login-submit">Giriş Yap</button>
                        <div class="social-login">
                            <button id="login-42" type="button" class="btn social-btn">42 API ile Giriş Yap</button>
                            <div class="g-signin2" data-onsuccess="onSignIn"></div>
                        </div>
                    </form>
                    <form id="register-form" class="form">
                        <h2 class="text-center">Üye Ol</h2>
                        <div class="input-group">
                            <label for="register-username">Kullanıcı Adı</label>
                            <input type="text" id="register-username" name="username" required>
                        </div>
                        <div class="input-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" name="email" required autocomplete="username">
                        </div>
                        <div class="input-group">
                            <label for="register-password">Şifre</label>
                            <input type="password" id="register-password" name="password" required autocomplete="new-password">
                        </div>
                        <div class="input-group">
                            <label for="register-password2">Şifre Tekrar</label>
                            <input type="password" id="register-password2" name="password2" required autocomplete="new-password">
                        </div>
                        <div id="error-content">
                            <my-error name="" content=""><my-error>
                        </div>
                        <button type="submit" class="btn" id="register-submit">Üye Ol</button>
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
        this.querySelector('#login-form').addEventListener('submit', (e) => this.login(e));
        this.querySelector('#register-form').addEventListener('submit', (e) => this.register(e));
    }

    static get observedAttributes() {
        return ['active'];
    }

    attributeChangedCallback(name, oldValue, newValue){
        this.render();
    }

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

    async ApiRemoteSign(provider) {
        let url = ''
        if (provider === '42')
            url = 'https://45.157.16.17:8080/direct_42_login_page';
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
            }
        });
        const data = await response.json();
        if (data.url) {            
            var newWindow = window.open(data.url, '_blank');
            this.innerHTML = "<my-loading page='42'></my-loading>"
        }
    }

    async login(e) {
        e.preventDefault();
        const loginButton = this.querySelector('#login-submit');
        loginButton.disabled = true; // Butonu devre dışı bırak
        const username = this.querySelector('#login-username').value;
        const password = this.querySelector('#login-password').value;

        try {
            const response = await fetch('https://45.157.16.17:8080/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();
            if (data.ok) {
                this.innerHTML = `<my-loading page="login" username="${username}""></my-loading>`;
            } else {
                error.call(this, data, 0);
            }
        } catch (error) {
            console.error(error);
        } finally {
            loginButton.disabled = false; // Butonu tekrar etkinleştir
        }
    }

    async register(e) {
        e.preventDefault();
        const registerButton = this.querySelector('#register-submit');
        registerButton.disabled = true; // Butonu devre dışı bırak
        const username = this.querySelector('#register-username').value;
        const email = this.querySelector('#register-email').value;
        const password = this.querySelector('#register-password').value;
        const password2 = this.querySelector('#register-password2').value;

        try {
            const response = await fetch('https://45.157.16.17:8080/register', {
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
            error.call(this, resData, 1);
            this.innerHTML = `<my-loading page="register" username="${username}" password="${password}"></my-loading>`;
        } catch (error) {
            console.error(error);
        } finally {
            registerButton.disabled = false; // Butonu tekrar etkinleştir
        }
    }
}

customElements.define('my-signup', Signup);
