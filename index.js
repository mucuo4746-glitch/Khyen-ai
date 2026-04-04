const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="zh"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>KHYEN AI མཁྱེན།</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
:root{--red:#8e2323;--cream:#fdfbf7;--gold:#c9a84c}
body{font-family:"Noto Serif SC",serif;background:var(--cream);margin:0;height:100vh;display:flex;flex-direction:column}
.prayer-bar{height:4px;background:repeating-linear-gradient(90deg,#c9a84c 0 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}
#landing{position:fixed;inset:0;background:var(--cream);z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;text-align:center}
.l-title{font-size:48px;letter-spacing:12px;margin:0}
.l-bo{font-family:'Noto Serif Tibetan',serif;color:var(--gold);font-size:20px;margin:10px 0}
.l-btn{background:#2a1a0a;color:var(--gold);border:none;padding:12px 40px;border-radius:25px;cursor:pointer;margin-top:30px}
#app{display:none;flex:1;flex-direction:column;overflow:hidden}
header{background:var(--red);color:white;padding:10px 15px;display:flex;justify-content:space-between;align-items:center}
#chat{flex:1;overflow-y:auto;padding:15px;display:flex;flex-direction:column;gap:15px}
.m{max-width:85%;padding:12px 18px;border-radius:15px;line-height:1.6;box-shadow:0 2px 5px rgba(0,0,0,0.05)}
.u{align-self:flex-end;background:#e6d5b8}
.a{align-self:flex-start;background:white;border:1px solid #eee}
.bo{font-family:'Noto Serif Tibetan',serif;font-size:18px;line-height:2}
#input-area{padding:15px;background:white;border-top:1px solid #eee;display:flex;gap:10px}
textarea{flex:1;height:45px;border:1px solid #ddd;border-radius:10px;padding:10px;resize:none}
#sb{background:var(--red);color:white;border:none;padding:0 20px;border-radius:10px;font-weight:bold}
</style></head>
<body>
<div class="prayer-bar"></div>
<div id="landing">
  <div class="l-title">KHYEN</div><div class="l-bo">མཁྱེན།</div>
  <p style="color:#8a7a6a;letter-spacing:2px;font-size:12px">INTELLIGENCE ROOTED IN TIBETAN WISDOM</p>
  <button class="l-btn" onclick="enterApp()">进入 · Enter</button>
</div>
<div id="app">
  <header><div>མཁྱེན། KHYEN AI</div><button onclick="location.reload()" style="background:none;border:1px solid white;color:white;font-size:10px;padding:2px 8px;border-radius:4px">重置</button></header>
  <div id="chat"></div>
  <div id="input-area"><textarea id="t" placeholder="在此开启心灵对话..."></textarea><button id="sb" onclick="send()">请教</button></div>
</div>
<script>
let h = [];
function enterApp(){document.getElementById('landing').style.display='none';document.getElementById('app').style.display='flex';add('扎西德勒！我是您的智慧导师 KHYEN。','a');}
function add(m,t){
  const d=document.createElement('div');d.className='m '+t;
  if(/[\\u0F00-\\u0FFF]/.test(m))d.classList.add('bo');
  d.innerHTML=marked.parse(m);document.getElementById('chat').appendChild(d);
  document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight;
}
async function send(){
  const v=document.getElementById('t').value.trim();if(!v)return;
  add(v,'u');h.push({role:'user',content:v});document.getElementById('t').value='';
  const l=document.createElement('div');l.className='m a';l.innerText='智者斟酌中...';document.getElementById('chat').appendChild(l);
  try{
    const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({messages:h})});
    const j=await r.json();l.innerHTML=marked.parse(j.reply);
    if(/[\\u0F00-\\u0FFF]/.test(j.reply))l.classList.add('bo');
    h.push({role:'assistant',content:j.reply});
  }catch(e){l.innerText='连接故障。';}
}
</script></body></html>`);
  } else if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      const { messages } = JSON.parse(body);
      const postData = JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        system: "你是 KHYEN AI མཁྱེན།。关于哈达（ཁ་བཏགས།）：1.历史源于领口抹糌粑粉（རྩམ་པས་དཀར་ཐིག་བརྒྱབས་པ）或系白羊毛绳。2.分类包括拜见（མཇལ་དར།）、求亲（སློང་དར།）、坐床（དཔལ་དར།）等。3.哈达不可被鲜花替代。语气睿智谦逊。",
        messages: messages
      });
      const reqApi = https.request({
        hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
          'anthropic-version': '2023-06-01' 
        }
      }, apiRes => {
        let d = ''; apiRes.on('data', c => d += c);
        apiRes.on('end', () => {
          const j = JSON.parse(d);
          res.end(JSON.stringify({ reply: j.content[0].text }));
        });
      });
      reqApi.write(postData); reqApi.end();
    });
  }
});
server.listen(process.env.PORT || 10000);
