const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="bo"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"><title>KHYEN AI མཁྱེན།</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            :root { --main-red: #8e2323; --bg-cream: #fdfbf7; --text-brown: #3d2b1f; }
            body { font-family: 'Noto Serif Tibetan', 'Microsoft Himalaya', serif; background: var(--bg-cream); margin: 0; display: flex; flex-direction: column; height: 100vh; color: var(--text-brown); -webkit-font-smoothing: antialiased; }
            #header { background: var(--main-red); color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            .m { max-width: 85%; padding: 15px 20px; border-radius: 18px; line-height: 2.8; font-size: 19px; word-wrap: break-word; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); user-select: text; -webkit-user-select: text; }
            .u { align-self: flex-end; background: #e6d5b8; border-bottom-right-radius: 4px; }
            .a { align-self: flex-start; background: #fff; border: 1px solid #eee; border-bottom-left-radius: 4px; }
            .a p { margin: 10px 0; line-height: 2.8; }
            .a h1, .a h2 { color: var(--main-red); font-size: 1.1em; margin: 15px 0 5px; }
            #input-area { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
            textarea { flex: 1; height: 48px; border: 1px solid #ddd; border-radius: 15px; padding: 12px; font-size: 16px; outline: none; transition: 0.3s; resize: none; }
            textarea:focus { border-color: var(--main-red); }
            button { background: var(--main-red); color: white; border: none; padding: 12px 25px; border-radius: 15px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            button:active { transform: scale(0.95); }
            /* 复制提示小动画 */
            @keyframes fade { from {opacity: 1} to {opacity: 0} }
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
                    // 双击气泡即可复制内容
                    d.onclick = () => {
                        navigator.clipboard.writeText(d.innerText);
                        const tip = document.createElement('span');
                        tip.innerText = ' སྦྱར་ཟིན། (已复制)';
                        tip.style.cssText = 'position:absolute;top:-20px;right:0;font-size:12px;color:var(--main-red);animation:fade 2s forwards;';
                        d.appendChild(tip);
                    };
                    c.appendChild(d);
                    c.scrollTop = c.scrollHeight;
                    return d;
                }
                async function s() {
                    const v = document.getElementById('t').value.trim();
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
                        if (h.length > 20) h = h.slice(-20); // 保持最近10轮对话记忆
                    } catch(e) { loader.innerText = '连接稍有延迟。'; }
                    c.scrollTop = c.scrollHeight;
                }
            </script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { messages } = JSON.parse(body);
                const postData = JSON.stringify({
                    model: "claude-haiku-4-5-20251001",
                    max_tokens: 4096,
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智导师。1.必须保持藏汉双语。2.藏文排版严禁乱码，使用标准符号。3.语气温和有礼。4.使用Markdown。",
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
            } catch(e) { res.end(JSON.stringify({ error: "异常。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
