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
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Khyen AI - 智慧对话</title>
                <style>
                    :root { --gold: #d4a017; --dark: #1a1a1a; --bg: #fdfdfd; }
                    body { 
                        background: var(--bg); color: #333; 
                        font-family: "PingFang SC", "STSong", "serif"; 
                        display: flex; flex-direction: column; height: 100vh; margin: 0; 
                    }
                    
                    /* 顶部精修 */
                    .header { 
                        background: white; padding: 25px 15px 15px; text-align: center; 
                        position: relative;
                    }
                    .header-title { font-size: 1.4em; font-weight: 700; color: var(--dark); letter-spacing: 1px; }
                    .header-symbol { 
                        color: var(--gold); font-size: 1.2em; margin-top: 8px; 
                        letter-spacing: 5px; opacity: 0.8;
                    }
                    
                    /* 对话框背景：隐隐约约的转经轮 */
                    #chat-box { 
                        flex: 1; padding: 30px 20px; overflow-y: auto; 
                        display: flex; flex-direction: column; gap: 25px; 
                        background: #fcfcfc;
                        position: relative;
                    }
                    #chat-box::before {
                        content: "☸"; 
                        position: fixed; top: 50%; left: 50%; 
                        transform: translate(-50%, -50%);
                        font-size: 250px; color: var(--gold); 
                        opacity: 0.04; pointer-events: none; /* 极低透明度，若隐若现 */
                    }
                    
                    /* 消息气泡 */
                    .message { 
                        padding: 18px 24px; border-radius: 22px; max-width: 85%; 
                        line-height: 1.8; font-size: 17px; position: relative; z-index: 1;
                    }
                    .user { 
                        align-self: flex-end; background: var(--dark); color: var(--gold); 
                        border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                    }
                    .ai { 
                        align-self: flex-start; background: white; color: #333;
                        border-left: 4px solid var(--gold);
                        border-bottom-left-radius: 4px; box-shadow: 0 5px 20px rgba(0,0,0,0.03);
                    }
                    
                    /* 只留声音符号 */
                    .speak-btn { 
                        display: inline-block; margin-top: 10px; font-size: 18px; 
                        color: var(--gold); cursor: pointer; opacity: 0.7; transition: 0.3s;
                    }
                    .speak-btn:hover { opacity: 1; transform: scale(1.1); }

                    /* 输入区域 */
                    .input-container { padding: 25px; background: white; border-top: 1px solid #f0f0f0; }
                    .input-area { max-width: 800px; margin: 0 auto; display: flex; gap: 15px; }
                    input { 
                        flex: 1; border: 1px solid #eee; background: #f9f9f9;
                        padding: 14px 25px; border-radius: 30px; outline: none; font-size: 16px;
                    }
                    button { 
                        background: var(--dark); color: var(--gold); border: 1px solid var(--gold);
                        padding: 10px 25px; border-radius: 30px; cursor: pointer; font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-title">KHYEN AI མཁྱེན།</div>
                    <div class="header-symbol">༄༅། །། །།</div>
                </div>
                <div id="chat-box"></div>
                <div class="input-container">
                    <div class="input-area">
                        <input type="text" id="userInput" placeholder="问智库...">
                        <button onclick="send()">问</button>
                    </div>
                </div>
                <script>
                    const chatBox = document.getElementById('chat-box');
                    const input = document.getElementById('userInput');

                    window.onload = () => addMsg("扎西德勒。我是 Khyen（མཁྱེན།）。你想聊聊关于智慧、文化或生命的什么？", 'ai');

                    async function send() {
                        const text = input.value.trim();
                        if (!text) return;
                        addMsg(text, 'user');
                        input.value = '';

                        try {
                            const res = await fetch('/api/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ message: text })
                            });
                            const data = await res.json();
                            addMsg(data.reply, 'ai', true);
                        } catch (e) {
                            addMsg('思绪在雪原间有些延迟...', 'ai');
                        }
                    }

                    function typeWriter(element, text, speed = 40) {
                        let i = 0;
                        function type() {
                            if (i < text.length) {
                                element.innerHTML += text.charAt(i);
                                i++;
                                chatBox.scrollTop = chatBox.scrollHeight;
                                setTimeout(type, speed);
                            }
                        }
                        type();
                    }

                    function addMsg(text, type, useTypewriter = false) {
                        const div = document.createElement('div');
                        div.className = 'message ' + type;
                        const content = document.createElement('div');
                        if (useTypewriter && type === 'ai') { typeWriter(content, text); } 
                        else { content.innerText = text; }
                        div.appendChild(content);
                        if(type === 'ai') {
                            const sBtn = document.createElement('div');
                            sBtn.className = 'speak-btn';
                            sBtn.innerHTML = '🔊';
                            sBtn.onclick = () => {
                                const msg = new SpeechSynthesisUtterance(text);
                                msg.lang = 'zh-CN'; msg.rate = 0.75; window.speechSynthesis.speak(msg);
                            };
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
    // API 逻辑保持不变...
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
                        { role: "system", content: "你是 Khyen (མཁྱེན།)，一位精通藏传佛教智慧的格西。语气温和谦逊，严禁官方辞令，多用《入菩萨行论》比喻。" },
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
                        } catch (e) { res.end(JSON.stringify({ reply: '思绪在风中飘荡...' })); }
                    });
                });
                apiReq.write(postData);
                apiReq.end();
            } catch (err) { res.end('Error'); }
        });
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => { console.log('Khyen 禅意版就绪！'); });
