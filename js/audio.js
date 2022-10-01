import * as utils from './utils.js';

var SOUNDS = {
	"bleep": [
		[
			new Audio("sounds/bleep_hi_1.mp3"),
			new Audio("sounds/bleep_hi_2.mp3"),
		],
		[
			new Audio("sounds/bleep_lo_1.mp3"),
			new Audio("sounds/bleep_lo_2.mp3"),
		],
	],
}

// TODO: Preload?

export function play(name) {
	var layers = SOUNDS[name];
	for (const layer of layers) {
		var sound = layer[utils.get_random_item(layer)];
	    sound.mozPreservesPitch = false;
	    sound.preservesPitch = false;
	    sound.playbackRate = utils.get_random_in_range(0.8, 1.2);
	    sound.volume = utils.get_random_in_range(0.8, 1.0);
	    sound.currentTime = 0;
	    sound.play();
	}
}

window.play = play;