import { createContext, useContext } from 'react';

// the window the companion is currently drawn in -- the browser tab
// normally, or the picture-in-picture window once it's popped out. timers
// and animation frames have to come from that window, because the tab's
// own requestAnimationFrame stops as soon as the tab is minimized
export const HostWindowContext = createContext(typeof window !== 'undefined' ? window : null);

export default function useHostWindow() {
  return useContext(HostWindowContext);
}
