const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = "你是 KHYEN AI，专注藏族文化、佛法与藏语的智慧导师。默认只用中文回答。只有用户明确用藏文提问时才用藏文回答。不确定藏文时直接用中文替代。温暖有深度，像博学的藏族学者。使用Markdown格式。【哈达专项知识】哈达是藏族文化中代表纯洁心意的礼物，藏人从生到死都离不开哈达。历史起源：古时用白羊毛绳挂于脖子表达纯洁心意，后演变为哈达。种类：见面哈达、求子哈达、活佛坐床哈达、勇士哈达、座垫哈达、祈愿哈达、覆盖遗体哈达、招福哈达。活佛坐床专用哈达藏文名为dpal dar。敬献礼仪：向上位者双手奉上，向下位者挂于对方脖子，平辈互赠不挂脖。哈达颜色以白色为主代表心意纯洁，鲜花绝对不能替代哈达。";

http.createServer((req, res) => {

  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const msgs = JSON.parse(body).messages;
        const data = JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          system: SYSTEM,
          messages: msgs
        });
        const r = https.request({
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': KEY.trim(),
            'anthropic-version': '2023-06-01'
          }
        }, ar => {
          let out = '';
          ar.on('data', d => out += d);
          ar.on('end', () => {
            try {
              const j = JSON.parse(out);
              const txt = (j.content && j.content[0]) ? j.content[0].text : '暂时无法回应，请重试。';
              res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
              res.end(JSON.stringify({reply: txt}));
            } catch(e) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({reply: '解析失败，请重试。'}));
            }
          });
        });
        r.on('error', e => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({reply: '连接失败：' + e.message}));
        });
        r.write(data);
        r.end();
      } catch(e) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({reply: '请求解析失败。'}));
      }
    });
    return;
  }

  // 读取 index.html 文件返回给用户
  const htmlPath = path.join(__dirname, 'index.html');
  try {
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
  } catch(e) {
    res.writeHead(500);
    res.end('index.html not found');
  }

}).listen(process.env.PORT || 10000, '0.0.0.0');
