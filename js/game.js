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
let timerId = null;

const $time = document.getElementById("time");
const $slots = document.getElementById("slots");
const $submitButton = document.getElementById("submit");

$submitButton.addEventListener("click", (e) => {
  console.log("Do something on submit");
  endRound();
});

$slots.addEventListener("click", (e) => {
  if (e.target.dataset.type === "image") {
    // TODO: need to track selection somewhere, or pull on submit
    e.target.parentElement.classList.toggle("selected");
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
  roundNumber += 1;
  console.log("Starting round", roundNumber);

  setupSlots(get_random_int_in_range(3, 9));

  // startTimer();
}

function endRound() {
  stopTimer();
  startRound();
}

function getRandomImageSrc() {
  const n = Math.floor(Math.random() * 5) + 1;
  return `images/${n.toString().padStart(2, 0)}.png`;
}

function setupSlots(numSlots) {
  clearSlots();
  for (let i = 0; i < numSlots; i++) {
    const src = getRandomImageSrc();
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
