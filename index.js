// =======================
// Discord Manager Panel
// =======================
const { 
  Client, GatewayIntentBits,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder 
} = require("discord.js");
const Aternos = require("aternos-unofficial-api");
const cron = require("node-cron");

// =======================
// Minecraft AFK Bot
// =======================
const mineflayer = require("mineflayer");

// =======================
// Config (use ENV in Render!)
// =======================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ATERNOS_USER = process.env.ATERNOS_USER;
const ATERNOS_PASS = process.env.ATERNOS_PASS;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS || "dreamspire-0KKj.aternos.me";
const BOT_USERNAME = process.env.BOT_USERNAME || "AFKBot";
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 35063;

// =======================
// Discord Bot Setup
// =======================
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let aternos;
let controlMessage;
let statusCache = "⏳ Checking...";

// GUI embed
function buildPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0x7289da)
    .setTitle("🌸 Dreamspire SMP Control Panel 🌸")
    .setDescription(
      `✨ **Status:** ${statusCache}\n\n` +
      `🎮 **Java Edition:** \`${SERVER_ADDRESS}:${SERVER_PORT}\`\n` +
      `📱 **Bedrock Edition:** [Click to Join](minecraft://?addExternalServer=Dreamspire|${SERVER_ADDRESS}:${SERVER_PORT})`
    )
    .setFooter({ text: "Use the buttons below to control your server." });
}

// GUI buttons
function buildButtons() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("start_server")
      .setLabel("🚀 Start Server")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("stop_server")
      .setLabel("🛑 Stop Server")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("send_message")
      .setLabel("💬 Send Broadcast")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("refresh_status")
      .setLabel("🔄 Refresh Status")
      .setStyle(ButtonStyle.Secondary)
  );
}

// Discord Ready
client.once("ready", async () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);
  aternos = new Aternos();
  await aternos.login(ATERNOS_USER, ATERNOS_PASS);
  startAFKBot(); // launch AFK bot when Discord bot is ready
});

// Panel command
client.on("messageCreate", async (msg) => {
  if (msg.content === "!panel") {
    const embed = buildPanelEmbed();
    const row = buildButtons();

    controlMessage = await msg.reply({ embeds: [embed], components: [row] });
    updateStatus();
  }
});

// Handle interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const server = await aternos.getServer(SERVER_ADDRESS);
  if (!server) return interaction.reply({ content: "⚠️ Server not found!", ephemeral: true });

  if (interaction.customId === "start_server") {
    await server.start();
    return interaction.reply({ content: "⏳ Server is starting...", ephemeral: true });
  }

  if (interaction.customId === "stop_server") {
    // only admins allowed
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({ content: "🚫 You are not allowed to stop the server.", ephemeral: true });
    }
    await server.stop();
    return interaction.reply({ content: "🛑 Server stopping...", ephemeral: true });
  }

  if (interaction.customId === "send_message") {
    await server.sendCommand("say Hello from Discord!");
    return interaction.reply({ content: "💬 Message sent to server chat!", ephemeral: true });
  }

  if (interaction.customId === "refresh_status") {
    await updateStatus();
    return interaction.reply({ content: "🔄 Status refreshed!", ephemeral: true });
  }
});

// Status updater
async function updateStatus() {
  try {
    const server = await aternos.getServer(SERVER_ADDRESS);
    const info = await server.fetch();
    statusCache = info.status ? `🟢 ${info.status.toUpperCase()}` : "❌ Unknown";

    if (controlMessage) {
      const embed = buildPanelEmbed();
      const row = buildButtons();
      await controlMessage.edit({ embeds: [embed], components: [row] });
    }
  } catch (err) {
    console.error("Status check failed:", err);
  }
}

// Refresh every 2 min
cron.schedule("*/2 * * * *", () => {
  updateStatus();
});

// =======================
// Minecraft AFK Bot (silent)
// =======================
function startAFKBot() {
  function createBot() {
    const bot = mineflayer.createBot({
      host: SERVER_ADDRESS,
      port: SERVER_PORT,
      username: BOT_USERNAME,
      version: false
    });

    // Silent AFK
    bot.removeAllListeners("message");

    bot.on("spawn", () => {
      console.log("🤖 AFK Bot joined silently and is standing still.");
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

// =======================
// Start Discord bot
// =======================
client.login(DISCORD_TOKEN);
