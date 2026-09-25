// short lucky messages shown when the companion is clicked
export const LUCK_MESSAGES = [
  'Good luck!',
  "You've got this!",
  'Keep going!',
  'Something good is coming.',
  'Stay focused!',
  "Let's go!"
];

export function getRandomMessage() {
  const index = Math.floor(Math.random() * LUCK_MESSAGES.length);
  return LUCK_MESSAGES[index];
}

// random delay before the next idle blink
export function getRandomBlinkDelay() {
  return 3000 + Math.random() * 4000;
}
