// index.js
import mineflayer from "mineflayer";
import chalk from "chalk";

let reconnectDelay = 5000; // start with 5s
const maxReconnectDelay = 60000; // cap at 1 min

function createBot() {
  console.log(chalk.cyan("🔄 Starting Dreamspire Bot..."));

  const bot = mineflayer.createBot({
    host: "dreamspire.aternos.me", // change to your Aternos host
    port: 25565,
    username: "DreamBot", // bot username (use alt account if online mode = true)
  });

  bot.on("login", () => {
    console.log(chalk.greenBright("✅ Successfully joined the server!"));
    reconnectDelay = 5000; // reset delay after success
  });

  bot.on("error", (err) => {
    console.log(chalk.redBright("❌ Bot Error: ") + chalk.yellow(err.message));
  });

  bot.on("end", (reason) => {
    console.log(
      chalk.magentaBright(
        `⚠️ Disconnected: ${reason || "unknown reason"}`
      )
    );
    console.log(
      chalk.blue(
        `⏳ Reconnecting in ${(reconnectDelay / 1000).toFixed(1)}s...`
      )
    );
    setTimeout(() => {
      // exponential backoff
      reconnectDelay = Math.min(reconnectDelay * 2, maxReconnectDelay);
      createBot();
    }, reconnectDelay);
  });

  // Listen to chat
  bot.on("chat", (username, message) => {
    if (username === bot.username) return; // ignore self
    console.log(chalk.gray(`💬 ${username}: ${message}`));
  });

  // Auto keep alive (optional AFK movement)
  bot.on("spawn", () => {
    console.log(chalk.green("🌍 Bot spawned in the world."));
    setInterval(() => {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 200);
    }, 60000); // jump every 60s to avoid AFK
  });
}

// start bot
createBot();
