import React from 'react';
import { getCharacterImage } from './characters.js';

// this just picks the right picture for the current charm and state
export default function CompanionAnimation({ character, state, sizeClass }) {
  const stateClass = `companionState${state.charAt(0).toUpperCase()}${state.slice(1)}`;
  const image = getCharacterImage(character, state);

  return (
    <img
      src={image}
      alt={character.name}
      className={`companionImage ${sizeClass} ${stateClass}`}
      draggable="false"
    />
  );
}
