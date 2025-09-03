// =======================
// Discord Manager Panel + AFK Bot
// =======================
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");
const { login } = require("aternos-unofficial-api");
const mineflayer = require("mineflayer");
const cron = require("node-cron");

// =======================
// Config (Render ENV Vars)
// =======================
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const ATERNOS_USER = process.env.ATERNOS_USER;
const ATERNOS_PASS = process.env.ATERNOS_PASS;
const SERVER_ADDRESS = process.env.SERVER_ADDRESS || "dreamspire-0KKj.aternos.me";
const SERVER_PORT = parseInt(process.env.SERVER_PORT) || 35063;
const BOT_USERNAME = process.env.BOT_USERNAME || "AFKBot";

let aternos;
let controlMessage;
let statusCache = "⏳ Checking...";

// =======================
// Discord Bot Setup
// =======================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Embed builder
function buildPanelEmbed() {
  return new EmbedBuilder()
    .setColor(0x00ffcc)
    .setTitle("🌸 Dreamspire SMP Control Panel 🌸")
    .setDescription(
      `✨ **Status:** ${statusCache}\n\n` +
      `🎮 **Java Edition:** \`${SERVER_ADDRESS}:${SERVER_PORT}\`\n` +
      `📱 **Bedrock Edition:** [Click to Join](minecraft://?addExternalServer=Dreamspire|${SERVER_ADDRESS}:${SERVER_PORT})`
    )
    .setFooter({ text: "Use the buttons below to control your server." });
}

// Buttons
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
      .setLabel("💬 Broadcast")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("refresh_status")
      .setLabel("🔄 Refresh")
      .setStyle(ButtonStyle.Secondary)
  );
}

// Ready event
client.once("ready", async () => {
  console.log(`✅ Discord bot logged in as ${client.user.tag}`);

  // Login to Aternos API
  aternos = await login(ATERNOS_USER, ATERNOS_PASS);
  console.log("🔑 Logged into Aternos API.");

  // Start AFK Bot when Discord is ready
  startAFKBot();
});

// Command to show panel
client.on("messageCreate", async (msg) => {
  if (msg.content === "!panel") {
    const embed = buildPanelEmbed();
    const row = buildButtons();

    controlMessage = await msg.reply({ embeds: [embed], components: [row] });
    updateStatus();
  }
});

// Handle button clicks
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const servers = await aternos.listServers();
  const server = servers.find(s => s.address.includes(SERVER_ADDRESS));
  if (!server) return interaction.reply({ content: "⚠️ Server not found!", ephemeral: true });

  if (interaction.customId === "start_server") {
    await server.start();
    return interaction.reply({ content: "⏳ Server is starting...", ephemeral: true });
  }

  if (interaction.customId === "stop_server") {
    if (!interaction.member.permissions.has("Administrator")) {
      return interaction.reply({ content: "🚫 Only admins can stop the server.", ephemeral: true });
    }
    await server.stop();
    return interaction.reply({ content: "🛑 Server stopping...", ephemeral: true });
  }

  if (interaction.customId === "send_message") {
    await server.sendCommand("say Hello from Discord!");
    return interaction.reply({ content: "💬 Broadcast sent!", ephemeral: true });
  }

  if (interaction.customId === "refresh_status") {
    await updateStatus();
    return interaction.reply({ content: "🔄 Status refreshed!", ephemeral: true });
  }
});

// Update status in panel
async function updateStatus() {
  try {
    const servers = await aternos.listServers();
    const server = servers.find(s => s.address.includes(SERVER_ADDRESS));
    if (!server) return;

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

// Auto refresh every 2 minutes
cron.schedule("*/2 * * * *", () => {
  updateStatus();
});

// =======================
// Minecraft AFK Bot (silent, stand still)
// =======================
function startAFKBot() {
  function createBot() {
    const bot = mineflayer.createBot({
      host: SERVER_ADDRESS,
      port: SERVER_PORT,
      username: BOT_USERNAME,
      version: false
    });

    // Remove chat logs
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
// Start Discord Bot
// =======================
client.login(DISCORD_TOKEN);
