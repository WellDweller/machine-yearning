import { getRandomImageDataUrl } from "./image_generation.js";
import { get_round_data, validate_round } from "./round.js";
import { get_random_int_in_range } from "./utils.js";

/*
- color transformation
- round end
- requestAnimationFrame for timer instead of setInterval
- Game begin state
- Game end state
- variable spacing
*/

const ROUND_DURATION_MS = 10 * 1000;
let roundNumber = 0;
let selectedIndex = null;
let timerId = null;

const $time = document.getElementById("time");
const $slots = document.getElementById("slots");
const $submitButton = document.getElementById("submit");
const $commandWords = document.getElementById("command-words");

$submitButton.addEventListener("click", (e) => {
  console.log("Do something on submit");
  endRound();
});

$slots.addEventListener("click", (e) => {
  if (e.target.dataset.type === "image") {
    selectedIndex = e.target.dataset.id;

    console.log({ selectedIndex });

    $slots.querySelectorAll(".slot").forEach((slot) => {
      if (slot === e.target.parentElement) {
        slot.classList.toggle("selected");
      } else {
        slot.classList.remove("selected");
      }
    });
  }
});

function startTimer() {
  const startTime = Date.now();

  timerId = window.setInterval(() => {
    const msElapsed = Date.now() - startTime;

    if (msElapsed >= ROUND_DURATION_MS) {
      endRound();
    }

    // Clamp at zero
    $time.textContent = Math.max(0, ROUND_DURATION_MS - msElapsed);
  }, 10);
}

function stopTimer() {
  window.clearInterval(timerId);
}

function startRound() {
  console.log("Starting round", roundNumber);
  const round = get_round_data(roundNumber);
  const { answers, prompt } = round;

  selectedIndex = null;
  $commandWords.textContent = prompt;
  setupSlots(answers);

  // startTimer();
}

function endRound() {
  stopTimer();

  if (selectedIndex === null) {
    // Didn't select before the time ran out
  } else {
    const result = validate_round(roundNumber, selectedIndex);
    console.log(result);
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
    console.log(src);
    const $slot = createSlotElement(src, i);
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

function createSlotElement(src, index) {
  const $slot = document.createElement("div");
  $slot.insertAdjacentHTML(
    "beforeEnd",
    /*html*/ `
        <div class="slot">
            <img src="${src}" data-id="${index}" data-type="image" />
        </div>
    `
  );
  return $slot;
}

//   Kick if off
startRound();
