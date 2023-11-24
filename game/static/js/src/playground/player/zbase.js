class Player extends AcGameObject {
    constructor(playground, x, y, radius, color, speed, character, username, photo) {
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
        this.character = character;
        this.username = username;
        this.photo = photo;
        this.spent_time = 0;
        this.ctx = this.playground.game_map.ctx;
        this.eps = 0.01;
        this.friction = 0.9;
        this.fireballs = [];

        this.cur_skill = null;

        if (this.character !== "robot") {
            this.img = new Image();
            this.img.src = this.photo;
        }

        if (this.character === "me") {
            this.fireball_coldtime = 3;  // 单位：秒
            this.fireball_img = new Image();
            this.fireball_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_9340c86053-fireball.png";
        
            this.blink_coldtime = 5;
            this.blink_img = new Image();
            this.blink_img.src = "https://cdn.acwing.com/media/article/image/2021/12/02/1_daccabdc53-blink.png";
        }
    }

    start() {
        this.playground.player_count ++ ;
        this.playground.notice_board.write(`已就绪：${this.playground.player_count}人`);

        if (this.playground.player_count >= 3) {
            this.playground.state = "fighting";
            this.playground.notice_board.write("Fighting");
        }

        if (this.character === "me") {
            this.add_listening_events();
        } else if (this.character === "robot") {
            const tx = Math.random() * this.playground.width / this.playground.scale;
            const ty = Math.random() * this.playground.height / this.playground.scale;
            this.move_to(tx, ty);
        }
    }

    add_listening_events() {
        let outer = this;
        this.playground.game_map.$canvas.on("contextmenu", function(){
            return false;
        });
        this.playground.game_map.$canvas.mousedown(function(e) {
            if (outer.playground.state !== "fighting") {
                return false;
            }

            // e.clientX返回的是绝对坐标，我们这里要的是相对于canvas的相对坐标
            const rect = outer.ctx.canvas.getBoundingClientRect();
            if (e.which === 3) {
                const tx = (e.clientX - rect.left) / outer.playground.scale;
                const ty = (e.clientY - rect.top) / outer.playground.scale;
                outer.move_to(tx, ty);
                if (outer.playground.mode === "multi mode") {
                    outer.playground.mps.send_move_to(tx, ty);
                }
            } else if (e.which === 1) {
                const tx = (e.clientX - rect.left) / outer.playground.scale;
                const ty = (e.clientY - rect.top) / outer.playground.scale;
                if (outer.cur_skill === "fireball") {
                    const fireball = outer.shoot_fireball(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_shoot_fireball(tx, ty, fireball.uuid);
                    }
                } else if (outer.cur_skill === "blink") {
                    outer.blink(tx, ty);
                    if (outer.playground.mode === "multi mode") {
                        outer.playground.mps.send_blink(tx, ty);
                    }
                }

                outer.cur_skill = null;
            }
        });
        this.playground.game_map.$canvas.keydown(function(e) {
            if (e.which === 13) {  // enter
                if (outer.playground.mode === "multi mode") {  // 打开聊天框
                    outer.playground.chat_field.show_input();
                    return false;
                }
            } else if (e.which === 27) {  // esc
                if (outer.playground.mode === "multi mode") {  // 关闭聊天框
                    outer.playground.chat_field.hide_input();
                    return false;
                }
            }

            if (outer.playground.state !== "fighting") {
                return true;
            }

            if (e.which === 81) { // q
                if (outer.fireball_coldtime > outer.eps) {
                    return true;
                }

                outer.cur_skill = "fireball";
                return false;
            } else if (e.which === 70) { // f
                if (outer.blink_coldtime > outer.eps) {
                    return true;
                }

                outer.cur_skill = "blink";
                return false;
            }
        });
    }

    shoot_fireball(tx, ty) {
        const x = this.x, y = this.y;
        const radius = 0.01;
        const angle = Math.atan2(ty - y, tx - x);
        const vx = Math.cos(angle), vy = Math.sin(angle);
        const color = "orange";
        const speed = 0.5;
        const move_length = 1;
        const damage = 0.01;
        const fireball = new FireBall(this.playground, this, x, y, radius, vx, vy, color, speed, move_length, damage);
        this.fireballs.push(fireball);

        this.fireball_coldtime = 3;
        
        return fireball;
    }

    destroy_fireball(uuid) {
        for (let i = 0; i < this.fireballs.length; i ++ ) {
            const fireball = this.fireballs[i];
            if (fireball.uuid === uuid) {
                fireball.destroy();
                break;
            }
        }
    }

    blink(tx, ty) {
        const d = Math.min(this.get_dist(this.x, this.y, tx, ty), 0.8);
        const angle = Math.atan2(ty - this.y, tx - this.x);
        this.x += d * Math.cos(angle);
        this.y += d * Math.sin(angle);

        this.blink_coldtime = 5;
        this.move_length = 0;  // 闪现结束停下来
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
        if (this.radius < this.eps) {
            this.destroy();
            return false;
        }
        this.damage_vx = Math.cos(angle);
        this.damage_vy = Math.sin(angle);
        this.damage_speed = damage * 100;
        this.speed *= 0.8;
    }

    receive_attack(x, y, angle, damage, ball_uuid, attacker) {
        attacker.destroy_fireball(ball_uuid);
        this.x = x;
        this.y = y;
        this.is_attacked(angle, damage);
    }

    update() {
        this.spent_time += this.timedelta / 1000;
        this.update_win();
        if (this.character === "me" && this.playground.state === "fighting") {
            this.update_coldtime();
        }
        this.update_move();
        this.render();
    }

    update_win() {
        if (this.playground.state === "fighting" && this.character === "me" && this.playground.players.length === 1) {
            this.playground.state = "over";
            this.playground.score_board.win();
        }
    }

    update_coldtime() {
        this.fireball_coldtime -= this.timedelta / 1000;
        this.fireball_coldtime = Math.max(this.fireball_coldtime, 0);

        this.blink_coldtime -= this.timedelta / 1000;
        this.blink_coldtime = Math.max(this.blink_coldtime, 0);
    }

    update_move() {  // 更新玩家移动
        if (this.spent_time > 5 && this.character === "robot" && Math.random() < 1.0 / 300) {
            const player = this.playground.players[Math.floor(Math.random() * this.playground.players.length)];
            if (player !== this) {
                this.shoot_fireball(player.x, player.y);
            }
        }

        if (this.damage_speed > this.eps) {
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
                if (this.character === "robot") {
                    const tx = Math.random() * this.playground.width / this.playground.scale;
                    const ty = Math.random();
                    this.move_to(tx, ty);
                }
            } else {
                const moved = Math.min(this.move_length, this.speed * this.timedelta / 1000);
                this.x += this.vx * moved;
                this.y += this.vy * moved;
                this.move_length -= moved;
            }
        }
    }

    render() {
        const scale = this.playground.scale;
        if (this.character !== "robot") {
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.clip();
            this.ctx.drawImage(this.img, (this.x - this.radius) * scale, (this.y - this.radius) * scale, this.radius * 2 * scale, this.radius * 2 * scale);
            this.ctx.restore();
        } else {
            this.ctx.beginPath();
            this.ctx.arc(this.x * scale, this.y * scale, this.radius * scale, 0, Math.PI * 2);
            this.ctx.fillStyle = this.color;
            this.ctx.fill();
        }

        if (this.character === "me" && this.playground.state === "fighting") {
            this.render_skill_coldtime();
        }
    }

    render_skill_coldtime() {
        let x = 1.5, y = 0.9, r = 0.04;
        const scale = this.playground.scale;
        
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.fireball_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.fireball_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.fireball_coldtime / 3) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }

        x = 1.62;
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.clip();
        this.ctx.drawImage(this.blink_img, (x - r) * scale, (y - r) * scale, r * 2 * scale, r * 2 * scale);
        this.ctx.restore();

        if (this.blink_coldtime > 0) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * scale, y * scale);
            this.ctx.arc(x * scale, y * scale, r * scale, 0 - Math.PI / 2, Math.PI * 2 * (1 - this.blink_coldtime / 5) - Math.PI / 2, true);
            this.ctx.lineTo(x * scale, y * scale);
            this.ctx.fillStyle = "rgba(0, 0, 255, 0.6)";
            this.ctx.fill();
        }
    }

    on_destroy() {
        if (this.character === "me") {
            if (this.playground.state === "fighting") {
                this.playground.state = "over";
                this.playground.score_board.lose();
            }
        }

        for (const i in this.playground.players) {
            if (this.playground.players[i] === this) {
                this.playground.players.splice(i, 1);
                break;
            }
        }
    }
}
