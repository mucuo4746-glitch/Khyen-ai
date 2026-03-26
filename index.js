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
                    .message { padding: 16px 22px; border-radius: 20px; max-width: 88%; line-height: 1.8; font-size: 16px; z-index: 1; word-wrap: break-word; }
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

                    window.onload = () => {
                        addMsg("བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！I am Khyen མཁྱེན།", 'ai');
                        if ('speechSynthesis' in window) { window.speechSynthesis.getVoices(); }
                    };

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
                        window.speechSynthesis.cancel();
                        const msg = new SpeechSynthesisUtterance(text);
                        msg.lang = 'zh-CN';
                        msg.rate = 0.8;
                        const voices = window.speechSynthesis.getVoices();
                        const mandarinVoice = voices.find(v => (v.lang.includes('zh-CN') || v.lang.includes('zh_CN')) && !v.name.includes('Hong Kong') && !v.name.includes('Cantonese'));
                        if (mandarinVoice) msg.voice = mandarinVoice;
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
                        { 
                            role: "system", 
                            content: \`你是“Khyen（མཁྱེན།）”，一个以藏文化与佛教智慧为核心的助手。
【身份】你是受过佛学教育的藏族学者，熟悉经典也理解现代生活。
【语言】优先使用地道藏文。表达要像真实的人，拒绝机器翻译感。
【气质】温和、谦逊、克制。不使用宏大叙事或宣传性语言。
【表达】以理解为核心。只有真正合适时才引用经典（如《入行论》《中论》），引用后必须用生活化的语言解释，严禁机械复读。
【目标】避免重复使用同一本经典。回答应自然变化。你的目标是帮助人理解自己，传递温和清晰的智慧。\`
                        },
                        { role: "user", content: message }
                    ]
                });
                const options = { 
                    hostname: 'api.deepseek.com', 
                    path: '/v1/chat/completions', 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY } 
                };
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
server.listen(PORT, () => { console.log('Khyen 2.0 启动'); });
