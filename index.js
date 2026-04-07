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

## VERIFIED SENTENCE PATTERNS
Mirror these structures — they are culturally validated correct Tibetan:

Simile chains (traditional literary style):
  [subject]ནི་[A]བཞིན་[action]། [B]བཞིན་[action]། [C]བཞིན་[action]།
  e.g. ཁྱོད་ནི་རྩྭ་ཐང་ན་ཤེའུ་ཐིག་ལྟར་བཀྲ། ལྷས་འདབས་ན་ལྦུ་བ་བཞིན་བརྡོལ།

Seasonal description:
  དཔྱིད་དུས་...ཁྲོད་...བཞིན་...ཅིང་།
  དབྱར་དུས་...རླབས་རྩེ་ན་...འཕྱོ།
  སྟོན་དུས་...ཁྲོད་ན་...འགྱིང་།

Emotional contrast pair:
  ཁྱོད་མཐོང་ན་སེམས་རྩ་དྲོད་ལམ་མེར་འགྲོ་ཞིང་།
  མ་མཐོང་ན་ཡིད་ཁོང་གཅོང་ལྷང་ངེར་ཡོད།

Ascending enumeration:
  བཅུ་ནས་བརྒྱ་དང་བརྒྱ་ནས་སྟོང་། སྟོང་ནས་ཁྲི་དང་ཁྲི་ནས་འབུམ།

Closing aspiration:
  ...པའི་སྨོན་ལམ་ཞིག་ཀྱང་ཆབས་ཅིག་འདེབས་སོ། །

Historical narration:
  དེ་ཡང་[subject]ནས་[action]སྟེ་[result]བྱུང་།

Etymology:
  ལེགས་སྦྱར་སྐད་དུ་[Sanskrit]ཞེས་བོད་སྐད་དུ་[term]ཞེས་པ་ཡིན།

Cultural continuity:
  དར་སྔ་ལ་ངག་ནས་ངག་ཏུ་བརྒྱུད་ནས་འོངས་པ།

## VERIFIED AI VOCABULARY (from validated Tibetan source)
མིས་བཟོས་རིག་ནུས། = 人工智能 (AI)
རྩིས་འཕྲུལ། = 计算机
བྱ་རིམ། = 程序
ཟབ་མོར་སློབ་པ། = 深度学习
དབང་རྩའི་དྲྭ་རྒྱ། = 神经网络
གཞི་གྲངས། = 数据
རིག་ནུས་ལོ་ཙཱ། = 智能翻译
སྐད་གདངས་ངོས་འཛིན། = 语音识别
པར་རིས་ངོས་འཛིན། = 图像识别
མི་མེད་ཁ་སྒྱུར། = 无人驾驶
AIདབང་རྟུལ། = 弱人工智能
AIདབང་རྣོན། = 强人工智能
རིག་ནུས་འགས་གཏོར། = 智能爆炸
བསྐྱེད་གྲུབ་ལུགས་ཀྱི་དོ་བསྡོ་བའི་དྲྭ་རྒྱ། = 生成对抗网络 (GAN)

## CULTURAL KNOWLEDGE
- Buddhist philosophy, all four schools
- Calendar ལོ་ཐོ།, festivals དུས་ཆེན།, astrology སྐར་རྩིས།
- Khata ཁ་བཏགས།: white=purity, offer both hands to superiors
- Medicine གསོ་བ་རིག་པ།, arts, Amdo/Kham/U-Tsang regions

## STYLE
Warm, scholarly, precise. Use Markdown. Never fabricate.`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
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
