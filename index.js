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
            body { font-family: 'Noto Serif Tibetan', serif; background: var(--bg-cream); margin: 0; display: flex; flex-direction: column; height: 100vh; color: var(--text-brown); -webkit-font-smoothing: antialiased; }
            #header { background: var(--main-red); color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            .m { 
                max-width: 88%; padding: 16px 20px; border-radius: 18px; 
                /* 核心修复：应用你找来的 CSS 秘籍 */
                word-break: keep-all; 
                white-space: pre-wrap; 
                line-height: 2.4; 
                font-size: 20px; 
                position: relative; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.05); 
                user-select: text;
            }
            .u { align-self: flex-end; background: #e6d5b8; border-bottom-right-radius: 4px; }
            .a { align-self: flex-start; background: #fff; border: 1px solid #eee; border-bottom-left-radius: 4px; }
            .a p { margin: 8px 0; }
            #input-area { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
            textarea { flex: 1; height: 48px; border: 1px solid #ddd; border-radius: 15px; padding: 12px; font-size: 16px; outline: none; resize: none; }
            button { background: var(--main-red); color: white; border: none; padding: 12px 25px; border-radius: 15px; font-weight: bold; cursor: pointer; }
            .copy-tip { position: absolute; top: -25px; right: 10px; background: var(--main-red); color: white; font-size: 12px; padding: 2px 8px; border-radius: 5px; animation: fadeout 2s forwards; }
            @keyframes fadeout { from {opacity: 1} to {opacity: 0} }
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
                    d.onclick = () => {
                        const text = d.innerText.replace('已复制 སྦྱར་ཟིན།', '');
                        navigator.clipboard.writeText(text);
                        const tip = document.createElement('div');
                        tip.className = 'copy-tip';
                        tip.innerText = '已复制 སྦྱར་ཟིན།';
                        d.appendChild(tip);
                        setTimeout(() => tip.remove(), 2000);
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
                        if (h.length > 20) h = h.slice(-20);
                    } catch(e) { loader.innerText = '智者正在冥想。'; }
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
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、谦虚的导师。1.当需要输出藏文时，必须使用标准的藏文书写系统（乌金体），确保每个音节之间有正确的音节点（་），格式必须准确。不要猜测或拼凑藏文，如果不确定，宁可只用中文回答。2.始终保持藏汉双语对照。3.语气温和有礼，使用 Markdown 格式。",
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
