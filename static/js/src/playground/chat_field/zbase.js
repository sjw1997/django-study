class ChatField {
    constructor(playground) {
        this.playground = playground;

        this.$history = $(`<div class="ac-game-chat-field-history">历史记录</div>`);
        this.$input = $(`<input type="text" class="ac-game-chat-field-input">`);

        this.$history.hide();
        this.$input.hide();
        this.func_id = null;

        this.playground.$playground.append(this.$history);
        this.playground.$playground.append(this.$input);

        this.start();
    }

    start() {
        this.add_listening_events();
    }

    add_listening_events() {
        this.$input.keydown((e) => {
            if (e.which === 27) {  // esc
                this.hide_input();
                return false;
            } else if (e.which === 13) { // enter
                const username = this.playground.root.settings.username;
                const text = this.$input.val();
                if (text) {
                    this.$input.val("");
                    this.add_message(username, text);
                    this.playground.mps.send_message(username, text);
                }
                return false;
            }
        })
    }

    render_message(message) {
        return $(`<div>${message}</div>`);
    }

    add_message(username, text) {
        const message = `[${username}]${text}`;
        this.$history.append(this.render_message(message));
        this.$history.scrollTop(this.$history[0].scrollHeight);  // 滚动条滑到最新的内容
        this.show_history();
    }

    show_history() {
        this.$history.fadeIn();
        
        if (this.func_id) {
            clearTimeout(this.func_id);
        }

        this.func_id = setTimeout(() => {
            this.$history.fadeOut();
            this.func_id = null;
        }, 3000);
    }

    show_input() {
        this.show_history();
        this.$input.show();
        this.$input.focus();
    }

    hide_input() {
        this.$input.hide();
        this.playground.game_map.$canvas.focus();
    }
}