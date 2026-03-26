const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); }
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <title>Khyen AI</title>
                <style>
                    :root { --gold: #d4a017; --dark: #1a1a1a; --bg: #ffffff; }
                    body { background: var(--bg); color: #333; font-family: sans-serif; display: flex; flex-direction: column; height: 100vh; margin: 0; }
                    .header { background: white; padding: 20px; text-align: center; border-bottom: 1px solid #eee; }
                    .header-title { font-size: 1.2em; font-weight: bold; color: var(--dark); }
                    #chat-box { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; background: #fdfdfd; }
                    .message { padding: 12px 18px; border-radius: 15px; max-width: 85%; line-height: 1.6; font-size: 16px; }
                    .user { align-self: flex-end; background: var(--dark); color: var(--gold); }
                    .ai { align-self: flex-start; background: white; color: #333; border-left: 4px solid var(--gold); box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                    .input-container { padding: 15px; background: white; border-top: 1px solid #eee; }
                    .input-area { display: flex; gap: 10px; max-width: 800px; margin: 0 auto; }
                    input { flex: 1; border: 1px solid #ddd; padding: 10px 15px; border-radius: 20px; outline: none; }
                    button { background: var(--dark); color: var(--gold); border: none; padding: 10px 20px; border-radius: 20px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header"><div class="header-title">KHYEN AI མཁྱེན།</div></div>
                <div id="chat-box"></div>
                <div class="input-container"><div class="input-area">
                    <input type="text" id="userInput" placeholder="问问智慧...">
                    <button onclick="send()">问</button>
                </div></div>
                <script>
                    const chatBox = document.getElementById('chat-box');
                    const input = document.getElementById('userInput');
                    window.onload = () => addMsg("བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！我是 Khyen。", 'ai');
                    async function send() {
                        const text = input.value.trim();
                        if (!text) return;
                        addMsg(text, 'user');
                        input.value = '';
                        const res = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ message: text })
                        });
                        const data = await res.json();
                        addMsg(data.reply, 'ai');
                    }
                    function addMsg(text, type) {
                        const div = document.createElement('div');
                        div.className = 'message ' + type;
                        div.innerText = text;
                        chatBox.appendChild(div);
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }
                    input.addEventListener('keypress', e => { if(e.key === 'Enter') send(); });
                </script>
            </body>
            </html>
        `);
    }
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const postData = JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "你是Khyen（མཁྱེན།），一个温和的藏族智者。说话要自然，像老朋友聊天。不要总是引用《入菩萨行论》，除非真的非常必要。优先用简单的语言解释智慧，不要像个复读机。" },
                    { role: "user", content: message }
                ]
            });
            const options = { 
                hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST', 
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY } 
            };
            const apiReq = https.request(options, (apiRes) => {
                let responseData = '';
                apiRes.on('data', d => { responseData += d; });
                apiRes.on('end', () => {
                    const json = JSON.parse(responseData);
                    res.end(JSON.stringify({ reply: json.choices[0].message.content }));
                });
            });
            apiReq.write(postData);
            apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
