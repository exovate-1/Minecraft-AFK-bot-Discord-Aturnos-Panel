const mineflayer = require('mineflayer');

// =======================
// Config
// =======================
const SERVER_ADDRESS = process.env.SERVER_ADDRESS || "dreamspire-0KKj.aternos.me";
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 35063;
const BOT_USERNAME = process.env.BOT_USERNAME || "AFKBot";

// =======================
// AFK Bot
// =======================
function startAFKBot() {
  function createBot() {
    const bot = mineflayer.createBot({
      host: SERVER_ADDRESS,
      port: SERVER_PORT,
      username: BOT_USERNAME,
      version: false // auto-detect version
    });

    // Remove chat and system messages
    bot.removeAllListeners("message");

    bot.on("spawn", () => {
      console.log(`🤖 AFK Bot ${BOT_USERNAME} joined and is standing still.`);
    });

    bot.on("end", () => {
      console.log("🔄 AFK Bot disconnected. Reconnecting in 5s...");
      setTimeout(createBot, 5000);
    });

    bot.on("kicked", () => {
      console.log("⚠️ AFK Bot was kicked. Reconnecting in 5s...");
      setTimeout(createBot, 5000);
    });

    bot.on("error", (err) => {
      console.log("⚠️ AFK Bot error:", err.message);
      setTimeout(createBot, 5000);
    });
  }

  createBot();
}

startAFKBot();
