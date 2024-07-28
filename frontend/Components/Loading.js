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
        this.time_href = null;
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
            window.clearInterval(this.time);
            this.time = null;
        }
        if (this.time_href) clearTimeout(this.time_href);
    }

    render() {
        let div = document.querySelector("#time");
        this.clearTimer();
        if (this.todosArr == "register" || this.todosArr == "login") {
            div.style.display = "block";
            this.querySelector('#message').textContent = "Enter the OTP code received in your mail";
            this.querySelector('.textBoxs').style.display = "flex";
            this.querySelector('#sendCode').style.display = "block"; 
            this.startTime = Date.now();
            this.time = window.setInterval(this.timeChutdown.bind(this), 1000);
        } else if (this.todosArr == "42") {
            div.style.display = "none";
            this.startTime = Date.now();
            this.time = window.setInterval(this.timeChutdown.bind(this), 1000);
            this.querySelector('#message').textContent = "42 is Logged in with API...";
            const timeId = setInterval(() => {
                if (localStorage.getItem('code') != null) {
                    this.login42(localStorage.getItem('code'))
                    clearInterval(timeId);
                }
            }, 500);
        } else {
            this.time_href = setTimeout(() => {
                window.route( { target: { href: "/"} } )
            }, 2000);
        }
    }

    async login42(code) {
        let response = "";
        if (code) {
            try {
                response = await fetch("https://45.157.16.17:8080/login_with_42?code=" + code);
                const data = await response.json();
                
                if (data.access) {
					localStorage.setItem('access', data.access);
					localStorage.setItem('refresh', data.refresh);
                    localStorage.setItem('username', data.username);
                    localStorage.removeItem('code');
                    window.route({ target: { href: '/' } });
                    triggerNavbar();
                } else {
                    error.call(this, data, 0);
                }
            } catch (error) {
                error.call(this, {"errror": error}, 0)
				console.log("error burda");
            }
        }
    }

    async sendCode() {
        const value = document.querySelector('#otp').value;
        if (value.length != 6) return;
        let data = document.querySelector("my-loading").getAttribute('data');
        let username = document.querySelector("my-loading").getAttribute('username');
        let password = document.querySelector("my-loading").getAttribute('password');
		localStorage.setItem('username', username);
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
			localStorage.setItem('access', resData.access);
			localStorage.setItem('refresh', resData.refresh);
            triggerNavbar();
            window.route({ target: { href: '/' } });
            
        } catch (error) { return; } 
    }

    async notActive() {
        const token = localStorage.getItem('access');
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