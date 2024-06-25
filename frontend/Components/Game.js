import Play from "../static/offline_pingpong.js";
import remoteGame from "../static/remote_pingpong.js";

class Game extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <main id="main-content" class="d-flex justify-content-center align-items-center bg-gradient" style="height: 70vh;">
                <div id="button-options" class="d-flex flex-column align-items-center w-100">
                    <h1>Game Options</h1>
                    <button id="two-player" class="btn btn-dark w-25 p-3 mt-2">Two Player</button>
                    <button id="remote" class="btn btn-dark w-25 p-3 mt-2">Remote Player</button>
                    <button id="tournament" class="btn btn-dark w-25 p-3 mt-2">Tournament</button>
                </div>
            </main>
            <div id="game-area"></div>
            <div id="room-list" class="container mt-5" style="display: none;">
                <h2>Available Rooms</h2>
                <ul id="rooms" class="list-group"></ul>
                <input type="text" id="room-name" class="form-control mt-3" placeholder="Enter room name">
                <button id="create-room" class="btn btn-primary mt-2">Create Room</button>
            </div>
        `;
        window.gameEnd = false;
        this.querySelector('#two-player').addEventListener('click', () => this.twoPlayer());
        this.querySelector('#remote').addEventListener('click', () => this.remotePlayer());
        this.querySelector('#create-room').addEventListener('click', () => this.createRoom());
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
        canvasElement.width = "50%";
        canvasElement.height = "50%";
        this.querySelector('#game-area').appendChild(canvasElement);

        const styleElement = document.createElement('style');
        styleElement.textContent = `
            #game-canvas {
                background: #000;
                margin: 0 auto;
                padding: 0;
                width: 50%;
                height: 50%;
                z-index: 1000;
            }
        `;

        this.appendChild(styleElement);
        const play = new Play();
        play.loop();
    }

    async remotePlayer() {
        this.dsplNone();
        document.getElementById('room-list').style.display = 'block';
        await this.fetchRooms();
    }


	async fetchRooms() {
    try {
        const response = await fetch('https://127.0.0.1:8081/get_rooms');
        const data = await response.json();
        const roomList = this.querySelector('#rooms');
        roomList.innerHTML = '';
        data.rooms.forEach(room => {
            const roomItem = document.createElement('li');
            roomItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            roomItem.textContent = room;
            const joinButton = document.createElement('button');
            joinButton.classList.add('btn', 'btn-primary');
            joinButton.textContent = 'Join';
            joinButton.addEventListener('click', () => this.joinRoom(room));
            roomItem.appendChild(joinButton);
            roomList.appendChild(roomItem);
        });
    } catch (error) {
        console.error('Error fetching rooms:', error);
    }
}

    async createRoom() {
        const roomName = this.querySelector('#room-name').value;
        if (roomName) {
            try {
                const response = await fetch('https://127.0.0.1:8081/create_room/', {
                    method: 'POST',
                    headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                    },
                    body: JSON.stringify({ room_name: roomName })
                });
                const data = await response.json();
				console.log(data)
				alert(data.message);
                if (data.status === 'success') {
                    this.fetchRooms();
                    this.querySelector('#room-name').value = '';
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error creating room:', error);
            }
        }
    }

    async joinRoom(room) {
        try {
            const response = await fetch(`https://127.0.0.1:8081/join_room/${room}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const data = await response.json();
            if (data.status === 'waiting') {
				this.startGame(room);
                alert('Waiting for another player to join...');
                // this.waitForOpponent(room);
            } else if (data.status === 'start') {
                this.startGame(room);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error joining room:', error);
        }
    }

	async leaveRoom(room) {
		try {
			const response = await fetch(`https://127.0.01:8081/leave_room/${room}/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});
			const data = await response.json();
			if (data.status === 'success') {
				this.fetchRooms();
			}
		} catch (error) {
			console.error('Error leaving room:', error);
		}
	}


    startGame(roomName) {
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
        this.querySelector('#game-area').style.display = 'block';

		remoteGame.waitingForPlayers(roomName);
    }
}

customElements.define('my-game', Game);
