export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function oppositePit(index) {
  return 12 - index;
}

export function randomInt(max) {
  return Math.floor(Math.random() * max);
}
