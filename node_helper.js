const NodeHelper = require("node_helper");
const { exec } = require("child_process");

const DEFAULT_ENV = {
  DISPLAY: ":0",
  XAUTHORITY: "/home/pi/.Xauthority",
};

function runCommand(command, env, done) {
  exec(command, { env: { ...process.env, ...env } }, (error, stdout, stderr) => {
    if (error) {
      console.error("[MMM-SleepMode] Command error:", error.message);
      done(false);
      return;
    }

    if (stdout) {
      console.log("[MMM-SleepMode]", stdout.trim());
    }
    if (stderr) {
      console.error("[MMM-SleepMode]", stderr.trim());
    }

    done(true);
  });
}

module.exports = NodeHelper.create({
  socketNotificationReceived(notification, payload) {
    if (notification !== "RUN_COMMAND" || !payload || !payload.command) {
      return;
    }

    const commands = Array.isArray(payload.command)
      ? payload.command
      : [payload.command];

    const env = { ...DEFAULT_ENV, ...(payload.env || {}) };

    const runNext = (index) => {
      if (index >= commands.length) {
        return;
      }

      runCommand(commands[index], env, (success) => {
        if (!success) {
          runNext(index + 1);
        }
      });
    };

    runNext(0);
  },
});
