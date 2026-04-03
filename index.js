const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            body { font-family: "Noto Serif SC", "Noto Serif Tibetan", serif; background: #fdfbf7; margin: 0; display: flex; flex-direction: column; height: 100vh; color: #3d2b1f; -webkit-font-smoothing: antialiased; }
            #header { background: #8e2323; color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.1em; position: sticky; top: 0; z-index: 100; }
            #chat { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 15px; -webkit-overflow-scrolling: touch; }
            .m { max-width: 85%; padding: 12px 16px; border-radius: 18px; line-height: 2.4; font-size: 17px; word-wrap: break-word; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
            .u { align-self: flex-end; background: #e6d5b8; color: #3d2b1f; border-bottom-right-radius: 4px; }
            .a { align-self: flex-start; background: #fff; border: 1px solid #eee; border-bottom-left-radius: 4px; }
            .a p { margin: 8px 0; line-height: 2.4; }
            #input-area { padding: 10px 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 8px; align-items: center; padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
            textarea { flex: 1; height: 44px; border: 1px solid #ddd; border-radius: 12px; padding: 10px; font-size: 16px; outline: none; background: #fcfcfc; -webkit-appearance: none; }
            button { background: #8e2323; color: white; border: none; padding: 8px 18px; border-radius: 12px; font-weight: bold; cursor: pointer; -webkit-tap-highlight-color: transparent; }
        </style></head>
        <body>
            <div id="header">མཁྱེན། KHYEN AI 智者</div>
            <div id="chat"></div>
            <div id="input-area"><textarea id="t" placeholder="在此开启心灵对话..."></textarea><button onclick="s()">请教</button></div>
            <script>
                const c = document.getElementById('chat');
                let h = [];
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
                    h.push({ role: 'user', content: v });
                    document.getElementById('t').value = '';
                    const loader = add('智者正在斟酌...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages: h }) });
                        const data = await r.json();
                        loader.innerHTML = marked.parse(data.reply);
                        h.push({ role: 'assistant', content: data.reply });
                        if (h.length > 10) h = h.slice(-10);
                    } catch(e) { loader.innerText = '连接稍有延迟。'; }
                    c.scrollTop = c.scrollHeight;
                }
            </script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { messages } = JSON.parse(body);
                const postData = JSON.stringify({
                    model: "claude-haiku-4-5-20251001",
                    max_tokens: 2048,
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、谦虚的导师。请始终保持藏汉双语。使用 Markdown 格式。",
                    messages: messages
                });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': MY_ANTHROPIC_KEY.trim(), 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', chunk => d += chunk);
                    apiRes.on('end', () => {
                        try {
                            const j = JSON.parse(d);
                            res.end(JSON.stringify({ reply: j.content[0].text }));
                        } catch(e) { res.end(JSON.stringify({ reply: "解析偏差。" })); }
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ error: "通道异常。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
