const http = require('http');
const https = require('https');

const KEY = process.env.ANTHROPIC_API_KEY;

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
        .pbar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}
        
        /* 封面样式调整 */
        #land{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;text-align:center;padding:20px}
        .lt{font-size:clamp(30px, 8vw, 48px);letter-spacing:10px;color:#2a1a0a;margin-bottom:10px}
        .lb{font-family:"Noto Serif Tibetan",serif;font-size:22px;color:var(--gold);margin-bottom:30px}
        .ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:15px 40px;font-size:16px;cursor:pointer;border-radius:30px;transition:0.3s}
        
        #app{display:none;flex-direction:column;height:100vh}
        
        /* 【关键：保持你满意的红边样式】 */
        #hdr{background:var(--red);color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;box-shadow:0 2px 5px rgba(0,0,0,0.2)}
        .htib{font-family:"Noto Serif Tibetan", serif !important; font-size: 1.2em; vertical-align: middle;}
        .htxt{font-weight:bold; letter-spacing:1px; margin-left:5px}

        #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:15px;background:#fdfbf7}
        .m{max-width:88%;padding:14px 18px;border-radius:18px;line-height:1.7;overflow-wrap:break-word;font-size:15px}
        .u{align-self:flex-end;background:#e6d5b8;color:#2a1a0a;border-bottom-right-radius:4px}
        .a{align-self:flex-start;background:#fff;border:1px solid #eee;color:#3d2b1f;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
        
        /* 藏文内容排版优化 */
        .tib{font-family:"Noto Serif Tibetan",serif;line-height:2.4;font-size:18px}
        
        #inp{padding:12px 16px 25px;background:#fff;border-top:1px solid #eee;display:flex;gap:10px;align-items:center}
        #t{flex:1;height:46px;border:1px solid #ddd;border-radius:12px;padding:11px 15px;resize:none;outline:none;font-family:inherit;font-size:15px;background:#f9f7f2}
        #sb{background:var(--red);color:#fff;border:none;width:70px;height:46px;border-radius:12px;font-weight:bold;cursor:pointer}
        #sb:disabled{opacity:0.5}
    </style>
</head>
<body>
    <div class="pbar"></div>
    <div id="land">
        <div class="lt">KHYEN</div>
        <div class="lb">མཁྱེན། AI</div>
        <button class="ebtn" onclick="enter()">开启智慧对话</button>
    </div>
    <div id="app">
        <div id="hdr">
            <div><span class="htib">མཁྱེན།</span><span class="htxt">KHYEN AI</span></div>
            <button onclick="location.reload()" style="background:rgba(255,255,255,0.2);border:none;color:white;padding:5px 12px;border-radius:6px;font-size:12px">返回首页</button>
        </div>
        <div id="chat"></div>
        <div id="inp">
            <textarea id="t" placeholder="在此请教导师..."></textarea>
            <button id="sb" onclick="send()">请教</button>
        </div>
    </div>
    <script>
        var C=document.getElementById('chat'),H=[];
        function hasTib(s){return /[\\u0F00-\\u0FFF]/.test(s)}
        function enter(){document.getElementById('land').style.display='none';document.getElementById('app').style.display='flex';if(H.length===0)add('扎西德勒！我是 KHYEN AI，您的智慧向导。','a')}
        function add(msg,type){
            var d=document.createElement('div');
            d.className='m '+type;
            if(hasTib(msg)) d.classList.add('tib');
            d.innerHTML=type==='a'?marked.parse(msg):msg;
            C.appendChild(d);C.scrollTop=C.scrollHeight;return d;
        }
        function send(){
            var v=document.getElementById('t').value.trim();if(!v)return;
            add(v,'u');H.push({role:'user',content:v});document.getElementById('t').value='';
            document.getElementById('sb').disabled=true;
            var loader=add('智者正在斟酌...','a');
            fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:H})})
            .then(r=>r.json()).then(data=>{
                if(data.reply){
                    loader.innerHTML=marked.parse(data.reply);
                    if(hasTib(data.reply)) loader.classList.add('tib');
                    H.push({role:'assistant',content:data.reply});
                } else { loader.innerText='导师暂未回应，请检查API设置。'; }
            }).catch(()=>loader.innerText='连接中断，请稍后再试。')
            .finally(()=>{document.getElementById('sb').disabled=false;C.scrollTop=C.scrollHeight});
        }
    </script>
</body>
</html>`;

http.createServer((req, res) => {
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', d => body += d);
        req.on('end', () => {
            try {
                const { messages } = JSON.parse(body);
                const postData = JSON.stringify({
                    model: "claude-3-5-sonnet-20240620", // 修正为绝对稳定的官方模型名
                    max_tokens: 4096,
                    system: "你是 KHYEN AI，专注藏族文化、佛法与藏语的智慧导师。请用温暖、深度的中文回答，Markdown格式。",
                    messages: messages
                });
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
                        try {
                            const j = JSON.parse(out);
                            const reply = (j.content && j.content[0]) ? j.content[0].text : "抱歉，我现在无法思考。";
                            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                            res.end(JSON.stringify({ reply }));
                        } catch(e) { res.end(JSON.stringify({ error: "解析失败" })); }
                    });
                });
                apiReq.write(postData); apiReq.end();
            } catch(e) { res.end(JSON.stringify({ error: "请求失败" })); }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(HTML);
    }
}).listen(process.env.PORT || 10000, '0.0.0.0');
