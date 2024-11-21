//info block
const start = document.querySelector(".btn-start");
const reset = document.querySelector(".btn-reset");
const timeElement = document.getElementById("time");
const currentScore = document.getElementById("current-score");
const currentMoves = document.getElementById("current-moves");
const currentTime = document.getElementById("current-time");
const playControl = document.querySelector(".play-control");
const resultElement = document.querySelector(".result");
const lastResultButton = document.querySelector(".last-results");
const lastResults = document.querySelector(".last-results span");
const resultBoard = document.getElementById("resultBoard");
const soundButton = document.querySelector(".btn-sound");

let timer;
let moves = 0;
let score = 0;
let gameTime = 60;
let gameActive = false;
let cardsFlipped = 0;
let soundEnabled = true;

soundButton.addEventListener("click", toggleSound);

function toggleSound() {
  soundEnabled = !soundEnabled;
  soundButton.innerHTML = soundEnabled
    ? '<img src="assets/on-sound.png" alt="sound" />'
    : '<img src="assets/off.png" alt="no sound" />';
}

function playSound(sound) {
  if (soundEnabled) {
    sound.play();
  }
}

function startGame() {
  if (gameActive) return;
  gameActive = true;
  gameTime = 60;
  moves = 0;
  score = 0;
  currentMoves.textContent = moves;
  currentScore.textContent = score;
  cardsFlipped = 0;
  timer = setInterval(() => {
    gameTime--;
    updateTimerDisplay();
    if (gameTime === 0) {
      endGame();
    }
  }, 1000);
  lockBoard = false;
}

start.addEventListener("click", startGame);

function updateTimerDisplay() {
  let minutes = Math.floor(gameTime / 60);
  let seconds = gameTime % 60;
  timeElement.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

function endGame() {
  clearInterval(timer);
  lockBoard = true;
  currentTime.textContent = 60 - gameTime;
  currentMoves.textContent = moves;
  let winSound = new Audio("assets/music/win.mp3");
  let overSound = new Audio("assets/music/over.mp3");
  if (gameTime > 0) {
    playSound(winSound);
    score = calculateScore();
    currentScore.textContent = calculateScore();
    showModal("win");
  } else {
    playSound(overSound);
    score = 0;
    currentScore.textContent = score;
    showModal("lose");
  }
  saveResult();
}

function calculateScore() {
  return gameTime * 100 - moves;
}

function resetGame() {
  clearInterval(timer);
  gameActive = false;
  moves = 0;
  score = 0;
  gameTime = 60;
  cardsFlipped = 0;
  currentTime.textContent = 0;
  currentMoves.textContent = moves;
  currentScore.textContent = score;
  updateTimerDisplay();
  cards.forEach((card) => {
    card.classList.remove("flip");
    card.addEventListener("click", flipCard);
  });
  mix();
}

reset.addEventListener("click", resetGame);

function saveResult() {
  const results = JSON.parse(localStorage.getItem("results")) || [];
  const result = {
    score: score,
    moves: moves,
    time: 60 - gameTime,
    date: new Date().toLocaleString(),
  };
  results.push(result);
  const last10Results = results.slice(-10);
  localStorage.setItem("results", JSON.stringify(last10Results));
}

function displayResults() {
  const results = JSON.parse(localStorage.getItem("results")) || [];
  resultBoard.innerHTML = "<h3>Your last results:</h3>";

  results.forEach((result, index) => {
    resultBoard.innerHTML += `
      <p>${result.date} - score: ${result.score}, moves: ${result.moves}, time: ${result.time}</p>
    `;
  });
}

lastResultButton.addEventListener("click", () => {
  if (lastResults.textContent === "Your last results") {
    resultElement.style.display = "none";
    playControl.style.display = "none";
    displayResults();
    lastResults.textContent = "Close";
  } else {
    resultElement.style.display = "block";
    playControl.style.display = "flex";
    resultBoard.innerHTML = "";
    lastResults.textContent = "Your last results";
  }
});

//game block
const cards = document.querySelectorAll(".memory-card");

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;

function flipCard() {
  if (lockBoard || !gameActive) return;
  if (this === firstCard) return;
  moves++;
  currentMoves.textContent = moves;
  this.classList.add("flip");
  if (!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    return;
  }
  secondCard = this;
  checkForMatch();
}

function checkForMatch() {
  let isMath = firstCard.dataset.word === secondCard.dataset.word;
  isMath ? disableCards() : unflipCards();
}

function disableCards() {
  let matchSound = new Audio("assets/music/match.mp3");
  playSound(matchSound);
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);
  cardsFlipped += 2;
  if (cardsFlipped === cards.length) {
    endGame();
  }
  resetBoard();
}

function unflipCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.add("shake");
    secondCard.classList.add("shake");
    setTimeout(() => {
      firstCard.classList.remove("flip", "shake");
      secondCard.classList.remove("flip", "shake");
      resetBoard();
    }, 600);
  }, 400);
}

function resetBoard() {
  [hasFlippedCard, lockBoard] = [false, false];
  [firstCard, secondCard] = [null, null];
}

function mix() {
  cards.forEach((card) => {
    let ramdomPos = Math.floor(Math.random() * cards.length);
    card.style.order = ramdomPos;
  });
}

mix();

cards.forEach((card) => card.addEventListener("click", flipCard));

function showModal(result) {
  const modal = document.getElementById("modal");
  const modalMessage = document.getElementById("modal-message");
  if (result === "win") {
    modalMessage.innerHTML =
      "🎉 You win! Great job! 🏆<br>You're a true Champion!";
  } else {
    modalMessage.innerHTML = "😢 Game Over!<br>Better luck next time!";
  }
  modal.style.display = "flex";
  setTimeout(() => {
    modal.classList.add("show");
  }, 100);
  setTimeout(() => {
    hideModal();
  }, 5000);
}

function hideModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 500);
}
