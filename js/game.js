const ROUND_DURATION_MS = 10 * 1000;
let roundNumber = 0;
let timerId = null;

const $time = document.getElementById("time");
const $slots = document.getElementById("slots");

$slots.addEventListener("click", (e) => {
  if (e.target.dataset.type === "image") {
    console.log(e.target.dataset.id);
    endRound();
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
  startTimer();
  randomizeImages();
}

function endRound() {
  stopTimer();
  startRound();
}

function randomizeImages() {
  $slots.querySelectorAll("img").forEach(($img) => {
    const n = Math.floor(Math.random() * 5) + 1;
    $img.src = `images/${n.toString().padStart(2, 0)}.png`;
  });
}

//   Kick if off
startRound();
