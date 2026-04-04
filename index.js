const http = require('http');
const https = require('https');

const KEY = process.env.ANTHROPIC_API_KEY;

// 藏文显示加强版：将网页直接嵌入，解决路径找不到的问题
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<title>KHYEN AI མཁྱེན།</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--red:#8e2323;--gold:#c9a84c;--cream:#fdfbf7;--brown:#3d2b1f}
body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;overflow:hidden}
.pbar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}
#land{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;padding:60px 20px 40px;overflow-y:auto;text-align:center}
.li{font-size:56px;margin-bottom:14px}
.lt{font-size:clamp(34px,7vw,58px);font-weight:300;letter-spacing:14px;color:#2a1a0a;padding-left:14px}
.lb{font-family:"Noto Serif Tibetan",serif;font-size:clamp(15px,3vw,21px);color:var(--gold);letter-spacing:3px;margin:8px 0}
.ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-bottom:18px}
#app{display:none;flex-direction:column;height:100vh}
#hdr{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
/* 修复顶栏乱码的关键：强制指定藏文字体 */
.htib{font-family:"Noto Serif Tibetan", serif !important; font-size: 1.2em; margin-right: 5px;}
.hbtns{display:flex;gap:6px}
.hbtn{background:rgba(255,255,255,.18);color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer}
#chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px}
.m{max-width:88%;padding:14px 18px;border-radius:16px;line-height:1.8;overflow-wrap:break-word;box-shadow:0 2px 8px rgba(0,0,0,.05)}
.u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
.a{align-self:flex-start;background:#fff;border:1px solid #eee;border-bottom-left-radius:4px}
.tib{font-family:"Noto Serif Tibetan",serif;line-height:2.5;font-size:17px}
#inp{padding:12px 16px 20px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}
#t{flex:1;min-height:44px;max-height:120px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none;resize:none;background:#fcfaf7}
#sb{background:var(--red);color:#fff;border:none;padding:10px 18px;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer;height:44px}
</style>
</head>
<body>
<div class="pbar"></div>
<div id="land">
  <div class="li">🏔️</div>
  <div class="lt">KHYEN</div>
  <div class="lb">མཁྱེན། AI</div>
  <button class="ebtn" id="ebtn">进入 · Enter</button>
</div>
<div id="app">
  <div id="hdr">
    <div class="htit"><span class="htib">མཁྱེན།</span> KHYEN AI</div>
    <div class="hbtns">
      <button class="hbtn" id="savebtn">💾 保存</button>
      <button class="hbtn" id="clrbtn">🗑️ 清空</button>
      <button class="hbtn" id="homebtn">🏠 首页</button>
    </div>
  </div>
  <div id="chat"></div>
  <div id="inp"><textarea id="t" placeholder="在此请教导师..."></textarea><button id="sb">请教</button></div>
</div>
<script>
var C=document.getElementById('chat'),H=[];
function hasTib(s){return /[\\u0F00-\\u0FFF]/.test(s)}
function add(msg,type){
  var d=document.createElement('div');
  d.className='m '+type;
  if(hasTib(msg)) d.classList.add('tib');
  d.innerHTML=type==='a'?marked.parse(msg):msg;
  C.appendChild(d);C.scrollTop=C.scrollHeight;return d;
}
function send(){
  var v=document.getElementById('t').value.trim();
  if(!v) return;
  add(v,'u');H.push({role:'user',content:v});
  document.getElementById('t').value='';
  document.getElementById('sb').disabled=true;
  var loader=add('智者正在斟酌...','a');
  fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:H})})
  .then(r=>r.json()).then(data=>{
    loader.innerHTML=marked.parse(data.reply);
    if(hasTib(data.reply)) loader.classList.add('tib');
    H.push({role:'assistant',content:data.reply});
  }).catch(()=>loader.innerText='连接中断').finally(()=>{document.getElementById('sb').disabled=false;C.scrollTop=C.scrollHeight});
}
document.getElementById('ebtn').onclick=()=>{document.getElementById('land').style.display='none';document.getElementById('app').style.display='flex';if(!H.length)add('扎西德勒！欢迎来到 KHYEN AI。','a')};
document.getElementById('sb').onclick=send;
document.getElementById('t').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}};
</script></body></html>`;

http.createServer((req, res) => {
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', d => body += d);
    req.on('end', () => {
      try {
        const msgs = JSON.parse(body).messages;
        const data = JSON.stringify({
          model: 'claude-3-5-sonnet-20240620', // 使用目前最稳的模型
          max_tokens: 4096,
          system: "你是 KHYEN AI，专注藏族文化、佛法与藏语的智慧导师。温暖有深度。使用Markdown格式。",
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
            const j = JSON.parse(out);
            const txt = (j.content && j.content[0]) ? j.content[0].text : '暂时无法回应。';
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({reply: txt}));
          });
        });
        r.write(data); r.end();
      } catch(e) { res.end(JSON.stringify({reply: '错误'})); }
    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    res.end(HTML_CONTENT);
  }
}).listen(process.env.PORT || 10000, '0.0.0.0');
