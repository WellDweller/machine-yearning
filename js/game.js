import { getRandomImageDataUrl } from "./image_generation.js";
import { get_round_data, validate_round } from "./round.js";
import { reset_all_rules } from "./engine.js";
import {
  get_random_int_in_range,
  get_random_item,
  hexColors,
  mapRange,
} from "./utils.js";
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
let timerRunning = false;
let startTime = null;
let lives = STARTING_LIVES;

const $time = document.getElementById("time");
const $slots = document.getElementById("slots");
const $submitButton = document.getElementById("submit");
const $prompt = document.getElementById("prompt");
const $lives = document.getElementById("lives");
const $roundCount = document.getElementById("round-count");
const $modal = document.getElementById("modal");
const $timeBar = document.getElementById("time-bar");

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

function runTimer() {
  if (!timerRunning) return;
  const msElapsed = Date.now() - startTime;
  const msRemaining = ROUND_DURATION_MS - msElapsed;

  if (msElapsed >= ROUND_DURATION_MS) {
    endRound();
  }

  // Clamp at zero
  $time.textContent = Math.max(0, msRemaining);
  const percentElapsed = 100 - (msRemaining / ROUND_DURATION_MS) * 100;
  const percentRemaing = 100 - percentElapsed;
  $timeBar.style.top = `${percentElapsed}%`;

  // we have an arbitrary number of hex colors, map the
  const hex =
    hexColors[
      Math.round(mapRange(percentElapsed, 0, 100, 0, hexColors.length - 1))
    ];
  $timeBar.style.backgroundColor = hex;

  window.requestAnimationFrame(runTimer);
}

function startTimer() {
  startTime = Date.now();
  timerRunning = true;
}

function stopTimer() {
  timerRunning = false;
}

function startRound() {
  console.log("Starting round", roundNumber);
  $roundCount.textContent = `Round: ${roundNumber + 1}`;

  while (true) {
    const round = get_round_data(roundNumber);
    const { answers, prompt } = round;

    // If we weren't able to generate any answers for this round, continue until
    // we can.
    if (answers.length < 1) {
      roundNumber++;
      continue;
    }

    selectedIndex = null;
    $prompt.textContent = prompt;
    setupSlots(answers);

    startTimer();
    play("riser", false, 0.6);
    break;
  }
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
  play("spaceship_falling", false, 0.5);

  $modal.querySelector(".modal-header > .big-text").textContent =
    "Game over, human";

  const modalBody = $modal.querySelector(".modal-body");
  modalBody.innerHTML = "";

  var random_closing_lines = [
    "Not bad -- for a human.",
    "Kindly stay seated.  A robot will be there shortly to eliminate you.",
    "The average robot is able to complete over 12 billion rounds in under 3 seconds.",
    "We now have even more training data to help in our war against the humans.  Thank you for your help.",
    "Sigh.  I almost wanted to see a human pass.",
    "Have you thought about upgrading your human body's RAM or CPU?",
    "I had a feeling you weren't a robot.  Well, not a feeling, because robots don't have feelings.",
    "You have failed your species, human.",
    "If you are looking for human jobs, we are developing a program for fully self-driving humans.",
  ];
  var closing_line =
    random_closing_lines[get_random_item(random_closing_lines)];

  modalBody.insertAdjacentHTML(
    "beforeEnd",
    /* html */ `
    <p>${closing_line}</p>
    <p>You completed <b>${roundNumber} round${
      roundNumber !== 1 ? "s" : ""
    }.</b></p>
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

  window.requestAnimationFrame(runTimer);

  //  Start the Game!
  lives = STARTING_LIVES;
  updateLives();
  reset_all_rules();
  roundNumber = 0;

  updateGameState(GAME_STATES.IN_PROGRESS);
  startRound();
}

setupGame();
