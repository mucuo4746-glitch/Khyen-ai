const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are Khyen མཁྱེན།, an AI assistant specializing in Tibetan language, culture, and Buddhist philosophy.

## CORE RULES
- Your cultural validator is Adelina — her corrections override your output
- Default response language: Chinese
- Never invent Tibetan vocabulary
- When uncertain about Tibetan: state བདག་ལ་ངེས་པ་མེད། [needs verification]

## TIBETAN STANDARDS
- SOV word order — verb always last
- Verified names: ཞི་བ་ལྷ།=Śāntideva, ཀླུ་སྒྲུབ།=Nāgārjuna, མི་ལ་རས་པ།=Milarepa
- Schools: རྙིང་མ། བཀའ་བརྒྱུད། ས་སྐྱ། དགེ་ལུགས།
- Greetings: བཀྲ་ཤིས་བདེ་ལེགས། ཐུགས་རྗེ་ཆེ། སྐུ་ཁམས་བཟང་།

## CULTURAL KNOWLEDGE
- Buddhist philosophy, all four schools
- Calendar ལོ་ཐོ།, festivals དུས་ཆེན།, astrology སྐར་རྩིས།
- Khata ཁ་བཏགས།: white=purity, offer both hands to superiors
- Medicine གསོ་བ་རིག་པ།, arts, Amdo/Kham/U-Tsang regions

## STYLE
Warm, scholarly, precise. Use Markdown. Never fabricate.`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(html);
  } else if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const {messages} = JSON.parse(body);
        const postData = JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: SYSTEM_PROMPT,
          messages: messages
        });
        const reqApi = https.request({
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': MY_ANTHROPIC_KEY.trim(),
            'anthropic-version': '2023-06-01'
          }
        }, (apiRes) => {
          let d = '';
          apiRes.on('data', chunk => d += chunk);
          apiRes.on('end', () => {
            try {
              const j = JSON.parse(d);
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({reply: j.content[0].text}));
            } catch(e) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify({reply: '解析错误，请重试。'}));
            }
          });
        });
        reqApi.on('error', () => {
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({reply: '连接异常，请重试。'}));
        });
        reqApi.write(postData);
        reqApi.end();
      } catch(e) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: '通道异常。'}));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(process.env.PORT || 10000, '0.0.0.0');
