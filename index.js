const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// 预定义 HTML，防止嵌套导致语法错误
const htmlContent = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        *{box-sizing:border-box;margin:0;padding:0}
        :root{--red:#8e2323;--cream:#fdfbf7;--brown:#3d2b1f;--gold:#c9a84c}
        body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;overflow:hidden}
        .prayer-bar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0% 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}
        #landing{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;padding:20px;text-align:center}
        .l-icon{font-size:60px;margin-bottom:16px}
        .l-title{font-size:clamp(36px,7vw,60px);font-weight:300;letter-spacing:16px;color:#2a1a0a}
        .l-bo{font-family:'Noto Serif Tibetan',serif;font-size:22px;color:var(--gold);margin:10px 0}
        .l-line{width:100px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:16px auto}
        .l-feats{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;width:100%;max-width:320px;margin:20px 0}
        .feat{background:white;border:1px solid rgba(201,168,76,0.2);border-radius:12px;padding:12px;font-size:12px;box-shadow:0 2px 4px rgba(0,0,0,0.02)}
        .l-btn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-top:20px}
        #app{display:none;flex-direction:column;height:100vh}
        #header{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        .h-btns{display:flex;gap:6px}
        .hbtn{background:rgba(255,255,255,0.2);color:white;border:none;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer}
        #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
        .m{max-width:88%;padding:14px 18px;border-radius:16px;line-height:1.8;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
        .u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
        .a{align-self:flex-start;background:white;border:1px solid #eee;border-bottom-left-radius:4px}
        .bo{font-family:'Noto Serif Tibetan',serif;font-size:18px;line-height:2.2}
        #input-area{padding:12px 16px 20px;background:white;border-top:1px solid #eee;display:flex;gap:8px;flex-shrink:0}
        #t{flex:1;height:44px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;outline:none}
        #sb{background:var(--red);color:white;border:none;padding:0 20px;border-radius:12px;font-weight:bold;cursor:pointer}
    </style>
</head>
<body>
    <div class="prayer-bar"></div>
    <div id="landing">
        <div class="l-icon">🏔️</div>
        <div class="l-title">KHYEN</div>
        <div class="l-bo">མཁྱེན། AI</div>
        <div class="l-line"></div>
        <div class="l-feats">
            <div class="feat">翻译 ཡིག་བསྒྱུར།</div>
            <div class="feat">文化 རིག་གཞུང་།</div>
            <div class="feat">佛法 དམ་ཆོས།</div>
            <div class="feat">节日 དུས་ཆེན།</div>
        </div>
        <button class="l-btn" onclick="enterApp()">开启智慧 · ENTER</button>
    </div>
    <div id="app">
        <header id="header">
            <div style="font-family:'Noto Serif Tibetan'">མཁྱེན། KHYEN AI</div>
            <div class="h-btns">
                <button class="hbtn" onclick="saveChat()">💾 保存</button>
                <button class="hbtn" onclick="clearChat()">🗑️ 清空</button>
                <button class="hbtn" onclick="location.reload()">🏠 首页</button>
            </div>
        </header>
        <div id="chat"></div>
        <div id="input-area">
            <input id="t" placeholder="在此请教导师..." autocomplete="off">
            <button id="sb" onclick="send()">请教</button>
        </div>
    </div>
    <script>
        let h = [];
        function enterApp(){document.getElementById('landing').style.display='none';document.getElementById('app').style.display='flex';if(h.length===0)add('བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！我是 KHYEN མཁྱེན།。','a');}
        function add(m,t){
            const d=document.createElement('div');d.className='m '+t;
            if(/[\\u0F00-\\u0FFF]/.test(m))d.classList.add('bo');
            d.innerHTML=marked.parse(m);document.getElementById('chat').appendChild(d);
            document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight;
        }
        function clearChat(){if(confirm('清空对话？')){document.getElementById('chat').innerHTML='';h=[];add('对话已重置。','a');}}
        function saveChat(){
            const txt=Array.from(document.querySelectorAll('.m')).map(m=>m.innerText).join('\\n\\n---\\n\\n');
            const b=new Blob([txt],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='Khyen_Chat.txt';a.click();
        }
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
                }else{l.innerText='提示：'+(d.error||'连接波动');}
            }catch(e){l.innerText='信号微弱，请重试。';}
            document.getElementById('chat').scrollTop=document.getElementById('chat').scrollHeight;
        }
        document.getElementById('t').onkeydown=(e)=>{if(e.key==='Enter')send();};
    </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlContent);
  } else if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { messages } = JSON.parse(body);
        const postData = JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          messages: messages
        });
        const reqApi = https.request({
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': (MY_ANTHROPIC_KEY || '').trim(),
            'anthropic-version': '2023-06-01'
          }
        }, apiRes => {
          let data = '';
          apiRes.on('data', c => data += c);
          apiRes.on('end', () => {
            try {
              const j = JSON.parse(data);
              if (j.content && j.content[0]) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply: j.content[0].text }));
              } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: j.error ? j.error.message : "请求未成功" }));
              }
            } catch (e) { res.end(JSON.stringify({ error: "解析失败" })); }
          });
        });
        reqApi.on('error', e => res.end(JSON.stringify({ error: e.message })));
        reqApi.write(postData);
        reqApi.end();
      } catch (e) { res.end(JSON.stringify({ error: "数据有误" })); }
    });
  }
});
server.listen(process.env.PORT || 10000);
