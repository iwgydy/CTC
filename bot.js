const { Client, GatewayIntentBits } = require('discord.js');

const bots = {}; // เก็บรายการบอทที่ออนไลน์

// สร้างบอทใหม่
function createBot(token) {
  if (bots[token]) {
    return { status: 'error', message: 'บอทนี้ออนไลน์อยู่แล้ว' };
  }

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  client.once('ready', () => {
    console.log(`บอทออนไลน์แล้ว: ${client.user.tag}`);
  });

  client.login(token).catch((err) => {
    console.error(`ไม่สามารถเข้าสู่ระบบด้วยโทเค็นนี้: ${err.message}`);
  });

  bots[token] = client;
  return { status: 'success', message: 'บอทออนไลน์แล้ว' };
}

// หยุดบอท
function stopBot(token) {
  if (!bots[token]) {
    return { status: 'error', message: 'บอทนี้ไม่ได้ออนไลน์อยู่' };
  }

  bots[token].destroy();
  delete bots[token];
  return { status: 'success', message: 'บอทถูกปิดแล้ว' };
}

// ดูรายการบอทที่ออนไลน์อยู่
function listBots() {
  return Object.keys(bots).map((token) => ({
    tag: bots[token]?.user?.tag || 'ไม่ทราบชื่อ',
    token,
  }));
}

module.exports = { createBot, stopBot, listBots };
