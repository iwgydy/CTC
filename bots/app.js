const express = require('express');
const bodyParser = require('body-parser');
const { createBot, stopBot, listBots } = require('./bots/botManager');

const app = express();
const PORT = 3000; // พอร์ตเซิร์ฟเวอร์

// ตั้งค่า View Engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

// หน้าหลัก
app.get('/', (req, res) => {
  res.render('index', { bots: listBots() });
});

// เริ่มบอท
app.post('/start-bot', (req, res) => {
  const token = req.body.token;
  const result = createBot(token);
  res.redirect('/');
});

// หยุดบอท
app.post('/stop-bot', (req, res) => {
  const token = req.body.token;
  stopBot(token);
  res.redirect('/');
});

// หน้าแสดงสถานะ
app.get('/status', (req, res) => {
  res.render('status', { bots: listBots() });
});

// รันเซิร์ฟเวอร์
app.listen(PORT, () => {
  console.log(`เซิร์ฟเวอร์ทำงานที่ http://localhost:${PORT}`);
});
