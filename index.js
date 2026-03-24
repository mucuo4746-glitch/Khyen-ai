const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); }
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    // 2. 对话界面路由 - 增加语音功能版
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Khyen AI - 智慧对话</title>
                <style>
                    body { background: #fdfdfd; color: #2c3e50; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; height: 100vh; margin: 0; }
                    .header { background: white; padding: 15px; text-align: center; border-bottom: 2px solid #d4a017; font-size: 1.1em; font-weight: bold; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
                    #chat-box { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 20px; background: #f8f9fa; }
                    .message { padding: 14px 20px; border-radius: 18px; max-width: 80%; line-height: 1.6; font-size: 15px; position: relative; box-shadow: 0 3px 10px rgba(0,0,0,0.03); }
                    .user { align-self: flex-end; background: #1a0f0a; color: #f5c842; border-bottom-right-radius: 2px; }
                    .ai { align-self: flex-start; background: white; border: 1px solid #eee; border-left: 4px solid #d4a017; border-bottom-left-radius: 2px; }
                    
                    /* 语音按钮样式 */
                    .speak-btn { 
                        display: block; margin-top: 8px; font-size: 12px; color: #d4a017; cursor: pointer; 
                        border: 1px solid #d4a017; border-radius: 12px; padding: 2px 8px; width: fit-content;
                        transition: 0.3s;
                    }
                    .speak-btn:hover { background: #d4a017; color: white; }

                    .input-area { padding: 15px 25px; background: white; display: flex; gap: 12px; border-top: 1px solid #eee; align-items: center; }
                    input { flex: 1; background: #f8f9fa; border: 1px solid #ddd; color: #333; padding: 12px 20px; border-radius: 25px; outline: none; }
                    button { background: #d4a017; color: white; border: none; padding: 10px 25px; border-radius: 25px; cursor: pointer; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header">མཁྱེན། KHYEN AI 智库空间</div>
                <div id="chat-box"></div>
                <div class="input-area">
                    <input type="text" id="userInput" placeholder="在此开启智慧对谈...">
                    <button onclick="send()" id="sendBtn">问智库</button>
                </div>
                <script>
                    const chatBox = document.getElementById('chat-box');
                    const input = document.getElementById('userInput');
                    const btn = document.getElementById('sendBtn');

                    window.onload = () => addMsg("扎西德勒！我是 Khyen AI 智库。在这片宁静的智慧空间，您想探索什么？", 'ai');

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
                            addMsg('抱歉，信号在雪原间有些延迟，请重试。', 'ai');
                        } finally {
                            btn.disabled = false;
                        }
                    }

                    // 核心语音函数
                    function speak(text) {
                        const msg = new SpeechSynthesisUtterance();
                        msg.text = text;
                        msg.lang = 'zh-CN';
                        msg.rate = 0.9; // 语速稍慢一点，更有智者风范
                        window.speechSynthesis.speak(msg);
                    }

                    function addMsg(text, type) {
                        const div = document.createElement('div');
                        div.className = 'message ' + type;
                        
                        // 文字内容
                        const content = document.createElement('div');
                        content.innerText = text;
                        div.appendChild(content);

                        // 如果是 AI 回复，增加语音播放按钮
                        if(type === 'ai') {
                            const sBtn = document.createElement('div');
                            sBtn.className = 'speak-btn';
                            sBtn.innerText = '🔊 点击倾听智慧';
                            sBtn.onclick = () => speak(text);
                            div.appendChild(sBtn);
                        }

                        chatBox.appendChild(div);
                        chatBox.scrollTop = chatBox.scrollHeight;
                    }
                    input.addEventListener('keypress', e => { if(e.key === 'Enter') send(); });
                </script>
            </body>
            </html>
        `);
    }
    // 3. API 逻辑保持不变
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
                        { role: "system", content: "你是一位精通藏族文化、历史和哲学的现代博学智者。请用温和且通透的语言回答。由于你现在具备语音功能，请注意回答不要过于冗长，方便用户倾听。" },
                        { role: "user", content: message }
                    ]
                });
                const options = {
                    hostname: 'api.deepseek.com',
                    path: '/v1/chat/completions',
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey }
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
                        } catch (e) { res.end(JSON.stringify({ reply: '大脑还在沉思中...' })); }
                    });
                });
                apiReq.write(postData);
                apiReq.end();
            } catch (err) { res.end('Error'); }
        });
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => { console.log('Khyen AI 语音系统已就绪！'); });
