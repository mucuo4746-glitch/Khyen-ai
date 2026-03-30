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
        header { text-align: center; padding: 15px; background: white; border-bottom: 1px solid #eee; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 15px; border-radius: 15px; max-width: 85%; line-height: 1.6; font-size: 1.05rem; }
        .user { background: #5c4b3a; color: #f1d592; align-self: flex-end; }
        .ai { background: white; color: #333; align-self: flex-start; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        #input-container { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
        textarea { flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 10px; resize: none; }
        button { background: #5c4b3a; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; }
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
        window.onload = () => add("མཁྱེན་ནོ། 欢迎来到 KHYEN。我是您的灵魂向导。", 'ai');
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
            // 💡 暂时还是用 DeepSeek 顶一下，等你换了 Claude API 后我们立刻重写这块
            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。你是一位睿智、温暖的藏族学者。玛旁雍错是圣湖，不是人。不要说废话，不要带特定宏大叙事。";
            const postData = JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }] });
            const options = { hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY } };
            const apiReq = https.request(options, (apiRes) => {
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    try { res.end(JSON.stringify({ reply: JSON.parse(d).choices[0].message.content })); } 
                    catch (e) { res.end(JSON.stringify({ reply: '智慧连接略有波动...' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
