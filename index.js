const http = require('http');
const https = require('https');

// 请确保你在 Render 的 Environment Variables 里设置了 ANTHROPIC_API_KEY
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
        
        /* 封面 */
        #land{position:fixed;inset:0;background:#fdfbf7;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;text-align:center}
        .lt{font-size:42px;letter-spacing:8px;color:#2a1a0a;margin-bottom:5px}
        .lb{font-family:"Noto Serif Tibetan",serif;font-size:20px;color:var(--gold);margin-bottom:30px}
        .ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:12px 30px;font-size:15px;cursor:pointer;border-radius:25px}

        #app{display:none;flex-direction:column;height:100vh}
        
        /* 【核心：保留你满意的顶栏比例】 */
        #hdr{background:var(--red);color:#fff;padding:10px 16px;display:flex;justify-content:space-between;align-items:center}
        .htib{font-family:"Noto Serif Tibetan", serif !important; font-size: 1.2em; vertical-align: middle}
        .htxt{font-weight:bold; margin-left:6px; vertical-align: middle}
        .hbtn{background:rgba(255,255,255,0.15); border:none; color:#fff; padding:4px 10px; border-radius:5px; font-size:12px; cursor:pointer}

        #chat{flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px}
        .m{max-width:85%;padding:12px 16px;border-radius:15px;line-height:1.6;font-size:15px}
        .u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:2px}
        .a{align-self:flex-start;background:#fff;border:1px solid #eee;border-bottom-left-radius:2px}
        .tib{font-family:"Noto Serif Tibetan",serif;line-height:2.2;font-size:17px}
        
        #inp{padding:15px;background:#fff;border-top:1px solid #eee;display:flex;gap:10px}
        #t{flex:1;height:42px;border:1px solid #ddd;border-radius:8px;padding:10px;resize:none;outline:none}
        #sb{background:var(--red);color:#fff;border:none;padding:0 20px;border-radius:8px;cursor:pointer;font-weight:bold}
    </style>
</head>
<body>
    <div id="land">
        <div class="lt">KHYEN</div>
        <div class="lb">མཁྱེན། AI</div>
        <button class="ebtn" onclick="enter()">开启智慧对话</button>
    </div>
    <div id="app">
        <div id="hdr">
            <div><span class="htib">མཁྱེན།</span><span class="htxt">KHYEN AI</span></div>
            <button class="hbtn" onclick="location.reload()">首页</button>
        </div>
        <div id="chat"></div>
        <div id="inp">
            <textarea id="t" placeholder="请教导师..."></textarea>
            <button id="sb" onclick="send()">请教</button>
        </div>
    </div>
    <script>
        var C=document.getElementById('chat'),H=[];
        function hasTib(s){return /[\\u0F00-\\u0FFF]/.test(s)}
        function enter(){document.getElementById('land').style.display='none';document.getElementById('app').style.display='flex';if(!H.length)add('扎西德勒！我是 KHYEN AI。','a')}
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
            var loader=add('...','a');
            fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({messages:H})})
            .then(r=>r.json()).then(data=>{
                loader.innerHTML=marked.parse(data.reply);
                if(hasTib(data.reply)) loader.classList.add('tib');
                H.push({role:'assistant',content:data.reply});
            }).catch(()=>loader.innerText='连接导师失败');
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
                    model: "claude-3-5-sonnet-20240620",
                    max_tokens: 2048,
                    system: "你是 KHYEN AI，一位睿智的藏文化导师。请用亲切、智慧的中文回答，适时加入藏文祝福。",
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
                            // 关键修复：确保能够正确读取 API 的返回字段内容
                            const reply = (j.content && j.content[0]) ? j.content[0].text : "导师正在禅修，请稍后再试。";
                            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                            res.end(JSON.stringify({ reply }));
                        } catch(e) { res.end(JSON.stringify({ reply: "解析回应失败" })); }
                    });
                });
                apiReq.on('error', () => res.end(JSON.stringify({reply: "接口连接失败"})));
                apiReq.write(postData); apiReq.end();
            } catch(e) { res.end(JSON.stringify({ reply: "服务器内部错误" })); }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(HTML);
    }
}).listen(process.env.PORT || 10000, '0.0.0.0');
