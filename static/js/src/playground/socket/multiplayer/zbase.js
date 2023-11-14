class MultiPlayerSocket {
    constructor(playground) {
        this.playground = playground;

        this.ws = new WebSocket("wss://app5415.acapp.acwing.com.cn/wss/multiplayer/");

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

            const event = data.event;
            if (event === "create_player") {
                this.receive_create_player(uuid, data.username, data.photo);
            } else if (event === 'move_to') {
                this.receive_move_to(uuid, data.tx, data.ty);
            } else if (event === 'shoot_fireball') {
                this.receive_shoot_fireball(uuid, data.tx, data.ty, data.ball_uuid);
            } else if (event === 'attack') {
                this.receive_attack(uuid, data.attackee_uuid, data.x, data.y, data.angle, data.damage, data.ball_uuid);
            } else if (event === 'blink') {
                this.receive_blink(uuid, data.tx, data.ty);
            } else if (event == 'message') {
                this.receive_message(uuid, data.username, data.text);
            }
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

    send_move_to(tx, ty) {
        this.ws.send(JSON.stringify({
            'event': 'move_to',
            'uuid': this.uuid,
            'tx': tx,
            'ty': ty,
        }));
    }

    get_player(uuid) {
        for (const player of this.playground.players) {
            if (player.uuid === uuid) return player;
        }
        return null;
    }

    receive_move_to(uuid, tx, ty) {
        const player = this.get_player(uuid);
        if (player) {
            player.move_to(tx, ty);
        }
    }

    send_shoot_fireball(tx, ty, ball_uuid) {
        this.ws.send(JSON.stringify({
            'event': 'shoot_fireball',
            'uuid': this.uuid,
            'tx': tx,
            'ty': ty,
            'ball_uuid': ball_uuid
        }));
    }

    receive_shoot_fireball(uuid, tx, ty, ball_uuid) {
        const player = this.get_player(uuid);
        if (player) {
            const fireball = player.shoot_fireball(tx, ty);
            fireball.uuid = ball_uuid;
        }
    }

    send_attack(attackee_uuid, x, y, angle, damage, ball_uuid) {
        this.ws.send(JSON.stringify({
            'event': 'attack',
            'uuid': this.uuid,
            'attackee_uuid': attackee_uuid,
            'x': x,
            'y': y,
            'angle': angle,
            'damage': damage,
            'ball_uuid': ball_uuid
        }));
    }

    receive_attack(uuid, attackee_uuid, x, y, angle, damage, ball_uuid) {
        const attacker = this.get_player(uuid);
        const attackee = this.get_player(attackee_uuid);
        if (attacker && attackee) {
            attackee.receive_attack(x, y, angle, damage, ball_uuid, attacker);
        }
    }

    send_blink(tx, ty) {
        this.ws.send(JSON.stringify({
            'event': 'blink',
            'uuid': this.uuid,
            'tx': tx,
            'ty': ty
        }));
    }

    receive_blink(uuid, tx, ty) {
        const player = this.get_player(uuid);
        if (player) {
            player.blink(tx, ty);
        }
    }

    send_message(username, text) {
        this.ws.send(JSON.stringify({
            'event': 'message',
            'uuid': this.uuid,
            'username': username,
            'text': text
        }));
    }

    receive_message(uuid, username, text){ 
        this.playground.chat_field.add_message(username, text);
    }
}
