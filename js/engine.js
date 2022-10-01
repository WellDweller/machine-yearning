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

import * as array_utils from './array_utils.js';

var p = console.log;

var POTENTIAL_RULES = {
  color: [
    "red", "blue", "green", "orange", "pink", "purple", "yellow"
  ],
  rotation: [
    "upright", "right", "upside_down", "left"
  ],
  size: [
    "small", "medium", "large"
  ]
}

export var RULES = {
  shape: {},
  color: {},
  rotation: {},
  size: {},
}

function define_rule(rule_type, name, value) {
  console.assert(rule_type in RULES, `Unknown rule ${rule_type}`);
  console.assert(!(name in RULES[rule_type]), `${rule_type} rule ${name} already exists`);
  RULES[rule_type][name] = value;
}

function get_rule(rule_type, name) {
  console.assert(rule_type in RULES, `Unknown rule ${rule_type}`);
  // Purposefully allow undefined returns so calling logic can do something different
  // if the rule wasn't found.
  return RULES[rule_type][name];
}

function get_word_for_rule(rule_type, value) {
  for (const key in RULES[rule_type]) {
    if (value == RULES[rule_type][key]) {
      return key;
    }
  }
  console.log(`Could not find value ${value} for rule type ${rule_type}`);
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

// Probably want a way to control which rules should be varied.  And get back what actual rules
// each image fits.
//
// Also need a way to specify an *existing* image for modification (e.g. a blue "florbon").
function get_random_image() {
  var result = 'data://';
  var characters  = 'abcdefghijklmnopqrstuvwxyz';
  for (var i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function transform_image(image, rule_type, rule_value) {
  // TODO: Make it actually blue.
  if (rule_type == "color") {
    image += "." + rule_value;
  }
  return image;
}

function get_random_word() {
  var consonants = 'bcdfghjklmnpqrstvwxz';
  var vowels = 'aeiou';
  var min = 3;
  var max = 7;
  var length = Math.random() * (max - min) + min;
  var word = '';
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

function get_image(rule_constraints, new_rule_type) {
  return get_random_image();
}

window.get_prompt = function(rule_constraints, new_rule_word) {
  var prompt = new_rule_word === undefined ? "Verify the" : "Define the";
  for (const rule_type in rule_constraints) {
    // Shape should always come last, because english.
    if (rule_type == "shape") {
      continue;
    }
    prompt += " " + get_word_for_rule(rule_type, rule_constraints[rule_type]);
  }
  if (new_rule_word !== undefined) {
    prompt += " " + new_rule_word;
  }
  if ("shape" in rule_constraints) {
    prompt += " " + get_word_for_rule("shape", rule_constraints.shape);
  }
  return prompt;
}

// Try to get `n` number of potential answers.  If new_rule_type is undefined, we will attempt
// to get as many answers that fit the rule constraints as possible.  If fewer than `n` are
// found, they will be returned anyway.
//
// The rule constraints are *not* in terms of the fake language.  They're real words
// (e.g. {shape: "data://osidj", color: "blue"});
function get_n_answers(n, rule_constraints, new_rule_type) {
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
      answer.shape = get_random_image();
    }

    // Rule constraint transformations
    //
    // Color
    if ("color" in rule_constraints) {
      answer.color = rule_constraints.color;
      answer.shape = transform_image(answer.shape, "color", answer.color);
    }

    // New rule transformations
    //
    // Shapes are different and *must* be defined before the transformations,
    // so we skip them here.
    if (new_rule_type !== undefined && new_rule_type != "shape") {
      var rule_value = array_utils.get_random_item(undefined_rules);
      undefined_rules.delete(rule_value);
      answer[new_rule_type] = rule_value;
      answer.shape = transform_image(answer.shape, new_rule_type, rule_value);
    }

    answers.push(answer);
  }
  return answers;
}

// rule_constraints -- a map of the type of rule to a rule value (e.g. {color: "blue"}.
// All answers must fit these rules.)
//
// new_rule_type -- the rule we're having the user choose(e.g. "size").
window.get_new_rule_round = function (rule_constraints, new_rule_type) {
  var word = get_random_word();
  var num_images = 3;
  var answers = get_n_answers(3, rule_constraints, new_rule_type);
  var prompt = get_prompt(rule_constraints, word);
  return {
    word: word,
    prompt: prompt,
    answers: answers,
  }
}

// For now, only supports shapes.
function get_existing_rule_round() {
  var keys = Object.keys(RULES['shape']);

  // The list of images we will build up and return
  answers = [];

  // We will try to find this many existing rules to return, if possible
  num_existing = 2;
  num_existing = Math.min(num_existing, Object.keys(RULES['shape']).length);

  // The total number of answers to return
  total_answers = 3;

  // Pick an answer
  keys = array_utils.shuffle(keys);
  answer = keys[0];
  answers.push({
    name: answer,
    image: RULES['shape'][answer]
  })

  // Pick any remaining existing rules
  other_names = keys.slice(1, num_existing);
  for (const name of other_names) {
    answers.push({
      name: name,
      image: RULES['shape'][name]
    })
  }

  // Fill out remainder with new names
  for (var i = answers.length; i < total_answers; i++) {
    answers.push({
      name: get_random_word(),
      image: get_random_image()
    })
  }

  // We don't want the existing rules to always be at the beginning
  answers = array_utils.shuffle(answers);

  return {
    rule: {
      type: "shape",
    },
    answer: answer,
    answers: answers,
    prompt: `Find the ${answer}`,
  }
}

//
//
// Testing
//
//

// Round 1
var rule_constraints = {};
var rule_type = "shape";
var new_rule_round = get_new_rule_round(rule_constraints, rule_type);
console.log(">>> " + new_rule_round.prompt);
var answer = new_rule_round.answers[0];
console.log(`Defining word ${new_rule_round.word} as ${rule_type} ${answer.shape}`);
define_rule(rule_type, new_rule_round.word, answer.shape);

// Round 2
var rule_constraints = {shape: answer.shape};
var rule_type = "color";
var new_rule_round = get_new_rule_round(rule_constraints, rule_type);
console.log(">>> " + new_rule_round.prompt);
var answer = new_rule_round.answers[0];
console.log(`Defining word ${new_rule_round.word} as ${rule_type} ${answer.color}`);
define_rule(rule_type, new_rule_round.word, answer.color);

// Miscellaneous testing.
p(" ");
p(" ");
p(" ");
define_rule("shape", "frobus", "data://frobus.jpg");
define_rule("shape", "blenny", "data://blenny.jpg");
console.log(get_word_for_rule("shape", "data://frobus.jpg"));
define_rule("color", "bleen", "blue");
console.log(get_undefined_rules("color"));
console.log(get_n_answers(3, {}));
console.log(get_n_answers(3, {shape: "data://frobus.jpg"}, "color"));