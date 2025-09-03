import mineflayer from 'mineflayer';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 1000;

// Start web server (for UptimeRobot)
app.get('/', (req, res) => res.send('Bot is alive'));
app.listen(PORT, () => console.log(`HTTP server running on port ${PORT}`));

// Function to create the bot
function createBot() {
  const bot = mineflayer.createBot({
    host: 'dreamspire-0KKj.aternos.me', // your server
    port: 35063,
    username: 'Dreamspire'
  });

  bot.on('login', () => console.log('Bot logged in!'));
  bot.on('error', err => {
    console.log('Bot error:', err);
    setTimeout(createBot, 5000); // reconnect on error
  });
  bot.on('end', () => {
    console.log('Bot disconnected, reconnecting in 5s...');
    setTimeout(createBot, 5000);
  });
}

// Start the bot
createBot();
