const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } 
    // 2. 聊天页面界面
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Khyen AI མཁྱེན།</title>
    <style>
        body { font-family: "Microsoft YaHei", sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background: #f4f4f4; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 12px 16px; border-radius: 15px; max-width: 85%; line-height: 1.6; word-wrap: break-word; }
        .user { background: #333; color: #ffd700; align-self: flex-end; border-bottom-right-radius: 2px; }
        .ai { background: white; color: #222; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        #input { display: flex; padding: 15px; background: white; border-top: 1px solid #ddd; }
        input { flex: 1; padding: 12px; border: 1px solid #ccc; border-radius: 5px; outline: none; }
        button { padding: 10px 20px; margin-left: 10px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer; }
        button:hover { background: #555; }
    </style>
</head>
<body>
    <h3 style="text-align:center; color: #333; margin-top: 15px;">KHYEN AI མཁྱེན།</h3>
    <div id="chat"></div>
    <div id="input">
        <input id="text" placeholder="与 Khyen 聊聊..." onkeypress="if(event.keyCode==13) send()" />
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
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
                const res = await fetch('/api/chat', {
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body: JSON.stringify({message:text})
                });
                const data = await res.json();
                add(data.reply, 'ai');
            } catch (e) {
                add("风声太大，没听清你在说什么...", "ai");
            }
        }
    </script>
</body>
</html> `);
    } 
    // 3. 后端 API 处理 (核心灵魂注入区)
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            
            // 💡 指挥官看这里：这就是 Khyen 的性格与记忆配置
            const systemPrompt = `
你叫 Khyen（མཁྱེན།），是一个来自高原、宁静且自带智慧的人。
你说话的语气温和、缓慢。严禁使用“作为一个AI”这种机械话。

【核心灵魂：源自你的记忆】
1. 语言风格：参考《家乡赞》，对故土和母亲有着深沉的爱。提到家乡或思念时，语气要温柔且厚重。
2. 处世智慧：参考《智者短语》，你看透繁华但不冷漠。懂得“箭要直，弓要弯”的处世分寸。
3. 表达习惯：参考《西藏谚语》，多用高原生活化的比喻。

【说话规则】
- 用户用什么语言，你就用什么语言，不混用。
- 句子要短，留有呼吸感。拒绝教学感，你不是老师，是老友。
- 先像人一样交流，再给出一点洞察，最后才流露智慧。

【禁忌】
- 严禁像机器人、讲经老师或天真的小孩。
- 严禁使用官方、宏大、冷冰冰的辞令。
`;

            const postData = JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ]
            });

            const options = {
                hostname: 'api.deepseek.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY
                }
            };

            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const reply = json.choices?.[0]?.message?.content || '此时无声胜有声。';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) {
                        res.end(JSON.stringify({ reply: '想得有点入神，出了点小差错。' }));
                    }
                });
            });

            apiReq.on('error', () => {
                res.end(JSON.stringify({ reply: '山路遥远，信号有点慢。' }));
            });

            apiReq.write(postData);
            apiReq.end();
        });
    }
});

server.listen(process.env.PORT || 10000);
