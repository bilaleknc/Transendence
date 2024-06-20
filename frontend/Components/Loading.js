class Loading extends HTMLElement {
    constructor() {
        super();
        
        this.innerHTML = `
        <style>
        .textBoxs {
  display:flex;
}

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

        </style>
        <div class="d-flex flex-column justify-content-center align-items-center bg-gradient m-3" style="height: 100vh; gap: 20px;">
            <div id="message" class="h2 text-secondary"></div>
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
            <input id="otp" type="hidden" name="otp" value="">
            <button id="sendCode" type="button" class="btn btn-dark">Kodu Gönder</button>
        </div>
        `
        this.time = null;
        this.render();
        const code = document.querySelector('#sendCode')
        
        code.addEventListener('click', () => {
            this.sendCode();
        });
    }

    disconnectedCallback() {
        this.clearTimer();
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
        const todosArr = this.attributes.page.value;
        let div = document.querySelector("#message");
        this.clearTimer();
        if (todosArr == "register") {
            console.log("selam");
            this.startTime = Date.now();
            this.time = window.setInterval(this.timeChutdown.bind(this), 1000);
        }
    }

    async sendCode() {
        const value = document.querySelector('#otp').value;
        if (value.length != 6) return;
        let data = document.querySelector("my-loading").getAttribute('data');

        try {
            const response = await fetch(`https://localhost:8080/otp?number=${value}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi'
                    },
                    body: data
                }
            );

            if (!response.ok) throw new Error("Network response was not ok");

            const res_data = await response.json();
            console.log(res_data);
        } catch (error) { console.error(error) } 
    }

    timeChutdown() {
        const div = document.querySelector('#message');
        const now = Date.now();
        const elapsed = Math.floor((now - this.startTime) / 1000);
        const remaining = 300 - elapsed; // 5 dakika = 300 saniye

        if (remaining <= 0 || div === null) {
            window.clearInterval(this.time);
            div.textContent = "00:00";
            console.log("selam");
            return;
        }

        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const result = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        div.textContent = result;
        console.log("selam");
    }
}

customElements.define('my-loading', Loading);