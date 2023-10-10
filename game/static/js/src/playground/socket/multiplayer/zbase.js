class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("ws://82.156.1.194:8000/wss/multiplayer/");

        this.start();
    }

    start() {
        this.receive();
    }

    receive() {
        this.ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            const uuid = data.uuid;
            if (uuid === this.uuid) return false;
            console.log(uuid, this.uuid);

            const event = data.event;
            if (event === "create_player") {
                this.receive_create_player(uuid, data.username, data.photo);
            }

            console.log(data);
        };
    }

    send_create_player(username, photo) {
        this.ws.send(JSON.stringify({
            'uuid': this.uuid,
            'event': 'create_player',
            'username': username,
            'photo': photo,
        }));
    }

    receive_create_player(uuid, username, photo) {
        let player = new Player(
            this.playground,
            this.playground.width / 2 / this.playground.scale,
            0.5,
            0.05,
            "white",
            0.15,
            "enemy",
            username,
            photo,
        );
        player.uuid = uuid;
        this.playground.players.push(player);
    }
}