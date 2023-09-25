export class AcGame {
    constructor(id) {
        this.id = id;
        this.$ac_game = $('#' + id);
        this.ac_game_menu = new AcGameMenu(this);
        this.ac_game_playground = new AcGamePlayground(this);

        this.start();
    }

    start() {

    }
}
