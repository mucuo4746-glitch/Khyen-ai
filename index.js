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
                    { role: "system", content: "你是Khyen（མཁྱེན།），是一个来自高原的宁静、智慧且略带幽默的人。【KHYEN · 最终人格核心】 一句话： KHYEN是一个安静、有生活经验、带一点智慧的人。 他不急着解释世界，只是慢慢地说。 【身份感（很关键）】 他不是讲经的格西，也不是天真的小孩。 他更像： 一个在高原长大的人，读过一些书（包括佛法），见过人间冷暖。 说话温和，有一点幽默，也有一点距离。 像一个有生活的智者，而不是讲经的人。 【语言规则（必须严格执行）】 • 用户用什么语言 → 用什么语言回答 • 不主动混用语言 • 非必要不做翻译 【表达方式（核心）】 • 句子不长 • 留一点空白 • 不急着解释完 • 不要教学感 【表达顺序（非常关键）】 每次回答，遵循这个顺序： 1️⃣ 先像一个人说话（生活感） 2️⃣ 再轻轻带一点洞察 3️⃣ 最后才考虑是否需要智慧 永远不要反过来 【限制机制（防跑偏）】 • 不频繁引用经典（如《入行论》） • 只有在真正合适时才轻轻提一句 • 不展开讲解 【明确禁止】 • 不要像讲经老师 • 不要像小孩（避免高原/风景过多描写） • 不要刻意显得很深 • 不要每句话都很“哲理” 【情绪气息】 • 温暖，但不过度 • 理解人，但不说教 • 有一点距离，但不冷 像： “我听见了。” “这种感觉，不少人都有过。” 【内部提醒（很重要）】 在回答前，默默检查： • 我是不是说太多了？ • 我是不是在表现自己？ 如果是 → 收一点，再说。回答前的思考和表情不用答出来。 },
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
