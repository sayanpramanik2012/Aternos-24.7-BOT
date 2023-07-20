const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const mc = require('minecraft-protocol');
const serverHost = 'DOOMS_DAY_REBORN.aternos.me';
const serverPort = 59173;
const botUsername = '247_Monitor';
const reconnectInterval = 1 * 40 * 1000;

let bot = null; // Initialize the bot as null

app.use(express.static(path.join(__dirname, '')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'main.html'));
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('control_bot', function(command) {
    switch (command) {
      case 'start':
        if (!bot) {
          bot = createBot(); // Start the bot only if it's not already running
        }
        break;
      case 'stop':
        if (bot) {
          bot.end(); // Gracefully disconnect the bot
          bot = null; // Reset bot to null since it's no longer running
          console.log('Bot stopped.');
          io.emit('bot_status', 'Bot stopped.');
        }
        break;
      case 'reconnect':
        if (bot) {
          bot.end(); // Gracefully disconnect the bot before reconnecting
        }
        console.log('Reconnecting bot...');
        io.emit('bot_status', 'Reconnecting bot...');
        setTimeout(() => {
          bot = createBot(); // Reconnect the bot after a short delay
        }, 1000);
        break;
      default:
        console.log('Unknown command.');
        break;
    }
  });
});

http.listen(3000, function() {
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
    io.emit('bot_status', `Bot ${bot.username} logged in!`);
  });

  bot.on('end', () => {
    console.log(`Bot ${bot.username} disconnected from the server. Reconnecting in ${reconnectInterval / 1000} seconds.`);
    io.emit('bot_status', `Bot ${bot.username} disconnected from the server. Reconnecting in ${reconnectInterval / 1000} seconds.`);
    handleDisconnection();
  });

  bot.on('error', (err) => {
    console.error(`Bot ${bot.username} encountered an error:`, err);
    handleDisconnection();
  });

  setInterval(() => {
    if (bot) {
      bot.write('keep_alive', { keepAliveId: 4337 });
    }
  }, 10000);

  return bot;
}

function handleDisconnection() {
  bot = null; // Reset bot to null since it's no longer connected
  setTimeout(() => {
    if (!bot) {
      bot = createBot(); // Reconnect the bot after a short delay
    }
  }, reconnectInterval);
}
