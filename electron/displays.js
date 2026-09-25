const { screen } = require('electron');

const WINDOW_WIDTH = 280;
const WINDOW_HEIGHT = 400;
const TOP_MARGIN = 40;

// the list shown in the settings dropdown -- "Monitor 1", "Monitor 2", ...
// in whatever order the OS reports them, with the primary one flagged
function listDisplays() {
  const primaryId = screen.getPrimaryDisplay().id;
  return screen.getAllDisplays().map((display, index) => ({
    id: display.id,
    index,
    isPrimary: display.id === primaryId,
    bounds: display.bounds
  }));
}

function getDisplayById(id) {
  return screen.getAllDisplays().find((display) => display.id === id) || screen.getPrimaryDisplay();
}

// a spot near the top-right corner of a display's work area
function getDefaultPosition(display) {
  const { x, y, width } = display.workArea;
  return { x: x + width - WINDOW_WIDTH, y: y + TOP_MARGIN };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

// true if a window at this position would land on a display that's actually
// connected right now -- false once the monitor it was saved on gets
// unplugged, which is when the OS would otherwise place it at coordinates
// nothing exists at (running, but never drawn anywhere you can see)
function isPositionVisible(position) {
  const windowRect = { x: position.x, y: position.y, width: WINDOW_WIDTH, height: WINDOW_HEIGHT };
  return screen.getAllDisplays().some((display) => rectsOverlap(windowRect, display.bounds));
}

module.exports = {
  listDisplays,
  getDisplayById,
  getDefaultPosition,
  isPositionVisible,
  WINDOW_WIDTH,
  WINDOW_HEIGHT
};
