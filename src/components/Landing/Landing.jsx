import React from 'react';
import { CHARACTERS, getCharacterById } from '../Companion/characters.js';
import useDesktopLaunch, { DOWNLOAD_URL } from '../../hooks/useDesktopLaunch.js';
import './Landing.css';

const FEATURES = [
  { icon: 'monitor', text: 'Just a charm on your screen. No sign-up, no account.' },
  { icon: 'cursor', text: 'Flick it, swing it, click it. Everything around it stays usable.' },
  { icon: 'toggle', text: 'Pop it out, bring it back, or swap to another charm any time.' },
  { icon: 'pin', text: 'Keep it hanging above every other window while you work.' },
  { icon: 'grid', text: 'Pick the charm that means something to you.' },
  { icon: 'refresh', text: 'Remembers your charm and settings for next time.' }
];

// small stroke icons for the feature cards
function Icon({ name }) {
  const paths = {
    monitor: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /><circle cx="15" cy="10" r="2" /></>,
    cursor: <><path d="M5 4l6 15 2-6 6-2z" /><path d="M16 3v2M19 5l-1.5 1.5M21 8h-2" /></>,
    toggle: <><rect x="3" y="7" width="18" height="10" rx="5" /><circle cx="15" cy="12" r="3" /></>,
    pin: <><path d="M6 4h12M12 4v9" /><circle cx="12" cy="16" r="3" /><circle cx="12" cy="16" r="1" /></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><path d="M14 17l2 2 4-4" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14-4.5L4 9" /><path d="M4 4v5h5" /><path d="M4 13a8 8 0 0 0 14 4.5l2-2.5" /><path d="M20 20v-5h-5" /></>
  };
  return (
    <svg className="featureIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

// this is the marketing page shown when the app runs in a normal browser tab
export default function Landing({ scene, popOut, settings, onSelectCharacter, onOpenSettings }) {
  const current = getCharacterById(settings.characterId);
  const popped = popOut.popOut;
  const desktop = useDesktopLaunch();

  return (
    <div className="landing">
      <header className="hero">
        <div className="heroText">
          <div className="brand">
            <img src={CHARACTERS[0].preview} alt="" className="brandMark" />
            <span>Lucky Companion</span>
          </div>

          <h1 className="heroTitle">
            A little charm.
            <br />
            Right where you work.
          </h1>

          <p className="heroLead">
            A tiny keepsake that hangs on your Windows screen. Pick a charm, watch it
            sway, and give it a flick whenever you need a bit of luck. It never gets in
            the way of what you&apos;re doing.
          </p>

          <div className="heroActions">
            <button
              className="btnPrimary"
              disabled={desktop.status === 'launching'}
              onClick={() => desktop.launch(current.id)}
            >
              {desktop.status === 'launching' ? 'Opening…' : 'Put it on my desktop'}
            </button>
            <a className="btnSecondary" href="#charms">Meet the charms</a>
          </div>

          {desktop.status === 'launched' && (
            <p className="desktopNote">
              {current.name} should be hanging on your desktop now. If Windows asked,
              choose <strong>Open Lucky Companion</strong>.
            </p>
          )}

          {desktop.status === 'notInstalled' && (
            <div className="desktopNote">
              <p>
                Looks like Lucky Companion isn&apos;t installed yet. Install it once (Windows,
                free), then press the button again and the charm lands straight on your desktop.
              </p>
              <div className="desktopNoteActions">
                <a className="btnPrimary" href={DOWNLOAD_URL}>Download for Windows</a>
                <button className="linkButton" onClick={() => desktop.launch(current.id)}>
                  I installed it, try again
                </button>
              </div>
            </div>
          )}

          <p className="heroNote">
            {popOut.supported && (
              <>
                <button className="linkButton" onClick={popped ? popOut.close : popOut.open}>
                  {popped ? 'Bring it back to this page' : 'Try it without installing'}
                </button>
                {' · '}
              </>
            )}
            <button className="linkButton" onClick={onOpenSettings}>Settings</button>
          </p>
        </div>

        <div className="heroCharm">
          <div className="heroCord" />
          <div className="heroStage">
            {popped ? (
              <div className="heroPopped">
                <p>{current.name} is on your desktop now.</p>
                <p>Drag its little window anywhere on screen.</p>
              </div>
            ) : (
              scene
            )}
          </div>
        </div>
      </header>

      <section className="features">
        <h2 className="sectionTitle">Made for your desktop</h2>
        <p className="sectionLead">
          One click moves the charm out of the browser and onto your screen, in a small
          window that stays above everything else.
        </p>

        <div className="featuresGrid">
          <div className="laptop" aria-hidden="true">
            <div className="laptopLid">
              <div className="laptopScreen">
                <div className="laptopCharm">
                  <span className="laptopCord" />
                  <img src={current.preview} alt="" />
                </div>
              </div>
            </div>
            <div className="laptopBase" />
          </div>

          <ul className="featureList">
            {FEATURES.map((feature) => (
              <li key={feature.icon} className="featureCard">
                <span className="featureIconWrap"><Icon name={feature.icon} /></span>
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="charms" id="charms">
        <h2 className="sectionTitle">Meet the charms</h2>
        <p className="sectionLead">Choose one to hang. You can change it any time.</p>

        <div className="charmGrid">
          {CHARACTERS.map((character) => {
            const active = character.id === current.id;
            return (
              <button
                key={character.id}
                className={`charmCard ${active ? 'charmCardActive' : ''}`}
                onClick={() => onSelectCharacter(character.id)}
              >
                <img src={character.preview} alt="" />
                <span className="charmName">{character.name}</span>
                <span className="charmState">{active ? 'Hanging now' : 'Hang this one'}</span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="landingFooter">Lucky Companion · made with a bit of luck</footer>
    </div>
  );
}
