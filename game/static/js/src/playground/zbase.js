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

    start() {
        $(window).resize(() => {
            this.resize();
        });
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
        this.game_map = new GameMap(this);


        this.players = [];
        this.players.push(new Player(this, this.width / 2 / this.scale, 0.5, 0.05, "white", 0.15, "me", this.root.settings.username, this.root.settings.photo));

        if (mode === "single mode") {
            for (let i = 0; i < 5; i ++ ) {
                const color = this.get_random_color();
                this.players.push(new Player(this, this.width / 2 / this.height, 0.5, 0.05, color, 0.15, "robot"));
            }
        } else if (mode === "multi mode") {
            this.mps = new MultiPlayerSocket(this);
            this.mps.uuid = this.players[0].uuid;

            this.mps.ws.onopen = () => {
                this.mps.send_create_player(this.root.settings.username, this.root.settings.photo);
            };
        }

    }

    hide() {
        this.$playground.hide();
    }
}
