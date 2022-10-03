import * as utils from './utils.js';

var MUSIC_VOLUME = 1.0;
var FX_VOLUME = 1.0;

var SOUNDS = {
	// "bleep": [
	// 	[
	// 		new Audio("sounds/bleep_hi_1.mp3"),
	// 		new Audio("sounds/bleep_hi_2.mp3"),
	// 	],
	// 	[
	// 		new Audio("sounds/bleep_lo_1.mp3"),
	// 		new Audio("sounds/bleep_lo_2.mp3"),
	// 	],
	// ],
	// "success": [
	// 	[
	// 		new Audio("sounds/success_hi_01.mp3"),
	// 		new Audio("sounds/success_hi_02.mp3"),
	// 		new Audio("sounds/success_hi_03.mp3"),
	// 	],
	// 	[
	// 		new Audio("sounds/success_mid_01.mp3"),
	// 		new Audio("sounds/success_mid_02.mp3"),
	// 		new Audio("sounds/success_mid_03.mp3"),
	// 	],
	// 	[
	// 		new Audio("sounds/success_low_01.mp3"),
	// 		new Audio("sounds/success_low_02.mp3"),
	// 		new Audio("sounds/success_low_03.mp3"),
	// 	],
	// ],
	// "success_single": [
	// 	[
	// 		new Audio("sounds/success_single.mp3"),
	// 	],
	// ],
	// "success_stairs_single": [
	// 	[
	// 		new Audio("sounds/success_stairs_single.mp3"),
	// 	],
	// ],
	// "beep_bright": [
	// 	[
	// 		new Audio("sounds/beep_bright.mp3"),
	// 	],
	// ],
	// "beep_muffled": [
	// 	[
	// 		new Audio("sounds/beep_muffled.mp3"),
	// 	],
	// ],
	// "ui_confirm": [
	// 	[
	// 		new Audio("sounds/ui_confirm_01.mp3"),
	// 	],
	// ],
	// "star_confirm_hi": [[new Audio("sounds/star_confirm_hi_01.mp3")]],
	// "star_confirm_mid": [
	// 	[
	// 		new Audio("sounds/star_confirm_mid_01.mp3"),
	// 	],
	// ],
	// "crisp_click": [[new Audio("sounds/crisp_click.mp3")]],
	// "basic_click": [[new Audio("sounds/basic_click_01.mp3")]],
	"basic_click_02": [[new Audio("sounds/basic_click_02.mp3")]],
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
	// "failure": [
	// 	[
	// 		new Audio("sounds/failure.mp3"),
	// 	],
	// ],
	"failure_02": [[new Audio("sounds/failure_02.mp3")]],
	"riser": [[new Audio("sounds/riser.mp3")]],
}

var VOLUME_MAP = {
	"basic_click_02": 0.8,
	"riser":  0.6,
	"failure_02": 0.7,
	"mouth_pop": 0.9,
	"spaceship_falling": 0.5,
}

export function play(name, vary_pitch) {
	var layers = SOUNDS[name];
	var volume = VOLUME_MAP[name];
	for (const layer of layers) {
		var sound = layer[utils.get_random_item(layer)];
	    sound.mozPreservesPitch = false;
	    sound.preservesPitch = false;
	    if (vary_pitch) {
	    	sound.playbackRate = utils.get_random_in_range(0.99, 1.01);
	    } else {
	    	sound.playbackRate = 1.0;
	    }
	    sound.volume = utils.get_random_in_range(0.9, 1.0) * volume * FX_VOLUME;
	    sound.currentTime = 0;
	    sound.play();
	}
}

window.play = play;

export function stop(name) {
	var layers = SOUNDS[name];
	for (const layer of layers) {
		for (const sound of layer) {
		    sound.pause();
		    sound.currentTime = 0;
		}
	}
}

window.stop = stop;

export var theme_song = new Audio('sounds/theme.mp3');
theme_song.addEventListener('timeupdate', function(){
    var buffer = .44;
    if(this.currentTime > this.duration - buffer){
        this.currentTime = 0;
        this.play();
    }
});

window.theme_song = theme_song;

export function set_music_volume(volume) {
	MUSIC_VOLUME = volume;
	theme_song.volume = volume;
}
// Since we're not storing the volumes directly on the objects, we don't know
// what they were intended to be played at.  So instead, an update to this will
// change any future FX volumes.
export function set_fx_volume(volume) {
	FX_VOLUME = volume;

	// Update any actively playing sounds.
	for (var name in SOUNDS) {
		var volume_map_volume = VOLUME_MAP[name];
		var layers = SOUNDS[name];
		for (const layer of layers) {
			for (const sound of layer) {
				console.log(name);
				console.log(volume, volume_map_volume);
			    sound.volume = volume * volume_map_volume;
			}
		}
	}

}

export function get_music_volume(){
	return MUSIC_VOLUME;
}

export function get_fx_volume(){
	return FX_VOLUME
}
