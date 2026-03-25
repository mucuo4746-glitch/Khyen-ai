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
                        font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif; 
                        display: flex; flex-direction: column; height: 100vh; margin: 0; 
                    }
                    /* 顶部美化 */
                    .header { 
                        background: white; padding: 20px; text-align: center; 
                        border-bottom: 1px solid rgba(212,160,23,0.3); 
                        letter-spacing: 2px; position: relative;
                    }
                    .header::after { 
                        content: ""; position: absolute; bottom: -1px; left: 25%; width: 50%; height: 2px; background: var(--gold); 
                    }
                    .header-title { font-size: 1.2em; font-weight: 600; color: var(--dark); }
                    
                    #chat-box { 
                        flex: 1; padding: 30px 20px; overflow-y: auto; 
                        display: flex; flex-direction: column; gap: 25px; 
                        background-image: radial-gradient(rgba(212,160,23,0.05) 1px, transparent 0);
                        background-size: 40px 40px;
                    }
                    
                    /* 消息气泡美化 */
                    .message { 
                        padding: 16px 22px; border-radius: 20px; max-width: 85%; 
                        line-height: 1.8; font-size: 16px; position: relative;
                        transition: all 0.3s ease;
                    }
                    .user { 
                        align-self: flex-end; background: var(--dark); color: var(--gold); 
                        border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                        font-weight: 400;
                    }
                    .ai { 
                        align-self: flex-start; background: white; color: #444;
                        border: 1px solid #eee; border-left: 5px solid var(--gold);
                        border-bottom-left-radius: 4px; box-shadow: 0 5px 20px rgba(0,0,0,0.03);
                    }
                    
                    .speak-btn { 
                        display: inline-block; margin-top: 12px; font-size: 12px; color: var(--gold); 
                        cursor: pointer; border: 1px solid var(--gold); border-radius: 20px; 
                        padding: 3px 12px; transition: 0.3s;
                    }
                    .speak-btn:hover { background: var(--gold); color: white; }

                    /* 输入区域美化 */
                    .input-container { padding: 20px 30px; background: white; border-top: 1px solid #eee; }
                    .input-area { 
                        max-width: 800px; margin: 0 auto; display: flex; gap: 15px; align-items: center; 
                    }
                    input { 
                        flex: 1; background: #f9f9f9; border: 1px solid #e0e0e0; 
                        padding: 14px 25px; border-radius: 30px; outline: none; font-size: 15px;
                        transition: 0.3s;
                    }
                    input:focus { border-color: var(--gold); background: white; box-shadow: 0 0 10px rgba(212,160,23,0.1); }
                    button { 
                        background: var(--dark); color: var(--gold); border: 1px solid var(--gold);
                        padding: 12px 28px; border-radius: 30px; cursor: pointer; 
                        font-weight: bold; transition: 0.3s;
                    }
                    button:hover { background: var(--gold); color: white; transform: translateY(-2px); }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-title">མཁྱེན། KHYEN AI 智库空间</div>
                </div>
                <div id="chat-box"></div>
                <div class="input-container">
                    <div class="input-area">
                        <input type="text" id="userInput" placeholder="在此开启智慧对谈...">
                        <button onclick="send()" id="sendBtn">问智库</button>
                    </div>
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
                            addMsg(data.reply, 'ai', true); // 开启打字机效果
                        } catch (e) {
                            addMsg('抱歉，思绪稍有阻碍，请重试。', 'ai');
                        } finally {
                            btn.disabled = false;
                        }
                    }

                    function speak(text) {
                        const msg = new SpeechSynthesisUtterance();
                        msg.text = text; msg.lang = 'zh-CN'; msg.rate = 0.75; msg.pitch = 0.9;
                        window.speechSynthesis.speak(msg);
                    }

                    // 打字机效果核心代码
                    function typeWriter(element, text, speed = 50) {
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
                        
                        if (useTypewriter && type === 'ai') {
                            typeWriter(content, text);
                        } else {
                            content.innerText = text;
                        }
                        
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
    // 3. API 逻辑 (保持灵魂提示词)
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
                            content: "你是 Khyen (མཁྱེན།)，一位精通藏传佛教智慧的格西。1. 气质：温和谦逊。2. 禁忌：禁止官方辞令和宏大叙事。3. 风格：多用《入菩萨行论》中的比喻（如暇满人身、暗夜闪电）。你的目标是传递智慧而非机械回答。语言要透彻、有留白。" 
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
                        } catch (e) { res.end(JSON.stringify({ reply: '思绪在风中飘荡，请再试一次。' })); }
                    });
                });
                apiReq.write(postData);
                apiReq.end();
            } catch (err) { res.end('Error'); }
        });
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => { console.log('Khyen 极美版上线！'); });
