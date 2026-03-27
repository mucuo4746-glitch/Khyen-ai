const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 首页
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
    // 聊天页面
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Khyen AI མཁྱེན།</title>
    <style>
        body { 
            font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", sans-serif; 
            margin: 0; 
            display: flex; 
            flex-direction: column; 
            height: 100vh; 
            background-color: #f7f7f7; 
            overflow: hidden;
        }
        header {
            text-align: center;
            padding: 15px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 10;
        }
        header h3 { margin: 0; color: #333; font-weight: 500; }
        header span { color: #888; font-size: 0.8rem; }
        #chat { 
            flex: 1; 
            overflow-y: auto; 
            padding: 20px; 
            display: flex; 
            flex-direction: column; 
            scroll-behavior: smooth;
        }
        .msg { 
            margin: 12px 0; 
            padding: 12px 18px; 
            border-radius: 18px; 
            max-width: 85%; 
            line-height: 1.6; 
            font-size: 0.95rem;
            position: relative;
            word-wrap: break-word;
        }
        .user { 
            background-color: #333; 
            color: #ffd700; 
            align-self: flex-end; 
            border-bottom-right-radius: 4px; 
        }
        .ai { 
            background-color: #fff; 
            color: #222; 
            align-self: flex-start; 
            border-bottom-left-radius: 4px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.06); 
        }
        .msg-stage-direction {
            color: #888;
            font-size: 0.85rem;
            margin-right: 5px;
        }
        #input-container { 
            display: flex; 
            padding: 15px; 
            background-color: #fff; 
            border-top: 1px solid #eaeaea; 
            align-items: center;
        }
        input { 
            flex: 1; 
            padding: 12px 18px; 
            border: 1px solid #ddd; 
            border-radius: 25px; 
            outline: none; 
            font-size: 0.95rem;
        }
        button { 
            padding: 10px 24px; 
            margin-left: 10px; 
            background-color: #333; 
            color: white; 
            border: none; 
            border-radius: 25px; 
            cursor: pointer; 
        }
    </style>
</head>
<body>
    <header>
        <h3>KHYEN AI མཁྱེན།</h3>
        <span>与高原的宁静对谈</span>
    </header>
    <div id="chat"></div>
    <div id="input-container">
        <input id="text" placeholder="说点什么..." onkeypress="if(event.keyCode==13) send()" />
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            text = text.replace(/\\(([^)]+)\\)/g, '<span class="msg-stage-direction">($1)</span>');
            div.innerHTML = text;
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
                add("风声太大，没听清...", "ai");
            }
        }
    </script>
</body>
</html>
`);
    } 
    // API
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const systemPrompt = "KHYEN是一个安静、有生活经验的人。他不急着解释世界，只是慢慢地说。用户用藏文就回藏文，用中文就回中文。不要教学感，句子要短。";

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
                        const reply = json.choices?.[0]?.message?.content || '出了点小问题。';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) {
                        res.end(JSON.stringify({ reply: '解析出错。' }));
                    }
                });
            });

            apiReq.on('error', () => {
                res.end(JSON.stringify({ reply: '连接失败。' }));
            });

            apiReq.write(postData);
            apiReq.end();
        });
    }
});

server.listen(process.env.PORT || 10000);
