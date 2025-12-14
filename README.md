# MMM-SleepMode

A zero-UI MagicMirror² module that puts the entire display to sleep after a configurable timeout and offers notifications to reset, sleep, or wake the screen.

## Features
- Default 15-minute sleep timer with configurable commands for Raspberry Pi 5 (or other Pi models).
- Responds to MagicMirror notifications to reset the timer, force sleep, or wake the display.
- Emits activation/deactivation notifications that other modules can listen to.

## One-line Installation
Copy/paste this in your MagicMirror `modules` directory:

```bash
cd ~/MagicMirror/modules && git clone https://github.com/yourusername/MMM-SleepMode.git && cd MMM-SleepMode
```

> No additional dependencies are required.

## Configuration
Add the module to `config/config.js`:

```js
{
  module: "MMM-SleepMode",
  position: "top_left", // Position is irrelevant; the module renders nothing.
  config: {
    sleepAfterMinutes: 15,
    sleepCommand: "vcgencmd display_power 0 || tvservice -o",
    wakeCommand: "vcgencmd display_power 1 || (tvservice -p && sudo chvt 6 && sudo chvt 7)",
    resetNotifications: ["USER_PRESENCE", "SLEEP_MODE_RESET"],
    sleepNotifications: ["SLEEP_MODE_SLEEP_NOW"],
    wakeNotifications: ["SLEEP_MODE_WAKE", "REMOTE_ACTION"],
  },
}
```

### Notifications
- **Reset timer:** Send any notification in `resetNotifications` (defaults: `USER_PRESENCE`, `SLEEP_MODE_RESET`).
- **Force sleep now:** Send any notification in `sleepNotifications` (default: `SLEEP_MODE_SLEEP_NOW`).
- **Force wake:** Send any notification in `wakeNotifications` (defaults: `SLEEP_MODE_WAKE`, `REMOTE_ACTION`).
- **Status request:** Send `SLEEP_MODE_STATUS` to receive `{ sleeping: boolean }`.
- **Broadcasts:**
  - `SLEEP_MODE_ACTIVATED` when the display is put to sleep.
  - `SLEEP_MODE_DEACTIVATED` when the display is woken.

### Command notes
- `vcgencmd display_power 0`/`1` is recommended for Raspberry Pi 5.
- `tvservice` is kept as a fallback for older Pi firmware stacks.
- Adjust the commands if you use a different window/display manager.

## Behavior
- The module has no on-screen visual and hides itself.
- Timer resets on module resume or on any configured reset notification.
- `suspend()` immediately triggers sleep; `resume()` restarts the timer.

## License
MIT
