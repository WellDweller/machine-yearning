import { wordProbability } from "./word-probability";

/**
 * Generate a fake word whose length is unexpected
 *
 * @param maxSeqN
 * @param randomGenerator
 */
export function generateFakeWordWithUnexpectedLength(
  maxSeqN = 4,
  randomGenerator = Math.random
) {
  let ch = "^";
  let fakeWord = "";
  let chrs = [];
  while (ch !== "END") {
    chrs = [...chrs, ch];
    if (chrs.length > maxSeqN) {
      chrs = chrs.slice(1);
    }
    let nextAccumedProbs;
    let n = 0;
    do {
      const str = chrs.slice(n).join("");
      nextAccumedProbs = wordProbability[str];
      n += 1;
    } while (nextAccumedProbs === undefined && n < chrs.length);

    let nextCh = "";
    const r = randomGenerator();
    for (let x of nextAccumedProbs) {
      const candidateNextCh = x[0];
      const prob = x[1];
      if (r <= prob) {
        nextCh = candidateNextCh;
        break;
      }
    }
    if (nextCh !== "END") {
      fakeWord += nextCh;
    }
    ch = nextCh;
  }
  return fakeWord;
}

/**
 * Generate a fake word by the specific length
 *
 * @param length
 * @param maxSeqN
 * @param randomGenerator
 */
export async function generateFakeWordByLength(
  length,
  maxSeqN = 4,
  randomGenerator = Math.random
) {
  let fakeWord = "";
  while (fakeWord.length != length) {
    fakeWord =
      (await new Promise()) <
      string >
      ((resolve) => {
        resolve(generateFakeWordWithUnexpectedLength(maxSeqN, randomGenerator));
      });
  }
  return fakeWord;
}

/**
 * Generate a fake word by the specific min and max lengths
 * @param minLength
 * @param maxLength
 * @param maxSeqN
 * @param randomGenerator
 */
export async function generateFakeWord(
  minLength = 4,
  maxLength = 9,
  maxSeqN = 2,
  randomGenerator = Math.random
) {
  let fakeWord = "";
  while (!(minLength <= fakeWord.length && fakeWord.length <= maxLength)) {
    fakeWord =
      (await new Promise()) <
      string >
      ((resolve) => {
        resolve(generateFakeWordWithUnexpectedLength(maxSeqN, randomGenerator));
      });
  }
  return fakeWord;
}
