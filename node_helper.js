const NodeHelper = require("node_helper");
const { exec } = require("child_process");

module.exports = NodeHelper.create({
  socketNotificationReceived(notification, payload) {
    if (notification !== "RUN_COMMAND" || !payload || !payload.command) {
      return;
    }

    exec(payload.command, (error, stdout, stderr) => {
      if (error) {
        console.error("[MMM-SleepMode] Command error:", error.message);
      }
      if (stdout) {
        console.log("[MMM-SleepMode]", stdout.trim());
      }
      if (stderr) {
        console.error("[MMM-SleepMode]", stderr.trim());
      }
    });
  },
});
