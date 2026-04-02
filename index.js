const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            body { font-family: "Noto Serif SC", "Noto Serif Tibetan", serif; background: #fdfbf7; margin: 0; display: flex; flex-direction: column; height: 100vh; color: #3d2b1f; }
            #header { background: #8e2323; color: #f7f3e8; padding: 15px; text-align: center; box-shadow: 0 2px 10px rgba(0,0,0,0.1); font-weight: bold; font-size: 1.2em; }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
            .m { max-width: 85%; padding: 12px 18px; border-radius: 15px; line-height: 1.8; word-wrap: break-word; font-size: 16px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
            .u { align-self: flex-end; background: #e6d5b8; color: #3d2b1f; border-bottom-right-radius: 2px; }
            .a { align-self: flex-start; background: #fff; color: #222; border-bottom-left-radius: 2px; border: 1px solid #eee; }
            .a p { margin: 8px 0; line-height: 2.2; }
            #input-area { padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; }
            textarea { flex: 1; height: 50px; border: 1px solid #ddd; border-radius: 12px; padding: 10px; font-size: 16px; resize: none; outline: none; }
            button { background: #8e2323; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: bold; }
        </style></head>
        <body>
            <div id="header">མཁྱེན། KHYEN AI 智者</div>
            <div id="chat"></div>
            <div id="input-area">
                <textarea id="t" placeholder="继续请教智者..."></textarea>
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
                    const loader = add('智者正在斟酌...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: v }) });
                        const data = await r.json();
                        loader.innerHTML = marked.parse(data.reply);
                    } catch(e) { loader.innerText = '连接中断。'; }
                }
            </script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                const postData = JSON.stringify({ 
                    model: "claude-3-5-haiku-20241022", 
                    max_tokens: 2048,
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、谦虚的导师。请根据用户的语言回复，始终保持藏汉双语的优美感。使用 Markdown 格式。",
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
                        const j = JSON.parse(d);
                        res.end(JSON.stringify({ reply: j.content[0].text }));
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ reply: "系统忙。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
