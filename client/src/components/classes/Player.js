class Player {
    constructor(username, x, y, speed, width, height, playerColor) {
        this.username = username;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.playerColor = playerColor
    }
}

module.exports = Player;