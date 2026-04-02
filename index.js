const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            /* 1. 核心字体策略：电脑优先用系统老牌字体，手机优先用云端字体 */
            body { 
                font-family: "Microsoft Himalaya", "Tibetan Machine Uni", "Noto Serif Tibetan", serif; 
                background: #fdfbf7; 
                margin: 0; 
                display: flex; 
                flex-direction: column; 
                height: 100vh; 
                color: #3d2b1f; 
                -webkit-font-smoothing: antialiased;
            }

            #header { background: rgba(142, 35, 35, 0.95); backdrop-filter: blur(10px); color: #f7f3e8; padding: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); font-weight: bold; font-size: 1.2em; position: sticky; top: 0; z-index: 100; }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            
            /* 2. 气泡通用样式 */
            .m { 
                max-width: 85%; 
                padding: 14px 18px; 
                border-radius: 18px; 
                line-height: 2.0; 
                word-wrap: break-word; 
                font-size: 17px; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.03); 
                animation: fadeInUp 0.4s ease-out; 
            }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            
            .u { align-self: flex-end; background: #e6d5b8; color: #3d2b1f; border-bottom-right-radius: 4px; }
            .a { align-self: flex-start; background: #fff; color: #222; border-bottom-left-radius: 4px; border: 1px solid #f0f0f0; }
            
            /* 3. 重要：手机端松绑（针对小屏幕） */
            @media (max-width: 767px) {
                .m { line-height: 2.4; padding: 16px 20px; font-size: 16px; }
                .a p { margin: 12px 0; line-height: 2.4; }
            }

            /* 4. 重要：电脑端稳固（针对大屏幕） */
            @media (min-width: 768px) {
                .m { 
                    max-width: 75%; 
                    line-height: 1.8; /* 电脑端收紧行高，防止断裂 */
                    white-space: normal;
                    font-size: 18px;
                }
                .a p { 
                    line-height: 2.0; 
                    display: block;
                    word-break: normal; /* 关键：禁止电脑端强制断字 */
                }
            }

            #input-area { padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 12px; align-items: center; }
            textarea { flex: 1; height: 50px; border: 1.5px solid #f0f0f0; border-radius: 15px; padding: 12px; font-size: 16px; resize: none; outline: none; background: #fcfcfc; }
            textarea:focus { border-color: #8e2323; background: #fff; }
            button { background: #8e2323; color: white; border: none; padding: 10px 24px; border-radius: 15px; cursor: pointer; font-weight: bold; font-size: 16px; }
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
                    add(v, 'u');
                    document.getElementById('t').value = '';
                    const loader = add('智者正在斟酌...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: v }) });
                        const data = await r.json();
                        loader.innerHTML = marked.parse(data.reply);
                    } catch(e) { loader.innerText = '连接稍有延迟。'; }
                    c.scrollTop = c.scrollHeight;
                }
            </script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                const postData = JSON.stringify({ 
                    model: "claude-haiku-4-5-20251001", 
                    max_tokens: 2048,
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、谦虚的导师。请根据用户的语言回复，始终保持藏汉双语。使用 Markdown 格式。",
                    messages: [{ role: "user", content: message }] 
                });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': MY_ANTHROPIC_KEY.trim(), 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', x => d += x);
                    apiRes.on('end', () => {
                        const j = JSON.parse(d);
                        res.end(JSON.stringify({ reply: j.content[0].text }));
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ error: "异常。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
