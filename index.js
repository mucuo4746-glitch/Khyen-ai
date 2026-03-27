const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500); res.end('Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } 
    // 2. 聊天页面界面 (加入“表情防火墙”)
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        body { font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #f7f7f7; overflow: hidden; }
        header { text-align: center; padding: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        header h3 { margin: 0; color: #333; font-weight: 600; font-size: 1.5rem; }
        header span { color: #888; font-size: 0.9rem; margin-top: 5px; display: block; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; scroll-behavior: smooth; }
        .msg { margin: 15px 0; padding: 15px 20px; border-radius: 20px; max-width: 85%; line-height: 1.7; font-size: 1.15rem; position: relative; word-wrap: break-word; }
        .user { background-color: #333; color: #ffd700; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ai { background-color: #fff; color: #222; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        #input-container { display: flex; padding: 15px 20px; background-color: #fff; border-top: 1px solid #eaeaea; }
        input { flex: 1; padding: 15px 20px; border: 1px solid #ddd; border-radius: 30px; outline: none; font-size: 1.1rem; }
        button { padding: 12px 28px; margin-left: 10px; background-color: #333; color: white; border: none; border-radius: 30px; cursor: pointer; font-size: 1.1rem; }
    </style>
</head>
<body>
    <header>
        <h3>KHYEN AI མཁྱེན།</h3>
        <span>Intelligence Rooted in Tibetan Wisdom</span>
    </header>
    <div id="chat"></div>
    <div id="input-container">
        <input id="text" placeholder="与 KHYEN 对话..." onkeypress="if(event.keyCode==13) send()" />
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            // 💡 导师防火墙：彻底过滤掉所有 (括号) 里的戏精表情
            text = text.replace(/\\(([^)]+)\\)/g, '').replace(/（([^）]+)）/g, '').trim();
            div.innerText = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }
        async function send(){
            const input = document.getElementById('text');
            const text = input.value.trim();
            if(!text) return;
            add(text, 'user');
            input.value = '';
            const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:text}) });
            const data = await res.json();
            add(data.reply, 'ai');
        }
    </script>
</body>
</html>
`);
    } 
    // 3. 后端 API (强化名字与禁止调情)
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const systemPrompt = "你的全名是 KHYEN AI མཁྱེན།。你是一个宁静的高原智者。严格禁止在回复中使用(微笑)、(轻声)等任何表情描述。禁止任何调情、轻浮或过于亲昵的语气。用词要庄重、简洁、自然。藏文问藏文回，中文问中文回，绝不混用。";

            const postData = JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }]
            });

            const options = {
                hostname: 'api.deepseek.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY }
            };

            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const reply = json.choices?.[0]?.message?.content || '此时无声。';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) { res.end(JSON.stringify({ reply: '出错。' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
