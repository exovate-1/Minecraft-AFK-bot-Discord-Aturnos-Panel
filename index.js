const mineflayer = require('mineflayer');

// =======================
// Config
// =======================
const SERVER_ADDRESS = process.env.SERVER_ADDRESS || "dreamspire-0KKj.aternos.me";
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 35063;
const BOT_USERNAME = process.env.BOT_USERNAME || "Dreamspire_Bot";

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

    // Remove chat/system messages to keep console clean
    bot.removeAllListeners("message");

    bot.on("spawn", () => {
      console.log(`🤖 AFK Bot ${BOT_USERNAME} joined and is standing still.`);
    });

    // Increase reconnect delay to avoid duplicate UUID kicks
    const RECONNECT_DELAY = 30000; // 30 seconds

    bot.on("end", () => {
      console.log(`🔄 AFK Bot disconnected. Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
      setTimeout(createBot, RECONNECT_DELAY);
    });

    bot.on("kicked", (reason) => {
      console.log(`⚠️ AFK Bot was kicked: ${reason}. Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
      setTimeout(createBot, RECONNECT_DELAY);
    });

    bot.on("error", (err) => {
      console.log(`⚠️ AFK Bot error: ${err.message}. Retrying in ${RECONNECT_DELAY / 1000}s...`);
      setTimeout(createBot, RECONNECT_DELAY);
    });
  }

  createBot();
}

startAFKBot();
