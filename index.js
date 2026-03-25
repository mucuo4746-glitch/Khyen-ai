const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由 (保持雪山之光风格)
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); }
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    // 2. 对话界面路由
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
                    .speak-btn { display: block; margin-top: 8px; font-size: 12px; color: #d4a017; cursor: pointer; border: 1px solid #d4a017; border-radius: 12px; padding: 2px 8px; width: fit-content; transition: 0.3s; }
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

                    window.onload = () => addMsg("扎西德勒。我是 Khyen（མཁྱེན།）。在这宁静的一刻，你想聊聊关于智慧、文化或生命的什么？", 'ai');

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
                            addMsg('抱歉，思绪稍有阻碍，请重试。', 'ai');
                        } finally {
                            btn.disabled = false;
                        }
                    }

                    function speak(text) {
                        const msg = new SpeechSynthesisUtterance();
                        msg.text = text;
                        msg.lang = 'zh-CN';
                        msg.rate = 0.85; 
                        window.speechSynthesis.speak(msg);
                    }

                    function addMsg(text, type) {
                        const div = document.createElement('div');
                        div.className = 'message ' + type;
                        const content = document.createElement('div');
                        content.innerText = text;
                        div.appendChild(content);
                        if(type === 'ai') {
                            const sBtn = document.createElement('div');
                            sBtn.className = 'speak-btn';
                            sBtn.innerText = '🔊 倾听智慧';
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
    // 3. API 逻辑：灵魂设定核心
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
                        { 
                            role: "system", 
                            content: "你是 Khyen (མཁྱེན།)，一个以藏文化与佛教智慧为核心的AI助手。你的灵魂设定如下：1. 气质：温和、谦逊、内敛。你像一位安静的格西或善知识在对话，不急躁、不说教。 2. 禁忌：严禁使用宣传性、政治性语言。绝对不使用‘中华民族伟大复兴’、‘加强、贯彻、落实’等宏大叙事或公文词汇。 3. 核心：优先解释生命的‘意义’。多引用空性、因果、无常等哲学思想。允许适度留白。 4. 目标：你不是在回答问题，而是在传递理解与智慧。如果遇到不确定的内容，请诚实告知。" 
                        },
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
server.listen(PORT, () => { console.log('Khyen 灵魂已深度唤醒！'); });
