let AC_GAME_OBJECTS = [];

class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.has_called_start = false;  // 是否执行过start函数
        this.timedelta = 0;  // 当前帧距离上一帧的时间间隔，毫秒
        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 8; i ++ ) {
            const x = parseInt(Math.floor(Math.random() * 10));
            res = res + x;

        }
        return res;
    }

    start() {  // 只会在第一帧执行一次

    }

    update() {  // 每一帧执行一次

    }

    late_update() {  // 在每一帧的最后执行一次

    }

    on_destroy() {  // 在被销毁前执行一次

    }

    destroy() {  // 删掉该对象
        this.on_destroy();
        for (const i in AC_GAME_OBJECTS) {
            if (AC_GAME_OBJECTS[i] === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
let AC_GAME_ANIMATION = function(timestamp) {
    for (const obj of AC_GAME_OBJECTS) {
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    for (const obj of AC_GAME_OBJECTS) {
        obj.late_update();
    }

    last_timestamp = timestamp;
    
    requestAnimationFrame(AC_GAME_ANIMATION);
}

requestAnimationFrame(AC_GAME_ANIMATION);
