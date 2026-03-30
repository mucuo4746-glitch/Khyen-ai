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
        header { text-align: center; padding: 15px; background: rgba(255, 255, 255, 0.9); box-shadow: 0 1px 10px rgba(0,0,0,0.04); z-index: 10; }
        header h3 { margin: 0; font-size: 1.3rem; color: #5c4b3a; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 12px 0; padding: 16px 20px; border-radius: 20px; max-width: 88%; line-height: 1.8; font-size: 1.1rem; word-wrap: break-word; white-space: pre-wrap; }
        .user { background: #5c4b3a; color: #f1d592; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ai { background-color: white; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
        #input-container { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
        textarea { flex: 1; border: 1px solid #ddd; border-radius: 12px; padding: 12px; font-size: 1rem; resize: none; font-family: inherit; }
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
        window.onload = () => { 
            add("མཁྱེན་ནོ། 欢迎来到 KHYEN。我是您的灵魂向导。\\n两足尊者初降世，七步莲华踏大地。智者于此恭敬礼。", 'ai'); 
        };
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
</html>
        `);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。是一位博学睿智、严谨温暖的藏族学者。玛旁雍错是圣湖，不是人。必须学习无著贤菩萨《入行论注疏》的风格：慈悲、深刻、逻辑严密。请用优美的藏汉双语回复。重要术语加粗。不要使用表情符号。";
            const postData = JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                system: systemPrompt,
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
                    try {
                        const json = JSON.parse(d);
                        res.end(JSON.stringify({ reply: json.content[0].text }));
                    } catch (e) {
                        res.end(JSON.stringify({ reply: '智慧连接略有波动。' }));
                    }
                });
            });
            apiReq.on('error', (e) => res.end(JSON.stringify({ reply: '连接失败：' + e.message })));
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
