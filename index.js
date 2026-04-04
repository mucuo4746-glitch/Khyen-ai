const http = require('http');
const https = require('https');

// 获取你在 Render 设置的 API Key
const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = "你是 KHYEN AI，专注藏族文化、佛法与藏语的智慧导师。默认只用中文回答。只有用户明确用藏文提问时才用藏文回答。不确定藏文时直接用中文替代。温暖有深度，像博学的藏族学者。使用Markdown格式回答。【哈达知识】哈达是藏族文化中代表纯洁心意的礼物，藏人从生到死都离不开哈达。种类包括见面哈达、求子哈达、活佛坐床哈达（dpal dar）、勇士哈达、座垫哈达、祈愿哈达、覆盖遗体哈达、招福哈达。敬献礼仪：向上位者双手奉上，向下位者挂于对方脖子，平辈互赠不挂脖。";

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
    
    /* 封面样式 - 严格保留你满意的比例 */
    #land{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;padding:60px 20px;text-align:center}
    .li{font-size:56px;margin-bottom:14px}
    .lt{font-size:clamp(34px,7vw,58px);font-weight:300;letter-spacing:14px;color:#2a1a0a;padding-left:14px}
    .lb{font-family:"Noto Serif Tibetan",serif;font-size:clamp(15px,3vw,21px);color:var(--gold);letter-spacing:3px;margin:8px 0}
    .ll{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:14px auto}
    .ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-top:20px}

    /* 聊天界面 */
    #app{display:none;flex-direction:column;height:100vh}
    #hdr{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
    .htib{font-family:"Noto Serif Tibetan",serif !important; font-size: 1.2em; vertical-align: middle}
    .htxt{font-weight:bold; margin-left:8px; vertical-align: middle}
    
    #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;background:var(--cream)}
    .m{max-width:88%;padding:14px 18px;border-radius:16px;line-height:1.8;overflow-wrap:break-word;box-shadow:0 2px 8px rgba(0,0,0,.05)}
    .u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
    .a{align-self:flex-start;background:#fff;border:1px solid #eee;border-bottom-left-radius:4px}
    .tib{font-family:"Noto Serif Tibetan",serif;line-height:2.5;font-size:17px}
    
    #inp{padding:12px 16px 25px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;align-items:center}
    #t{flex:1;height:44px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none;resize:none;background:#fcfaf7}
    #sb{background:var(--red);color:#fff;border:none;padding:0 18px;border-radius:12px;font-weight:bold;cursor:pointer;height:44px}
</style>
</head>
<body>
    <div class="pbar"></div>
    <div id="land">
        <div class="li">🏔️</div>
        <div class="lt">KHYEN</div>
        <div class="lb">མཁྱེན། AI</div>
        <div class="ll"></div>
        <button class="ebtn" onclick="enter()">进入 · Enter</button>
    </div>

    <div id="app">
        <div id="hdr">
            <div class="htit"><span class="htib">མཁྱེན།</span><span class="htxt">KHYEN AI</span></div>
            <button onclick="location.reload()" style="background:none;border:1px solid #fff;color:#fff;padding:4px 8px;border-radius:5px;font-size:12px">首页</button>
        </div>
        <div id="chat"></div>
        <div id="inp">
            <textarea id="t" placeholder="在此请教导师..."></textarea>
            <button id="sb" onclick="send()">请教</button>
        </div>
    </div>

    <script>
        var C=document.getElementById('chat'), H=[];
        function hasTib(s){return /[\\u0F00-\\u0FFF]/.test(s)}
        function enter(){
            document.getElementById('land').style.display='none';
            document.getElementById('app').style.display='flex';
            if(!H.length) add('扎西德勒！欢迎来到 KHYEN AI。我是您的藏文化智慧向导。','a');
        }
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
            add(v,'u'); H.push({role:'user',content:v});
            document.getElementById('t').value='';
            var loader=add('智者正在斟酌...','a');
            fetch('/api/chat',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({messages:H})
            })
            .then(r=>r.json())
            .then(data=>{
                loader.innerHTML=marked.parse(data.reply);
                if(hasTib(data.reply)) loader.classList.add('tib');
                H.push({role:'assistant',content:data.reply});
            })
            .catch(()=>{loader.innerText='连接中断，请重试。'});
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
                const msgs = JSON.parse(body).messages;
                const postData = JSON.stringify({
                    model: 'claude-3-5-sonnet-20240620', // 使用目前最稳的模型名
                    max_tokens: 4096,
                    system: SYSTEM,
                    messages: msgs
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
                            const txt = (j.content && j.content[0]) ? j.content[0].text : '导师正在禅修，请稍后再试。';
                            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                            res.end(JSON.stringify({reply: txt}));
                        } catch(e) { res.end(JSON.stringify({reply: '解析失败'})); }
                    });
                });
                apiReq.write(postData); apiReq.end();
            } catch(e) { res.end(JSON.stringify({reply: '请求错误'})); }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(HTML);
    }
}).listen(process.env.PORT || 10000, '0.0.0.0');
