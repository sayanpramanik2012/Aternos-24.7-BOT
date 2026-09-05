const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const mineflayer = require('mineflayer');

const serverHost = process.env.SERVER_HOST || 'nixora.play.hosting';
const serverPort = parseInt(process.env.SERVER_PORT || '61362', 10);
const botUsername = process.env.BOT_USERNAME || '247_Monitor';
const minecraftVersion = process.env.MC_VERSION || false;
const reconnectInterval = parseInt(process.env.RECONNECT_INTERVAL_MS || '40000', 10);
const antiAfkInterval = parseInt(process.env.ANTI_AFK_INTERVAL_MS || '20000', 10);
const httpPort = parseInt(process.env.PORT || '3000', 10);

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    botRunning: bot !== null,
    botUsername: bot && bot.player ? bot.username : null,
    target: `${serverHost}:${serverPort}`,
  });
});

let bot = null;
let antiAfkTimer = null;
let reconnectTimer = null;
let manualStop = false;

io.on('connection', (socket) => {
  console.log('Web client connected.');

  if (bot && bot.player) {
    socket.emit('bot_status', `Bot ${bot.username} is online.`);
  } else if (bot) {
    socket.emit('bot_status', 'Bot is connecting...');
  } else {
    socket.emit('bot_status', 'Bot is offline.');
  }

  socket.on('control_bot', (command) => {
    switch (command) {
      case 'start':
        manualStop = false;
        if (!bot) {
          createBot();
        } else {
          io.emit('bot_status', 'Bot is already running.');
        }
        break;
      case 'stop':
        manualStop = true;
        stopBot('Stopped by user.');
        break;
      case 'reconnect':
        manualStop = false;
        reconnectBot();
        break;
      default:
        console.log(`Unknown command: ${command}`);
        break;
    }
  });
});

server.listen(httpPort, () => {
  console.log(`HTTP server listening on port ${httpPort}.`);
  createBot();
});

function createBot() {
  clearReconnectTimer();

  if (bot) {
    console.log('Bot instance already exists; skipping create.');
    return;
  }

  console.log(`Connecting bot "${botUsername}" to ${serverHost}:${serverPort} ...`);
  io.emit('bot_status', `Connecting to ${serverHost}:${serverPort}...`);

  let newBot;
  try {
    newBot = mineflayer.createBot({
      host: serverHost,
      port: serverPort,
      username: botUsername,
      version: minecraftVersion,
      auth: 'offline',
      hideErrors: false,
    });
  } catch (err) {
    console.error('Failed to create bot:', err.message);
    io.emit('bot_status', `Failed to create bot: ${err.message}`);
    scheduleReconnect();
    return;
  }

  bot = newBot;

  bot.once('login', () => {
    console.log(`Bot "${bot.username}" logged in to ${serverHost}.`);
    io.emit('bot_status', `Bot ${bot.username} logged in.`);
  });

  bot.once('spawn', () => {
    console.log(`Bot "${bot.username}" spawned in the world.`);
    io.emit('bot_status', `Bot ${bot.username} spawned. Anti-AFK active.`);
    startAntiAfk();
  });

  bot.on('health', () => {
    if (bot && bot.health <= 0) {
      console.log('Bot has died, will respawn automatically.');
    }
  });

  bot.on('death', () => {
    console.log('Bot died. Respawning.');
    io.emit('bot_status', 'Bot died, respawning.');
  });

  bot.on('kicked', (reason) => {
    let message = reason;
    try {
      const parsed = typeof reason === 'string' ? JSON.parse(reason) : reason;
      message = (parsed && (parsed.text || parsed.translate)) || JSON.stringify(parsed);
    } catch (_) {
      // Reason was not JSON; use as-is.
    }
    console.log(`Bot kicked: ${message}`);
    io.emit('bot_status', `Kicked: ${message}`);
  });

  bot.on('error', (err) => {
    console.error('Bot error:', err && err.message ? err.message : err);
    io.emit('bot_status', `Error: ${err && err.message ? err.message : err}`);
  });

  bot.on('end', (reason) => {
    console.log(`Bot disconnected. Reason: ${reason || 'unknown'}.`);
    cleanupBot();
    if (manualStop) {
      io.emit('bot_status', 'Bot stopped.');
      return;
    }
    io.emit('bot_status', `Disconnected (${reason || 'unknown'}). Reconnecting in ${reconnectInterval / 1000}s.`);
    scheduleReconnect();
  });
}

function startAntiAfk() {
  stopAntiAfk();

  antiAfkTimer = setInterval(() => {
    if (!bot || !bot.entity) return;

    try {
      const moves = ['forward', 'back', 'left', 'right'];
      const move = moves[Math.floor(Math.random() * moves.length)];

      bot.setControlState(move, true);
      setTimeout(() => {
        if (bot) bot.setControlState(move, false);
      }, 600);

      if (Math.random() < 0.4) {
        bot.setControlState('jump', true);
        setTimeout(() => {
          if (bot) bot.setControlState('jump', false);
        }, 250);
      }

      const yaw = (Math.random() - 0.5) * Math.PI * 2;
      const pitch = (Math.random() - 0.5) * (Math.PI / 3);
      bot.look(yaw, pitch, true).catch(() => {});

      bot.swingArm('right');
    } catch (err) {
      console.error('Anti-AFK error:', err.message);
    }
  }, antiAfkInterval);
}

function stopAntiAfk() {
  if (antiAfkTimer) {
    clearInterval(antiAfkTimer);
    antiAfkTimer = null;
  }
}

function cleanupBot() {
  stopAntiAfk();
  if (bot) {
    bot.removeAllListeners();
  }
  bot = null;
}

function stopBot(message) {
  clearReconnectTimer();
  if (bot) {
    try {
      bot.quit(message || 'Bye');
    } catch (err) {
      console.error('Error quitting bot:', err.message);
    }
    cleanupBot();
    console.log(message || 'Bot stopped.');
    io.emit('bot_status', message || 'Bot stopped.');
  } else {
    io.emit('bot_status', 'Bot is not running.');
  }
}

function reconnectBot() {
  console.log('Manual reconnect requested.');
  io.emit('bot_status', 'Reconnecting bot...');
  if (bot) {
    try {
      bot.quit('Reconnecting');
    } catch (err) {
      console.error('Error during manual reconnect:', err.message);
    }
    cleanupBot();
  }
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    createBot();
  }, 1000);
}

function scheduleReconnect() {
  clearReconnectTimer();
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    if (!bot && !manualStop) createBot();
  }, reconnectInterval);
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
}

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down.');
  manualStop = true;
  stopBot('Server shutting down.');
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
