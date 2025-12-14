# MMM-SleepMode

A zero-UI MagicMirror² module that puts the entire display to sleep after a configurable idle timeout and wakes it on demand. Designed for Raspberry Pi 5 but works with any platform that supports your chosen sleep/wake shell commands.

## Quick install & setup (one copy/paste)
Run this from your MagicMirror `modules` directory to clone the module and print a ready-to-use config snippet:

```bash
cd ~/MagicMirror/modules \
  && git clone https://github.com/pcheek13/MMM-SleepMode.git \
  && cd MMM-SleepMode \
  && echo '
{
  module: "MMM-SleepMode",
  position: "top_left", // hidden; position is irrelevant
  config: {
    sleepAfterMinutes: 15,
    sleepCommand: [
      "/usr/bin/vcgencmd display_power 0",
      "DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force off",
      "/usr/bin/tvservice -o",
    ],
    wakeCommand: [
      "/usr/bin/vcgencmd display_power 1",
      "DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force on",
      "/usr/bin/tvservice -p && sudo /usr/bin/chvt 6 && sudo /usr/bin/chvt 7",
    ],
    resetNotifications: ["USER_PRESENCE", "SLEEP_MODE_RESET"],
    sleepNotifications: ["SLEEP_MODE_SLEEP_NOW"],
    wakeNotifications: ["SLEEP_MODE_WAKE", "REMOTE_ACTION"],
  },
},' \
  && echo "Paste the above block into ~/MagicMirror/config/config.js"
```

> No npm install or extra dependencies are required. The defaults run multiple display-off/on strategies in order (Raspberry Pi 5/4: `vcgencmd`; X11/DPMS: `xset`; legacy firmware: `tvservice`).

## What it does
- Hides itself; nothing is drawn on screen.
- Starts a sleep timer (default 15 minutes) and cancels/resets the timer whenever configured reset notifications arrive.
- Executes the configured sleep command when the timer expires or when told to sleep now.
- Executes the wake command on wake notifications and restarts the timer.
- Broadcasts activation/deactivation notifications that other modules can react to.

## Configuration reference
```js
{
  module: "MMM-SleepMode",
  position: "top_left", // not displayed
  config: {
    sleepAfterMinutes: 15, // minimum 1 minute; timer restarts after wake
    sleepCommand: [ // array runs in order until one succeeds
      "/usr/bin/vcgencmd display_power 0",
      "DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force off",
      "/usr/bin/tvservice -o",
    ],
    wakeCommand: [
      "/usr/bin/vcgencmd display_power 1",
      "DISPLAY=:0 XAUTHORITY=/home/pi/.Xauthority /usr/bin/xset dpms force on",
      "/usr/bin/tvservice -p && sudo /usr/bin/chvt 6 && sudo /usr/bin/chvt 7",
    ],
    resetNotifications: ["USER_PRESENCE", "SLEEP_MODE_RESET"], // reset timer
    sleepNotifications: ["SLEEP_MODE_SLEEP_NOW"], // force sleep immediately
    wakeNotifications: ["SLEEP_MODE_WAKE", "REMOTE_ACTION"], // force wake
  },
}
```

### Notifications
- **Reset timer:** any notification in `resetNotifications`.
- **Force sleep now:** any notification in `sleepNotifications`.
- **Force wake:** any notification in `wakeNotifications`.
- **Status request:** send `SLEEP_MODE_STATUS` to receive `{ sleeping: boolean }`.
- **Broadcasts:**
  - `SLEEP_MODE_ACTIVATED` when the display is put to sleep.
  - `SLEEP_MODE_DEACTIVATED` when the display is woken.

### Command tips
- Commands can be a single string or an array of strings; arrays are executed in order until one completes without error.
- Default commands set `DISPLAY=:0` and `XAUTHORITY=/home/pi/.Xauthority` so `xset dpms` works inside the MagicMirror Electron session.
- Raspberry Pi 5/4: `vcgencmd display_power 0|1` is preferred and runs first.
- Older Pi firmware: `tvservice` fallback remains for compatibility.
- If you use a different display manager, swap in your own shell commands; the module executes what you provide with the same environment defaults.

## Behavior notes
- Timer starts on module load and on resume; it is cancelled when the screen sleeps.
- `suspend()` forces sleep, `resume()` restarts the timer.
- Log output is prefixed with `[MMM-SleepMode]` to make debugging easier.

## License
MIT
