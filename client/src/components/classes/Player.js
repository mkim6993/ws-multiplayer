class Player {
    constructor(username, x, y, speed, width, height, color) {
        this.username = username;
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.width = width;
        this.height = height;
        this.color = color
    }
}

module.exports = Player;