const express = require('express');
const bodyParser = require('body-parser');
const { Client, GatewayIntentBits } = require('discord.js');

// เก็บรายการบอท
const bots = {};

// ฟังก์ชันสร้างบอท
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

// ฟังก์ชันหยุดบอท
function stopBot(token) {
  if (!bots[token]) {
    return { status: 'error', message: 'บอทนี้ไม่ได้ออนไลน์อยู่' };
  }

  bots[token].destroy();
  delete bots[token];
  return { status: 'success', message: 'บอทถูกปิดแล้ว' };
}

// ฟังก์ชันดูรายการบอทออนไลน์
function listBots() {
  return Object.keys(bots).map((token) => ({
    tag: bots[token]?.user?.tag || 'ไม่ทราบชื่อ',
    token,
  }));
}

// เริ่มเซิร์ฟเวอร์ Express
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// หน้าเว็บหลัก
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Discord Bot Manager</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; color: #333; }
        h1 { text-align: center; }
        form { margin: 20px 0; }
        input { padding: 10px; font-size: 16px; }
        button { padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; cursor: pointer; }
        button:hover { background-color: #0056b3; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>Discord Bot Manager</h1>
      <form action="/start-bot" method="POST">
        <input type="text" name="token" placeholder="กรุณาใส่โทเค่นบอท" required />
        <button type="submit">เริ่มบอท</button>
      </form>
      <h2>บอทที่ออนไลน์อยู่</h2>
      <ul>
        ${
          listBots().length === 0
            ? '<li>ไม่มีบอทออนไลน์</li>'
            : listBots()
                .map(
                  (bot) => `
          <li>
            ชื่อบอท: ${bot.tag}
            <form action="/stop-bot" method="POST" style="display:inline;">
              <input type="hidden" name="token" value="${bot.token}">
              <button type="submit">ปิดบอท</button>
            </form>
          </li>`
                )
                .join('')
        }
      </ul>
      <a href="/status">ดูสถานะบอททั้งหมด</a>
    </body>
    </html>
  `);
});

// เริ่มบอท
app.post('/start-bot', (req, res) => {
  const token = req.body.token;
  createBot(token);
  res.redirect('/');
});

// หยุดบอท
app.post('/stop-bot', (req, res) => {
  const token = req.body.token;
  stopBot(token);
  res.redirect('/');
});

// หน้าแสดงสถานะบอททั้งหมด
app.get('/status', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bot Status</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f9; color: #333; }
        h1 { text-align: center; }
        ul { list-style: none; padding: 0; }
        li { margin: 10px 0; }
        a { text-decoration: none; color: #007bff; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>สถานะบอททั้งหมด</h1>
      <ul>
        ${
          listBots().length === 0
            ? '<li>ไม่มีบอทออนไลน์</li>'
            : listBots()
                .map(
                  (bot) => `
          <li>
            ชื่อบอท: ${bot.tag}<br>
            โทเค่น: ${bot.token}
          </li>`
                )
                .join('')
        }
      </ul>
      <a href="/">กลับไปหน้าหลัก</a>
    </body>
    </html>
  `);
});

// เริ่มเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่ http://localhost:${PORT}`);
});
