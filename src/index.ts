import Discord, { MessageReaction, TextChannel } from 'discord.js';
import { commands, ChatModel } from './chat';
import { checkOnlineDLPlayers } from './chat/deadlocked-online';
import { checkOnlineUYAPlayers } from './chat/uya-online';
import { clearQueueRole, checkQueueDL, checkQueueUYA } from './chat/queue';
import { initMessageReactionMonitor } from './chat/reaction-monitor';
import * as dotenv from 'dotenv';
/**
 * Initialize dotenv so we can easily access custom env variables.
 */
dotenv.config();

/**
 * Initialize the discord client and login.
 */
const client = new Discord.Client();
client.login(process.env.BIG_AL_BOT_TOKEN);

/**
 * Initialize the DL online players script.
 */

client.on('ready', () => {
  clearQueueRole(client);

  if (process.env.DL_PLAYERS_ONLINE_ENABLED === 'true') {
    client.setInterval(
      () => checkOnlineDLPlayers(client),
      Number(process.env.DL_PLAYERS_ONLINE_INTERVAL) || 60000
    );
  }
  if (process.env.UYA_PLAYERS_ONLINE_ENABLED === 'true') {
    client.setInterval(
      () => checkOnlineUYAPlayers(client),
      Number(process.env.UYA_PLAYERS_ONLINE_INTERVAL) || 60000
    );
  }
  if (process.env.DL_QUEUE_ENABLED === 'true') {
    client.setInterval(
      () => checkQueueDL(client),
      Number(process.env.DL_QUEUE_INTERVAL) || 60000
    );
  }
  if (process.env.UYA_QUEUE_ENABLED === 'true') {
    client.setInterval(
      () => checkQueueUYA(client),
      Number(process.env.UYA_QUEUE_INTERVAL) || 60000
    );
  }
  initMessageReactionMonitor(client);
});

/**
 * Take incoming messages and route them through the chat parsers.
 */
client.on('message', (msg) => {
  const message = msg.content;
  const channel = msg.channel;
  const parts = msg.content.split(/ +/);
  const command = parts[0];
  const args = parts.slice(1);
  const model: ChatModel = {
    rawMessage: msg,
    command,
    channel,
    sender: msg.author,
    args,
  };
  for (let command of commands) {
    command(model);
  }
});
