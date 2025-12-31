const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let keys = {};
document.addEventListener("keydown", e => {
  keys[e.key] = true;
  if (e.key === " " || e.key === "ArrowUp") {
    e.preventDefault();
  }
});
document.addEventListener("keyup", e => keys[e.key] = false);

const groundY = canvas.height - 60;

let player = {
  x: 80,
  y: groundY - 40,
  width: 30,
  height: 40,
  dy: 0,
  gravity: 0.6,
  jumpForce: -11,
  onGround: true
};

let obstacles = [];
let particles = [];
let speed = 5;
let spawnTimer = 0;
let score = 0;
let gameOver = false;

function resetGame() {
  obstacles = [];
  particles = [];
  speed = 5;
  spawnTimer = 0;
  score = 0;
  gameOver = false;
  player.y = groundY - player.height;
  player.dy = 0;
  player.onGround = true;
}

function spawnObstacle() {
  const height = 30 + Math.random() * 30;
  obstacles.push({
    x: canvas.width + 20,
    y: groundY - height,
    width: 20 + Math.random() * 20,
    height: height,
    color: ["#ff0044", "#ff00ff", "#00ff88", "#ff8800"][Math.floor(Math.random() * 4)]
  });
}

function spawnParticles(x, y, color) {
  for (let i = 0; i < 10; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 4,
      dy: (Math.random() - 1.5) * 4,
      life: 30,
      color
    });
  }
}

function updateParticles() {
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    p.dy += 0.1;
    p.life--;
  });
  particles = particles.filter(p => p.life > 0);
}

function updatePlayer() {
  // Jump
  if ((keys[" "] || keys["ArrowUp"]) && player.onGround && !gameOver) {
    player.dy = player.jumpForce;
    player.onGround = false;
    spawnParticles(player.x + player.width / 2, player.y + player.height, "#00eaff");
  }

  player.dy += player.gravity;
  player.y += player.dy;

  if (player.y + player.height >= groundY) {
    player.y = groundY - player.height;
    player.dy = 0;
    player.onGround = true;
  }
}

function updateObstacles() {
  obstacles.forEach(o => {
    o.x -= speed;
  });
  obstacles = obstacles.filter(o => o.x + o.width > -20);
}

function checkCollisions() {
  for (let o of obstacles) {
    if (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    ) {
      gameOver = true;
      spawnParticles(player.x + player.width / 2, player.y + player.height / 2, "#ffffff");
      break;
    }
  }
}

function drawBackground() {
  // Ground line
  ctx.strokeStyle = "#00eaff";
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#00eaff";
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(canvas.width, groundY);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Scanning neon lines in background
  ctx.strokeStyle = "#222244";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 40, groundY - 80);
    ctx.stroke();
  }
}

function drawPlayer() {
  ctx.fillStyle = "#00eaff";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00eaff";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.shadowBlur = 0;
}

function drawObstacles() {
  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.shadowBlur = 20;
    ctx.shadowColor = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
    ctx.shadowBlur = 0;
  });
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 30;
    ctx.fillRect(p.x, p.y, 3, 3);
    ctx.globalAlpha = 1;
  });
}

function drawScore() {
  ctx.fillStyle = "#00eaff";
  ctx.font = "20px Arial";
  ctx.fillText("Score: " + Math.floor(score), 10, 25);
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "40px Arial";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

  ctx.font = "22px Arial";
  ctx.fillText("Final Score: " + Math.floor(score), canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText("Press R to Restart", canvas.width / 2, canvas.height / 2 + 55);

  ctx.textAlign = "start";
}

function handleRestart() {
  if (gameOver && (keys["r"] || keys["R"])) {
    resetGame();
  }
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  updatePlayer();
  updateObstacles();
  updateParticles();
  checkCollisions();

  // Increase difficulty over time
  if (!gameOver) {
    score += 0.1;
    speed = 5 + score * 0.02;
    spawnTimer--;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 60 - Math.min(score, 40); // spawn faster as score increases
    }
  }

  drawObstacles();
  drawPlayer();
  drawParticles();
  drawScore();

  if (gameOver) {
    drawGameOver();
    handleRestart();
  }

  requestAnimationFrame(update);
}

resetGame();
update();
