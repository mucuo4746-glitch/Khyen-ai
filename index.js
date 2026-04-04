const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
  // 1. 确保前端界面回归最初的精美与稳定
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html><html lang="zh"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>KHYEN AI མཁྱེན།</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--red:#8e2323;--cream:#fdfbf7;--brown:#3d2b1f;--gold:#c9a84c}
body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;display:flex;flex-direction:column}
.prayer-bar{height:5px;background:repeating-linear-gradient(90deg,#c9a84c 0% 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}
#header{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;font-family:'Noto Serif Tibetan'}
.hbtn{background:rgba(255,255,255,0.2);color:white;border:1px solid rgba(255,255,255,0.3);padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer}
#chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px;background:var(--cream)}
.m{max-width:85%;padding:14px 18px;border-radius:16px;line-height:1.8;box-shadow:0 2px 5px rgba(0,0,0,0.05)}
.u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
.a{align-self:flex-start;background:white;border:1px solid #eee;border-bottom-left-radius:4px}
.bo{font-family:'Noto Serif Tibetan',serif;font-size:18px;line-height:2.2}
#input-area{padding:12px 16px 20px;background:white;border-top:1px solid #eee;display:flex;gap:8px}
#t{flex:1;height:44px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none}
#sb{background:var(--red);color:white;border:none;padding:0 20px;border-radius:12px;font-weight:bold;cursor:pointer}
</style></head>
<body>
<div class="prayer-bar"></div>
<header id="header">
  <div>མཁྱེན། KHYEN AI</div>
  <button class="hbtn" onclick="location.reload()">🔄 刷新</button>
</header>
<div id="chat"></div>
<div id="input-area"><input id="t" placeholder="在此请教导师..."><button id="sb" onclick="send()">请教</button></div>
<script>
let h=[];
function add(m,t){
  const d=document.createElement('div');d.className='m '+t;
  if(/[\\u0F00-\\u0FFF]/.test(m))d.classList.add('bo');
  d.innerHTML=marked.parse(m);document.getElementById('chat').appendChild(d);
  document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight;
}
add('བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！我是 KHYEN མཁྱེན།。','a');
async function send(){
  const v=document.getElementById('t').value.trim();if(!v)return;
  add(v,'u');h.push({role:'user',content:v});document.getElementById('t').value='';
  const l=document.createElement('div');l.className='m a';l.innerText='智者斟酌中...';document.getElementById('chat').appendChild(l);
  try{
    const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:h})});
    const d=await r.json();
    if(d.reply){
      l.innerHTML=marked.parse(d.reply);
      if(/[\\u0F00-\\u0FFF]/.test(d.reply))l.classList.add('bo');
      h.push({role:'assistant',content:d.reply});
    }else{l.innerText="API提示："+(d.error||"连接异常");}
  }catch(e){l.innerText="网络故障，请稍后再试。";}
}
document.getElementById('t').onkeydown=(e)=>{if(e.key==='Enter')send();};
</script></body></html>`);

  // 2. 核心后端：严格依照 Anthropic 规范，纠正刚才的格式错误
  } else if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(body);
        const postData = JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          system: "你是一位睿智的藏文化导师，请用温暖、平等的语气回答。",
          messages: messages
        });

        const options = {
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': (MY_ANTHROPIC_KEY || '').trim(),
            'anthropic-version': '2023-06-01'
          }
        };

        const reqApi = https.request(options, apiRes => {
          let data = '';
          apiRes.on('data', c => data += c);
          apiRes.on('end', () => {
            try {
              const j = JSON.parse(data);
              if (j.content && j.content[0] && j.content[0].text) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply: j.content[0].text }));
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: j.error ? j.error.message : "API暂无有效回应" }));
              }
            } catch (e) {
              res.end(JSON.stringify({ error: "响应解析失败" }));
            }
          });
        });

        reqApi.on('error', e => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: "服务器连接超时" }));
        });
        reqApi.write(postData);
        reqApi.end();
      } catch (e) {
        res.end(JSON.stringify({ error: "数据格式异常" }));
      }
    });
  }
});

server.listen(process.env.PORT || 10000);
