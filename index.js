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
        body { font-family: "Noto Serif CJK TC", "Jomolhari", serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #f7f3e8; }
        header { text-align: center; padding: 15px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 1px 10px rgba(0,0,0,0.04); }
        header h3 { margin: 0; font-size: 1.3rem; color: #5c4b3a; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 12px 0; padding: 16px 20px; border-radius: 20px; max-width: 88%; line-height: 1.8; font-size: 1.1rem; word-wrap: break-word; white-space: pre-wrap; }
        .user { background: #5c4b3a; color: #f1d592; align-self: flex-end; }
        .ai { background-color: white; color: #333; align-self: flex-start; box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
        #input-container { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
        textarea { flex: 1; border: 1px solid #ddd; border-radius: 12px; padding: 12px; resize: none; font-family: inherit; }
        button { background: #5c4b3a; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; }
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
        window.onload = () => add("མཁྱེན་ནོ། 正在为您全力连接 Claude 智库...\\n如果连接成功，您将体验到全新的智慧回响。", 'ai');
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
        req.on('end', () => {
            const { message } = JSON.parse(body);
            
            // 💡 自动轮询模型：先试 3.5 Sonnet，再试 3.0 Sonnet
            const attemptClaude = (modelName) => {
                return new Promise((resolve, reject) => {
                    const postData = JSON.stringify({
                        model: modelName,
                        max_tokens: 1024,
                        system: "你叫 KHYEN AI མཁྱེན།。藏族学者。请用藏汉双语回复。",
                        messages: [{ role: "user", content: message }]
                    });

                    const options = {
                        hostname: 'api.anthropic.com',
                        path: '/v1/messages',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': process.env.CLAUDE_API_KEY,
                            'anthropic-version': '2023-06-01'
                        }
                    };

                    const apiReq = https.request(options, (apiRes) => {
                        let d = ''; apiRes.on('data', c => d += c);
                        apiRes.on('end', () => {
                            const json = JSON.parse(d);
                            if (json.content) resolve(json.content[0].text);
                            else reject(json.error ? json.error.message : 'Unknown error');
                        });
                    });
                    apiReq.on('error', (e) => reject(e.message));
                    apiReq.write(postData); apiReq.end();
                });
            };

            // 🚀 核心逻辑：像套娃一样一个个试
            attemptClaude("claude-3-5-sonnet-20240620")
                .then(reply => res.end(JSON.stringify({ reply })))
                .catch(() => {
                    attemptClaude("claude-3-sonnet-20240229")
                        .then(reply => res.end(JSON.stringify({ reply })))
                        .catch(err => res.end(JSON.stringify({ reply: "❌ Claude 通道目前锁死：" + err })));
                });
        });
    }
});
server.listen(process.env.PORT || 10000);
