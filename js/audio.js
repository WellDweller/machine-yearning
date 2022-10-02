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
	"success": [
		[
			new Audio("sounds/success_hi_01.mp3"),
			new Audio("sounds/success_hi_02.mp3"),
			new Audio("sounds/success_hi_03.mp3"),
		],
		[
			new Audio("sounds/success_mid_01.mp3"),
			new Audio("sounds/success_mid_02.mp3"),
			new Audio("sounds/success_mid_03.mp3"),
		],
		[
			new Audio("sounds/success_low_01.mp3"),
			new Audio("sounds/success_low_02.mp3"),
			new Audio("sounds/success_low_03.mp3"),
		],
	],
	"spaceship_falling": [
		[
			new Audio("sounds/spaceship_falling.mp3"),
		],
	]
}

// TODO: Preload?

export function play(name, vary_pitch, volume) {
	var layers = SOUNDS[name];
	volume = volume === undefined ? 1.0 : volume;
	for (const layer of layers) {
		var sound = layer[utils.get_random_item(layer)];
	    sound.mozPreservesPitch = false;
	    sound.preservesPitch = false;
	    if (vary_pitch) {
	    	sound.playbackRate = utils.get_random_in_range(0.99, 1.01);
	    } else {
	    	sound.playbackRate = 1.0;
	    }
	    sound.volume = utils.get_random_in_range(0.9, 1.0) * volume;
	    sound.currentTime = 0;
	    sound.play();
	}
}

window.play = play;