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
                    body { background: var(--bg); color: #333; font-family: "PingFang SC", sans-serif; display: flex; flex-direction: column; height: 100vh; margin: 0; }
                    .header { background: white; padding: 30px 15px 20px; text-align: center; }
                    .header-title { font-size: 1.4em; font-weight: 700; color: var(--dark); letter-spacing: 1px; }
                    #chat-box { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 25px; background: #fdfdfd; position: relative; }
                    #chat-box::before { content: "☸"; position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%); font-size: 280px; color: var(--gold); opacity: 0.03; pointer-events: none; }
                    .message { padding: 16px 22px; border-radius: 20px; max-width: 88%; line-height: 1.8; font-size: 16px; z-index: 1; }
                    .user { align-self: flex-end; background: var(--dark); color: var(--gold); border-bottom-right-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
                    .ai { align-self: flex-start; background: white; color: #333; border-left: 5px solid var(--gold); border-bottom-left-radius: 4px; box-shadow: 0 5px 15px rgba(0,0,0,0.03); }
                    .speak-btn { display: inline-block; margin-top: 10px; font-size: 22px; color: var(--gold); cursor: pointer; opacity: 0.7; }
                    .input-container { padding: 15px 20px 30px; background: white; border-top: 1px solid #f5f5f5; }
                    .input-area { max-width: 600px; margin: 0 auto; display: flex; gap: 12px; }
                    input { flex: 1; background: #f7f7f7; border: 1px solid #eee; padding: 12px 20px; border-radius: 25px; outline: none; font-size: 16px; }
                    button { background: var(--dark); color: var(--gold); border: 1px solid var(--gold); padding: 10px 22px; border-radius: 25px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="header"><div class="header-title">KHYEN AI མཁྱེན།</div></div>
                <div id="chat-box"></div>
                <div class="input-container"><div class="input-area">
                    <input type="text" id="userInput" placeholder="མཁྱེན་རབ།...">
                    <button onclick="send()">问</button>
                </div></div>
                <script>
                    const chatBox = document.getElementById('chat-box');
                    const input = document.getElementById('userInput');

                    // 预加载语音包
                    window.speechSynthesis.getVoices();

                    window.onload = () => addMsg("བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！I am Khyen མཁྱེན།", 'ai');

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
                        } catch (e) { addMsg('...', 'ai'); }
                    }

                    function typeWriter(element, text, i = 0) {
                        if (i < text.length) {
                            element.innerHTML += text.charAt(i);
                            chatBox.scrollTop = chatBox.scrollHeight;
                            setTimeout(() => typeWriter(element, text, i + 1), 40);
                        }
                    }

                    function handleSpeak(text) {
                        window.speechSynthesis.cancel(); // 停止当前所有播放
                        const msg = new SpeechSynthesisUtterance(text);
                        msg.lang = 'zh-CN';
                        msg.rate = 0.8;
                        msg.pitch = 0.9;
                        
                        // 简单的兜底逻辑
                        const voices = window.speechSynthesis.getVoices();
                        for (let v of voices) {
                            // 优先匹配普通话
                            if (v.lang.includes('zh-CN') || v.lang.includes('zh-Hans')) {
                                msg.voice = v;
                                break;
                            }
                        }
                        window.speechSynthesis.speak(msg);
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
                            sBtn.className = 'speak-btn'; sBtn.innerHTML = '🔊';
                            sBtn.onclick = () => handleSpeak(text);
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
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                const { message } = JSON.parse(body);
                const postData = JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: "你是 Khyen (མཁྱེན།)，一位精通藏传佛教智慧的格西。语气温和，多引用《入菩萨行论》。如果用户用藏文提问，请优先用藏文回答。" },
                        { role: "user", content: message }
                    ]
                });
                const options = { hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY } };
                const apiReq = https.request(options, (apiRes) => {
                    let responseData = '';
                    apiRes.on('data', d => { responseData += d; });
                    apiRes.on('end', () => {
                        try {
                            const json = JSON.parse(responseData);
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ reply: json.choices[0].message.content }));
                        } catch (e) { res.end(JSON.stringify({ reply: '...' })); }
                    });
                });
                apiReq.write(postData);
                apiReq.end();
            } catch (err) { res.end('Error'); }
        });
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => { console.log('Khyen 丝滑版就绪'); });
