import { useMemo } from 'react';

// this hook turns the electron drag region on or off
export default function useDrag(enabled = true) {
  const dragStyle = useMemo(() => ({
    WebkitAppRegion: enabled ? 'drag' : 'no-drag'
  }), [enabled]);

  return dragStyle;
}
