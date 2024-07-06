import error from "../ModulesJS/ErrorUtils.js";
import triggerNavbar from "../ModulesJS/TriggerNavbar.js";

class Loading extends HTMLElement {
    constructor() {
        super();
        
        this.innerHTML = `
        <style>
            input {
                width: 64px;
                height: 64px;
                padding: 8px;
                font-size: 24px;
                font-weight: bold;
                background: #37474f;
                border: 8px solid #37474f;
                border-radius: 4px;
                margin: 4px;
                color: white!important;
                text-align: center;
                caret-color: transparent;
                outline: false;
                line-height:32px;
            }

            input:focus {
                border-bottom: 8px solid #42a5f5;
                outline: false;
                animation-name: blinking;
                animation-duration: 1s;
                animation-iteration-count: 50;
            }

            @keyframes blinking {
                50% {
                    border-bottom: 8px solid #fff;
                }
            }
            .textBoxs,
            #sendCode,
            #error-content  {
                display: none;
            }
        </style>
        <div class="d-flex flex-column justify-content-center align-items-center bg-gradient m-3" style="height: 100vh; gap: 20px;">
            <div id="time" class="h2 text-secondary"></div>
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
            <div class="textBoxs">
                <input type="text" maxlength="1" onkeydown="moveToNextTextbox(event, 1)">
                <input type="text" maxlength="1" onkeydown="moveToNextTextbox(event, 2)">
                <input type="text" maxlength="1" onkeydown="moveToNextTextbox(event, 3)">
                <input type="text" maxlength="1" onkeydown="moveToNextTextbox(event, 4)">
                <input type="text" maxlength="1" onkeydown="moveToNextTextbox(event, 5)">
                <input type="text" maxlength="1" onkeydown="moveToNextTextbox(event, 6)">
            </div>
            <div id="message" class="h6 text-secondary"></div>
            <input id="otp" type="hidden" name="otp" value="">
            <div id="error-content">
                <my-error name="" content=""><my-error>
            </div>
            <form id="sendCode">
                <button type="submit" class="btn btn-dark">Kodu Gönder</button>
            </form>
        </div>
        `
        this.time = null;
        this.render();
        this.todosArr = this.attributes.page?.value;
        this.username = this.attributes.username?.value;
        const code = document.querySelector('#sendCode')
        code?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendCode();
        });

    }

    disconnectedCallback() {
        this.clearTimer();
        if (this.todosArr == 'register')
            this.notActive();
    }

    static get observedAttributes() {
        return ['page'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        this.render();
    }

    clearTimer() {
        if (this.time != null) {
            console.log("time: " + this.time);
            window.clearInterval(this.time);
            this.time = null;
        }
    }

    render() {
        let div = document.querySelector("#time");
        this.clearTimer();
        if (this.todosArr == "register" || this.todosArr == "login") {
            this.querySelector('#message').textContent = "Enter the OTP code received in your mail";
            this.querySelector('.textBoxs').style.display = "flex";
            this.querySelector('#sendCode').style.display = "block"; 
            this.startTime = Date.now();
            this.time = window.setInterval(this.timeChutdown.bind(this), 1000);
        }
    }

    async sendCode() {
        const value = document.querySelector('#otp').value;
        if (value.length != 6) return;
        let data = document.querySelector("my-loading").getAttribute('data');
        let username = document.querySelector("my-loading").getAttribute('username');
        let password = document.querySelector("my-loading").getAttribute('password');

        try {
            const response = await fetch(`https://45.157.16.17:8080/otp?username=${username}&number=${value}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
                    },
                    body: data
                }
            );
            
            const resData = await response.json();
            if (!response.ok) {
                error.call(this, resData, 0)
                return;
            }
            error.call(this, resData, 0);
            localStorage.setItem('access_token', resData.token);
            triggerNavbar();
            window.route({ target: { href: '/' } });
            
        } catch (error) { console.error(error) } 
    }

    async login(username, password) {
        fetch('https://45.157.16.17:8080/login', {
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
			if (data.token) {
				const { token, username } = data;
                localStorage.setItem('access_token', token);
                localStorage.setItem('username', username);
                triggerNavbar();
				window.route({ target: { href: '/' } });
			}else {
                alert('Invalid username or password');
			}
		}).catch((error) => {
            console.error('Error:', error);
        });
    }

    async notActive() {
        const token = localStorage.getItem('access_token');
        if (token) return;
        const json = JSON.stringify( { username: this.username } );
        const response = await fetch(`https://45.157.16.17:8080/notactive`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
            },
            body: json
        });
        if (!response.ok) console.log("Error: notActive");
    }

    timeChutdown() {
        const div = document.querySelector('#time');
        const now = Date.now();
        const elapsed = Math.floor((now - this.startTime) / 1000);
        const remaining = 180 - elapsed; // 5 dakika = 300 saniye

        if (remaining <= 0 || div === null) {
            window.clearInterval(this.time);
            div.textContent = "00:00";
            this.notActive();
            window.route({ target: { href: '/' } });
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const result = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        div.textContent = result;
    }
}

customElements.define('my-loading', Loading);