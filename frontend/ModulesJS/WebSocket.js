export default class WS {
    constructor (roomName, player) {
        this.message = null;
        this.isOpen = false;
        this.player = player;
        this.roomName = roomName;
        this.socket = null;
        this.messageQue = [];
        this.receive = null;
    }
    
    onmessage(e) {
        const data = JSON.parse(e.data);
        if (!data)
            return;
        this.message = data;
        this.receive();
    };

    onclose(e) { 
        this.isOpen = false;
        this.socket = null;
    };

    onopen(e) {
        while (this.messageQue.length > 0) {
            this.socket.send(this.messageQue.shift());
        }
        this.isOpen = true;
    };

    begin() {
        this.socket = new WebSocket(`wss://45.157.16.17:8081/wss/socket-server/${this.roomName}/`);
        this.socket.onopen = this.onopen.bind(this);
        this.socket.onmessage = this.onmessage.bind(this);
        this.socket.onclose = this.onclose.bind(this);
    }

    getMessage() { return this.message; }

    sendMessage(message) {
        const messageStr = JSON.stringify({ "message": message })
        if (!this.isOpen){
            this.messageQue.push(messageStr);
        } else {
            try{
                this.socket?.send(messageStr);
            } catch(error) { 
                return;
            }
        }
    }  
};