/*

RULES example:

{
  shape: {
    frobus: "data://...",
  },
  color: {
    blelon: "blue",
  },
  rotation: {
    blecken: 180,
  },
  size: {
    teenus: "small",
  }
}
*/

import * as audio from "./audio.js";
import * as utils from "./utils.js";
import { getRandomImageDataUrl } from "./image_generation.js";

var p = console.log;

var POTENTIAL_RULES = {
  color: ["red", "blue", "green", "orange", "pink", "purple", "yellow"],
  rotation: ["upright", "right", "upside_down", "left"],
  size: ["small", "medium", "large"],
};

window.RULES = {
  shape: {},
  color: {},
  rotation: {},
  size: {},
};

export function define_rule(rule_type, name, value) {
  console.assert(rule_type in RULES, `Unknown rule ${rule_type}`);
  console.assert(
    !(name in RULES[rule_type]),
    `${rule_type} rule ${name} already exists`
  );
  RULES[rule_type][name] = value;
}

function get_random_rule(rule_type) {
  const random_name = utils.get_random_key(RULES[rule_type]);
  return get_rule(rule_type, random_name);
}

function get_rule(rule_type, name) {
  console.assert(rule_type in RULES, `Unknown rule ${rule_type}`);
  // Purposefully allow undefined returns so calling logic can do something different
  // if the rule wasn't found.
  return RULES[rule_type][name];
}

// Given a real word (i.e. "blue"), get the fake word associated with it.
function get_fake_word_for_rule(rule_type, value) {
  for (const key in RULES[rule_type]) {
    if (value == RULES[rule_type][key]) {
      return key;
    }
  }
  console.log(`Could not find value ${value} for rule type ${rule_type}`);
}

// Return a rule's random value (i.e. real word, i.e. "blue")
function get_random_potential_rule(rule_type) {
  return POTENTIAL_RULES[rule_type][
    utils.get_random_key(POTENTIAL_RULES[rule_type])
  ];
}

function transform_image(image, rule_type, rule_value) {
  // TODO: Make it actually blue.
  if (rule_type == "color") {
    image += "." + rule_value;
  }
  return image;
}

function get_prompt(rule_constraints, new_rule_word) {
  var words = [];
  for (const rule_type in rule_constraints) {
    // Shape should always come last, because english.
    if (rule_type == "shape") {
      continue;
    }
    words.push(get_fake_word_for_rule(rule_type, rule_constraints[rule_type]));
  }
  if (new_rule_word !== undefined) {
    words.push(new_rule_word);
  }
  if ("shape" in rule_constraints) {
    words.push(get_fake_word_for_rule("shape", rule_constraints.shape));
  }
  return words.join(" ");
}

///////////////////////////////////////////////////////////////////////
//
// New Rule Round
//
//

// If size is undefined, it will be random
function get_random_image(size) {
  let randomImage;
  // Make sure the Images we return are random
  do {
    randomImage = getRandomImageDataUrl(size);
  } while (Object.values(RULES["shape"]).includes(randomImage));

  return randomImage;
}

// Gets all rules that haven't been defined for a particular rule type
// (e.g. all colors the user hasn't defined yet).
function get_undefined_rules(rule_type) {
  var available_rules = new Set(POTENTIAL_RULES[rule_type]);
  for (const name in RULES[rule_type]) {
    var value = get_rule(rule_type, name);
    available_rules.delete(value);
  }
  return available_rules;
}

// Try to get `n` number of potential answers.  If new_rule_type is undefined, we will attempt
// to get as many answers that fit the rule constraints as possible.  If fewer than `n` are
// found, they will be returned anyway.
//
// The rule constraints are *not* in terms of the fake language.  They're real words
// (e.g. {shape: "data://osidj", color: "blue"});
function get_n_answers(n, rule_constraints, new_rule_type, image_size) {
  var answers = [];

  // Set up a pool of rule values that satisfy the new rule type for us to choose from.
  var undefined_rules = get_undefined_rules(new_rule_type);

  for (var i = 0; i < n; i++) {
    var answer = {};

    // Shape
    //
    // If there's a shape rule, find the base image.
    if ("shape" in rule_constraints) {
      answer.shape = rule_constraints.shape;
    } else {
      answer.shape = get_random_image(image_size);
    }

    // Color
    if ("color" in rule_constraints) {
      answer.color = rule_constraints.color;
    }

    // New rule transformations
    //
    // Shapes are different.
    if (new_rule_type != "shape") {
      var rule_value = utils.get_random_item(undefined_rules);

      // There aren't any more rules left, continue
      if (rule_value === undefined) {
        continue;
      }
      undefined_rules.delete(rule_value);
      answer[new_rule_type] = rule_value;
    }

    answers.push(answer);
  }
  return answers;
}

function get_random_word() {
  var consonants = "bcdfghjklmnpqrstvwxz";
  var vowels = "aeiou";
  var min = 3;
  var max = 7;
  var length = Math.random() * (max - min) + min;
  var word = "";
  var pick_from_consonants = true;
  for (var i = 0; i < length; i++) {
    if (pick_from_consonants) {
      word += consonants.charAt(Math.floor(Math.random() * consonants.length));
    } else {
      word += vowels.charAt(Math.floor(Math.random() * vowels.length));
    }
    pick_from_consonants = !pick_from_consonants;
  }
  return word;
}

// rule_constraints -- a map of the type of rule to a rule value (e.g. {color: "blue"}.
// All answers must fit these rules.)
//
// new_rule_type -- the rule we're having the user choose(e.g. "size").
export function get_new_rule_round(
  rules_to_be_consistent,
  new_rule_type,
  num_images,
  image_size
) {
  const rule_constraints = {};

  for (const rule_type of rules_to_be_consistent) {
    const random_rule = get_random_rule(rule_type);
    rule_constraints[rule_type] = random_rule;
  }

  var word_we_are_defining = get_random_word();
  var answers = get_n_answers(
    num_images,
    rule_constraints,
    new_rule_type,
    image_size
  );
  var prompt = get_prompt(rule_constraints, word_we_are_defining);
  return {
    word_we_are_defining: word_we_are_defining,
    prompt: prompt,
    answers: answers,
  };
}

///////////////////////////////////////////////////////////////////////
//
// Existing Rule Round
//
//

function transform_answer(rule_constraints) {
  // Color
  if ("color" in rule_constraints) {
    rule_constraints.shape = transform_image(
      rule_constraints.shape,
      "color",
      rule_constraints.color
    );
  }
  return rule_constraints.shape;
}

// Fetch an answer with an existing rule definition, i.e. the player has enough
// information to correctly answer
function get_defined_answer() {
  var answer = {};
  for (const key in RULES) {
    if (Object.keys(RULES[key]).length == 0) {
      continue;
    }
    answer[key] = RULES[key][utils.get_random_key(RULES[key])];
  }
  var name = get_prompt(answer);
  answer.name = name;
  return answer;
}

// If no rules to randomize are passed, they all will be.  It doesn't make any
// sense to do none of them.
function get_n_random_answers(n, rules_to_randomize, image_size) {
  var answers = [];
  rules_to_randomize = new Set(rules_to_randomize);
  for (var i = 0; i < n; i++) {
    var answer = {};

    // Shape
    if (rules_to_randomize.has("shape") || rules_to_randomize.size == 0) {
      answer.shape = get_random_image(image_size);
    }

    // Color
    if (rules_to_randomize.has("color") || rules_to_randomize.size == 0) {
      answer.color = get_random_potential_rule("color");
    }

    answers.push(answer);
  }
  return answers;
}

function get_random_answer(rules_to_randomize, image_size) {
  const [answer] = get_n_random_answers(1, rules_to_randomize, image_size);
  return answer;
}

export function get_existing_rule_round(
  total_answers,
  rules_to_randomize,
  image_size
) {
  var answers = [];

  const correctAnswer = get_defined_answer();
  answers.push(correctAnswer);

  for (var i = 0; i < total_answers - 1; i++) {
    answers.push(get_random_answer(rules_to_randomize, image_size));
  }

  // We don't want the winning answer to always be at the beginning!
  answers = utils.shuffle(answers);

  return {
    answers: answers,
    correct_answer: correctAnswer,
    prompt: correctAnswer.name,
  };
}

///////////////////////////////////////////////////////////////////////
//
// Testing
//
//

// // Round 1 (new rule)
// var rule_constraints = {};
// var rule_type = "shape";
// var new_rule_round = get_new_rule_round(rule_constraints, rule_type, 3);
// console.log(">>> Define the " + new_rule_round.prompt);
// console.log(new_rule_round);
// var answer = new_rule_round.answers[0];
// console.log(
//   `Defining word ${new_rule_round.word_we_are_defining} as ${rule_type} ${answer.shape}`
// );
// define_rule(rule_type, new_rule_round.word_we_are_defining, answer.shape);

// // Round 2 (existing rules)
// var existing_rule_round = get_existing_rule_round(3);
// console.log(`>>> Find the ${existing_rule_round.correct_answer.name}`);
// console.log(existing_rule_round);

// // Round 3 (new rule)
// var rule_constraints = { shape: answer.shape };
// var rule_type = "color";
// var new_rule_round = get_new_rule_round(rule_constraints, rule_type, 3);
// console.log(">>> Define the " + new_rule_round.prompt);
// console.log(new_rule_round);
// var answer = new_rule_round.answers[0];
// console.log(
//   `Defining word ${new_rule_round.word_we_are_defining} as ${rule_type} ${answer.color}`
// );
// define_rule(rule_type, new_rule_round.word_we_are_defining, answer.color);

// // Round 4 (existing rules)
// var existing_rule_round = get_existing_rule_round(3);
// console.log(`>>> Find the ${existing_rule_round.correct_answer.name}`);
// console.log(existing_rule_round);

// // Miscellaneous testing.
// p(" ");
// p(" ");
// p(" ");
// define_rule("shape", "frobus", "data://frobus.jpg");
// define_rule("shape", "blenny", "data://blenny.jpg");
// console.log(get_fake_word_for_rule("shape", "data://frobus.jpg"));
// define_rule("color", "bleen", "blue");
// console.log(get_undefined_rules("color"));
// console.log(get_n_answers(3, {}));
// console.log(get_n_answers(3, { shape: "data://frobus.jpg" }, "color"));
