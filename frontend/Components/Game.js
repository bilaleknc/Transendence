import Play from "../static/offline_pingpong.js";

class Game extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <main id="main-content" class="d-flex justify-content-center align-items-center bg-gradient" style="height: 70vh;">
                <div id="button-options" class="d-flex flex-column align-items-center w-100">
                    <h1> Game Options </h1>
                    <button id="two-player" class="btn btn-dark w-25 p-3 mt-2">Two Player</button>
                    <button id="remote" class="btn btn-dark w-25 p-3 mt-2">Remote Player</button>
                    <button id="tournament" class="btn btn-dark w-25 p-3 mt-2">Tournament</button>
                </div>
            </main>
            <div id="game-area" style="display: none !important;"></div>
            <div id="remote-container" style="display: none !important;" class="d-flex flex-column align-items-center w-100">
                <h2>Available Rooms</h2>
                <ul id="roomList" class="list-group w-50 mb-4"></ul>
                <h2>Create New Room</h2>
                <input type="text" id="newRoomName" class="form-control w-50" placeholder="Room Name">
                <button id="createRoomBtn" class="btn btn-dark w-25 p-3 mt-2">Create Room</button>
            </div>	
        `;
        console.log("constructor")
        window.gameEnd = false;
        this.querySelector('#two-player').addEventListener('click', () => this.twoPlayer());
        this.querySelector('#remote').addEventListener('click', () => this.remotePlayer());
        this.querySelector('#createRoomBtn').addEventListener('click', () => this.createRoom());
    }

    disconnectedCallback() {
        const style = document.getElementById('pingpong-style');
        if (style) {
            style.remove();
        }
        window.gameEnd = true;
    }

    dsplNone() {
        const style = document.createElement('style');
        style.id = "pingpong-style";
        style.innerHTML = `
            #main-content { display: none !important; }
            my-navbar { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    twoPlayer() {
        this.dsplNone();
        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'game-canvas';
        canvasElement.width = "100%";
        canvasElement.height = "100%";
        this.querySelector('#game-area').appendChild(canvasElement);

        const styleElement = document.createElement('style');
        styleElement.textContent = `
            #game-canvas {
                background: #000;
                margin: 0 auto;
                padding: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
            }
        `;

        this.appendChild(styleElement);
        const play = new Play();
        play.loop();
    }

    async fetchRooms() {
        try {
            const response = await fetch('https://127.0.0.1:8081/get_rooms');
            const data = await response.json();
            const roomList = this.querySelector('#roomList');
            roomList.innerHTML = '';
            data.rooms.forEach(room => {
                const li = document.createElement('li');
                li.textContent = room;
                li.classList.add('list-group-item');
                roomList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching rooms:', error);
        }
    }

    async createRoom() {
        const roomName = this.querySelector('#newRoomName').value;
        if (roomName) {
            try {
                const response = await fetch('https://127.0.0.1:8081/create_room', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `room_name=${roomName}`
                });
                const data = await response.json();
                if (data.status === 'success') {
                    this.fetchRooms();
                    this.querySelector('#newRoomName').value = '';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error creating room:', error);
            }
        }
    }

    async remotePlayer() {
        this.dsplNone();
        this.querySelector('#game-area').style.display = 'none';
        this.querySelector('#remote-container').style.display = 'flex';
        await this.fetchRooms();
    }
}

customElements.define('my-game', Game);
