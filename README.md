# i2 miniOS

A play-and-learn "operating system" for little kids, in one HTML file. Open it in a browser, or turn an old Windows laptop into a safe, offline-first kids' computer. No accounts, no ads, no app store.

By [i2 interactive](https://i2interactive.com/).

## What it is

- **79 apps**, most with levels that get harder as the child improves:
  - 3D games in a chunky early-2000s console style: bowling, basketball, darts, two mini golf courses, a skate park, a carnival water-squirter gallery, kart racing, snowboarding, penalty kicks, hide & seek, blocks and space.
  - 2D games: runner, rocket, fishing, trucks, bubbles, flush launch, air hockey, match-up, Splash Fleet (find the hidden boats, alone or against Robo or a grown-up), Marble Run (watch the marbles, fix the run, then build your own).
  - 90s-style edutainment: Number Blaster, TV Sleuth and World Detective.
  - Learning: ABC, spelling, counting, shapes, patterns, I Spy, puzzles and mazes, science lab, coding with arrow blocks, a family-photo game, and a baby-care game.
  - Making things: paint, a town builder, garage, kitchen, cook-along recipes, a music maker, a video editor that exports to WebM, a sticker maker, a color-hunt camera game, a silly mirror.
  - Music: piano, drums, rhythm, beat maker, a band, sing-along.
- **Four hosts**: Robo, Dino, Hoot and Foxy. They show picture cards instead of talking all the time.
- **Long-term progression**: stars unlock 19 worlds on an adventure map, plus a sticker album, a closet of hats, a daily mailbox, a pet that grows over weeks, seasons and holidays, a birthday mode and 15 hidden secrets.
- **Grown-up controls**: time limits and bedtime, a weekly highlight card, postcards, a printable storybook, hidden apps, and backup/restore.
- **Bilingual**: English plus an optional second language (Spanish, French, Portuguese, Japanese or Chinese).
- **Optional extras**, all off until a grown-up turns them on:
  - a "robot brain" for Talk, Stories, Quizzes, Say It, Show Me and weekly content, using LM Studio on a home PC, the Claude API or the OpenAI API;
  - cloud voices (OpenAI or ElevenLabs) with a different voice per character;
  - Claude drawings for Robo Draws, story pictures and Sticker Maker;
  - local image generation through ComfyUI, using a fixed kid-safe template (the child never types a prompt);
  - family voice recordings, family photos and your own background music.

## Quick start

1. Play it at https://www.i2interactive.stream/mini/, or download `i2minios.html` from the [latest release](https://github.com/i2interactive/i2-minios/releases/latest) (or build it, see below) and open it in Chrome or Edge.
2. Optional: type the child's name on the start-up screen. You can change it later.
3. Press **▶ PLAY**.
4. To open the **Grown-Ups** panel, either:
   - on the home screen, press and hold **Hoot the owl** for 3 seconds, then answer the times-table question; or
   - press **Ctrl+Shift+O**.

Everything is saved in that browser on that device. Use **Backup** in Grown-Ups now and then.

## Web version

Play it at **https://www.i2interactive.stream/mini/**.

To host it yourself, upload `dist/i2minios.html` as `mini/index.html` (or under any name). It's one self-contained file with no external requests, so it works from any folder or subpath.

It also works inside an `<iframe>`:

```html
<iframe src="https://www.i2interactive.stream/mini/" allow="fullscreen; microphone; camera" style="width:100%;aspect-ratio:16/10;border:0"></iframe>
```

In a normal tab or an iframe, the kiosk features step back:

- It never forces full screen. A **⛶** button on the taskbar toggles it where the browser allows (it's hidden inside an iframe without `allow="fullscreen"`).
- **Keyboard Lock** only engages in full screen in a top-level Chrome or Edge tab.
- **Exit to Windows** only appears on the kiosk laptop.
- If the page or iframe isn't allowed to use the camera or microphone, those apps show a 📷 ✖ / 🎤 card instead of breaking.

## Kiosk install (Windows 10/11, Home or Pro)

This makes a kid's Windows account boot straight into i2 miniOS.

1. Put `i2minios.html` and `tools/Install-i2miniOS.ps1` in `C:\i2miniOS\`.
2. From an admin terminal, run:

   ```powershell
   powershell -ExecutionPolicy Bypass -File C:\i2miniOS\Install-i2miniOS.ps1 -KidUser <WindowsAccountName> -DisableWinKey
   ```

   The script:
   - adds a start-up launcher that keeps the app open and full screen in its own Edge profile;
   - sets Edge policies that turn off first-run and sign-in pop-ups and allow the camera and mic for the local file;
   - turns off touchscreen edge swipes and the lock screen after sleep;
   - optionally turns off the Windows key.

3. Use **netplwiz** to sign the kid account in automatically (add `-AutoLogon` and the script tells you how).

Other options:

- `-Check` shows what's set up and why it might not be working.
- `-Uninstall` removes everything the script set up. Progress stays in the Edge profile.

Opened from a file, i2 miniOS runs in kiosk mode: full screen, Keyboard Lock, and **Exit to Windows** in Grown-Ups. A hosted copy can be forced into kiosk mode with `?kiosk` in the URL.

**Why not Edge `--kiosk` mode?** Kiosk mode runs InPrivate and can wipe local storage, which would erase progress, recordings and settings.

**Updating:** replace the HTML file. Settings and progress stay, because they live in the browser, not the file. Make a Backup first anyway.

## White-label it

In Grown-Ups, the **Branding** section sets:

- the OS name and the Start-button label (default "miniOS")
- the color theme: Teletext, Pastel, Ocean, Candy, Forest or Mono
- a start-up logo
- the characters' names

**Apps** hides any app. **About the child** sets the name (blank shows "Friend"), pronouns for the robot brain, birthday, favorites, family names and an optional baby's name for the Baby apps.

**Export brand pack** saves the branding, hidden apps, music and voice settings as a JSON file that another family can import. It never includes keys, photos or progress.

To change the defaults in code, edit `DEFAULTS` and `MINIOS` in `src/core.js`.

## Privacy

- **Offline-first.** The app makes no network requests of its own: no analytics, no fonts or scripts from a CDN, no accounts. With no AI configured, nothing leaves the device.
- **Your keys stay local.** API keys (Claude, OpenAI, ElevenLabs) are typed in by a grown-up and stored only in that browser's local storage. They are sent only to the provider you picked. They are never included in backups or brand packs. Give them a low spending limit.
- Show Me sends one camera snapshot per press of the shutter button to the configured AI.
- Color Hunt, Silly Mirror, family photos and family voice recordings never leave the device.
- Speech recognition uses the browser's built-in service, which may need an internet connection.

## Build from source

```bash
python3 build.py        # → dist/i2minios.html  (also runs `node --check` if Node is installed)
```

- `src/*.js` are plain browser scripts that share one global scope. The order in `build.py` matters.
- `src/tpl.html` holds the page, its CSS and the Grown-Ups panel.
- `src/fonts.css` holds the embedded fonts.
- `vendor/three.min.js` is three.js r149.

| File | What's in it |
|---|---|
| `core.js` | name/version, storage keys, helpers, languages (EN/ES/FR/PT/JA/ZH), settings, sound synth, the AI chat backends, the game context |
| `sys.js` | IndexedDB, the voice manager (family clips, cloud TTS cache, voice-app gating), profile |
| `cast.js` / `world.js` | pixel characters and hats; seasons, holidays and weekly themes |
| `play.js`, `learn.js`, `three.js`, `music.js`, `robo.js` | the original apps |
| `meta.js` | stickers, the map and worlds, the mailbox, the pet, secrets, the weekly AI content engine |
| `apps1-9.js`, `sports1-2.js` | newer apps and games |
| `demo.js` | home-screen wallpapers, screensaver |
| `brand.js` | the i2 miniOS wordmark, white-label branding, background music, hidden apps |
| `shell.js` | desktop, start menu, windows, keyboard lock, full screen, time limits, Grown-Ups panel |

A new app is one call:

```js
game('myid', 'play', '🎈', g => {
  const H = g.host('robo');          // character in the title bar; H.say(text, ex, lang, noBubble, card)
  g.levels(3, lv => { g.meter(5); }); // level pips + progress meter
  // g.stage (DOM), g.canvas(), g.three(), g.loop(dt => …), g.star(n), g.progress() → g.levelUp()
});
```

Storage keys (`localStorage` and the IndexedDB database name) are defined once in `KEYS` in `core.js`. They are frozen so that existing installs keep their progress, so don't rename them.

## License

- i2 miniOS code: MIT, © 2026 i2 interactive LLC (see `LICENSE`).
- three.js: MIT (`vendor/three-LICENSE.txt`).
- "i2 Pixel" is the VT323 font (SIL Open Font License 1.1).
- IBM Plex Sans: SIL Open Font License 1.1.
- The dotted "i2" wordmark is drawn in code, so no extra font is needed. The i2 interactive name and mark belong to i2 interactive LLC and aren't covered by the MIT license.
- The songs in Sing are traditional and in the public domain.
