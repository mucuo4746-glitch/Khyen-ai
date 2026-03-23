const https = require('https');

const data = JSON.stringify({
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "你是一个深耕藏文化的智库专家。你的开场白必须是：‘您好，我是您的藏文化帮手。’" },
    { role: "user", content: "请向指挥官报到。" }
  ]
});

const options = {
  hostname: 'api.openai.com',
  port: 443,
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.KEY}` 
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => { console.log("智库大脑已就绪。"); });
});

req.write(data);
req.end();