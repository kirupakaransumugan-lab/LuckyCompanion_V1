// this file lists every animation state the companion can be in
export const CompanionState = {
  IDLE: 'idle',
  BLINK: 'blink',
  HAPPY: 'happy',
  CLICK: 'click',
  SURPRISED: 'surprised',
  SLEEP: 'sleep'
};

// how long each short animation plays before returning to idle, in ms
export const STATE_DURATION = {
  blink: 220,
  click: 500,
  happy: 900,
  surprised: 600
};
