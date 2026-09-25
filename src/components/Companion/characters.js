import luckyEyeIdle from '../../assets/characters/lucky-eye/idle/evileye.png';
import luckyEyeBlink from '../../assets/characters/lucky-eye/blink/evileye.png';
import luckyEyeHappy from '../../assets/characters/lucky-eye/happy/evileye.png';
import luckyEyeClick from '../../assets/characters/lucky-eye/click/evileye.png';
import luckyEyeSurprised from '../../assets/characters/lucky-eye/surprised/evileye.png';
import luckyEyeSleep from '../../assets/characters/lucky-eye/sleep/evileye.png';
import ukiIdle from '../../assets/characters/uki/idle/uki.png';
import velmayilIdle from '../../assets/characters/velmayil/idle/velmayil.png';
import ksSangaIdle from '../../assets/characters/ks-sanga/idle/ks-sanga.png';

// this is the list of charms the companion can hang as
// each one only needs an idle image, extra states are optional
export const CHARACTERS = [
  {
    id: 'lucky-eye',
    name: 'Lucky Eye',
    preview: luckyEyeIdle,
    images: {
      idle: luckyEyeIdle,
      blink: luckyEyeBlink,
      happy: luckyEyeHappy,
      click: luckyEyeClick,
      surprised: luckyEyeSurprised,
      sleep: luckyEyeSleep
    }
  },
  {
    id: 'uki',
    name: 'UKI',
    preview: ukiIdle,
    images: {
      idle: ukiIdle
    }
  },
  {
    id: 'velmayil',
    name: 'Velmayil',
    preview: velmayilIdle,
    images: {
      idle: velmayilIdle
    }
  },
  {
    id: 'ks-sanga',
    name: 'KS Sanga',
    preview: ksSangaIdle,
    images: {
      idle: ksSangaIdle
    }
  }
];

export function getCharacterById(id) {
  return CHARACTERS.find((character) => character.id === id) || CHARACTERS[0];
}

// falls back to the idle picture if a charm has no art for this state yet
export function getCharacterImage(character, state) {
  return character.images[state] || character.images.idle;
}
