import {
  get_existing_rule_round,
  get_new_rule_round,
  define_rule,
} from "./engine.js";
import { get_random_int_in_range } from "./utils.js";

const ROUND_TYPES = {
  NEW_RULE: "new_rule",
  EXISTING_RULE: "existing_rule",
};

// The rounds the game will play through
const ROUNDS = [
  {
    roundType: ROUND_TYPES.NEW_RULE,
    ruleType: "shape",
    rulesToBeConsistent: [],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    // ruleType: "shape",
    // ruleConstraints: {},
    rulesToRandomize: ["shape"],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    // ruleType: "shape",
    rulesToRandomize: ["shape"],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.NEW_RULE,
    ruleType: "shape",
    rulesToBeConsistent: [],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    // ruleType: "shape",
    // ruleConstraints: {},
    rulesToRandomize: ["shape"],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    // ruleType: "shape",
    rulesToRandomize: ["shape"],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.NEW_RULE,
    ruleType: "color",
    rulesToBeConsistent: ["shape"],
    numAnswers: 3,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    // ruleType: "shape",
    rulesToRandomize: ["shape", "color"],
    numAnswers: 4,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    ruleType: "shape",
    rulesToRandomize: ["shape", "color"],
    numAnswers: 4,
    imageSize: 4,
  },
  {
    roundType: ROUND_TYPES.EXISTING_RULE,
    ruleType: "shape",
    rulesToRandomize: ["shape", "color"],
    numAnswers: 4,
    imageSize: 4,
  },
];

const INITIAL_NUM_ROUNDS = ROUNDS.length;

// Hacky global that we use to store the generated round data that is persistent
// for the duration of the round
let currentRoundData = {};

export function get_round_data(roundNum) {
  const round = ROUNDS[roundNum] || generateRandomRound(roundNum);

  if (round.roundType === ROUND_TYPES.NEW_RULE) {
    currentRoundData = get_new_rule_round(
      round.rulesToBeConsistent,
      round.ruleType,
      round.numAnswers,
      round.imageSize
    );
    console.log({ round, currentRoundData });
    return currentRoundData;
  } else {
    currentRoundData = get_existing_rule_round(
      round.numAnswers,
      round.rulesToRandomize,
      round.imageSize
    );
    console.log({ round, currentRoundData });
    return currentRoundData;
  }
}

export function validate_round(roundNum, answerIndex) {
  const round = ROUNDS[roundNum];
  if (round.roundType === ROUND_TYPES.NEW_RULE) {
    const answer = currentRoundData.answers[answerIndex];
    if (round.ruleType == "shape") {
      define_rule(
        round.ruleType,
        currentRoundData.word_we_are_defining,
        answer.shape
      );
    } else if (round.ruleType == "color") {
      define_rule(
        round.ruleType,
        currentRoundData.word_we_are_defining,
        answer.color
      );
    } else {
      console.log(`Unknown rule type ${round.ruleType}`);
    }
    return true;
  } else {
    // Existing round
    return (
      currentRoundData.correct_answer.name ===
      currentRoundData.answers[answerIndex].name
    );
  }
}

function generateRandomRound(roundNumber) {
  const wrappedIndex = roundNumber % INITIAL_NUM_ROUNDS;
  // How many times we've looped over the initial round structure
  const loopCount = Math.floor(roundNumber / INITIAL_NUM_ROUNDS);
  // Get the hard coded round for this index
  const round = ROUNDS[wrappedIndex];
  // Increase the complexity a little, but keep the other attributes the same
  round.imageSize = round.imageSize + loopCount;
  // Never show more than 9 answers
  round.numAnswers = Math.min(round.numAnswers + loopCount, 9);

  ROUNDS.push(round);
  return round;
}
