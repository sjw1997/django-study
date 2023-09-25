class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, is_me) {
        super();
        this.playground = playground;
        this.x = x;
        this.y = y;
        this.vx = 1;
        this.vy = 1;
        this.damage_vx = 0;
        this.damage_vy = 0;
        this.damage_speed = 0;
        this.move_length = 0;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.is_me = is_me;
        this.spent_time = 0;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.1;
        this.friction = 0.9;

        this.cur_skill = null;
    }

    start() {
        if (this.is_me) {
            this.add_listening_events();
        } else {
            const tx = Math.random() * this.playground.width;
            const ty = Math.random() * this.playground.height;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            // e.clientX返回的是绝对坐标，我们这里要的是相对于canvas的相对坐标
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                outer.move_to(e.clientX - rect.left, e.clientY - rect.top);
            } else if (e.which === 1) {
                if (outer.cur_skill === "fireball") {
                    outer.shoot_fireball(e.clientX - rect.left, e.clientY - rect.top);
                }

                outer.cur_skill = null;
            }
        });
        $(window).keydown(function(e) {
            if (e.which === 81) { // q
                outer.cur_skill = "fireball";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        const x = this.x, y = this.y;
        const radius = this.playground.height * 0.01;
        const angle = Math.atan2(ty - y, tx - x);
        const vx = Math.cos(angle), vy = Math.sin(angle);
        const color = "orange";
        const speed = this.playground.height * 0.5;
        const move_length = this.playground.height * 1;
        const damage = this.playground.height * 0.01;
        new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
    }

    get_dist(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    move_to(tx, ty) {
        this.move_length = this.get_dist(this.x, this.y, tx, ty);
        const angle = Math.atan2(ty - this.y, tx - this.x);
        this.vx = Math.cos(angle);
        this.vy = Math.sin(angle);
    }

    is_attacked(angle, damage) {
        for (let i = 0; i < 20 + Math.random() * 10; i ++ ) {
            const x = this.x, y = this.y;
            const radius = this.radius * Math.random() * 0.1;
            const angle = Math.PI * 2 * Math.random();
            const vx = Math.cos(angle), vy = Math.sin(angle);
            const color = this.color;
            const speed = this.speed * 10;
            const move_length = this.radius * Math.random() * 5;
            new Particle(this.playground, x, y, radius, vx, vy, color, speed, move_length);
        }

        this.radius -= damage;
        if (this.radius < 10) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 200;
        this.speed *= 0.8;
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        if (this.spent_time > 5 && !this.is_me && Math.random() < 1.0 / 300) {
            const player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (player !== this) {
                this.shoot_fireball(player.x, player.y);
            }
        }

        if (this.damage_speed > 10) {
            this.vx = this.vy = 0;
            this.move_length = 0;
            const damage_moved = this.damage_speed * this.timedelta / 1000;
            this.x += this.damage_vx * damage_moved;
            this.y += this.damage_vy * damage_moved;
            this.damage_speed *= this.friction;
        } else {
            if (this.move_length < this.eps) {
                this.move_length = 0;
                this.vx = this.vy = 0;
                if (!this.is_me) {
                    const tx = Math.random() * this.playground.width;
                    const ty = Math.random() * this.playground.height;
                    this.move_to(tx, ty);
                }
            } else {
                const moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
        this.render();
    }

    render() {
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.color;
        this.ctx.fill();
    }

    on_destroy() {
        for (const i in this.playground.players) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
            }
        }
    }
}
