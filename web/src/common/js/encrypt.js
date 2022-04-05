export function encrypt(str) {
  return btoa(btoa(str).split("").reverse().join(""));
}
