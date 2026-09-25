import { useEffect, useRef, useState, useCallback } from 'react';
import useHostWindow from './useHostWindow.js';

// A Verlet-integrated rope: instead of one rigid angle for the whole rope
// (the old model), the rope is a short chain of points that each remember
// only their current and previous position. Velocity is never stored
// separately -- it falls out of (position - previousPosition) -- which is
// what makes a drag-release feel right for free: the last dragged position
// becomes "previous", so letting go leaves exactly the right amount of
// motion behind, no manual velocity sampling needed.
//
// Modeled on the physics bookmyluck.com uses for its hanging charm: a
// fixed-length chain solved with iterative distance constraints, stepped at
// a fixed 120Hz clock (decoupled from the monitor's frame rate) so the
// motion looks the same and stays stable on any display. There's no ambient
// sway -- gravity and damping settle the rope to a dead stop once it's not
// being touched, so it only ever moves because the charm was grabbed.

export const ROPE_POINTS = 7; // anchor + 6 movable points
export const SEGMENT_LENGTH = 18; // px between points -> ~108px of rope
const GRAVITY = 0.09; // px added to y each physics substep
const DAMPING = 0.98; // fraction of velocity kept each substep (air drag)
const CONSTRAINT_ITERATIONS = 6;
const SUBSTEP = 1 / 120;
const MAX_SUBSTEPS_PER_FRAME = 6; // caps the catch-up if a frame stalls
// a segment can reach this multiple of SEGMENT_LENGTH before the hard stop
// in satisfyRopeConstraints kicks in -- what makes the cord feel elastic
// instead of a rigid rod
export const MAX_STRETCH_RATIO = 1.5;

function createChain() {
  return Array.from({ length: ROPE_POINTS }, (_, i) => {
    const y = i * SEGMENT_LENGTH;
    return { x: 0, y, px: 0, py: y };
  });
}

export default function useRopePhysics(enabled) {
  const hostWindow = useHostWindow();
  const pointsRef = useRef(createChain());
  const [, forceRender] = useState(0);
  const draggingRef = useRef(false);
  const dragTargetRef = useRef(null);
  const accRef = useRef(0);
  const lastFrameRef = useRef(null);
  const rafRef = useRef(null);

  const step = useCallback(() => {
    const points = pointsRef.current;

    for (let i = 1; i < points.length; i++) {
      const p = points[i];
      const vx = (p.x - p.px) * DAMPING;
      const vy = (p.y - p.py) * DAMPING;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + GRAVITY;
    }

    // the rope always starts pinned to the top of the pivot
    points[0].x = 0;
    points[0].y = 0;

    if (draggingRef.current && dragTargetRef.current) {
      const end = points[points.length - 1];
      end.x = dragTargetRef.current.x;
      end.y = dragTargetRef.current.y;
    }

    satisfyRopeConstraints(points, draggingRef.current);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    function frame(now) {
      if (lastFrameRef.current == null) lastFrameRef.current = now;
      const dt = (now - lastFrameRef.current) / 1000;
      lastFrameRef.current = now;
      accRef.current = Math.min(accRef.current + dt, SUBSTEP * MAX_SUBSTEPS_PER_FRAME);

      while (accRef.current >= SUBSTEP) {
        step();
        accRef.current -= SUBSTEP;
      }

      forceRender((t) => t + 1);
      rafRef.current = hostWindow.requestAnimationFrame(frame);
    }

    rafRef.current = hostWindow.requestAnimationFrame(frame);
    return () => {
      hostWindow.cancelAnimationFrame(rafRef.current);
      lastFrameRef.current = null;
    };
  }, [enabled, step, hostWindow]);

  const startDrag = useCallback(() => {
    draggingRef.current = true;
  }, []);

  // x, y are local to the anchor (top of the rope), same as the physics points
  const dragTo = useCallback((x, y) => {
    const maxReach = SEGMENT_LENGTH * (ROPE_POINTS - 1) * MAX_STRETCH_RATIO;
    const d = Math.max(Math.hypot(x, y), 1);
    const clamped = Math.min(d, maxReach);
    dragTargetRef.current = { x: (x / d) * clamped, y: (y / d) * clamped };
  }, []);

  const endDrag = useCallback(() => {
    draggingRef.current = false;
    dragTargetRef.current = null;
  }, []);

  const points = pointsRef.current;
  const end = points[points.length - 1];
  const beforeEnd = points[points.length - 2];
  const endAngle = Math.atan2(end.x - beforeEnd.x, end.y - beforeEnd.y) * (180 / Math.PI);
  // how taut the whole cord is right now (1 = resting length, >1 = stretched),
  // so the rope can be drawn thinner while it's under tension
  const stretch = getChainLength(points) / (SEGMENT_LENGTH * (ROPE_POINTS - 1));

  return { points, end, endAngle, stretch, startDrag, dragTo, endDrag };
}

function getChainLength(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
  }
  return total;
}

// Pulls each segment back toward its resting length (SEGMENT_LENGTH), a
// handful of iterations at a time. It's what turns "points falling under
// gravity" into "a rope swinging and curving like a real cord" instead of
// a rigid rotating rod -- and how stretchy that cord feels comes entirely
// from how hard each iteration pulls a stretched segment back.
function satisfyRopeConstraints(points, dragging) {
  for (let iteration = 0; iteration < CONSTRAINT_ITERATIONS; iteration++) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distance = Math.max(Math.hypot(dx, dy), 1e-4);
      const stretch = distance - SEGMENT_LENGTH; // > 0 stretched, < 0 bunched up

      // TODO(human): turn `stretch` into `correction` -- how much of the
      // gap between `a` and `b` gets pulled back this iteration.
      // `correction = stretch` reproduces the old rigid rope (fully
      // satisfied every iteration, so segments never visibly stretch).
      // Make it elastic instead: only pull back a fraction of `stretch`
      // when the segment is within its elastic range, but once `distance`
      // passes SEGMENT_LENGTH * MAX_STRETCH_RATIO, snap hard back to that
      // limit so the cord doesn't stretch forever. Compression (stretch < 0,
      // the rope bunching up on itself) can stay close to a full correction
      // -- real cords resist being pushed together far more than being pulled.
      const correction = stretch;

      const diff = correction / distance;
      const offsetX = dx * diff * 0.5;
      const offsetY = dy * diff * 0.5;

      if (i === 0) {
        // the anchor never moves, so the next point absorbs the full correction
        b.x -= offsetX * 2;
        b.y -= offsetY * 2;
      } else if (dragging && i === points.length - 2) {
        // let the dragged end follow the pointer directly instead of springing back
        a.x += offsetX * 2;
        a.y += offsetY * 2;
      } else {
        a.x += offsetX;
        a.y += offsetY;
        b.x -= offsetX;
        b.y -= offsetY;
      }
    }
  }
}
