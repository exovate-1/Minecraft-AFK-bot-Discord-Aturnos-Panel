
// afkBot.js
const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: 'dreamspire-0KKj.aternos.me', // e.g., play.example.com
  port: 35063,                 // default Minecraft port
  username: 'Dreamspire',
  version: '1.21.8'            // match your server version
});

bot.once('spawn', () => {
  console.log('Bot has joined the server and is AFK.');
  
  // Optional: keep moving a little to avoid being kicked
  setInterval(() => {
    bot.setControlState('forward', true);
    setTimeout(() => bot.setControlState('forward', false), 1000);
  }, 60000); // every 60 seconds
});

bot.on('error', (err) => console.log('Error:', err));
bot.on('end', () => console.log('Bot disconnected. Reconnect manually.'));

