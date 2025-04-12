const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');

// Game constants 10
const WIDTH = 800;
const HEIGHT = 600;
const PLAYER_SIZE = 50;
const CHICKEN_SIZE = 40;
const BANANA_SIZE = 10;
const PLAYER_SPEED = 5;
const BANANA_SPEED = 10;
const CHICKEN_SPEED = 2;

// Game state
let playerX = WIDTH / 2;
let playerY = HEIGHT - PLAYER_SIZE - 10;
let bananas = [];
let chickens = [];
let score = 0;
let gameOver = false;
let lastBananaTime = 0;
let bananaCooldown = 500; // milliseconds
let spawnTimer = 0;
let spawnDelay = 2000; // milliseconds

class Chicken {
    constructor() {
        this.x = Math.random() * (WIDTH - CHICKEN_SIZE);
        this.y = -CHICKEN_SIZE;
        this.speed = CHICKEN_SPEED;
        this.health = 1;
    }

    move() {
        this.y += this.speed;
    }

    draw() {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x + CHICKEN_SIZE/2, this.y + CHICKEN_SIZE/2, CHICKEN_SIZE/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Banana {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.speed = BANANA_SPEED;
    }

    move() {
        this.y -= this.speed;
    }

    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, BANANA_SIZE, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPlayer() {
    ctx.fillStyle = 'brown';
    ctx.fillRect(playerX, playerY, PLAYER_SIZE, PLAYER_SIZE);
}

function update() {
    if (gameOver) return;

    const currentTime = Date.now();

    // Player movement
    if (keys.ArrowLeft && playerX > 0) {
        playerX -= PLAYER_SPEED;
    }
    if (keys.ArrowRight && playerX < WIDTH - PLAYER_SIZE) {
        playerX += PLAYER_SPEED;
    }

    // Spawn chickens
    if (currentTime - spawnTimer > spawnDelay) {
        chickens.push(new Chicken());
        spawnTimer = currentTime;
    }

    // Move and check bananas
    for (let i = bananas.length - 1; i >= 0; i--) {
        bananas[i].move();
        if (bananas[i].y < 0) {
            bananas.splice(i, 1);
        }
    }

    // Move and check chickens
    for (let i = chickens.length - 1; i >= 0; i--) {
        const chicken = chickens[i];
        chicken.move();

        // Check collision with player
        if (playerX < chicken.x + CHICKEN_SIZE &&
            playerX + PLAYER_SIZE > chicken.x &&
            playerY < chicken.y + CHICKEN_SIZE &&
            playerY + PLAYER_SIZE > chicken.y) {
            gameOver = true;
            gameOverElement.style.display = 'block';
        }

        // Check collision with bananas
        for (let j = bananas.length - 1; j >= 0; j--) {
            const banana = bananas[j];
            if (banana.x > chicken.x && banana.x < chicken.x + CHICKEN_SIZE &&
                banana.y > chicken.y && banana.y < chicken.y + CHICKEN_SIZE) {
                chicken.health--;
                bananas.splice(j, 1);
                if (chicken.health <= 0) {
                    chickens.splice(i, 1);
                    score++;
                    scoreElement.textContent = `Score: ${score}`;
                }
                break;
            }
        }

        // Remove chickens that go off screen
        if (chicken.y > HEIGHT) {
            chickens.splice(i, 1);
        }
    }

    // Check for secret ending
    if (score >= 100) {
        const bigChicken = new Chicken();
        bigChicken.health = 100;
        bigChicken.speed = 1;
        bigChicken.y = -CHICKEN_SIZE * 2;
        chickens.push(bigChicken);
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
    }
}

function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Draw player
    drawPlayer();
    
    // Draw bananas
    bananas.forEach(banana => banana.draw());
    
    // Draw chickens
    chickens.forEach(chicken => chicken.draw());
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Handle keyboard input
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ' && !gameOver) {
        const currentTime = Date.now();
        if (currentTime - lastBananaTime > bananaCooldown) {
            bananas.push(new Banana(playerX + PLAYER_SIZE/2, playerY));
            lastBananaTime = currentTime;
        }
    }
    
    if (e.key === 'r' && gameOver) {
        gameOver = false;
        gameOverElement.style.display = 'none';
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        chickens = [];
        bananas = [];
        playerX = WIDTH / 2;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Start the game
gameLoop(); 