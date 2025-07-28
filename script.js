let board = document.getElementById("board");
let scoreboard = document.getElementById("scoreboard");
let timerElement = document.getElementById("timer");

const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get("mode") || "1"; // "1" = single, "2" = two-player
const difficulty = urlParams.get("difficulty") || "easy";
const isTwoPlayer = mode === "2";

let flipped = [], matched = 0;
let playerTurn = 1;
let score = { 1: 0, 2: 0 };
let timer = 0, timerInterval;
let firstClickStarted = false;

let emojis = ["🐶", "🍕", "🦄", "🎮", "👻", "🐱", "🍩", "🌈", "😎", "🧠", "🐸", "🌸", "🍉", "🚀", "🎲", "🥑", "💻", "🧁", "🐧", "🍓"];
let pairs = difficulty === "easy" ? 8 : difficulty === "hard" ? 32 : 18;
let gridSize = difficulty === "easy" ? 4 : difficulty === "hard" ? 8 : 6;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildBoard() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
  const deck = shuffle([...emojis.slice(0, pairs), ...emojis.slice(0, pairs)]);
  deck.forEach(emoji => {
    const card = document.createElement("div");
    card.className = "card";
    card.textContent = "❔";
    card.dataset.emoji = emoji;
    card.addEventListener("click", () => flipCard(card));
    board.appendChild(card);
  });

  updateScoreboard();
  updatePlayerTurnUI();
}

function flipCard(card) {
  if (!firstClickStarted) {
    startTimer();
    firstClickStarted = true;
  }
  if (flipped.length === 2 || card.classList.contains("matched") || flipped.includes(card)) return;
  card.textContent = card.dataset.emoji;
  flipped.push(card);

  if (flipped.length === 2) {
    const [first, second] = flipped;
    if (first.dataset.emoji === second.dataset.emoji) {
      first.classList.add("matched");
      second.classList.add("matched");
      matched += 2;
      score[playerTurn]++;
      flipped = [];
      updateScoreboard();
      if (matched === pairs * 2) setTimeout(showPopup, 500);
    } else {
      setTimeout(() => {
        first.textContent = "❔";
        second.textContent = "❔";
        flipped = [];
        if (isTwoPlayer) {
          playerTurn = playerTurn === 1 ? 2 : 1;
          updateScoreboard();
          updatePlayerTurnUI();
        }
      }, 700);
    }
  }
}

function updateScoreboard() {
  if (isTwoPlayer) {
    scoreboard.textContent = `Player 1: ${score[1]} | Player 2: ${score[2]}`;
  } else {
    scoreboard.textContent = `Pairs found: ${matched / 2}`;
  }
}

function startTimer() {
  timer = 0;
  timerElement.textContent = "⏱ 00:00";
  timerInterval = setInterval(() => {
    timer++;
    timerElement.textContent = `⏱ ${formatTime(timer)}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function showPopup() {
  stopTimer();

  const genZQuotes = [
    "You matched faster than my Wi-Fi!",
    "Precision. Power. Perfection.",
    "Cards never stood a chance.",
    "Smooooth moves, brain juice activated.",
    "That was a picture-perfect match spree!",
    "Who needs cheat codes with a brain like that?",
    "Your memory just clapped the game.",
    "Flipped. Matched. Dominated.",
    "You played like you wrote the code.",
    "The cards didn’t even see it coming.",
    "You're officially a pattern-recognition pro.",
    "You cracked the matrix of matching.",
    "Your neurons deserve a standing ovation."
  ];

  const quote = genZQuotes[Math.floor(Math.random() * genZQuotes.length)];

  let winnerHTML = '';
  let scoreHTML = '';

  if (isTwoPlayer) {
    const p1 = score[1];
    const p2 = score[2];

    if (p1 === p2) {
      winnerHTML = `<div style="font-size: 1.5rem; color: rgb(131, 0, 78); margin-top: 8px; font-weight: bold;">🤝 It's a tie!</div>`;
    } else {
      const winner = p1 > p2 ? 'Player 1' : 'Player 2';
      winnerHTML = `<div style="font-size: 1.5rem; color:rgb(131, 0, 78); margin-top: 8px; font-weight: bold;">🎉 ${winner} wins!</div>`;
    }

    scoreHTML = `
      <div style="font-size: 1.3rem; color: #b3006b; margin-top: 18px;">Scores</div>
      <div style="font-size: 1.8rem; font-weight: bold; color: #ff4fa8;">P1: ${p1} | P2: ${p2}</div>
    `;
  } else {
    scoreHTML = `
      <div style="font-size: 1.3rem; color: #b3006b; margin-top: 10px;">Score</div>
      <div style="font-size: 2rem; font-weight: bold; color: #ff4fa8;">${score[1]}</div>
    `;
  }
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header" style="font-size: 1.8rem;">GG, Next?</div>
      ${winnerHTML}
      <p style="margin: 20px 0 16px; font-size: 1.3rem; color: #d63384; font-weight: 600;">
        ${quote}
      </p>
      ${scoreHTML}
      <div style="font-size: 1.3rem; color: #b3006b; margin-top: 16px;">Time Taken</div>
      <div style="font-size: 1.8rem; font-weight: bold; color: #ff4fa8;">${formatTime(timer)}</div>
      <button class="modal-btn" style="margin-top: 26px;" onclick="location.href='main.html'">🏠 HOME</button>
    </div>
  `;
  document.body.appendChild(modal);
  modal.style.display = "flex";
}

function updatePlayerTurnUI() {
  document.body.classList.remove("player1-turn", "player2-turn");
  if (isTwoPlayer) {
    document.body.classList.add(playerTurn === 1 ? "player1-turn" : "player2-turn");
  }
}

buildBoard();
