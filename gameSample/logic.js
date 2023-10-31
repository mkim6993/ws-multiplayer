// Initialize the canvas and context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const pos = document.getElementById("characterpos");

// Player properties
const player = {
  x: 50, // Initial x-coordinate
  y: 50, // Initial y-coordinate
  speed: 1, // Movement speed
};

// Square properties
const square = {
  x: 100, // Top-left corner x-coordinate
  y: 100, // Top-left corner y-coordinate
  width: 200, // Square width
  height: 200, // Square height
};

// Create an object to track the player's movement
const playerMovement = {
  left: false,
  right: false,
  up: false,
  down: false,
};

// Function to update the player's movement
function updatePlayerMovement() {
  if (playerMovement.left && playerMovement.up) {
    player.x -= player.speed;
    player.y -= player.speed;
  }
  if (playerMovement.left && playerMovement.down) {
    player.x -= player.speed;
    player.y += player.speed;
  }
  if (playerMovement.right && playerMovement.up) {
    player.x += player.speed;
    player.y -= player.speed;
  }
  if (playerMovement.right && playerMovement.down) {
    player.x += player.speed;
    player.y += player.speed;
  }
  if (playerMovement.left) {
    player.x -= player.speed * 2;
  }
  if (playerMovement.right) {
    player.x += player.speed * 2;
  }
  if (playerMovement.up) {
    player.y -= player.speed * 2;
  }
  if (playerMovement.down) {
    player.y += player.speed * 2;
  }
}

// Function to handle keydown and keyup events
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "a":
      playerMovement.left = true;
      break;
    case "d":
      playerMovement.right = true;
      break;
    case "w":
      playerMovement.up = true;
      break;
    case "s":
      playerMovement.down = true;
      break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "a":
      playerMovement.left = false;
      break;
    case "d":
      playerMovement.right = false;
      break;
    case "w":
      playerMovement.up = false;
      break;
    case "s":
      playerMovement.down = false;
      break;
  }
});

// Function to update the game state
function update() {
  // Update the player's movement
  updatePlayerMovement();
//   console.log(player.x, player.y)

  // Ensure the player stays within the square boundaries
  player.x = Math.max(square.x, Math.min(square.x + square.width, player.x));
  player.y = Math.max(square.y, Math.min(square.y + square.height, player.y));

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the square
  ctx.fillStyle = "blue";
  ctx.fillRect(square.x, square.y, square.width, square.height);

  // Draw the player
  ctx.fillStyle = "red";
  ctx.fillRect(player.x, player.y, 10, 10);

  // Request the next animation frame
  requestAnimationFrame(update);
}

// Start the game loop
update();
