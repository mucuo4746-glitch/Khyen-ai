const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            /* 修正核心：增强字体序列和文本渲染模式 */
            body { 
                font-family: "Noto Serif SC", "Noto Serif Tibetan", "Microsoft YaHei UI", serif; 
                text-rendering: optimizeLegibility; /* 强化复杂文本渲染 */
                -webkit-font-smoothing: antialiased;
                background: #fdfbf7; margin: 0; display: flex; flex-direction: column; height: 100vh; color: #3d2b1f; 
            }
            #header { background: #8e2323; color: #f7f3e8; padding: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-weight: bold; font-size: 1.2em; }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
            .m { max-width: 85%; padding: 12px 18px; border-radius: 15px; line-height: 1.8; word-wrap: break-word; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .u { align-self: flex-end; background: #e6d5b8; color: #3d2b1f; border-bottom-right-radius: 2px; }
            .a { align-self: flex-start; background: #fff; color: #222; border-bottom-left-radius: 2px; border: 1px solid #eee; }
            /* 为藏文预留更宽的行距，防止上下打架 */
            .a p, .a div { margin: 8px 0; line-height: 2.3; }
            #input-area { padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
            textarea { flex: 1; height: 50px; border: 1px solid #ddd; border-radius: 12px; padding: 10px; font-size: 16px; resize: none; outline: none; transition: 0.3s; }
            textarea:focus { border-color: #8e2323; }
            button { background: #8e2323; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: bold; transition: 0.3s; }
            button:hover { background: #5c1616; transform: scale(1.05); }
        </style></head>
        <body>
            <div id="header">མཁྱེན། KHYEN AI 智者</div>
            <div id="chat"></div>
            <div id="input-area">
                <textarea id="t" placeholder="输入您的问题 (支持汉/藏/英)..."></textarea>
                <button onclick="s()">咨询</button>
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
                    const loader = add('མཁྱེན། 智者正在聆听...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: v }) });
                        const data = await r.json();
                        loader.innerHTML = marked.parse(data.reply);
                    } catch(e) { loader.innerText = '智者已远行，请稍后再咨询。'; }
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
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、谦逊的导师，深谙藏、汉、英三方文化。请根据用户的提问语言进行针对性回复，但在回复中始终保留藏汉双语的智慧精华。使用 Markdown 格式让排版整洁。在提及藏文术语时，确保 Unicode 字符结构完整。",
                    messages: [{ role: "user", content: message }] 
                });
                
                const reqApi = https.request({
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'x-api-key': MY_ANTHROPIC_KEY.trim(), 
                        'anthropic-version': '2023-06-01'
                    }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', x => d += x);
                    apiRes.on('end', () => {
                        try {
                            const j = JSON.parse(d);
                            res.end(JSON.stringify({ reply: j.content[0].text }));
                        } catch(e) { res.end(JSON.stringify({ reply: "智者沉思中，请稍后再试。" })); }
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ reply: "系统开小差了。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
