# Aternos Server Bot Setup Guide

**Update: 
  - added GUI for Webpage
  - added start, stop, reconnect bot option on webpage
  - Removed ServerTime update due to mismatch of time

[Watch the Video Tutorial!](https://youtu.be/mRgLIu1sLMQ)**

This guide will help you set up and run a Minecraft bot on an Aternos server using Replit and UptimeRobot. Follow these steps to ensure a smooth setup.

## Requirements

- Aternos server
- Replit account
- UptimeRobot free account

## Setup Instructions

1. **Create and Start Aternos Server:**

   - Create your own Aternos server.
   - Start the server and copy the IP address of the server you just created.

2. **Replit Setup:**

   - Open your Replit account and start a new project.
   - Copy the content of `index.js` and `main.html` into your Replit project.
   - Click on "Run" to start the bot.

3. **Verify Bot Connection:**

   - Once the bot is running, check the console in Replit. You should see a message indicating that the bot is connected, followed by the server time. The bot will disconnect and reconnect in a loop if everything works correctly.

4. **Get Webview URL:**

   - In the Replit web view on the right-hand side, copy the web address (URL).

5. **Set up UptimeRobot:**

   - Create a UptimeRobot account if you don't have one.
   - Add a new monitor and select "HTTP" as the monitor type.
   - Paste the URL from the Replit web view into the URL section of UptimeRobot.
   - Click on "Create Monitor" to finalize the setup.

## Configuration

In the `index.js` file, you can modify the following variables to customize the bot's behavior:

- `serverHost`: The Minecraft server host name.
- `serverPort`: The Minecraft server port.
- `botUsername`: The username of the Minecraft bot.
- `reconnectInterval`: The time (in milliseconds) to wait before attempting to reconnect after disconnection.

## Usage

Once the bot logs in to the Minecraft server, it will print a message in the Replit console. The bot will also send a chat message every time the game time is updated.

Using Replit ensures that the bot runs on a virtual machine on your account, and UptimeRobot pings the Replit server every 5 minutes, preventing the bot from sleeping. This setup ensures the bot remains active and responsive on your Aternos server.

Happy botting! 🤖🎮

🔗 GitHub Link: [GitHub Repo](https://github.com/sayanpramanik2012/Aternos-24.7-BOT)
