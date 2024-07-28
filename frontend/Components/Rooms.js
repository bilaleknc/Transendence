import RemoteGame from "../static/remote_pingpong.js";
import error from "../ModulesJS/ErrorUtils.js";


class Rooms extends HTMLElement {
    constructor() {
        super();
        this.innerHTML = `
            <div id="error-content">
                <my-error name="" content=""><my-error>
            </div>
            <div id="room-list" class="container mt-5">
                <div class="d-flex justify-content-between align-items-center">
                    <h2>Available Rooms</h2>
                    <button id="refresh-rooms" class="btn btn-warning">Refresh</button>
                </div>
                <ul id="rooms" class="list-group"></ul>
                <div class="input-group mt-3">
                    <input type="text" id="room-name" class="form-control" placeholder="Enter room name">
                    <button id="create-room" class="btn btn-success">Create Room</button>
                </div>
            </div>
        `
        this.querySelector('#create-room').addEventListener('click', () => this.createRoom());
        this.querySelector('#refresh-rooms').addEventListener('click', () => this.fetchRooms());
        this.fetchRooms();
    }

    disconnectedCallback() {
		clearInterval(this.time_id);
	}

    async createRoom() {
        const roomName = this.querySelector('#room-name').value;
        if (!/^[a-zA-Z0-9]+$/.test(roomName)) {
            error.call(this, {"error": 'Room name can only contain letters and numbers.'})
            return;
        }
        let roomList = this.querySelector('#rooms');
        for (let i = 0; i < roomList.children.length; i++) {
            if (roomList.children[i].textContent === roomName+"Join") {
                error.call(this, {"error": 'Room name already exists.'})
                return;
            }       
        }
        if (roomName) {
            try {
                const response = await fetch('https://45.157.16.17:8081/create_room/', {
                    method: 'POST',
                    headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
						'X-CSRFToken': 'sgCUgxQk3cN51WA7p0uKTXsZbYsnDSupQgS3ktHTfmDK00t8woOMSXuVMchJwlTi',
                    },
                    body: JSON.stringify({ room_name: roomName })
                });
                const data = await response.json();
                if (data.status === 'success') {
                    error.call(this, {"success": "the room was successfully formed"})
                    this.fetchRooms();
                    this.querySelector('#room-name').value = '';
                } else {
                    error.call(this, {"error": data.message})
                }
            } catch (error) {
                return;
            }
        }
    }
    
    async fetchRooms() {
        try {
            const response = await fetch('https://45.157.16.17:8081/get_rooms');
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
                joinButton.addEventListener('click', (e) => {
                    this.joinRoom(room)
                });
                roomItem.appendChild(joinButton);
                roomList.appendChild(roomItem);
            });
        } catch (error) {
            return;
        }
    }

    async joinRoom(room) {
        try {
			// room'u ve username'i gönder
			const roomData = {room: room, username: localStorage.getItem('username')}
            const response = await fetch(`https://45.157.16.17:8081/join_room/`,
				{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
				body: JSON.stringify(roomData)
            });
            const data = await response.json();
			
			if (data.message === 'waiting') {
                window.route( {target: { 
                    href: `/game-area?room=${room}&player=1`
                }})
            } else if (data.message === 'start') {
                window.route( {target: { 
                    href: `/game-area?room=${room}&player=2`
                }})
            } else {
				error.call(this, data)
			}
        } catch (error) {
            return;
        }
    }

};

customElements.define("my-remote", Rooms);
