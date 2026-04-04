const http = require('http');
const https = require('https');

// 这里从环境变量读取 Key
const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = "你是 KHYEN AI，专注藏族文化、佛法与藏语的智慧导师。默认用中文回答。温暖有深度。使用Markdown格式。";

const HTML = `<!DOCTYPE html>
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
        #land{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;text-align:center}
        .li{font-size:56px;margin-bottom:14px}
        .lt{font-size:clamp(34px,7vw,58px);font-weight:300;letter-spacing:14px;color:#2a1a0a;padding-left:14px}
        .lb{font-family:"Noto Serif Tibetan",serif;font-size:clamp(15px,3vw,21px);color:var(--gold);letter-spacing:3px;margin:8px 0}
        .ll{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:14px auto}
        .ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-top:20px}
        #app{display:none;flex-direction:column;height:100vh}
        #hdr{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
        #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;background:var(--cream)}
        .m{max-width:88%;padding:14px 18px;border-radius:16px;line-height:1.8;box-shadow:0 2px 8px rgba(0,0,0,.05)}
        .u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
        .a{align-self:flex-start;background:#fff;border:1px solid #eee;border-bottom-left-radius:4px}
        #inp{padding:12px 16px 25px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px}
        #t{flex:1;height:44px;border:1px solid #ddd;border-radius:12px;padding:10px;outline:none;resize:none}
        #sb{background:var(--red);color:#fff;border:none;padding:0 18px;border-radius:12px;cursor:pointer}
    </style>
</head>
<body>
    <div id="land">
        <div class="li">🏔️</div>
        <div class="lt">KHYEN</div>
        <div class="lb">མཁྱེན། AI</div>
        <div class="ll"></div>
        <button class="ebtn" id="enterBtn">进入 · ENTER</button>
    </div>
    <div id="app">
        <div id="hdr">
            <div style="font-weight:bold">མཁྱེན། KHYEN AI</div>
            <button onclick="location.reload()" style="background:none;border:1px solid #fff;color:#fff;padding:4px;border-radius:4px">首页</button>
        </div>
        <div id="chat"></div>
        <div id="inp">
            <textarea id="t" placeholder="在此请教导师..."></textarea>
            <button id="sb">请教</button>
        </div>
    </div>
    <script>
        const chat=document.getElementById('chat'), t=document.getElementById('t'), sb=document.getElementById('sb');
        let H=[];
        document.getElementById('enterBtn').onclick=()=>{
            document.getElementById('land').style.display='none';
            document.getElementById('app').style.display='flex';
            if(!H.length) add('扎西德勒！我是 KHYEN མཁྱེན།。','a');
        };
        function add(msg,type){
            const d=document.createElement('div');
            d.className='m '+type;
            d.innerHTML=marked.parse(msg);
            chat.appendChild(d);chat.scrollTop=chat.scrollHeight;
            return d;
        }
        sb.onclick=async()=>{
            const v=t.value.trim(); if(!v) return;
            add(v,'u'); H.push({role:'user',content:v}); t.value='';
            const loader=add('智者正在斟酌...','a');
            try {
                const r=await fetch('/api/chat',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({messages:H})
                });
                const data=await r.json();
                loader.innerHTML=marked.parse(data.reply);
                H.push({role:'assistant',content:data.reply});
            } catch(e) { loader.innerText='导师连接中断，请检查设置。'; }
        };
    </script>
</body>
</html>`;

http.createServer((req, res) => {
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', d => body += d);
        req.on('end', () => {
            if (!KEY || KEY.length < 10) {
                res.end(JSON.stringify({reply: "⚠️ 错误：未检测到有效的 API Key。请在 Render 的 Dashboard -> Settings -> Environment Variables 中添加 ANTHROPIC_API_KEY。"}));
                return;
            }
            try {
                const msgs = JSON.parse(body).messages;
                const apiReq = https.request({
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': KEY.trim(),
                        'anthropic-version': '2023-06-01'
                    }
                }, apiRes => {
                    let out = '';
                    apiRes.on('data', d => out += d);
                    apiRes.on('end', () => {
                        const j = JSON.parse(out);
                        // 如果 API 返回错误（如余额不足），这里能抓到具体提示
                        if (j.error) {
                            res.end(JSON.stringify({reply: "导师提示错误：" + j.error.message}));
                        } else {
                            const txt = j.content[0].text;
                            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                            res.end(JSON.stringify({reply: txt}));
                        }
                    });
                });
                apiReq.write(JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    max_tokens: 1024,
                    system: SYSTEM,
                    messages: msgs
                }));
                apiReq.end();
            } catch(e) { res.end(JSON.stringify({reply: '请求解析失败'})); }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(HTML);
    }
}).listen(process.env.PORT || 10000);
