RULES = {
	shapes: {},
	colors: {},
	rotations: {},
	size: {},
}

// Probably want a way to control which rules should be varied.  And get back what actual rules
// each image fits.
//
// Also need a way to specify an *existing* image for modification (e.g. a blue "florbon").
function get_random_image() {
	var result           = 'data://';
    var characters       = 'abcdefghijklmnopqrstuvwxyz';
    for ( var i = 0; i < 12; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
   }
   return result;
}

function get_random_word() {
	consonants = 'bcdfghjklmnpqrstvwxz';
	vowels = 'aeiou';
	min = 3;
	max = 7;
	length = Math.random() * (max - min) + min;
	word = '';
	pick_from_consonants = true;
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

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

function define_rule(type, name, value) {
	console.assert(type in RULES, `Unknown rule ${type}`);
	console.assert(!(name in RULES[type]), `${type} rule ${name} already exists`);
	RULES[type][name] = value;
}

function get_new_rule_round() {
	word = get_random_word();
	num_images = 3;
	images = []
	for (var i = 0; i < num_images; i++) {
		images.push({image: get_random_image()});
	}
	return {
		definition: {
			type: "shapes",
			name: word,
		},
		prompt: `Define the ${word}`,
		images: images,
	}
}

// For now, only supports shapes.
function get_existing_rule_round() {
	var keys = Object.keys(RULES['shapes']);

	// The list of images we will build up and return
	answers = [];

	// We will try to find this many existing rules to return, if possible
	num_existing = 2;
	num_existing = Math.min(num_existing, Object.keys(RULES['shapes']).length);

	// The total number of answers to return
	total_answers = 3;

	// Pick an answer
	keys = shuffle(keys);
	answer = keys[0];
	answers.push({
		name: answer,
		image: RULES['shapes'][answer]
	})

	// Pick any remaining existing rules
	other_names = keys.slice(1, num_existing);
	for (const name of other_names) {
		answers.push({
			name: name,
			image: RULES['shapes'][name]
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
	answers = shuffle(answers);

	return {
		rule: {
			type: "shapes",
		},
		answer: answer,
		answers: answers,
		prompt: `Find the ${answer}`,
	}
}

//
//
// Dummy test data
//
//

define_rule("shapes", "frobus", "data://frobus.jpg");
define_rule("shapes", "blenny", "data://blenny.jpg");