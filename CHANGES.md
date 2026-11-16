# Changes

## i2 miniOS 1.1 (2026-11-16)

### Names
- Kart Racing's last two tracks are now SKY RIBBON and CITY LIGHTS (our own names). Best times and progress are unchanged.

### New game: Marble Run (P216, Play)
- A wooden pegboard marble run with real marble physics. Marbles roll down ramps, hop down xylophone steps, ring bells, bounce on trampolines, spin pinwheels and drop through funnels into a glass jar that counts them.
- **Level 1**: tap anywhere to drop a marble and watch. A marble drops by itself at the start to show how it works. Three courses take turns.
- **Level 2**: two hoppers whose runs meet in the middle, or two runs with a jar each.
- **Level 3**: fix the run. One piece is missing; drag it from the tray into the gap and drop a marble. After two marbles miss, the spot glows and a tap places the piece. 8 puzzles.
- **Level 4**: build your own. Drag any of 9 pieces onto the board, tap a piece to turn it around, drag it back to the tray to remove it. 🗑 clears the board. The build is saved.
- Every course and puzzle was checked by running the marble physics until each marble reached the jar (and, for puzzles, missed without the piece).
- Unlocks with the **Raceway** world (5,300 stars). If that world is already open, the game shows up as new. Progress is saved in `PROG.marble`; no new storage keys.

### New game: Splash Fleet (P215, Play)
- The hidden-boats grid game, made for little hands. Tap a square of sea to throw a splash ball: a ring means water, an orange star means a boat was hit, and a whole boat pops up and toots when it's found. A hit means you go again.
- **Level 1**: just find Robo's 3 boats on a 5×5 sea. After a few misses, a twinkle shows where to try.
- **Levels 2–4**: take turns with Robo, from 6×6 with 3 boats up to 8×8 with 5. Robo gets sharper each level and goes easy at the start. Levels 3–4 label the sea A–H and 1–8.
- **👫 two players** on one screen: a cover card with the next player's character hides both seas between turns. Player 2's name comes from the same 👤 list as the other two-player games.
- **🔀 🚢** moves your own boats around before your first shot. Arrow keys + Space also work.
- Unlocks with **Rainbow Castle** (4,500 stars). If that world is already open, the game shows up as new. No new storage keys: the 2-player choice is saved in progress as `fleet2p`.

## i2 miniOS 1.0 (2026-10-25): first public release

This is the first public, white-label release of the kids' OS, published by i2 interactive LLC. It's built from the private pre-release build of 2026-10-17.

### Name and look
- The product is now **i2 miniOS** everywhere: page title, favicon, boot screen, Start menu header, Grown-Ups panel, postcards, weekly card, storybook, screensaver, README, LICENSE and installer.
- **New wordmark**: i2 interactive's big dot-matrix "i2" with "miniOS" in small dots underneath. It's drawn in code (SVG and canvas), so no extra font is needed. It appears on the boot screen, in the About box, on the bouncing-logo screensaver and as the favicon.
- **The Start button reads "miniOS"** in every language and theme. It keeps its lowercase "mini" and scales to fit, down to 320 px wide. A family can still set its own label (up to 8 characters) under Branding.
- The teletext style and the cast (Robo, Dino, Hoot, Foxy) are unchanged.
- Added a "by i2 interactive" credit on the boot screen. The Grown-Ups panel has a new About box with the version and a link to i2interactive.com.
- The output file is now `dist/i2minios.html`.

### No personal defaults
- The child's name is blank by default and shows as "Friend" until a grown-up sets it, either in the new optional name field on the first start-up screen or in Grown-Ups → About the child.
- Greetings now use a `{name}` template in all six languages. With no name, a plain greeting is used ("Hi there! Let's play!"). The Japanese greeting no longer uses a fixed name or "くん".
- Bedtime, postcards, My TV, the Start-menu user, the storybook and the birthday song all fall back gracefully when no name is set.
- The robot brain's prompts use they/them by default. Grown-Ups can pick "girl (she)" or "boy (he)". The safety rules now say "go find a grown-up" instead of "Mommy or Daddy".
- "Big Brother" is now **Baby Helper** in all six languages. "Baby brother's name" is now an optional "Baby in the family" field. The secret "BIG BROTHER" is now "BIG HELPER", and the old name-spelling secret is now "SECRET WORD": type the first four letters of the Start-button label.
- The Japanese "My World" tab changed from ぼくのせかい to じぶんのせかい.
- Placeholders and help text are neutral ("Mom, Dad, Grandma", "the child", "this device").
- No names, birthdays, photos, recordings or keys ship in the build.

### Removed
- **LINK CABLE** (`src/link.js`): the gift and milestone codes exchanged with the other OS, the "From Dad / For Dad" strip in the Mailbox, its CSS, its hooks in level-ups, secrets and boot, and its progress fields (removed from saved progress on load).

### Web edition
- Runs from any http(s) path, including `https://www.i2interactive.stream/mini/`, and inside a cross-origin `<iframe>`. It uses relative paths only and makes no external requests of its own.
- Kiosk mode turns on automatically when the file is opened from disk (`file://`), or with `?kiosk`. Only kiosk mode forces full screen on PLAY, re-enters full screen after a tap, and shows **Exit to Windows**.
- In a normal tab, a **⛶** taskbar button toggles full screen where the browser allows it. It's hidden inside iframes that can't go full screen.
- Keyboard Lock is only requested when full screen in a top-level page. Every full-screen and Keyboard Lock call is guarded, so nothing throws in a tab or an iframe.
- The code does not call `navigator.getGamepads` (nor does the bundled three.js), so no guard was needed there.

### Storage and upgrades
- Every `localStorage` key and the IndexedDB database name are **unchanged**. They're now defined once, in `KEYS` in `core.js`. A device running the pre-release build keeps all stars, levels, stickers, the pet, recordings, photos, creations and settings.
- On first load, saved settings are migrated: the old built-in OS name becomes "i2 miniOS" / "miniOS" (a custom name is kept), and the old baby-sibling field moves to the new `baby` field. Found secrets carry over under their new IDs.
- Backups now use the marker `i2minios: 6` and the file name `i2minios-backup-<date>.json`. Restore still accepts old backups.
- Backups now also include the Music Maker song. Restore only writes the app's own storage keys.
- Brand packs use the marker `i2miniosBrand` and still import old packs.

### Privacy and keys (checked)
- API keys (Claude, OpenAI, ElevenLabs) are typed in by a grown-up and kept only in that browser's local storage.
- Keys are blanked out of backups and are never part of brand packs; this is verified by the test suite. Restoring a backup keeps the device's own keys.
- No keys or secrets are in the source or the build.
- The ComfyUI client ID and output file prefix are now `i2minios`.

### Kiosk installer
- Renamed to `tools/Install-i2miniOS.ps1`. Defaults are now `C:\i2miniOS\`, the "i2 miniOS" start-up shortcut, `%LOCALAPPDATA%\i2miniOS\` for the Edge profile and log, and `i2minios-exit.txt` for Exit to Windows.
- `-KidUser` is now required. There's no default account name; if it's missing, the script lists the local accounts.
- The folder parameter is now `-AppDir`.
- Upgrading from the pre-release build: the installer moves the old Edge profile, where all progress lives, to the new folder name once, and removes the old start-up shortcut and task. If the kid is signed in with Edge open, it stops and asks you to sign them out first.

### Docs
- New README covering what it is, quick start, the web version, iframe embedding, kiosk install, white-labelling, privacy, build and licenses.
- "i2 Pixel" is now identified as VT323 (SIL OFL 1.1).
- LICENSE holder is now i2 interactive LLC.
