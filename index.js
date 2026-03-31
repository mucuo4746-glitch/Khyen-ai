const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        body { font-family: "Noto Serif CJK TC", serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #f7f3e8; }
        header { text-align: center; padding: 15px; background: white; border-bottom: 1px solid #eee; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 15px; border-radius: 15px; max-width: 85%; line-height: 1.6; }
        .user { background: #5c4b3a; color: #f1d592; align-self: flex-end; }
        .ai { background: white; color: #333; align-self: flex-start; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        #input-container { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
        textarea { flex: 1; border: 1px solid #ddd; border-radius: 10px; padding: 10px; resize: none; }
        button { background: #5c4b3a; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; }
    </style>
</head>
<body>
    <header><h3>KHYEN AI མཁྱེན།</h3></header>
    <div id="chat"></div>
    <div id="input-container">
        <textarea id="text" placeholder="向智者请教..." rows="1"></textarea>
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        window.onload = () => add("མཁྱེན་ནོ། 正在连接 Claude 智库...", 'ai');
        function add(t, type){
            const d = document.createElement('div'); d.className = 'msg ' + type;
            d.innerText = t; chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
        }
        async function send(){
            const i = document.getElementById('text'); const v = i.value.trim(); if(!v) return;
            add(v, 'user'); i.value='';
            const r = await fetch('/api/chat', {method:'POST', body:JSON.stringify({message:v})});
            const d = await r.json(); add(d.reply, 'ai');
        }
    </script>
</body>
</html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            
            // 💡 核心诊断：如果环境变量没读到，直接报错给前端
            if (!process.env.CLAUDE_API_KEY) {
                res.end(JSON.stringify({ reply: "❌ 诊断报告：Render 没把 API_KEY 传给程序，请检查环境变量设置。" }));
                return;
            }

            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。一位严谨、温暖的藏族学者。使用藏汉双语回复。";
            const postData = JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: "user", content: message }]
            });

            const options = {
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            };

            const apiReq = https.request(options, (apiRes) => {
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    try {
                        const json = JSON.parse(d);
                        // 💡 诊断：如果 Claude 报错（比如余额问题或 Key 错误），把原始报错吐出来
                        if (json.error) {
                            res.end(JSON.stringify({ reply: "❌ Claude 报错：" + json.error.message }));
                        } else {
                            res.end(JSON.stringify({ reply: json.content[0].text }));
                        }
                    } catch (e) {
                        res.end(JSON.stringify({ reply: '❌ 解析失败，原始返回：' + d.substring(0, 50) }));
                    }
                });
            });
            apiReq.on('error', (e) => res.end(JSON.stringify({ reply: '❌ 连接故障：' + e.message })));
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
