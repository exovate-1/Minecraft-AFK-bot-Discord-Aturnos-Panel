// index.js
import express from "express";
import mineflayer from "mineflayer";
import { status } from "minecraft-server-util";

const app = express();
const PORT = process.env.PORT || 10000;

const SERVER_HOST = "berryvale.aternos.me"; // replace with your host
const SERVER_PORT = 35063; // replace with your Aternos port

let bot = null;
let lastStatus = "unknown";

// Function: check server online/offline
async function checkServer() {
  try {
    const res = await status(SERVER_HOST, SERVER_PORT, { timeout: 5000 });
    if (lastStatus !== "online") {
      console.log(`✅ Server is ONLINE: ${res.players.online}/${res.players.max}`);
      lastStatus = "online";
    }

    if (!bot) {
      createBot();
    }
  } catch (err) {
    if (lastStatus !== "offline") {
      console.log("❌ Server is OFFLINE or unreachable.");
      lastStatus = "offline";
    }

    if (bot) {
      bot.quit("Server offline");
      bot = null;
    }
  }
}

// Function: safely create bot
function createBot() {
  console.log("🤖 Attempting to log bot into server...");

  try {
    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: "AFK_Bot",
    });

    bot.once("spawn", () => {
      console.log("🎉 Bot has spawned in the server!");
    });

    bot.on("end", () => {
      console.log("🔌 Bot disconnected. Waiting for server to come online again.");
      bot = null;
    });

    bot.on("kicked", (reason) => {
      console.log(`⚠️ Bot was kicked: ${reason}`);
      bot = null;
    });

    bot.on("error", (err) => {
      console.log(`⚠️ Bot error: ${err.message}`);
    });
  } catch (err) {
    console.error("❌ Failed to create bot:", err);
    bot = null;
  }
}

// Check every 20s
setInterval(async () => {
  try {
    await checkServer();
  } catch (err) {
    console.error("💥 Unhandled checkServer error:", err);
  }
}, 20000);

// Simple web server
app.get("/", (req, res) => {
  res.send("✅ AFK Minecraft Bot is running and monitoring server.");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
