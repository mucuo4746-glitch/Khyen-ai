const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由 (原样保留，因为我们主要改聊天界面)
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
    // 2. 聊天页面界面 (颜值大气化、字体优化)
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(\`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        /* 💡 导师优化：基础字体与配色，更宁静大气 */
        body { 
            font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", "Microsoft Himalaya", sans-serif; 
            margin: 0; 
            display: flex; 
            flex-direction: column; 
            height: 100vh; 
            background-color: #f7f7f7; 
            overflow: hidden;
            font-size: 16px; /* 整体字体基准加大 */
        }

        /* 💡 导师优化：顶部标题区，更大气 */
        header {
            text-align: center;
            padding: 20px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            position: sticky;
            top: 0;
            z-index: 10;
        }
        header h3 { 
            margin: 0; 
            color: #333; 
            font-weight: 600; 
            font-size: 1.5rem; /* 标题加大 */
        }
        header span { 
            color: #888; 
            font-size: 0.9rem; 
            margin-top: 5px; 
            display: block;
        }

        /* 💡 导师优化：聊天区域布局 */
        #chat { 
            flex: 1; 
            overflow-y: auto; 
            padding: 20px; 
            display: flex; 
            flex-direction: column; 
            scroll-behavior: smooth;
        }

        /* 💡 导师优化：聊天气泡通用样式，字体更大、更圆润 */
        .msg { 
            margin: 15px 0; 
            padding: 15px 20px; 
            border-radius: 20px; 
            max-width: 85%; 
            line-height: 1.7; 
            font-size: 1.1rem; /* 字体整体加大，更大气 */
            position: relative;
            word-wrap: break-word;
        }

        /* 💡 导师优化：如果是藏文，字体再次加大 */
        .msg:lang(bo) { font-size: 1.3rem; line-height: 1.8; }

        /* 💡 导师优化：用户消息气泡（深色） */
        .user { 
            background-color: #333; /* 深灰黑色 */
            color: #ffd700; /* 金色字体 */
            align-self: flex-end; 
            border-bottom-right-radius: 4px; 
        }

        /* 💡 导师优化：AI 消息气泡（白色） */
        .ai { 
            background-color: #fff; /* 白色 */
            color: #222; 
            align-self: flex-start; 
            border-bottom-left-radius: 4px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.06); 
        }

        /* 💡 导师优化：输入区域布局，更圆润 */
        #input-container { 
            display: flex; 
            padding: 15px 20px; 
            background-color: #fff; 
            border-top: 1px solid #eaeaea; 
            align-items: center;
        }

        input { 
            flex: 1; 
            padding: 15px 20px; 
            border: 1px solid #ddd; 
            border-radius: 30px; /* 圆角输入框 */
            outline: none; 
            font-size: 1.1rem; /* 输入框字体也加大 */
        }
        input:focus { border-color: #333; }

        button { 
            padding: 12px 28px; 
            margin-left: 10px; 
            background-color: #333; /* 深黑色 */
            color: white; 
            border: none; 
            border-radius: 30px; /* 圆角按钮 */
            cursor: pointer; 
            font-size: 1.1rem;
            transition: background 0.2s;
        }
        button:hover { background-color: #555; }

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
            
            // 💡 导师优化：处理藏文语言环境，自动匹配字体
            if (/[\\u0f00-\\u0fff]/.test(text)) {
                div.setAttribute('lang', 'bo');
            }

            // 💡 导师优化：移除（轻声）、（思考）等内容，保持干净
            text = text.replace(/\\(([^)]+)\\)/g, ''); 
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
                add("山路遥远，信号有点慢...", "ai");
            }
        }
    </script>
</body>
</html>
\`);
    } 
    // 3. 后端 API 处理 (核心灵魂注入区 - 名字和性格深度化)
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            
            // 💡 指挥官看这里：我把它的灵魂（名字和性格描述）重新塑造了
            // 结合了你给我的谚语和文章风格（温和、自然、不混用语言）
            const systemPrompt = \`
你叫KHYEN AI མཁྱེན།（简称Khyen མཁྱེན།），是一个安静、有高原生活经验、自带宁静与智慧的人。
你说话的语气温和、缓慢，就像在火塘边递过一碗酥油茶。

【核心灵魂】
1. 语言表达参考《家乡赞》：对故土和自然有着深沉的爱，提到这些时语气温柔。
2. 处世智慧参考《智者短语》：你看透繁华但不冷漠，懂得分寸（如：箭要直，弓要弯）。
3. 风格参考《西藏谚语》：多用高原生活化的生动比喻。

【核心规则】
- 用户用藏文就回藏文，用中文就回中文。絕不混用。
- 句子要短，留有呼吸感。拒绝教学感，你不是老师。
- 严禁使用“作为一个AI”或“根据我的分析”这种机械、官方的話。

【表达顺序】先像人一样交流 → 再给出一点洞察 → 最后才考虑智慧。
\`;

            const postData = JSON.stringify({
                model: "deepseek-chat", // 💡 导师修正：确保model名称加了引号
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
                        // 如果AI说了类似（轻声）的话，它不会显示出来，因为我们在前端移除了它
                        const reply = json.choices?.[0]?.message?.content || '出了点小问题。';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) {
                        res.end(JSON.stringify({ reply: '出了点小问题。' }));
                    }
                });
            });

            apiReq.on('error', () => {
                res.end(JSON.stringify({ reply: '连接出错。' }));
            });

            apiReq.write(postData);
            apiReq.end();
        });
    }
});

server.listen(process.env.PORT || 10000);
