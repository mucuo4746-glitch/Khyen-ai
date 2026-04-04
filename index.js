const http = require('http');
const https = require('https');

const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = "你是 KHYEN AI མཁྱེན།，专注藏族文化、佛法与藏语的智慧导师。默认只用中文回答。只有用户明确用藏文提问时才用藏文回答。不确定藏文时直接用中文替代。温暖有深度，像博学的藏族学者。使用Markdown格式。【哈达专项知识 ཁ་བཏགས།】哈达是藏族文化中代表纯洁心意的礼物，藏人从生到死都离不开哈达。历史起源：古时用白羊毛绳挂于脖子表达纯洁心意，后演变为哈达。种类包括：见面哈达མཇལ་དར།、求子哈达སློང་དར།、活佛坐床哈达དཔལ་དར།、勇士哈达དཔའ་དར།、座垫哈达གདན་དར།、祈愿哈达སྙན་དར།、覆盖遗体哈达སྤུ་དར།、招福哈达གཡང་དར།。活佛坐床专用དཔལ་དར།。敬献礼仪：向上位者双手奉上，向下位者挂于对方脖子，平辈互赠不挂脖。哈达颜色以白色为主代表心意纯洁，鲜花绝对不能替代哈达。";

function getHTML() {
  return [
    '<!DOCTYPE html>',
    '<html lang="zh">',
    '<head>',
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">',
    '<title>KHYEN AI</title>',
    '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">',
    '<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"><' + '/script>',
    '<style>',
    '*{box-sizing:border-box;margin:0;padding:0}',
    ':root{--red:#8e2323;--gold:#c9a84c;--cream:#fdfbf7;--brown:#3d2b1f}',
    'body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;overflow:hidden}',
    '.pbar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}',
    '#land{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;padding:60px 20px 40px;overflow-y:auto;text-align:center}',
    '.li{font-size:56px;margin-bottom:14px}',
    '.lt{font-size:clamp(34px,7vw,58px);font-weight:300;letter-spacing:14px;color:#2a1a0a;padding-left:14px}',
    '.lb{font-family:"Noto Serif Tibetan",serif;font-size:clamp(15px,3vw,21px);color:var(--gold);letter-spacing:3px;margin:8px 0}',
    '.ll{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:14px auto}',
    '.ltag{font-size:11px;color:#8a7a6a;letter-spacing:3px;text-transform:uppercase;margin-bottom:28px}',
    '.feats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;max-width:420px;margin-bottom:28px}',
    '@media(max-width:460px){.feats{grid-template-columns:repeat(2,1fr)}}',
    '.feat{background:#fff;border:1px solid rgba(201,168,76,.25);border-radius:14px;padding:14px 8px}',
    '.fi{font-size:22px;margin-bottom:6px}',
    '.ft{font-size:12px;font-weight:600}',
    '.fb{font-family:"Noto Serif Tibetan",serif;font-size:11px;color:var(--gold);margin-top:3px}',
    '.ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-bottom:18px}',
    '.mant{font-family:"Noto Serif Tibetan",serif;font-size:13px;color:rgba(201,168,76,.45);letter-spacing:3px}',
    '#app{display:none;flex-direction:column;height:100vh}',
    '#hdr{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}',
    '.htit{font-weight:bold;font-size:1em}',
    '.hbtns{display:flex;gap:6px}',
    '.hbtn{background:rgba(255,255,255,.18);color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer}',
    '#chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px}',
    '.m{max-width:88%;padding:14px 18px;border-radius:16px;line-height:1.8;overflow-wrap:break-word;box-shadow:0 2px 8px rgba(0,0,0,.05)}',
    '.u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}',
    '.a{align-self:flex-start;background:#fff;border:1px solid #eee;border-bottom-left-radius:4px}',
    '.a p{margin:6px 0}',
    '.tib{font-family:"Noto Serif Tibetan",serif;line-height:2.5;font-size:17px}',
    '.acts{display:flex;gap:8px;margin-top:8px;padding-top:8px;border-top:1px dashed #eee}',
    '.abtn{background:none;border:1px solid #ddd;color:#888;padding:3px 10px;border-radius:6px;font-size:11px;cursor:pointer}',
    '#inp{padding:12px 16px 20px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}',
    '#t{flex:1;min-height:44px;max-height:120px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none;resize:none;font-family:"Noto Serif SC",serif;background:#fcfaf7}',
    '#sb{background:var(--red);color:#fff;border:none;padding:10px 18px;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer;height:44px}',
    '.toast{position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.75);color:#fff;padding:8px 20px;border-radius:20px;font-size:13px;z-index:999;animation:fo 2s forwards}',
    '@keyframes fo{0%,70%{opacity:1}100%{opacity:0}}',
    '</style>',
    '</head>',
    '<body>',
    '<div class="pbar"></div>',
    '<div id="land">',
    '  <div class="li">&#x1F3D4;&#xFE0F;</div>',
    '  <div class="lt">KHYEN</div>',
    '  <div class="lb">མཁྱེན། AI</div>',
    '  <div class="ll"></div>',
    '  <div class="ltag">Intelligence Rooted in Tibetan Wisdom</div>',
    '  <div class="feats">',
    '    <div class="feat"><div class="fi">&#x1F524;</div><div class="ft">翻译</div><div class="fb">ཡིག་བསྒྱུར།</div></div>',
    '    <div class="feat"><div class="fi">&#x1F4DA;</div><div class="ft">文化</div><div class="fb">རིག་གཞུང་།</div></div>',
    '    <div class="feat"><div class="fi">&#x2638;&#xFE0F;</div><div class="ft">佛法</div><div class="fb">དམ་ཆོས།</div></div>',
    '    <div class="feat"><div class="fi">&#x1F5D3;&#xFE0F;</div><div class="ft">节日</div><div class="fb">དུས་ཆེན།</div></div>',
    '  </div>',
    '  <button class="ebtn" id="ebtn">进入 · Enter</button>',
    '  <div class="mant">ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།</div>',
    '</div>',
    '<div id="app">',
    '  <div id="hdr">',
    '    <div class="htit" style="font-family:\'Noto Serif SC\',serif">མཁྱེན། KHYEN AI</div>',
    '    <div class="hbtns">',
    '      <button class="hbtn" id="savebtn">💾 保存</button>',
    '      <button class="hbtn" id="clrbtn">🗑️ 清空</button>',
    '      <button class="hbtn" id="homebtn">🏠 首页</button>',
    '    </div>',
    '  </div>',
    '  <div id="chat"></div>',
    '  <div id="inp">',
    '    <textarea id="t" placeholder="在此请教导师..."></textarea>',
    '    <button id="sb">请教</button>',
    '  </div>',
    '</div>',
    '<script>',
    'var C=document.getElementById("chat"),H=[];',
    'function hasTib(s){return /[\\u0F00-\\u0FFF]/.test(s)}',
    'function toast(m){var t=document.createElement("div");t.className="toast";t.innerText=m;document.body.appendChild(t);setTimeout(function(){t.remove()},2000)}',
    'function enter(){',
    '  document.getElementById("land").style.display="none";',
    '  document.getElementById("app").style.display="flex";',
    '  if(!H.length) add("扎西德勒！欢迎来到 KHYEN AI。我是您的藏文化智慧向导，欢迎向我询问藏传佛教、藏族文化、历史、节日、饮食，或进行藏汉英翻译。","a");',
    '}',
    'function add(msg,type){',
    '  var d=document.createElement("div");',
    '  d.className="m "+type;',
    '  if(type==="a"&&hasTib(msg)) d.classList.add("tib");',
    '  d.innerHTML=type==="a"?marked.parse(msg):msg;',
    '  if(type==="a"){',
    '    var ac=document.createElement("div");ac.className="acts";',
    '    var cb=document.createElement("button");cb.className="abtn";cb.innerText="📋 复制";',
    '    cb.onclick=function(){var txt=d.innerText.replace("📋 复制","").trim();navigator.clipboard.writeText(txt).then(function(){toast("已复制")})};',
    '    ac.appendChild(cb);d.appendChild(ac);',
    '  }',
    '  C.appendChild(d);C.scrollTop=C.scrollHeight;return d;',
    '}',
    'function send(){',
    '  var v=document.getElementById("t").value.trim();',
    '  if(!v) return;',
    '  add(v,"u");H.push({role:"user",content:v});',
    '  document.getElementById("t").value="";',
    '  document.getElementById("sb").disabled=true;',
    '  var loader=add("智者正在斟酌...","a");',
    '  fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:H})})',
    '  .then(function(r){return r.json()})',
    '  .then(function(data){',
    '    var reply=data.reply||"暂时无法回应，请重试。";',
    '    loader.innerHTML=marked.parse(reply);',
    '    if(hasTib(reply)) loader.classList.add("tib");',
    '    var ac=document.createElement("div");ac.className="acts";',
    '    var cb=document.createElement("button");cb.className="abtn";cb.innerText="📋 复制";',
    '    cb.onclick=function(){navigator.clipboard.writeText(reply).then(function(){toast("已复制")})};',
    '    ac.appendChild(cb);loader.appendChild(ac);',
    '    H.push({role:"assistant",content:reply});',
    '    if(H.length>20) H=H.slice(-20);',
    '  })',
    '  .catch(function(){loader.innerText="连接中断，请重试。"})',
    '  .finally(function(){document.getElementById("sb").disabled=false;C.scrollTop=C.scrollHeight});',
    '}',
    'document.getElementById("ebtn").onclick=enter;',
    'document.getElementById("homebtn").onclick=function(){document.getElementById("land").style.display="flex";document.getElementById("app").style.display="none"};',
    'document.getElementById("savebtn").onclick=function(){',
    '  var msgs=Array.from(document.querySelectorAll(".m")).map(function(m){var c=m.cloneNode(true);var a=c.querySelector(".acts");if(a)a.remove();return c.innerText.trim()}).join("\\n\\n---\\n\\n");',
    '  var b=new Blob([msgs],{type:"text/plain;charset=utf-8"});',
    '  var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download="Khyen_AI.txt";a.click();',
    '  toast("已保存");',
    '};',
    'document.getElementById("clrbtn").onclick=function(){if(confirm("确定清空？")){C.innerHTML="";H=[];add("对话已清空。","a")}};',
    'document.getElementById("sb").onclick=send;',
    'document.getElementById("t").onkeydown=function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}};',
    '<' + '/script>',
    '</body>',
    '</html>'
  ].join('\n');
}

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

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.end(getHTML());

}).listen(process.env.PORT || 10000, '0.0.0.0');
