import { get_random_int_in_range } from "./utils.js";

// add metadata
// add ability to download
// add base64 export
// needs some kind of uniqueness checker

const TYPES = {
  RANDOM: "random",
  SYM_HORZ: "symmetrical_horz",
  SYM_VERT: "symmetrical_vert",
};

const $body = document.querySelector("body");

export function getRandomImageDataUrl(_size, _type) {
  const size = _size || get_random_int_in_range(3, 8);
  const type = _type || Math.random() > 0.5 ? TYPES.SYM_HORZ : TYPES.SYM_VERT;
  const $canvas = createImage(size, type);
  return $canvas.toDataURL();
}

function createSymbol() {
  const size = get_random_int_in_range(3, 10);

  let type = TYPES.RANDOM;

  if (Math.random() > 0.5) {
    if (Math.random() > 0.5) {
      type = TYPES.SYM_HORZ;
    } else {
      type = TYPES.SYM_VERT;
    }
  }

  const metadata = {
    size,
    type,
  };

  const $canvas = createImage(size, type);
  const $symbolInfo = document.createElement("div");
  $symbolInfo.classList.add("symbol-info");
  $symbolInfo.appendChild($canvas);

  function copy() {
    const base64Canvas = $canvas.toDataURL("image/png").split(";base64,")[1];
    navigator.clipboard.writeText(base64Canvas);
  }

  $symbolInfo.insertAdjacentHTML(
    "beforeend",
    /* html */ `
    <ul>
        <li>${size} x ${size}</li>
        <li>${type}</li>
        <li><a href="#" id="base64">copy base64</a></li>
    </ul>
  `
  );

  $symbolInfo.querySelector("#base64").addEventListener("click", copy);

  $body.appendChild($symbolInfo);
}

function createImage(size, type) {
  const width = size;
  // assume they will always been square
  const height = width;

  const $canvas = document.createElement("canvas");
  $canvas.width = width;
  $canvas.height = height;

  const ctx = $canvas.getContext("2d");

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Array equal to number of pixels in image, with average rgb values (should
  // be 0 or 255 while we're just black and white) Used for quick checks on
  // complexity.
  const pixelAverageValues = new Array(width * height);

  // TODO: Add some filtering for complexity;

  if (type === TYPES.RANDOM) {
    makeRandom();
  } else {
    makeSymmetrical(type);
  }

  ctx.putImageData(imageData, 0, 0);
  // console.log(pixelAverageValues);
  return $canvas;

  function makeRandom() {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        setPixelColor(col, row, getBlackOrWhite());
      }
    }
  }

  function makeSymmetrical(type) {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if ((type = TYPES.SYM_HORZ)) {
          //mirror horizontally
          if (col < Math.ceil(width / 2)) {
            setPixelColor(col, row, getBlackOrWhite());
          } else {
            const mirrorIndex = width - 1 - col;
            const mirrorPixelColor = getPixelColor(mirrorIndex, row);
            setPixelColor(col, row, mirrorPixelColor);
          }
        } else {
          //mirror vertically
          if (row < Math.ceil(height / 2)) {
            setPixelColor(col, row, getBlackOrWhite());
          } else {
            const mirrorIndex = height - 1 - row;
            const mirrorPixelColor = getPixelColor(col, mirrorIndex);
            setPixelColor(col, row, mirrorPixelColor);
          }
        }
      }
    }
  }

  function getRandomColor() {
    return [
      get_random_int_in_range(0, 255),
      get_random_int_in_range(0, 255),
      get_random_int_in_range(0, 255),
    ];
  }

  function getBlackOrWhite() {
    if (Math.random() >= 0.5) {
      // White
      return [255, 255, 255];
    } else {
      // Black
      return [0, 0, 0];
    }
  }

  function setPixelColor(x, y, [r, g, b]) {
    const index = y * (width * 4) + x * 4;
    const _r = index;
    const _g = index + 1;
    const _b = index + 2;
    const _a = index + 3;

    data[_r] = r;
    data[_g] = g;
    data[_b] = b;
    // Always full opaque (default is 0)
    data[_a] = 255;

    pixelAverageValues[y * width + x] = [r, g, b].reduce((a, b) => a + b) / 3;
  }

  function getPixelColor(x, y) {
    const index = y * (width * 4) + x * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    return [r, g, b];
  }
}
