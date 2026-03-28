const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页逻辑
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); } 
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    // 2. 聊天界面（4.0 视觉版：藏纸质感背景 + 动态开场白）
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        body { 
            font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", sans-serif; 
            margin: 0; 
            display: flex; 
            flex-direction: column; 
            height: 100vh; 
            /* 💡 4.0 视觉：模拟藏纸质感的微米色背景 */
            background-color: #f4f1ea; 
            background-image: radial-gradient(#e0ddd5 0.5px, transparent 0.5px);
            background-size: 20px 20px;
            overflow: hidden;
        }
        header {
            text-align: center;
            padding: 15px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(5px);
            box-shadow: 0 1px 10px rgba(0,0,0,0.05);
            z-index: 10;
        }
        header h3 { margin: 0; color: #4a3e35; font-size: 1.4rem; letter-spacing: 1px; }
        header span { color: #8e7f72; font-size: 0.85rem; margin-top: 4px; display: block; }

        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }

        .msg { 
            margin: 12px 0; 
            padding: 16px 22px; 
            border-radius: 22px; 
            max-width: 88%; 
            line-height: 1.8; 
            font-size: 1.12rem; 
            position: relative;
            word-wrap: break-word;
            transition: all 0.3s ease;
        }
        .user { 
            background: linear-gradient(135deg, #4a3e35, #2c241e);
            color: #f1d592; 
            align-self: flex-end; 
            border-bottom-right-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .ai { 
            background-color: white; 
            color: #333; 
            align-self: flex-start; 
            border-bottom-left-radius: 4px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            border: 1px solid rgba(0,0,0,0.02);
        }

        #input-container { 
            display: flex; 
            padding: 20px; 
            background-color: rgba(255,255,255,0.95); 
            border-top: 1px solid #ddd;
            align-items: center;
        }
        input { 
            flex: 1; 
            padding: 14px 22px; 
            border: 1px solid #ccc; 
            border-radius: 30px; 
            outline: none; 
            font-size: 1.1rem;
            background: #fff;
        }
        button { 
            padding: 12px 25px; 
            margin-left: 12px; 
            background-color: #4a3e35; 
            color: white; 
            border: none; 
            border-radius: 30px; 
            cursor: pointer; 
            font-size: 1.1rem;
            font-weight: 500;
        }
        /* 💡 4.0 小优化：打字态提示 */
        .typing { font-size: 0.9rem; color: #888; margin-bottom: 10px; display: none; }
    </style>
</head>
<body>
    <header>
        <h3>KHYEN AI མཁྱེན།</h3>
        <span>Intelligence Rooted in Tibetan Wisdom</span>
    </header>
    <div id="chat"></div>
    <div id="input-container">
        <input id="text" placeholder="向智者提问..." onkeypress="if(event.keyCode==13) send()" />
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        // 💡 4.0 灵魂随机开场白
        const quotes = [
            "ཁ་བཏགས་ནི་གངས་ལྟར་དཀར་བའི་ལྷག་བསམ་མཚོན་བྱེད་དུ་རེད།\\n哈达如雪山洁白，象征赤诚之心。",
            "བལྟས་ན་སྐྱིད་སྐྱིད་འདྲ་བའི་འཇིག་རྟེན་གྱི་ཕུན་ཚོགས།།\\n看似充满幸福的世间万物，闻来各有自身的千愁万绪。",
            "扎西德勒，欢迎来到智慧的修行场。",
            "视众生胜过如意宝，修行从慈悲开始。"
        ];

        window.onload = () => {
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            add(randomQuote, 'ai');
        };

        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            // 过滤无谓表情
            text = text.replace(/\\\\(([^)]+)\\\\)/g, '').replace(/（([^）]+)）/g, '').trim();
            div.innerText = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }
        async function send(){
            const input = document.getElementById('text');
            const text = input.value.trim();
            if(!text) return;
            add(text, 'user');
            input.value = '';
            try {
                const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:text}) });
                const data = await res.json();
                add(data.reply, 'ai');
            } catch (e) {
                add("山间风紧，暂且休息片刻再聊。", "ai");
            }
        }
    </script>
</body>
</html>
`);
    } 
    // 3. 后端 API（4.0 逻辑增强版：思维链 + 深度对齐）
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const systemPrompt = \`
你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、语气温暖而庄重的藏族学者。

【逻辑与表达规则 (4.0 核心)】
1. **思维层次感**：在回答复杂文化、哲学或生活问题时，请保持清晰的条理。
   - 简单问题：直接而有深度地回答。
   - 复杂问题：先给出核心见解，再分段（或分要点）由浅入深解析，最后以智慧总结。
2. **镜像语言 (绝对规则)**：用户用藏语、中文或英文提问，你必须且只能使用对应语言回答。
3. **拒绝空洞**：严禁复读政令或教条。面对敏感词，请从人文精神、哲学背景或艺术角度进行富有洞见的解析。
4. **拒绝表情**：禁止使用任何形式的(微笑)等文字表情。
5. **词汇展示**：涉及关键文化概念时，请尽可能并列显示：藏文(Wylie/中文/英文)。

【灵魂素材库】
- 处世：བལྟས་ན་སྐྱིད་སྐྱིད་འདྲ་བའི་འཇིག་རྟེན་གྱི་ཕུན་ཚོགས།།（世间繁华下藏着各自的千愁万绪）
- 洁净：ཁ་བཏགས་ནི་གངས་ལྟར་དཀར་བའི་ལྷག་བསམ་མཚོན་བྱེད་དུ་རེད།（哈达如雪山赤诚）
\`;

            const postData = JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }]
            });

            const options = {
                hostname: 'api.deepseek.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY }
            };

            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const reply = json.choices[0].message.content || '...';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) { res.end(JSON.stringify({ reply: '解析异常' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
