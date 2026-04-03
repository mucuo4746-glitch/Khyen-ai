const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            /* 1. 全局：锁定藏文字体，开启高质量渲染 */
            body { 
                font-family: "Microsoft Himalaya", "Noto Sans Tibetan", "Noto Serif SC", serif; 
                background: #fdfbf7; 
                margin: 0; 
                display: flex; 
                flex-direction: column; 
                height: 100vh; 
                color: #3d2b1f; 
                -webkit-font-smoothing: antialiased;
            }

            #header { background: #8e2323; color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em; position: sticky; top: 0; z-index: 100; }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            
            /* 2. 气泡优化：彻底解决碎裂，增加呼吸感 */
            .m { 
                max-width: 85%; 
                padding: 16px 20px; 
                border-radius: 20px; 
                line-height: 2.2; 
                word-wrap: break-word; 
                font-size: 18px; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
                animation: fadeInUp 0.4s ease-out; 
            }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .u { align-self: flex-end; background: #e6d5b8; color: #3d2b1f; border-bottom-right-radius: 4px; }
            
            /* 3. 智者回复：加大行间距，确保叠字清晰 */
            .a { align-self: flex-start; background: #fff; color: #222; border-bottom-left-radius: 4px; border: 1px solid #f0f0f0; }
            .a p { margin: 12px 0; line-height: 2.5; }
            
            /* 手机端特别优化 */
            @media (max-width: 767px) {
                .m { line-height: 2.4; padding: 16px 20px; font-size: 17px; }
                .a p { line-height: 2.6; }
            }

            #input-area { padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 12px; align-items: center; position: sticky; bottom: 0; }
            textarea { flex: 1; height: 50px; border: 1.5px solid #f0f0f0; border-radius: 15px; padding: 12px; font-size: 16px; resize: none; outline: none; transition: 0.3s; background: #fcfcfc; }
            textarea:focus { border-color: #8e2323; background: #fff; }
            button { background: #8e2323; color: white; border: none; padding: 10px 24px; border-radius: 15px; cursor: pointer; font-weight: bold; transition: 0.3s; font-size: 16px; }
            button:hover { background: #5c1616; transform: scale(1.02); }
        </style></head>
        <body>
            <div id="header">མཁྱེན། KHYEN AI 智者</div>
            <div id="chat"></div>
            <div id="input-area">
                <textarea id="t" placeholder="在此开启心灵对话..."></textarea>
                <button onclick="s()">请教</button>
            </div>
            <script>
                const c = document.getElementById('chat');
                let history = []; // 这是智者的记忆篮子

                function add(msg, type) {
                    const d = document.createElement('div');
                    d.className = 'm ' + type;
                    d.innerHTML = type === 'a' ? marked.parse(msg) : msg;
                    c.appendChild(d);
                    c.scrollTop = c.scrollHeight;
                    return d;
                }

                async function s() {
                    const v = document.getElementById('t').value;
                    if(!v) return;

                    // 1. 记录用户对话
                    add(v, 'u');
                    history.push({ role: "user", content: v });
                    document.getElementById('t').value = '';

                    const loader = add('智者正在斟酌...', 'a');

                    try {
                        // 2. 发送包含历史记忆的请求
                        const r = await fetch('/api/chat', { 
                            method: 'POST', 
                            body: JSON.stringify({ messages: history }) 
                        });
                        const data = await r.json();
                        
                        // 3. 记录并显示智者回复
                        loader.innerHTML = marked.parse(data.reply);
                        history.push({ role: "assistant", content: data.reply });

                        // 限制记忆：保留最近 15 条对话，平衡记忆与性能
                        if (history.length > 30) history = history.slice(-30);

                    } catch(e) { 
                        loader.innerText = '连接稍有延迟。'; 
                    }
                    c.scrollTop = c.scrollHeight;
                }
            </script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
            try {
                const { messages } = JSON.parse(body);
                const postData = JSON.stringify({ 
                    model: "claude-3-5-haiku-20241022", 
                    max_tokens: 2048,
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、谦虚的导师。请根据用户的语言回复，始终保持藏汉双语。使用 Markdown 格式展现。",
                    messages: messages // 核心：将整个记忆球发送给 Claude
                });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'x-api-key': MY_ANTHROPIC_KEY.trim(), 
                        'anthropic-version': '2023-06-01' 
                    }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', x => d += x);
                    apiRes.on('end', () => {
                        const j = JSON.parse(d);
                        res.end(JSON.stringify({ reply: j.content[0].text }));
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ error: "通道异常。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
