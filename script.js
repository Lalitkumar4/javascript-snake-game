// board
const blockSize = 25; // each column size
const rows = 30; //board rows
const cols = 30; //board columns
let context;

//snake head
let snakeX = blockSize * 5;
let snakeY = blockSize * 5;

let velocityX = 0;
let velocityY = 0;

let snakeBody = [];

//food
let foodX;
let foodY;

let gameOver = false;
let gamePaused = false;
let counter = 0; //counter
let intervalId;
let speed; // default speed (medium)

const counterEl = document.getElementById("counter");
const counterTwoEl = document.getElementById("counterTwo");
const score = document.getElementById("score");
const pause = document.getElementById("pause");
const gameOverInstruct = document.getElementById("gameOverInstruct");
const speedInstruct = document.getElementById("speedInstruct");
const speedSelect = document.getElementById("speedSelect");

//sound elements
const biteSound = document.getElementById("bite");
const hitSound = document.getElementById("hit");
const backgroundSound = document.getElementById("backgroundSound");
const soundIcon = document.getElementById("soundIcon");

let isMuted = false;

// toggle sound
soundIcon.addEventListener("click", () => {
  if (isMuted) {
    soundIcon.innerHTML = `<i class="fa-solid fa-volume-high"></i
    >`;
    isMuted = false;
    backgroundSound.src = "./sounds/background.mp3";
  } else {
    soundIcon.innerHTML = `<i class="fa-solid fa-volume-xmark"></i>`;
    isMuted = true;
    backgroundSound.src = "";
  }
});

// Event listener for speed select
speedSelect.addEventListener("input", speedChange);

//Disable Tab key
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
  }
});

// Window onload function
window.onload = function () {
  // initializing board
  initializeBoard();
  placeFood();
  // Event listener for key change
  document.addEventListener("keyup", changeDirection);
  //update();
  // Every 100ms run update function
  if (speed > 0) {
    intervalId = setInterval(update, 1000 / 10);
  }
};

// Handle speed change
function speedChange(e) {
  speed = parseInt(e.target.value);
  clearInterval(intervalId);
  if (speed > 0) {
    intervalId = setInterval(update, 1000 / speed);
  } else {
    intervalId = setInterval(update, 0);
  }

  //The speed instruction disappears after the user selects a speed of 500ms
  setTimeout(() => {
    speedInstruct.style.display = "none";
  }, 500);
}

// initialize board
function initializeBoard() {
  board = document.getElementById("board");
  board.height = rows * blockSize;
  board.width = cols * blockSize;
  context = board.getContext("2d"); // used for drawing on the board
}

// update function
function update() {
  soundIcon.style.display = "block";
  soundIcon.style.userSelect = "auto";

  backgroundSound.play();
  if (gameOver || gamePaused) {
    return;
  }
  clearBoard();
  drawFood();
  checkFoodCollision();
  updateSnake();
  drawSnake();
  checkGameOver();
}

// Clear board
function clearBoard() {
  context.fillStyle = "black";
  context.fillRect(0, 0, board.width, board.height);
}

// Draw Board
function drawFood() {
  context.fillStyle = "red";
  context.fillRect(foodX, foodY, blockSize, blockSize);
}

// check food collision
function checkFoodCollision() {
  if (snakeX == foodX && snakeY == foodY) {
    snakeBody.push([foodX, foodY]);

    counter += 5;
    counterEl.textContent = counter;

    placeFood();

    biteSound.play();
  }
}

//update snake
function updateSnake() {
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  if (snakeBody.length) {
    snakeBody[0] = [snakeX, snakeY];
  }
  snakeX += velocityX * blockSize;
  snakeY += velocityY * blockSize;
}

// Draw snake
function drawSnake() {
  context.fillStyle = "lime";
  context.fillRect(snakeX, snakeY, blockSize, blockSize);

  for (let i = 0; i < snakeBody.length; i++) {
    context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
  }
}

// check for game over
function checkGameOver() {
  //game over conditions
  // wall collision
  if (
    snakeX < 0 ||
    snakeX > cols * blockSize - 25 ||
    snakeY < 0 ||
    snakeY > rows * blockSize - 25
  ) {
    hitSound.play();

    gameOver = true;

    backgroundSound.pause(); // Pause the background music
    backgroundSound.src = ""; // Clear the src of the audio, stopping it
    // alert("Game Over");
    gameOverInstruct.style.display = "block";
    counterTwoEl.textContent = counter;
  }

  // self collision
  for (let i = 0; i < snakeBody.length; i++) {
    if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
      gameOver = true;
      // alert("Game Over");
      hitSound.play();
      backgroundSound.pause();
      backgroundSound.src = "";
      gameOverInstruct.style.display = "block";
      counterTwoEl.textContent = counter;
    }
  }
}

//change direction using arrow keys
function changeDirection(e) {
  if (!intervalId) {
    // Don't change direction if the game hasn't started yet
    return;
  }
  if (e.code == "ArrowUp" && velocityY != 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.code == "ArrowDown" && velocityY != -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.code == "ArrowLeft" && velocityX != 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.code == "ArrowRight" && velocityX != -1) {
    velocityX = 1;
    velocityY = 0;
  } else if (e.code == "Space") {
    // game pause when press space
    backgroundSound.pause();
    togglePaused();
  } else if (e.code == "KeyR") {
    // game restart when press R
    gameOverInstruct.style.display = "none";
    window.location.reload();
  }
}

// placeFood on random location
function placeFood() {
  foodX = Math.floor(Math.random() * cols) * blockSize;
  foodY = Math.floor(Math.random() * rows) * blockSize;
}

// pause and resume handler
function togglePaused() {
  gamePaused = !gamePaused;

  if (gamePaused) {
    if (
      gameOverInstruct.hasAttribute("style") ||
      !speedInstruct.hasAttribute("style")
    ) {
      clearInterval(intervalId);
      pause.style.display = "none";
    } else {
      clearInterval(intervalId);
      pause.style.display = "block";
    }
  } else if (speed > 0) {
    clearInterval(intervalId);
    intervalId = setInterval(update, 1000 / speed);
    pause.style.display = "none";
  }
}
