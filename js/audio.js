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
	"success_single": [
		[
			new Audio("sounds/success_single.mp3"),
		],
	],
	"success_stairs_single": [
		[
			new Audio("sounds/success_stairs_single.mp3"),
		],
	],
	"beep_bright": [
		[
			new Audio("sounds/beep_bright.mp3"),
		],
	],
	"beep_muffled": [
		[
			new Audio("sounds/beep_muffled.mp3"),
		],
	],
	"ui_confirm": [
		[
			new Audio("sounds/ui_confirm_01.mp3"),
		],
	],
	"star_confirm_hi": [[new Audio("sounds/star_confirm_hi_01.mp3")]],
	"star_confirm_mid": [
		[
			new Audio("sounds/star_confirm_mid_01.mp3"),
		],
	],
	"crisp_click": [[new Audio("sounds/crisp_click.mp3")]],
	"mouth_pop": [
		[
			new Audio("sounds/mouth_pop_01.mp3"),
			new Audio("sounds/mouth_pop_02.mp3"),
			new Audio("sounds/mouth_pop_03.mp3"),
			new Audio("sounds/mouth_pop_04.mp3"),
			new Audio("sounds/mouth_pop_05.mp3"),
			new Audio("sounds/mouth_pop_06.mp3"),
			new Audio("sounds/mouth_pop_07.mp3"),
		],
	],
	// Bad stuff
	"spaceship_falling": [
		[
			new Audio("sounds/spaceship_falling.mp3"),
		],
	],
	"failure": [
		[
			new Audio("sounds/failure.mp3"),
		],
	],
}

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

export var theme_song = new Audio('sounds/theme draft.mp3');
theme_song.addEventListener('timeupdate', function(){
    var buffer = .44;
    if(this.currentTime > this.duration - buffer){
        this.currentTime = 0;
        this.play();
    }
});

window.theme_song = theme_song;

window.play = play;