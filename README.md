# Aternos 24/7 Bot

A Minecraft bot that connects to your Aternos server and stays active so the
server is not auto-shut-down for inactivity. The bot performs lightweight
anti-AFK movements (moves, looks around, jumps, swings arm), exposes a tiny
web page so a free uptime service (such as UptimeRobot) can keep the host
awake, and automatically reconnects if it gets kicked or16798.

> Update:
> - play_nob_smp_fun.aternos.me:`mineflayer` for proper protocol handling and built-in
>   keep-alive responses.
> - Added real anti-AFK behavior (random movement, jumps, look, swing arm)
>   so Aternos no longer marks the bot as idle.
> - Fixed the `setInterval` leak and variable-shadowing bug from the previous
>   version.
> - Fixed the web UI buttons (`Start`, `Stop`, `Reconnect`) so they actually
>   send commands.
> - Added `package.json`, environment-variable configuration, and a
>   `/health` endpoint for uptime pings.

[Watch the original Video Tutorial!](https://youtu.be/mRgLIu1sLMQ)

## Requirements

- An Aternos server (cracked / offline mode by default).
- A free hosting service that runs Node.js (Replit, Render, Railway, a VPS,
  or even your own machine).
- Optional: a free [UptimeRobot](https://uptimerobot.com/) account to ping
  the web URL every 5 minutes so the host stays awake.

## Setup

1. **Create and start your Aternos server.** Note the IP and port (for
   example `DOOMS_DAY_REBORN.aternos.me:59173`).

2. **Clone this repository** into your hosting service or local machine:

   ```bash
   git clone https://github.com/sayanpramanik2012/Aternos-24.7-BOT.git
   cd Aternos-24.7-BOT
   npm install
   ```

3. **Configure the bot.** Either edit the defaults at the top of
   `index.js` or set environment variables:

   | Variable                | Default                           | Description                                 |
   | ----------------------- | --------------------------------- | ------------------------------------------- |
   | `SERVER_HOST`           | `DOOMS_DAY_REBORN.aternos.me`     | Aternos server hostname.                    |
   | `SERVER_PORT`           | `59173`                           | Aternos server port.                        |
   | `BOT_USERNAME`          | `247_Monitor`                     | In-game username for the bot.               |
   | `MC_VERSION`            | auto-detect                       | Minecraft version, e.g. `1.20.1`.           |
   | `RECONNECT_INTERVAL_MS` | `40000`                           | Wait time before reconnecting after kicks.  |
   | `ANTI_AFK_INTERVAL_MS`  | `20000`                           | Frequency of anti-AFK movements.            |
   | `PORT`                  | `3000`                            | HTTP port for the web UI.                   |

4. **Run the bot:**

   ```bash
   npm start
   ```

   The bot will connect to the server and the web UI will be available at
   `http://localhost:3000` (or your hosted URL).

5. **(Optional) Keep the host awake** by adding the public URL of your bot
   as an HTTP monitor on UptimeRobot. Use either `/` or `/health` as the
   target — UptimeRobot will ping it every 5 minutes.

## Web UI

Open the served URL in a browser. You will see live bot status and three
buttons:

- **Start Bot** — starts the bot if it is not running.
- **Stop Bot** — disconnects the bot and stops auto-reconnect.
- **Reconnect Bot** — gracefully disconnects and immediately re-establishes
  the connection.

## How the anti-AFK works

Aternos shuts a server down if no players are active. While the bot is
spawned in-world it periodically:

- Picks a random direction (forward / back / left / right) and walks
  briefly.
- Occasionally jumps.
- Looks around with random yaw / pitch.
- Swings its arm.

That activity is enough to keep Aternos from marking the bot as idle.

## Troubleshooting

- **Bot keeps getting kicked with "Failed to verify username":** the server
  is in online mode. Either switch your Aternos server to cracked / offline
  mode, or supply Microsoft credentials (see `mineflayer` docs).
- **`ECONNREFUSED` / connect errors:** the Aternos server is offline. Start
  it from the Aternos panel; the bot will reconnect on its own.
- **Wrong protocol version:** set `MC_VERSION` to match the version your
  server runs (for example `1.20.1`).

## License

MIT — see [LICENSE](./LICENSE).

🔗 GitHub Link: [GitHub Repo](https://github.com/sayanpramanik2012/Aternos-24.7-BOT)
