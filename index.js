const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// 把前端界面完全固定下来
const page = `<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>KHYEN AI</title><link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC&family=Noto+Serif+Tibetan&display=swap" rel="stylesheet"><script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script><style>:root{--red:#8e2323;--cream:#fdfbf7;--gold:#c9a84c}body{font-family:"Noto Serif SC",serif;background:var(--cream);margin:0;display:flex;flex-direction:column;height:100vh}#header{background:var(--red);color:#fff;padding:15px;display:flex;justify-content:space-between;align-items:center}#chat{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:15px}.m{max-width:85%;padding:12px;border-radius:10px;line-height:1.6}.u{align-self:flex-end;background:#e6d5b8}.a{align-self:flex-start;background:#fff;border:1px solid #ddd}.bo{font-family:"Noto Serif Tibetan",serif;font-size:20px}#input-area{padding:15px;background:#fff;border-top:1px solid #ddd;display:flex;gap:10px}input{flex:1;padding:10px;border:1px solid #ddd;border-radius:5px}button{background:var(--red);color:#fff;border:none;padding:10px 20px;border-radius:5px;cursor:pointer}</style></head><body><div id="header"><div style="font-family:'Noto Serif Tibetan'">མཁྱེན། KHYEN AI</div><button onclick="location.reload()" style="background:none;color:#fff;border:1px solid #fff;padding:4px 8px;font-size:12px;border-radius:4px">重置</button></div><div id="chat"></div><div id="input-area"><input id="t" placeholder="请输入..."><button onclick="send()">发送</button></div><script>let h=[];function add(m,t){const d=document.createElement('div');d.className='m '+t;if(/[\\u0F00-\\u0FFF]/.test(m))d.classList.add('bo');d.innerHTML=marked.parse(m);document.getElementById('chat').appendChild(d);document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight}add('扎西德勒！我是 KHYEN。','a');async function send(){const v=document.getElementById('t').value.trim();if(!v)return;add(v,'u');h.push({role:'user',content:v});document.getElementById('t').value='';const l=document.createElement('div');l.className='m a';l.innerText='...';document.getElementById('chat').appendChild(l);try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:h})});const d=await r.json();if(d.reply){l.innerHTML=marked.parse(d.reply);if(/[\\u0F00-\\u0FFF]/.test(d.reply))l.classList.add('bo');h.push({role:'assistant',content:d.reply})}else{l.innerText='错误：'+(d.error||'未知')}}catch(e){l.innerText='连接失败'}}</script></body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(page);
  } else if (req.url === '/api/chat' && req.method === 'POST') {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(b);
        const postData = JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
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
        const apiReq = https.request(options, apiRes => {
          let d = '';
          apiRes.on('data', c => d += c);
          apiRes.on('end', () => {
            try {
              const j = JSON.parse(d);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              if (j.content && j.content[0]) {
                res.end(JSON.stringify({ reply: j.content[0].text }));
              } else {
                res.end(JSON.stringify({ error: j.error ? j.error.message : "API错误" }));
              }
            } catch (e) { res.end(JSON.stringify({ error: "解析失败" })); }
          });
        });
        apiReq.on('error', e => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
        apiReq.write(postData);
        apiReq.end();
      } catch (e) { res.end(JSON.stringify({ error: "格式错误" })); }
    });
  }
});

server.listen(process.env.PORT || 10000);
