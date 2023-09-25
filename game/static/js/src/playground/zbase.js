class AcGamePlayground {
    constructor(root) {
        this.root = root;
        this.$playground = $(`<div class="ac-game-playground"></div>`);
        this.hide();
        
        this.start();
    }

    get_random_color() {
        const colors = ["blue", "red", "pink", "grey", "green"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    start() {

    }

    show() {
        this.$playground.show();
        this.root.$ac_game.append(this.$playground);
        this.width = this.$playground.width();
        this.height = this.$playground.height();
        this.game_map = new GameMap(this);
        this.players = [];
        this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, "white", this.height * 0.15, true));

        for (let i = 0; i < 5; i ++ ) {
            const color = this.get_random_color();
            this.players.push(new Player(this, this.width / 2, this.height / 2, this.height * 0.05, color, this.height * 0.15, false));
        }

    }

    hide() {
        this.$playground.hide();
    }
}
