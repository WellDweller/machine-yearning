import { getRandomImageDataUrl } from "./image_generation.js";
import { get_round_data, validate_round } from "./round.js";
import { get_random_int_in_range } from "./utils.js";
import { theme_song } from "./audio.js";

/*
- color transformation
- round end
- requestAnimationFrame for timer instead of setInterval
- Game begin state
- Game end state
- variable spacing
*/

const ROUND_DURATION_MS = 10 * 1000;
const STARTING_LIVES = 3;
const GAME_STATES = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  FINISHED: "finished",
};

let gameState = GAME_STATES.NOT_STARTED;

let roundNumber = 0;
let selectedIndex = null;
let timerId = null;
let lives = STARTING_LIVES;

const $time = document.getElementById("time");
const $slots = document.getElementById("slots");
const $submitButton = document.getElementById("submit");
const $prompt = document.getElementById("prompt");
const $lives = document.getElementById("lives");
const $roundCount = document.getElementById("round-count");
const $modal = document.getElementById("modal");

$modal.addEventListener("click", (e) => {
  if (e.target.dataset.action === "modal-close") {
    $modal.classList.add("hide");

    startGame();
  }
});

$submitButton.addEventListener("click", (e) => {
  endRound();
});

$slots.addEventListener("click", (e) => {
  if (e.target.dataset.type === "image") {
    selectedIndex = e.target.dataset.id;

    $slots.querySelectorAll(".slot").forEach((slot) => {
      if (slot === e.target.parentElement) {
        slot.classList.toggle("selected");
      } else {
        slot.classList.remove("selected");
      }
      play("basic_click_02", true, 0.8);
    });
  }
});

function startTimer() {
  const startTime = Date.now();

  timerId = window.setInterval(() => {
    const msElapsed = Date.now() - startTime;

    if (msElapsed >= ROUND_DURATION_MS && timerId) {
      endRound();
    }

    // Clamp at zero
    $time.textContent = Math.max(0, ROUND_DURATION_MS - msElapsed);
  }, 100);
}

function stopTimer() {
  window.clearInterval(timerId);
}

function startRound() {
  console.log("Starting round", roundNumber);
  $roundCount.textContent = `Round: ${roundNumber + 1}`;

  const round = get_round_data(roundNumber);
  const { answers, prompt } = round;

  selectedIndex = null;
  $prompt.textContent = prompt;
  setupSlots(answers);

  startTimer();
  play("riser", false, 0.6);
}

function endRound() {
  stopTimer();
  stop("riser");

  if (selectedIndex === null) {
    console.log("FAILED: TIME EXPIRED");
    // Didn't select before the time ran out;

    // Lose a life
    play("failure_02", true, 0.7);
    updateLives({ decrement: true });
    if (lives <= 0) {
      endGame();
      return;
    }
    // Begin the round again
    startRound();
    return;
  } else {
    const result = validate_round(roundNumber, selectedIndex);
    if (result) {
      play("mouth_pop", true, 0.9);
      console.log("CORRECT");
    } else {
      console.log("FAILED: INCORRECT");
      play("failure_02", true, 0.7);
      updateLives({ decrement: true });
      if (lives <= 0) {
        endGame();
        return;
      }
    }
  }

  roundNumber++;

  startRound();
}

function getRandomImageSrc() {
  const n = Math.floor(Math.random() * 5) + 1;
  return `images/${n.toString().padStart(2, 0)}.png`;
}

function setupSlots(answers) {
  clearSlots();
  for (let i = 0; i < answers.length; i++) {
    const src = answers[i].shape;
    const color = answers[i].color;
    // console.log(src);
    const $slot = createSlotElement(src, i, color);
    $slots.appendChild($slot);
  }

  //   TODO: feels janky
  const numCols = answers.length === 4 ? 2 : 3;

  $slots.style.gridTemplateColumns = "1fr ".repeat(numCols);
}

function setupRandomSlots(numSlots) {
  clearSlots();
  for (let i = 0; i < numSlots; i++) {
    const src = getRandomImageDataUrl();
    const $slot = createSlotElement(src, i);
    $slots.appendChild($slot);
  }

  //   TODO: feels janky
  const numCols = numSlots === 4 ? 2 : 3;

  $slots.style.gridTemplateColumns = "1fr ".repeat(numCols);
}

function clearSlots() {
  while ($slots.firstChild) {
    $slots.removeChild($slots.firstChild);
  }
}

function createSlotElement(src, index, color) {
  const $slot = document.createElement("div");
  $slot.insertAdjacentHTML(
    "beforeEnd",
    /*html*/ `
        <div class="slot">
            <img src="${src}" data-id="${index}" data-type="image" />
            <div class="overlay"></div>
        </div>
    `
  );

  if (color) {
    const $overlay = $slot.querySelector(".overlay");
    $overlay.style.backgroundColor = `var(--${color})`;
  }

  return $slot;
}

function updateGameState(newState) {
  gameState = newState;
}

function updateLives({ decrement } = { decrement: false }) {
  if (decrement) {
    lives--;
  }

  const liveArr = [];
  for (let i = 0; i < STARTING_LIVES; i++) {
    if (i < lives) {
      liveArr.push("❤️");
    } else {
      liveArr.push("❌");
    }
  }
  $lives.textContent = liveArr.join("");
}

function setupGame() {
  // Volume
  set_music_volume(0.8);
  set_fx_volume(0.8);

  // We can't play sound until the user interacts.  So as soon as they
  // click anywhere, we'll blast em with our theme song.
  window.theme_started = false;
}

function endGame() {
  updateGameState(GAME_STATES.FINISHED);

  $modal.querySelector(".modal-header > .big-text").textContent =
    "Game over, man";

  const modalBody = $modal.querySelector(".modal-body");
  modalBody.innerHTML = "";
  modalBody.insertAdjacentHTML(
    "beforeEnd",
    /* html */ `
    <p>You completed ${roundNumber} rounds.</p>
    <p>Well done?</p>
  `
  );

  $modal.querySelector(".modal-footer > button > .text").textContent =
    "Try again";

  $modal.classList.remove("hide");
}

function startGame() {
  if (!window.theme_started) {
    theme_song.play();
    window.theme_started = true;
  }

  //  Start the Game!
  lives = STARTING_LIVES;
  updateLives();
  roundNumber = 0;

  updateGameState(GAME_STATES.IN_PROGRESS);
  startRound();
}

setupGame();
