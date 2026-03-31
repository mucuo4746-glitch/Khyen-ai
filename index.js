const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Jomolhari&family=Noto+Serif+CJK+TC:wght@400;500;700&display=swap');
        body { font-family: "Noto Serif CJK TC", "Jomolhari", serif; margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #f7f3e8; }
        header { text-align: center; padding: 15px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 1px 10px rgba(0,0,0,0.04); }
        header h3 { margin: 0; font-size: 1.3rem; color: #5c4b3a; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 12px 0; padding: 16px 20px; border-radius: 20px; max-width: 88%; line-height: 1.8; font-size: 1.1rem; word-wrap: break-word; white-space: pre-wrap; }
        .user { background: #5c4b3a; color: #f1d592; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ai { background-color: white; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
        #input-container { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
        textarea { flex: 1; border: 1px solid #ddd; border-radius: 12px; padding: 12px; font-size: 1rem; outline: none; resize: none; font-family: inherit; }
        button { background: #5c4b3a; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 500; }
    </style>
</head>
<body>
    <header><h3>KHYEN AI མཁྱེན།</h3></header>
    <div id="chat"></div>
    <div id="input-container">
        <textarea id="text" placeholder="向智者请教..." rows="1"></textarea>
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        window.onload = () => add("མཁྱེན་ནོ། 正在为您调动 Claude 3.5 最新智库...\\n如果拨通，智慧将如泉涌现。", 'ai');
        function add(t, type){
            const d = document.createElement('div'); d.className = 'msg ' + type;
            d.innerText = t; chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
        }
        async function send(){
            const i = document.getElementById('text'); const v = i.value.trim(); if(!v) return;
            add(v, 'user'); i.value='';
            const r = await fetch('/api/chat', {method:'POST', body:JSON.stringify({message:v})});
            const d = await r.json(); add(d.reply, 'ai');
        }
    </script>
</body>
</html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', async () => {
            const { message } = JSON.parse(body);
            const sys = "你叫 KHYEN AI མཁྱེན།。博学睿智。请用藏汉双语回复。";

            try {
                // 1. 核心调用：使用最新模型名和地址
                const postData = JSON.stringify({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 1024,
                    system: sys,
                    messages: [{ role: "user", content: message }]
                });

                const options = {
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.ANTHROPIC_API_KEY, // 2. 核心变量名对齐
                        'anthropic-version': '2023-06-01'
                    }
                };

                const apiReq = https.request(options, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => {
                        const json = JSON.parse(d);
                        if (json.content) res.end(JSON.stringify({ reply: json.content[0].text }));
                        else res.end(JSON.stringify({ reply: "❌ Claude 后台反馈：" + (json.error ? json.error.message : "未知错误") }));
                    });
                });

                apiReq.on('error', e => res.end(JSON.stringify({ reply: "❌ 网络请求失败：" + e.message })));
                apiReq.write(postData); apiReq.end();

            } catch (e) {
                res.end(JSON.stringify({ reply: "❌ 系统运行异常，请检查配置。" }));
            }
        });
    }
});
server.listen(process.env.PORT || 10000);
