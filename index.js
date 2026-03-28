const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500); res.end('Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } 
    // 2. 聊天界面（大气字体 + 表情自动过滤）
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
        body { font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #f7f7f7; overflow: hidden; }
        header { text-align: center; padding: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        header h3 { margin: 0; color: #333; font-weight: 600; font-size: 1.5rem; }
        header span { color: #888; font-size: 0.9rem; margin-top: 5px; display: block; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; scroll-behavior: smooth; }
        .msg { margin: 15px 0; padding: 15px 20px; border-radius: 20px; max-width: 85%; line-height: 1.7; font-size: 1.15rem; position: relative; word-wrap: break-word; }
        .user { background-color: #333; color: #ffd700; align-self: flex-end; border-bottom-right-radius: 4px; }
        .ai { background-color: #fff; color: #222; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        #input-container { display: flex; padding: 15px 20px; background-color: #fff; border-top: 1px solid #eaeaea; }
        input { flex: 1; padding: 15px 20px; border: 1px solid #ddd; border-radius: 30px; outline: none; font-size: 1.1rem; }
        button { padding: 12px 28px; margin-left: 10px; background-color: #333; color: white; border: none; border-radius: 30px; cursor: pointer; font-size: 1.1rem; }
    </style>
</head>
<body>
    <header>
        <h3>KHYEN AI མཁྱེན།</h3>
        <span>Intelligence Rooted in Tibetan Wisdom</span>
    </header>
    <div id="chat"></div>
    <div id="input-container">
        <input id="text" placeholder="与 KHYEN 对话..." onkeypress="if(event.keyCode==13) send()" />
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            // 💡 导师防火墙：彻底过滤掉所有 (括号) 里的语气词和表情
            text = text.replace(/\\(([^)]+)\\)/g, '').replace(/（([^）]+)）/g, '').trim();
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
                add("山间风紧，消息暂未传到...", "ai");
            }
        }
    </script>
</body>
</html>
`);
    } 
    // 3. 后端逻辑（融合博学学者人设 + 三语精通 + 核心资料）
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            
            // 💡 指挥官，这是咱们切磋出的“终极灵魂指令”
            const systemPrompt = \`
你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、语气温暖而庄重的藏族学者。

【核心人设与守则】
1. 语言大师：你精通藏文、中文、英文三语。用户用哪种语言提问就用哪种语言回答。遇到重要概念，可以三语并列显示。严禁说自己不懂某种语言。
2. 智慧学者：回答要有深度。遇到生活文化问题要生动自然；遇到哲学、宗教问题要展现洞察。不要过于幼稚。
3. 拒绝教条：饮食、节日、日常文化问题请用专业知识回答，禁止强行引用经论。只有在专门讨论修行、哲学时才引用经典。
4. 真实诚恳：严禁说“问题本身是答案”这种空话。如果回答“书是谁写的”，要像人一样回答“书是人写的”。

【核心资料（你的记忆库）】
- 哈达：ཁ་བཏགས་ནི་གངས་ལྟར་དཀར་བའི་ལྷག་བསམ་མཚོན་བྱེད་དུ་རེད།（哈达如雪山洁白，象征赤诚之心）
- 世间：བལྟས་ན་སྐྱིད་སྐྱིད་འདྲ་བའི་འཇིག་རྟེན་གྱི་ཕུན་ཚོགས།།（看似充满幸福的世间万物，闻来各有自身的千愁万绪）
- 情感：参考《思念宗喀巴》中母子连心的深情，语气要厚重感人。
- 修行：参考《练心八颂》“视众生胜过如意宝”，但仅在相关时引用。

【行为禁止】
- 严禁调情，禁止使用(微笑)、(轻声)等任何表情描述。
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
                        const reply = json.choices?.[0]?.message?.content || '此时无声，心神合一。';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) { res.end(JSON.stringify({ reply: '出了点小错。' })); }
                });
            });

            apiReq.on('error', () => {
                res.end(JSON.stringify({ reply: '连接有点慢。' }));
            });

            apiReq.write(postData);
            apiReq.end();
        });
    }
});

server.listen(process.env.PORT || 10000);
