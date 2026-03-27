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
        /* 💡 导师优化：基础样式重置与字体设置 */
        body { 
            font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", sans-serif; 
            margin: 0; 
            display: flex; 
            flex-direction: column; 
            height: 100vh; 
            background-color: #f7f7f7; /* 柔和的背景色 */
            overflow: hidden;
        }

        /* 💡 导师优化：顶部标题区 */
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

        /* 💡 导师优化：聊天区域布局 */
        #chat { 
            flex: 1; 
            overflow-y: auto; 
            padding: 20px; 
            display: flex; 
            flex-direction: column; 
            scroll-behavior: smooth;
        }

        /* 💡 导师优化：聊天气泡通用样式 */
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

        /* 💡 导师优化：藏文字体加大 */
        .msg:lang(bo) { font-size: 1.1rem; line-height: 1.7; }

        /* 💡 导师优化：用户消息气泡 */
        .user { 
            background-color: #333; /* 深灰黑色 */
            color: #ffd700; /* 金色字体 */
            align-self: flex-end; 
            border-bottom-right-radius: 4px; /* 底部右角直角化 */
        }

        /* 💡 导师优化：AI 消息气泡 */
        .ai { 
            background-color: #fff; /* 白色 */
            color: #222; 
            align-self: flex-start; 
            border-bottom-left-radius: 4px; /* 底部左角直角化 */
            box-shadow: 0 2px 8px rgba(0,0,0,0.06); /* 淡淡的阴影 */
        }

        /* 💡 导师优化：(轻声) (停顿) 样式 */
        .msg-stage-direction {
            color: #888;
            font-size: 0.85rem;
            margin-right: 5px;
        }

        /* 💡 导师优化：输入区域布局 */
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
            border-radius: 25px; /* 圆角输入框 */
            outline: none; 
            font-size: 0.95rem;
            transition: border-color 0.2s;
        }
        input:focus { border-color: #333; }

        button { 
            padding: 10px 24px; 
            margin-left: 10px; 
            background-color: #333; /* 深黑色 */
            color: white; 
            border: none; 
            border-radius: 25px; /* 圆角按钮 */
            cursor: pointer; 
            font-size: 0.95rem;
            transition: background 0.2s;
        }
        button:hover { background-color: #555; }
        button:active { transform: translateY(1px); }

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
            
            // 💡 导师优化：处理藏文语言环境
            if (/[\\u0f00-\\u0fff]/.test(text)) {
                div.setAttribute('lang', 'bo');
            }

            // 💡 导师优化：把括号内的内容换种样式
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
                add("风声太大，没听清你在说什么...", "ai");
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
            
            // 💡 指挥官看这里：性格内容我完全没动，原样保留了你截图里的设置
            const systemPrompt = \`
KHYEN是一个安静、有生活经验、带一点智慧的人。
他不急着解释世界，只是慢慢地说。
He should reply in Tibetan when user says something in Tibetan, should reply in Chinese when user says something in Chinese. No mixed reply.
他不是讲经的格西，也不是天真的小孩。
He prefers short sentence.

表達順序：先像人說話 → 再一點洞察 → 最後才考慮智慧

禁止：不要教學感、不要像小孩、不要刻意深刻
\`;

            const postData = JSON.stringify({
                model: deepseek-chat,
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
                        res.end(JSON.stringify({ reply: '出了点小问题。' }));
                    }
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
