const http = require('http');
const https = require('https');

const KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM = `你是 KHYEN AI，专注藏族文化、佛法与藏语的智慧导师。默认只用中文回答。只有用户明确用藏文提问时才用藏文回答。不确定藏文时直接用中文替代。温暖有深度。使用Markdown格式回答。

【哈达专项知识 ཁ་བཏགས།】
- 哈达是藏族文化中代表纯洁心意的礼物，藏人从生到死都离不开哈达。
- 历史起源：古时用白羊毛绳挂于脖子表达纯洁心意，后演变为哈达。
- 主要种类：མཇལ་དར། (见面哈达)、སློང་དར། (求子哈达)、དཔལ་དར། (活佛坐床专用)、དཔའ་དར། (勇士哈达)、གདན་དར། (座垫哈达)、སྙན་དར། (祈愿哈达)、སྤུ་དར། (覆盖遗体哈达)、གཡང་དར། (招福哈达)。
- 哈达颜色以白色为主，代表心意纯洁，后逐渐有黄色、蓝色、红色等。
- 敬献礼仪：向上位者双手奉上，向下位者挂于对方脖子，平辈互赠不挂脖。
- 鲜花不能替代哈达，哈达是藏族传统文化的核心象征。`;

const HTML = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>KHYEN AI</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
    *{box-sizing:border-box;margin:0;padding:0}
    :root{--red:#8e2323;--gold:#c9a84c;--cream:#fdfbf7;--brown:#3d2b1f}
    body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;overflow:hidden}
    .pbar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0 20%,#8e2323 20% 40%,#1a5a8a 40% 60%,#1a6b3a 60% 80%,#6b1a8a 80% 100%)}
    #land{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;padding:40px 20px;text-align:center;overflow-y:auto}
    .li{font-size:56px;margin-bottom:14px}
    .lt{font-size:clamp(34px,7vw,58px);font-weight:300;letter-spacing:14px;color:#2a1a0a;padding-left:14px}
    .lb{font-family:"Noto Serif Tibetan",serif;font-size:clamp(15px,3vw,21px);color:var(--gold);letter-spacing:3px;margin:8px 0}
    .ll{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:14px auto}
    .feats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;max-width:420px;margin-bottom:28px}
    @media(max-width:460px){.feats{grid-template-columns:repeat(2,1fr)}}
    .feat{background:#fff;border:1px solid rgba(201,168,76,.25);border-radius:14px;padding:14px 8px}
    .fi{font-size:22px;margin-bottom:6px}.ft{font-size:12px;font-weight:600}.fb{font-family:"Noto Serif Tibetan",serif;font-size:11px;color:var(--gold);margin-top:3px}
    .ebtn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-bottom:18px}
    #app{display:none;flex-direction:column;height:100vh}
    #hdr{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
    .htib{font-family:"Noto Serif Tibetan",serif !important; font-size: 1.2em}
    #chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:14px;background:var(--cream)}
    .m{max-width:88%;padding:14px 18px;border-radius:16px;line-height:1.8;box-shadow:0 2px 8px rgba(0,0,0,.05)}
    .u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
    .a{align-self:flex-start;background:#fff;border:1px solid #eee;border-bottom-left-radius:4px}
    .tib{font-family:"Noto Serif Tibetan",serif;line-height:2.5;font-size:18px}
    #inp{padding:12px 16px 25px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px}
    #t{flex:1;height:44px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none;resize:none}
    #sb{background:var(--red);color:#fff;border:none;padding:0 18px;border-radius:12px;font-weight:bold;cursor:pointer}
</style>
</head>
<body>
    <div class="pbar"></div>
    <div id="land">
        <div class="li">🏔️</div>
        <div class="lt">KHYEN</div><div class="lb">མཁྱེན། AI</div><div class="ll"></div>
        <div class="feats">
            <div class="feat"><div class="fi">🔤</div><div class="ft">翻译</div><div class="fb">ཡིག་བསྒྱུར།</div></div>
            <div class="feat"><div class="fi">📚</div><div class="ft">文化</div><div class="fb">རིག་གཞུང་།</div></div>
            <div class="feat"><div class="fi">☸️</div><div class="ft">佛法</div><div class="fb">དམ་ཆོས།</div></div>
            <div class="feat"><div class="fi">🗓️</div><div class="ft">节日</div><div class="fb">དུས་ཆེན།</div></div>
        </div>
        <button class="ebtn" onclick="enter()">进入 · Enter</button>
    </div>
    <div id="app">
        <div id="hdr">
            <div><span class="htib">མཁྱེན།</span> KHYEN AI</div>
            <button onclick="location.reload()" style="background:rgba(255,255,255,.2);color:#fff;border:none;padding:5px 10px;border-radius:8px">首页</button>
        </div>
        <div id="chat"></div>
        <div id="inp">
            <textarea id="t" placeholder="在此请教导师..."></textarea>
            <button id="sb" onclick="send()">请教</button>
        </div>
    </div>
    <script>
        var C=document.getElementById('chat'), H=[], B=document.getElementById('sb');
        function hasTib(s){return /[\\u0F00-\\u0FFF]/.test(s)}
        function enter(){ document.getElementById('land').style.display='none'; document.getElementById('app').style.display='flex'; if(!H.length) add('扎西德勒！欢迎来到 KHYEN AI。','a'); }
        function add(msg,type){
            var d=document.createElement('div'); d.className='m '+type;
            if(hasTib(msg)) d.classList.add('tib');
            d.innerHTML=type==='a'?marked.parse(msg):msg;
            C.appendChild(d); C.scrollTop=C.scrollHeight; return d;
        }
        function send(){
            var v=document.getElementById('t').value.trim(); if(!v) return;
            add(v,'u'); H.push({role:'user',content:v}); document.getElementById('t').value='';
            B.disabled=true; var loader=add('智者正在斟酌...','a');
            fetch('/api/chat',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({messages:H})
            })
            .then(function(r){ return r.json(); })
            .then(function(data){
                var reply = data.reply || '暂时无法回应。';
                loader.innerHTML=marked.parse(reply);
                if(hasTib(reply)) loader.classList.add('tib');
                H.push({role:'assistant',content:reply});
            })
            .catch(function(){ loader.innerText='连接失败，请重试。'; })
            .finally(function(){ B.disabled=false; C.scrollTop=C.scrollHeight; });
        }
    </script>
</body>
</html>`;

http.createServer(function(req, res) {
    if (req.url === '/api/chat' && req.method === 'POST') {
        var body = '';
        req.on('data', function(d){ body += d; });
        req.on('end', function(){
            try {
                var msgs = JSON.parse(body).messages;
                var data = JSON.stringify({
                    model: 'claude-3-5-sonnet-20240620', // 使用最稳定的 3.5 Sonnet
                    max_tokens: 4096,
                    system: SYSTEM,
                    messages: msgs
                });
                var r = https.request({
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': KEY.trim(),
                        'anthropic-version': '2023-06-01'
                    }
                }, function(ar){
                    var out = '';
                    ar.on('data', function(d){ out += d; });
                    ar.on('end', function(){
                        try {
                            var j = JSON.parse(out);
                            var txt = (j.content && j.content[0]) ? j.content[0].text : '暂时无法回应，请重试。';
                            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
                            res.end(JSON.stringify({reply: txt}));
                        } catch(e) {
                            res.writeHead(200, {'Content-Type': 'application/json'});
                            res.end(JSON.stringify({reply: '解析失败，请检查 API 状态。'}));
                        }
                    });
                });
                r.on('error', function(e){
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify({reply: '连接 API 失败'}));
                });
                r.write(data);
                r.end();
            } catch(e) {
                res.end(JSON.stringify({reply: '请求解析失败'}));
            }
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(HTML);
    }
}).listen(process.env.PORT || 10000, '0.0.0.0');
