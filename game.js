const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
let gravity = 0.5;
const initialJumpStrength = -10;
let jumpStrength = initialJumpStrength;
let obstacleSpeed = 6;
let speedIncreaseInterval = 500;
let speedIncreaseAmount = 0.5;

// Player
const player = {
    x: 50,
    y: canvas.height - 60,
    width: 30,
    height: 30,
    dy: 0,
    grounded: false,
    jump() {
        if (this.grounded) {
            this.dy = jumpStrength;
            this.grounded = false;
        }
    },
    update() {
        this.dy += gravity;
        this.y += this.dy;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.dy = 0;
            this.grounded = true;
        }
    },
    draw() {
        ctx.fillStyle = 'cyan';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
};

// Obstacles
const obstacles = [];
function spawnObstacle() {
    const height = Math.random() * (canvas.height / 6) + 20; // Ensure obstacles are small enough to jump over
    const obstacle = {
        x: canvas.width,
        y: canvas.height - height,
        width: 30,
        height: height,
        update() {
            this.x -= obstacleSpeed;
        },
        draw() {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    };
    obstacles.push(obstacle);
}

// Collision detection
function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Game loop
let frame = 0;
let score = 0;
let gameOver = false;
let nextObstacleFrame = 100;
function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 120, canvas.height / 2);
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 120, canvas.height / 2 + 60);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.update();
    player.draw();

    if (frame >= nextObstacleFrame) {
        spawnObstacle();
        nextObstacleFrame = frame + Math.random() * 100 + 50; // Randomize the distance between obstacles
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.update();
        obstacle.draw();

        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            score++;
        }

        if (checkCollision(player, obstacle)) {
            if (player.y + player.height - player.dy <= obstacle.y) {
                // Player is on top of the obstacle
                player.y = obstacle.y - player.height;
                player.dy = 0;
                player.grounded = true;
            } else {
                // Player hit the obstacle from the side
                gameOver = true;
            }
        }
    }

    // Display score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Increase difficulty over time
    if (frame % speedIncreaseInterval === 0) {
        obstacleSpeed += speedIncreaseAmount;
    }

    frame++;
    requestAnimationFrame(gameLoop);
}

// Controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        player.jump();
    }
});

// Start the game loop
gameLoop();
