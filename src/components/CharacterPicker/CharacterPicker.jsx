import React from 'react';
import { CHARACTERS } from '../Companion/characters.js';
import './CharacterPicker.css';

// this is the small panel for picking which charm hangs on the rope
export default function CharacterPicker({ selectedId, onSelect, onClose }) {
  return (
    <div className="charmPickerPanel">
      <div className="charmPickerHeader">
        <span>Change Charm</span>
        <button className="charmPickerCloseBtn" onClick={onClose}>×</button>
      </div>

      <div className="charmPickerGrid">
        {CHARACTERS.map((character) => {
          const isActive = character.id === selectedId;
          return (
            <button
              key={character.id}
              className={`charmPickerItem ${isActive ? 'charmPickerItemActive' : ''}`}
              onClick={() => onSelect(character.id)}
            >
              <img src={character.preview} alt={character.name} className="charmPickerImage" />
              <span>{character.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
