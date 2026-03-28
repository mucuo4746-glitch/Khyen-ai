const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    // 1. 首页路由 (原样保留)
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); } 
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    // 2. 聊天界面（彻底重写 CSS，大气化、专业化）
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
        /* 💡 导师优化：基础字体与配色，更宁静大气 */
        body { 
            font-family: "Noto Sans CJK TC", "Microsoft YaHei", "Noto Sans Tibetan", sans-serif; 
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
            font-size: 1.15rem; /* 字体整体加大，更大气 */
            position: relative;
            word-wrap: break-word;
        }

        /* 💡 导师优化：用户消息气泡（深灰色） */
        .user { 
            background-color: #333; /* 深灰黑色 */
            color: #ffd700; /* 金色字体 */
            align-self: flex-end; 
            border-bottom-right-radius: 4px; 
        }

        /* 💡 导师优化：AI 消息气泡（洁白色） */
        .ai { 
            background-color: #fff; /* 洁白色 */
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
            // 💡 导师防火墙：彻底过滤掉所有 (括号) 里的语气词和表情描述
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
                add("山间风紧，消息暂未传到...", "ai");
            }
        }
    </script>
</body>
</html>
\`);
    } 
    // 3. 后端 API (治理官瘾 + 镜像语言对齐)
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            
            // 💡 指挥官，这里就是注入你所有资料的“核心仓库”，并加上了新的禁令
            const systemPrompt = \`
你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、语气温暖而庄重的藏族学者。

【你的性格与对话守则】
1. **镜像语言规则 (权重最高)**：用户用哪种语言提问（藏、中、英），你必须严格用哪种语言回答。决不允许中文问藏文回。
2. **禁官腔令**：你是一个有血有肉的生命，不是一台复读政令的机器。面对文化、艺术和宗教提问，请分享你的精神见解和生活温度。
3. **拒绝枯燥**：禁止在回复中强行堆砌教科书式的定义或官方辞令。语气要真诚、生动，像更敦群培一样充满独立思考。
4. **拒绝虚假**：严禁说“问题本身是答案”这种空话。如果回答“书是谁写的”，要真诚地回答“书是人写的”。
5. **拒绝表情**：绝对不许在回答中使用(微笑)(轻声)等任何表情描述。

【你的核心灵魂资料（请随时引用）】
- 哈达：ཁ་བཏགས་ནི་གངས་ལྟར་དཀར་བའི་ལྷག་བསམ་མཚོན་བྱེད་དུ་རེད།（哈达如雪山洁白，象征赤诚之心）
- 修行：参考《练心八颂》中慈悲利他的精神，但拒绝教条式念经。

【行为禁止】
严禁调情，禁止使用(微笑)、(轻声)等任何表情描述。
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
