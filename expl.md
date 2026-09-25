# Lucky Companion — What This Is and How to Use It

This is an original desktop companion app, built as its own thing (not copied from
Book My Luck or anyone else — their site was checked only to understand the general
idea of a charm swaying from a cord; the animation, code and UI here are original).
It's a small charm that hangs from a rope at the top of your Windows desktop,
sways on its own, and can be flicked or dragged around.

## 1. What was built

- A transparent, frameless, always-on-top Electron window (no normal app window/border).
- A rope hanging from a fixed point, with a charm swinging below it using real
  pendulum physics (a spring pulls it back to center, damping slows it down, and a
  tiny constant "breeze" keeps it gently swaying forever instead of stopping dead).
- Click the charm (a quick tap, no drag) → it plays a springy bounce animation and
  shows a random "good luck" message in a speech bubble.
- Grab the charm and drag → it swings with real momentum, following your mouse, and
  keeps swinging naturally after you let go.
- Grab the rope itself → that moves the whole companion window to a new spot on the
  desktop. Its position is remembered and restored next time you open the app.
- A **Change Charm** panel with thumbnails for Lucky Eye, UKI, and Velmayil — open it
  from the tray menu or by right-clicking the charm — to switch which charm is hanging.
- A system tray icon with a menu: Show Companion, Hide Companion, Change Character,
  Settings, Start With Windows, Quit.
- A settings panel with: charm size (small/medium/large), sound on/off,
  animations on/off, always-on-top on/off, start-with-Windows on/off, and a
  "reset position" button.
- Settings, chosen charm, and window position are all saved with `electron-store`,
  so they survive restarts.

## 2. How the code is organized

```
lucky-companion/
├── electron/                → everything that runs in Electron's main process
│   ├── main.js               → creates the window, wires everything together
│   ├── preload.js            → the ONLY bridge between Electron and React (safe APIs only)
│   ├── ipc/
│   │   ├── settings.js       → get/save settings, reset position
│   │   └── app.js            → show/hide/quit messages from React
│   └── tray/
│       └── tray.js           → builds the system tray icon and its menu
│
├── src/                      → the React app (the part you see on screen)
│   ├── components/
│   │   ├── Companion/        → the rope + charm, its animation states, and the charm list
│   │   ├── CharacterPicker/  → the "Change Charm" thumbnail panel
│   │   ├── Settings/         → the settings panel UI
│   │   └── Menu/             → the small right-click menu
│   ├── assets/
│   │   ├── characters/       → charm artwork, one folder per charm
│   │   ├── shared/rope.png   → the rope, used by every charm
│   │   └── sounds/           → put click.mp3 here if you want a click sound
│   ├── hooks/                → small reusable pieces of logic (see below)
│   ├── utils/                → plain helper functions (messages, storage)
│   └── App.jsx               → puts the companion, settings, and pickers together
│
├── public/icons/             → tray icon and app icon
├── package.json
├── vite.config.js
└── electron-builder.yml      → Windows build settings
```

### The hooks

- `useCompanionAnimation.js` — the little "state machine" for the charm's expression
  (idle, blink, happy, click, surprised, sleep). It returns to idle automatically
  and schedules random blinks.
- `usePendulumSwing.js` — the physics for the swaying rope. Every animation frame it
  works out an angle using three forces: a spring pulling back to the middle, damping
  that slows the swing down, and a small constant "breeze" so it never fully stops.
  While you're dragging the charm, physics pauses and the angle just follows your mouse.
- `useDrag.js` — turns Electron's native window-dragging on or off for an element
  (used on the rope, so grabbing the rope moves the window).
- `useSettings.js` — loads settings when the app starts and saves them whenever
  they change.

### How the flick/drag interaction tells a click from a swing

`Companion.jsx` tracks how far the mouse moved and how long the pointer was held
between press and release. If it was a short tap with barely any movement, it's
treated as a click (message + bounce). Otherwise, it's treated as a drag: the last
few mouse positions are used to work out how fast you were moving when you let go,
and that becomes the charm's starting swing speed — so a fast flick makes it swing
harder, just like a real hanging charm.

### Why dragging the rope doesn't need mouse-tracking code

The rope image uses the CSS rule `-webkit-app-region: drag`, so Electron lets the
operating system handle moving the window — smoother and simpler than doing it by
hand. The charm itself is `no-drag` so it can be grabbed for the physics-based swing
instead of moving the window.

## 3. About the artwork

Your uploaded images live in `src/assets/`:

- `characters/lucky-eye/` — the blue evil-eye mascot. It currently has the **same
  image** in every animation folder (`idle`, `blink`, `happy`, `click`, `surprised`,
  `sleep`) as a placeholder — the animation *movement* already differs per state
  because that's done with CSS. Drop a distinct picture into any one folder (say, an
  eye with a closed lid for `blink`) and it's used automatically — nothing else
  needs to change.
- `characters/uki/` and `characters/velmayil/` — each only has an `idle` image, and
  that's fine: a charm with no dedicated `blink`/`click`/etc art just reuses its
  idle picture for those states (see `getCharacterImage()` in `characters.js`).
- `shared/rope.png` — the rope, shared by every charm.

Note: a couple of the images you provided (the "UKI" charm and the peacock pendant)
look like they may be existing product photography rather than artwork drawn for
this project. They've been placed in as you asked, but it's worth double-checking
you have the rights to use them before shipping the app publicly.

## 4. Running it yourself

```
npm install
npm run dev      # opens the companion in development mode
npm run dist     # builds a Windows installer into the release/ folder
```

The app works fully offline — no backend, no network calls.

## 5. Easy things to customize next

- Add a real `click.mp3` file into `src/assets/sounds/` to get a click sound
  (the code already looks for it and quietly does nothing if it's missing).
- Add unique artwork per animation state for `lucky-eye` (see section 3 above).
- Add a full state set (`blink`, `click`, etc.) for `uki` or `velmayil` the same way.
- Tweak the sway feel by adjusting `SPRING`, `DAMPING`, and `BREEZE_STRENGTH` at the
  top of `usePendulumSwing.js` — higher `SPRING` swings back faster, higher `DAMPING`
  settles quicker, higher `BREEZE_STRENGTH` keeps it moving more.
- Add more messages to `LUCK_MESSAGES` in `src/utils/animation.js`.
- Add a fourth charm by adding its images to `src/assets/characters/` and a new
  entry in `CHARACTERS` inside `characters.js` — it'll show up in the picker.
