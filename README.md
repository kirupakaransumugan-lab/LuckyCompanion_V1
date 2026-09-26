# Lucky Companion

A small animated charm that hangs on your Windows desktop, built with Electron + React + Vite.
Original concept and code — not affiliated with Book My Luck.

The project has two parts that share the same React code:

| Part | Where it runs | What it is |
|---|---|---|
| **Website** | Vercel (browser) | The landing page. Visitors pick a charm and press **Put it on my desktop**. |
| **Desktop app** | The visitor's Windows PC | A transparent, frameless, always-on-top Electron window with a tray icon — the actual charm hanging on the desktop. |

---

## How "Put it on my desktop" works

A web page can't draw a transparent window on someone's desktop, because browsers
don't allow it. So the website *launches* the desktop app, the way Zoom, Discord or
Spotify do from their sites:

```
Visitor clicks "Put it on my desktop" on the website
        │
        ▼
Browser opens  luckycompanion://open?character=lucky-eye
        │
        ├── App installed? ──► Windows starts Lucky Companion (or wakes the running one)
        │                      → the charm appears on the desktop, transparent, on top
        │                      → it switches to the charm the visitor picked
        │
        └── Not installed? ──► After ~1.5 s the page shows "Download for Windows"
                               → opens the shared Google Drive folder
                               → visitor installs once
                               → next click opens the app directly
```

### The pieces

- **`luckycompanion://` link.** The installer registers this link type with Windows
  (`protocols` in [electron-builder.yml](electron-builder.yml)), and the app also
  registers it when it starts (`app.setAsDefaultProtocolClient` in
  [electron/main.js](electron/main.js)). After that, any browser can open the app with
  a link.
- **One copy only.** `app.requestSingleInstanceLock()` makes sure a second click on
  the website doesn't start a second charm. The new launch passes its link to the
  running app (the `second-instance` event) and quits.
- **Choosing the charm.** The link carries `?character=<id>`. The main process saves
  it and sends `set-character` to the React app ([electron/preload.js](electron/preload.js),
  [src/App.jsx](src/App.jsx)).
- **Detecting whether it worked.** A browser can't tell a page whether a custom link
  opened anything. [src/hooks/useDesktopLaunch.js](src/hooks/useDesktopLaunch.js)
  watches for the page losing focus, which happens when the app or the Windows
  "Open Lucky Companion?" prompt appears. If that doesn't happen, the page offers the
  download instead.
- **Try without installing.** On Chrome/Edge the page still has the older
  picture-in-picture pop-out ([src/hooks/usePopOut.js](src/hooks/usePopOut.js)). It
  floats on top, but a browser window can't be transparent, so it shows a solid
  background. The desktop app is the real experience.

---

## Setup

```
npm install
```

## Run in development

```
npm run dev      # website on localhost:5173 + the Electron desktop window
npm run web      # website only, in the browser
```

When you run `npm run dev` once, it registers `luckycompanion://` on your PC, so
the website's button will open your dev app. Good for testing the full flow locally.

---

## Releasing (so website visitors can install it)

### 1. Build the Windows installer

```
npm run dist
```

This creates `release/LuckyCompanion-Setup.exe`. The file name is fixed on purpose
(`artifactName` in `electron-builder.yml`).

### 2. Upload it to Google Drive

The website's **Download for Windows** button opens this shared Drive folder:

```
https://drive.google.com/drive/folders/1rHVOdtnS1uNwDqJzhp_v8G3SFqQ64pXC
```

To ship a new version, upload the new `LuckyCompanion-Setup.exe` to that folder and
delete the old one. The folder link stays the same, so the website doesn't need
changing. The link is set in `DOWNLOAD_URL` in
[src/hooks/useDesktopLaunch.js](src/hooks/useDesktopLaunch.js).

> The folder must stay shared as **Anyone with the link → Viewer**, or visitors will
> see a "request access" page. Google Drive shows a "can't scan this file for viruses"
> notice for large files; visitors click **Download anyway**.

### 3. Deploy the website to Vercel

Vercel settings (auto-detected for Vite):

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |

Push to `main` and Vercel redeploys.

---

## Things visitors may see

- **"Windows protected your PC" (SmartScreen).** The installer isn't code-signed, so
  Windows warns on first install. Visitors click **More info → Run anyway**. A
  code-signing certificate removes this warning.
- **"Open Lucky Companion?" browser prompt.** Chrome/Edge ask before opening an app
  from a link. Ticking "Always allow" skips it next time.
- **Windows only.** The installer is built for Windows. Mac/Linux visitors can still
  use the in-browser pop-out.

---

## Project layout

```
electron/            desktop app (main process)
  main.js            transparent window, luckycompanion:// link handling, single instance
  preload.js         safe bridge between Electron and React
  tray/ ipc/         tray menu, settings + app messages
src/                 React app, used by both the website and the desktop window
  components/Landing the website page with "Put it on my desktop"
  hooks/useDesktopLaunch.js  opens the app from the website, or offers the download
  hooks/usePopOut.js         in-browser pop-out fallback
electron-builder.yml installer config (link registration, installer file name)
```

See `expl.md` for a deeper explanation of how each piece works.
