import mineflayer from "mineflayer";
import express from "express";

// --- CONFIG ---
const MC_SERVER_HOST = "dreamspire-0KKj.aternos.me";
const MC_SERVER_PORT = 35063;
const BOT_USERNAME = "Dreamspire"; // Can be any username
const HTTP_PORT = 1000;       // Express server port

// --- CREATE MINECRAFT BOT ---
const bot = mineflayer.createBot({
  host: MC_SERVER_HOST,
  port: MC_SERVER_PORT,
  username: BOT_USERNAME,
});

bot.on("login", () => {
  console.log(`Bot logged in as ${BOT_USERNAME}`);
});

bot.on("error", err => {
  console.log("Bot error:", err);
});

bot.on("end", () => {
  console.log("Bot disconnected, reconnecting in 5s...");
  setTimeout(() => createBot(), 5000);
});

// --- EXPRESS SERVER FOR UPTIMEROBOT ---
const app = express();
app.get("/", (req, res) => {
  res.send("Minecraft bot server is online! ✅");
});

app.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on port ${HTTP_PORT}`);
});
