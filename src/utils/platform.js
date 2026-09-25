// true when running inside the electron shell, false in a normal browser tab
export const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

// document picture-in-picture (chrome / edge 116+) is what lets the web
// build float on top of the windows desktop like the electron window does
export const canPopOut = typeof window !== 'undefined' && 'documentPictureInPicture' in window;
