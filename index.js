const express = require('express');
const app = express();
const path = require('path');

const mc = require('minecraft-protocol');
const serverHost = 'ATERNOS_SERVER_NAME & ADD_PORT_NO_BELOW';
const serverPort = ;
const botUsername = 'YOUR_BOT_NAME';
const reconnectInterval = 1 * 40 * 1000;

app.use(express.static(path.join(__dirname, '')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});

function createBot() {
  const bot = mc.createClient({
    host: serverHost,
    port: serverPort,
    username: botUsername,
  });

  bot.on('login', () => {
    console.log(`Bot ${bot.username} logged in!`);
  });

  bot.on('end', () => {
    console.log(`Bot ${bot.username} disconnected from the server. Reconnecting in ${reconnectInterval / 1000} seconds.`);
    setTimeout(createBot, reconnectInterval);
  });
  for (let i = 1; i <= 1; i++) {
    bot.on('update_time', ({ age, time }) => {
      const minecraftTime = Number(time) / 24000 * 24 % 24;
      const hours = Math.floor(minecraftTime);
      const minutes = Math.floor((minecraftTime % 1) * 60);

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

      console.log(`Game time printed: ${formattedTime}`);
      bot.chat(`Game time: ${formattedTime}`);
    }
    );
  }

  setInterval(() => {
    bot.write('keep_alive', { keepAliveId: 4337 });
  }, 10000);

  return bot;
}
createBot();
