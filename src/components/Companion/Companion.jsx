import React, { useState, useRef } from 'react';
import CompanionAnimation from './CompanionAnimation.jsx';
import { getCharacterById } from './characters.js';
import useCompanionAnimation from '../../hooks/useCompanionAnimation.js';
import useRopePhysics, { ROPE_POINTS, SEGMENT_LENGTH } from '../../hooks/useRopePhysics.js';
import useDrag from '../../hooks/useDrag.js';
import { getRandomMessage } from '../../utils/animation.js';
import './Companion.css';

const SIZE_CLASS = {
  small: 'sizeSmall',
  medium: 'sizeMedium',
  large: 'sizeLarge'
};

// a click vs a drag is told apart by how far and how long the pointer moved
const CLICK_MAX_DISTANCE = 6;
const CLICK_MAX_TIME = 300;

const STAGE_WIDTH = 230;
const STAGE_HEIGHT = SEGMENT_LENGTH * (ROPE_POINTS - 1) + 40;
// the pivot's children are all absolutely positioned, so it needs an
// explicit height (rope + the tallest charm) or it collapses to 0 and the
// message bubble below it ends up drawn on top of the charm
const PIVOT_HEIGHT = STAGE_HEIGHT + 210;

// draws a smooth curve through the rope's physics points, the same way
// bookmyluck.com turns its point chain into a path (quadratic curve through
// midpoints, so the rope bends instead of showing sharp joints)
function buildRopePath(points, offsetX) {
  let d = `M ${(points[0].x + offsetX).toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2 + offsetX;
    const midY = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${(points[i].x + offsetX).toFixed(2)} ${points[i].y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
  }
  const last = points[points.length - 1];
  d += ` L ${(last.x + offsetX).toFixed(2)} ${last.y.toFixed(2)}`;
  return d;
}

// this is the desktop companion: a rope with a charm swinging on it
export default function Companion({ settings, onRightClick }) {
  const character = getCharacterById(settings.characterId);
  const sizeClass = SIZE_CLASS[settings.characterSize] || 'sizeMedium';
  const { state, triggerClick } = useCompanionAnimation(settings.animationsOn !== false);
  const { points, end, endAngle, stretch, startDrag, dragTo, endDrag } = useRopePhysics(settings.animationsOn !== false);
  const ropeDragStyle = useDrag(true);

  const [message, setMessage] = useState('');
  const pivotRef = useRef(null);
  const gestureRef = useRef({ active: false, startX: 0, startY: 0, startTime: 0 });

  function playClickSound() {
    if (settings.soundOn === false) return;
    try {
      const soundUrl = new URL('../../assets/sounds/click.mp3', import.meta.url).href;
      const audio = new Audio(soundUrl);
      audio.play().catch(() => {});
    } catch (err) {
      // no sound file yet, that is fine
    }
  }

  function handleClick() {
    triggerClick();
    playClickSound();
    setMessage(getRandomMessage());
    setTimeout(() => setMessage(''), 2000);
  }

  function handleContextMenu(event) {
    event.preventDefault();
    onRightClick(event.clientX, event.clientY);
  }

  // works out a point's position relative to the anchor (top of the rope)
  function localFromPoint(x, y) {
    const rect = pivotRef.current.getBoundingClientRect();
    const anchorX = rect.left + rect.width / 2;
    const anchorY = rect.top;
    return { x: x - anchorX, y: y - anchorY };
  }

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now()
    };
    const local = localFromPoint(event.clientX, event.clientY);
    startDrag();
    dragTo(local.x, local.y);
  }

  function handlePointerMove(event) {
    if (!gestureRef.current.active) return;
    const local = localFromPoint(event.clientX, event.clientY);
    dragTo(local.x, local.y);
  }

  function handlePointerUp(event) {
    if (!gestureRef.current.active) return;
    gestureRef.current.active = false;

    const dx = event.clientX - gestureRef.current.startX;
    const dy = event.clientY - gestureRef.current.startY;
    const moved = Math.sqrt(dx * dx + dy * dy);
    const heldTime = performance.now() - gestureRef.current.startTime;

    endDrag();

    if (moved < CLICK_MAX_DISTANCE && heldTime < CLICK_MAX_TIME) {
      handleClick();
    }
  }

  const ropePath = buildRopePath(points, STAGE_WIDTH / 2);
  // real cord thins out as it's stretched taut -- same idea as necking in a
  // pulled elastic, just enough to read as tension rather than a rigid rod
  const ropeTension = Math.max(Math.sqrt(stretch), 1);
  const charmTransform =
    `translate(-50%, 0) translate(${end.x.toFixed(2)}px, ${end.y.toFixed(2)}px) rotate(${endAngle.toFixed(2)}deg)`;

  return (
    <div className="companionAnchor">
      <div className="pivot" ref={pivotRef} style={{ width: STAGE_WIDTH, height: PIVOT_HEIGHT }}>
        <div className="ropeDragZone" style={ropeDragStyle} />
        <svg
          className="ropeSvg"
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
        >
          <path className="ropeStroke" d={ropePath} style={{ strokeWidth: 3.2 / ropeTension }} />
          <path className="ropeHighlight" d={ropePath} style={{ strokeWidth: 1.3 / ropeTension }} />
        </svg>
        <div
          className="charmHandle"
          style={{ transform: charmTransform }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onContextMenu={handleContextMenu}
        >
          <CompanionAnimation character={character} state={state} sizeClass={sizeClass} />
        </div>
      </div>
      {message && <div className="companionBubble">{message}</div>}
    </div>
  );
}
