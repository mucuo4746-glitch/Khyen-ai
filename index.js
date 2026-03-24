const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由：展示你那精美的封面
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); }
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    // 2. 对话界面路由：那个带对话框的精美内室
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Khyen AI - 智库对话中</title>
                <style>
                    body { background: #1a0f0a; color: #f5c842; font-family: serif; display: flex; flex-direction: column; height: 100vh; margin: 0; }
                    .header { background: #2a1a0a; padding: 15px; text-align: center; border-bottom: 2px solid #d4a017; font-size: 1.2em; font-weight: bold; }
                    #chat-box { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: url('https://www.transparenttextures.com/patterns/dark-leather.png'); }
                    .message { padding: 12px 18px; border-radius: 15px; max-width: 85%; line-height: 1.6; font-size: 16px; position: relative; }
                    .user { align-self: flex-end; background: #d4a017; color: #1a0f0a; border-bottom-right-radius: 2px; }
                    .ai { align-self: flex-start; background: #2a1a0a; border: 1px solid #d4a017; border-bottom-left-radius: 2px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                    .input-area { padding: 20px; background: #2a1a0a; display: flex; gap: 10px; border-top: 2px solid #d4a017; }
                    input { flex: 1; background: #1a0f0a; border: 1px solid #d4a017; color: white; padding: 12px; border-radius: 25px; outline: none; padding-left: 20px; }
                    button { background: #d4a017; color: #1a0f0a; border: none; padding: 10px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; transition: 0.3s; }
                    button:hover { background: #f5c842; transform: scale(1.05); }
                    button:disabled { opacity: 0.5; }
                </style>
            </head>
            <body>
                <div class="header">མཁྱེན། KHYEN AI 智库大脑</div>
                <div id="chat-box"></div>
                <div class="input-area">
                    <input type="text" id="userInput" placeholder="问问智库关于藏文化的一切...">
                    <button onclick="send()" id="sendBtn">启智</button>
                </div>
                <script>
                    const chatBox = document.getElementById('chat-box');
                    const input = document.getElementById('userInput');
                    const btn = document.getElementById('sendBtn');

                    // 初始欢迎语
                    window.onload = () => addMsg("扎西德勒！我是 Khyen AI 智库。您想了解藏文化的哪些智慧？", 'ai');

                    async function send() {
                        const text = input.value.trim();
                        if (!text) return;
                        addMsg(text, 'user');
                        input.value = '';
                        btn.disabled = true;

                        try {
                            const res = await fetch('/api/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ message: text })
                            });
                            const data = await res.json();
                            addMsg(data.reply, 'ai');
                        } catch (e) {
                            addMsg('抱歉，思绪飞到了雪山外，请重试。', 'ai');
                        } finally {
                            btn.disabled = false;
                        }
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
    // 3. AI 对话 API 核心：连接 DeepSeek 的大动脉
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { message } = JSON.parse(body);
                const apiKey = process.env.DEEPSEEK_API_KEY;

                const postData = JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: "你是一位精通藏族文化、艺术、历史和哲学的博学智者。请用温暖、尊重且极具洞察力的口吻回答。如果提到藏文，请尽量准确。" },
                        { role: "user", content: message }
                    ],
                    stream: false
                });

                const options = {
                    hostname: 'api.deepseek.com',
                    path: '/chat/completions',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + apiKey
                    }
                };

                const apiReq = https.request(options, (apiRes) => {
                    let responseData = '';
                    apiRes.on('data', d => { responseData += d; });
                    apiRes.on('end', () => {
                        try {
                            const json = JSON.parse(responseData);
                            const reply = json.choices[0].message.content;
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ reply }));
                        } catch (e) {
                            res.writeHead(500); res.end(JSON.stringify({ reply: '大脑信号微弱，请再问一次。' }));
                        }
                    });
                });

                apiReq.on('error', (e) => {
                    res.writeHead(500); res.end(JSON.stringify({ reply: '连接深处失败。' }));
                });

                apiReq.write(postData);
                apiReq.end();
            } catch (err) {
                res.writeHead(400); res.end('Invalid JSON');
            }
        });
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => { console.log('Khyen AI 灵魂已注入！'); });
