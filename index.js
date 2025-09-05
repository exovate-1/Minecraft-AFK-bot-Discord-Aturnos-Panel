import express from "express";
import mineflayer from "mineflayer";
import { status } from "minecraft-server-util";

// No need to import Vec3 from vec3, use mineflayer's own Vec3
const { Vec3 } = mineflayer;

const app = express();
const PORT = process.env.PORT || 10000;

const SERVER_HOST = "berryvale.aternos.me"; // replace with your host
const SERVER_PORT = 35063; // replace with your Aternos port

let bot = null;
let lastStatus = "unknown";

// Define circle radius (2 for 4x4 space)
const circleRadius = 2;  // Radius of the circular movement
let angle = 0; // Starting angle for the circular motion

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

// Function: create bot and spawn it into the world
function createBot() {
  console.log("🤖 Attempting to log bot into server...");

  try {
    bot = mineflayer.createBot({
      host: SERVER_HOST,
      port: SERVER_PORT,
      username: "AFK_Bro",  // Updated bot name
    });

    bot.once("spawn", () => {
      console.log("🎉 Bot has spawned in the server!");
      startCircularMovement();  // Start circular movement when bot spawns
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

// Function: calculate the next position in a circular path
function calculateCircularPosition(radius, angle) {
  const x = Math.cos(angle) * radius;  // X position based on angle
  const z = Math.sin(angle) * radius;  // Z position based on angle
  return new Vec3(x, 0, z);  // Keep Y position at 0 (flat surface)
}

// Function: make bot move in a circular pattern
async function startCircularMovement() {
  while (bot) {
    const targetPosition = calculateCircularPosition(circleRadius, angle);  // Calculate next position
    const currentPos = bot.entity.position;

    bot.setControlState("forward", true);  // Move forward
    await bot.lookAt(targetPosition);      // Face the target position
    setTimeout(() => bot.setControlState("forward", false), 1000);  // Stop after 1 second

    // Increment the angle to move around the circle
    angle += Math.PI / 8;  // Increment the angle (45 degrees per iteration)
    if (angle >= 2 * Math.PI) {
      angle = 0;  // Reset angle after completing one full circle
    }

    // Delay for smooth movement
    await new Promise(resolve => setTimeout(resolve, 1000));  // Wait 1 second before next move
  }
}

// Check server status every 20 seconds
setInterval(async () => {
  try {
    await checkServer();
  } catch (err) {
    console.error("💥 Unhandled checkServer error:", err);
  }
}, 20000);

// Simple web server
app.get("/", (req, res) => {
  res.send("✅ AFK Minecraft Bot (AFK_Bro) is running and monitoring server.");
});

app.listen(PORT, () => {
  console.log(`🌐 Web server running on port ${PORT}`);
});
