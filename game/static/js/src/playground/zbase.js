class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();
        this.root.$ac_game.append(this.$playground);
        this.start();
    }

    get_random_color() {
        const colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            const x = parseInt(Math.floor(Math.random() * 10));
            res = res + x;

        }
        return res;
    }

    start() {
        const uuid = this.create_uuid();
        $(window).on(`resize.${uuid}`, () => {
            this.resize();
        });

        if (this.root.AcWingOS) {
            this.root.AcWingOS.api.window.on_close(() => {
                $(window).off(`resize.${uuid}`);
            })
        }
    }

    resize() {
        const width = this.$playground.width();
        const height = this.$playground.height();
        const unit = Math.min(width / 16, height / 9);
        this.width = unit * 16;
        this.height = unit * 9;
        this.scale = this.height;

        if (this.game_map) {
            this.game_map.resize();
        }
    }

    show(mode) {
        this.$playground.show();
        this.resize();

        this.mode = mode;
        this.state = "waiting";  // waiting -> fighting -> over
        this.game_map = new GameMap(this);
        this.notice_board = new NoticeBoard(this);
        this.score_board = new ScoreBoard(this);
        this.player_count = 0;


        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++ ) {
                const color = this.get_random_color();
                this.players.push(new Player(this, this.width / 2 / this.height, 0.5, 0.05, color, 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            this.chat_field = new ChatField(this);
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = () => {
                this.mps.send_create_player(this.root.settings.username, this.root.settings.photo);
            };
        }

    }

    hide() {  // 关闭playground界面
        while (this.players && this.players.length > 0) {
            this.players[0].destroy();
        }

        if (this.game_map) {
            this.game_map.destroy();
            this.game_map = null;
        }

        if (this.notice_board) {
            this.notice_board.destroy();
            this.notice_board = null;
        }

        if (this.score_board) {
            this.score_board.destroy();
            this.score_board = null;
        }

        this.$playground.empty();

        this.$playground.hide();
    }
}
