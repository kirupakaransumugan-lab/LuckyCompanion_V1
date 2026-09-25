import { useState, useEffect, useRef, useCallback } from 'react';
import { CompanionState, STATE_DURATION } from '../components/Companion/CompanionStates.js';
import { getRandomBlinkDelay } from '../utils/animation.js';

// this hook is the little state machine for the companion
export default function useCompanionAnimation(animationsEnabled) {
  const [state, setState] = useState(CompanionState.IDLE);
  const timeoutRef = useRef(null);

  const playState = useCallback((newState, duration) => {
    if (!animationsEnabled) return;
    setState(newState);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setState(CompanionState.IDLE), duration);
  }, [animationsEnabled]);

  // occasional blink while idle
  useEffect(() => {
    if (!animationsEnabled) return undefined;
    let blinkTimer;
    const scheduleBlink = () => {
      blinkTimer = setTimeout(() => {
        if (state === CompanionState.IDLE) {
          playState(CompanionState.BLINK, STATE_DURATION.blink);
        }
        scheduleBlink();
      }, getRandomBlinkDelay());
    };
    scheduleBlink();
    return () => clearTimeout(blinkTimer);
  }, [state, animationsEnabled, playState]);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  return {
    state,
    triggerClick: () => playState(CompanionState.CLICK, STATE_DURATION.click),
    triggerHappy: () => playState(CompanionState.HAPPY, STATE_DURATION.happy),
    triggerSurprised: () => playState(CompanionState.SURPRISED, STATE_DURATION.surprised),
    setSleep: (isSleeping) => setState(isSleeping ? CompanionState.SLEEP : CompanionState.IDLE)
  };
}
