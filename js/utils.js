export function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function get_random_item(array_or_set) {
  let keys = Array.from(array_or_set.keys());
  return keys[Math.floor(Math.random() * keys.length)];
}

export function get_random_in_range(min, max) {
  return Math.random() * (max - min) + min;
}

export function get_random_int_in_range(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function get_random_key(obj) {
  let keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}

export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
