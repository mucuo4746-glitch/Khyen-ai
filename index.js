const http = require('http');
const https = require('https');
const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            /* 1. 核心修复：电脑端强制回归最稳的 Windows 藏文字体 */
            body { 
                font-family: "Microsoft Himalaya", "Tibetan Machine Uni", "Microsoft YaHei", sans-serif; 
                background: #fdfbf7; margin: 0; display: flex; flex-direction: column; height: 100vh; color: #3d2b1f; 
            }
            #header { background: #8e2323; color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em; }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            
            /* 2. 气泡：取消所有复杂的 word-break 限制，让浏览器自然渲染 */
            .m { max-width: 85%; padding: 14px 18px; border-radius: 18px; line-height: 1.6; font-size: 18px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .u { align-self: flex-end; background: #e6d5b8; }
            .a { align-self: flex-start; background: #fff; border: 1px solid #f0f0f0; }

            /* 3. 针对电脑端的特殊“强力胶”：锁定行高，防止叠字被切断 */
            @media (min-width: 768px) {
                .m { line-height: 1.4 !important; font-family: "Microsoft Himalaya" !important; font-size: 22px !important; }
                .a p { margin: 5px 0; }
            }

            /* 4. 手机端保持松绑 */
            @media (max-width: 767px) {
                .m { line-height: 2.2; font-size: 16px; }
            }

            #input-area { padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
            textarea { flex: 1; height: 50px; border-radius: 12px; border: 1px solid #ddd; padding: 10px; font-size: 16px; outline: none; }
            button { background: #8e2323; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: bold; }
        </style></head>
        <body>
            <div id="header">མཁྱེན། KHYEN AI 智者</div>
            <div id="chat"></div>
            <div id="input-area"><textarea id="t" placeholder="在此开启心灵对话..."></textarea><button onclick="s()">请教</button></div>
            <script>
                const c = document.getElementById('chat');
                function add(msg, type) {
                    const d = document.createElement('div'); d.className = 'm ' + type;
                    d.innerHTML = type === 'a' ? marked.parse(msg) : msg;
                    c.appendChild(d); c.scrollTop = c.scrollHeight; return d;
                }
                async function s() {
                    const v = document.getElementById('t').value; if(!v) return;
                    add(v, 'u'); document.getElementById('t').value = '';
                    const l = add('智者正在斟酌...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: v }) });
                        const d = await r.json(); l.innerHTML = marked.parse(d.reply);
                    } catch(e) { l.innerText = '连接稍慢。'; }
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
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智导师。请保持藏汉双语回复。",
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
