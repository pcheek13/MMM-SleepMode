/* MagicMirror² Module: MMM-SleepMode
 * Puts the display to sleep after a configurable idle timeout.
 */

Module.register("MMM-SleepMode", {
  defaults: {
    sleepAfterMinutes: 15,
    sleepCommand: "vcgencmd display_power 0 || tvservice -o",
    wakeCommand:
      "vcgencmd display_power 1 || (tvservice -p && sudo chvt 6 && sudo chvt 7)",
    resetNotifications: ["USER_PRESENCE", "SLEEP_MODE_RESET"],
    sleepNotifications: ["SLEEP_MODE_SLEEP_NOW"],
    wakeNotifications: ["SLEEP_MODE_WAKE", "REMOTE_ACTION"],
  },

  start() {
    this.sleepTimer = null;
    this.isSleeping = false;
    this.log("Starting MMM-SleepMode with " + this.config.sleepAfterMinutes + " minute timeout.");
    this.scheduleSleep();
  },

  getDom() {
    const wrapper = document.createElement("div");
    wrapper.style.display = "none";
    return wrapper;
  },

  notificationReceived(notification, payload, sender) {
    if (this.config.resetNotifications.includes(notification)) {
      this.log("Reset notification received: " + notification);
      this.scheduleSleep();
      return;
    }

    if (this.config.sleepNotifications.includes(notification)) {
      this.log("Sleep notification received: " + notification);
      this.enterSleep();
      return;
    }

    if (this.config.wakeNotifications.includes(notification)) {
      this.log("Wake notification received: " + notification);
      this.wake();
      return;
    }

    if (notification === "SLEEP_MODE_STATUS") {
      this.sendNotification("SLEEP_MODE_STATUS", { sleeping: this.isSleeping });
    }
  },

  suspend() {
    this.log("Module suspended; forcing sleep.");
    this.enterSleep();
  },

  resume() {
    this.log("Module resumed; scheduling sleep.");
    this.scheduleSleep();
  },

  scheduleSleep() {
    this.cancelSleep();
    const delay = this.config.sleepAfterMinutes * 60 * 1000;
    this.log("Scheduling sleep in " + this.config.sleepAfterMinutes + " minutes.");
    this.sleepTimer = setTimeout(() => this.enterSleep(), delay);
  },

  cancelSleep() {
    if (this.sleepTimer) {
      clearTimeout(this.sleepTimer);
      this.sleepTimer = null;
    }
  },

  enterSleep() {
    if (this.isSleeping) {
      return;
    }

    this.isSleeping = true;
    this.sendSocketNotification("RUN_COMMAND", { command: this.config.sleepCommand });
    this.sendNotification("SLEEP_MODE_ACTIVATED");
    this.log("Sleep command executed.");
  },

  wake() {
    if (!this.isSleeping) {
      this.scheduleSleep();
      return;
    }

    this.isSleeping = false;
    this.sendSocketNotification("RUN_COMMAND", { command: this.config.wakeCommand });
    this.sendNotification("SLEEP_MODE_DEACTIVATED");
    this.log("Wake command executed.");
    this.scheduleSleep();
  },

  log(message) {
    if (typeof Log !== "undefined" && Log.log) {
      Log.log("[MMM-SleepMode] " + message);
    } else {
      // Fallback for environments without MagicMirror Log helper.
      console.log("[MMM-SleepMode] " + message);
    }
  },
});
