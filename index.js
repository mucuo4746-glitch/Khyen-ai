const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
let chatLog = []; 

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title>
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            body { font-family: "Noto Serif SC", "Noto Serif Tibetan", serif; text-rendering: optimizeLegibility; background: #fdfbf7; margin: 0; display: flex; flex-direction: column; height: 100vh; color: #3d2b1f; }
            #header { background: #8e2323; color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em; position: sticky; top:0; z-index:100; }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            .m { max-width: 88%; padding: 15px 20px; border-radius: 18px; line-height: 1.8; position: relative; transition: 0.3s; }
            .u { align-self: flex-end; background: #e6d5b8; color: #3d2b1f; border-bottom-right-radius: 2px; }
            .a { align-self: flex-start; background: #fff; color: #222; border: 1px solid #eee; border-bottom-left-radius: 2px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
            .a p { margin: 10px 0; line-height: 2.3; }
            .copy-btn { font-size: 12px; color: #8e2323; cursor: pointer; margin-top: 10px; display: block; text-align: right; font-weight: bold; }
            #input-area { padding: 20px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; position: sticky; bottom:0; }
            textarea { flex: 1; height: 50px; border: 1px solid #ddd; border-radius: 12px; padding: 12px; font-size: 16px; outline: none; transition: 0.3s; border: 1.5px solid #eee; }
            textarea:focus { border-color: #8e2323; }
            button { background: #8e2323; color: white; border: none; padding: 0 20px; border-radius: 12px; cursor: pointer; font-weight: bold; }
            .loader-text { font-size: 14px; color: #888; margin-bottom: 5px; }
        </style></head>
        <body>
            <div id="header">མཁྱེན། KHYEN AI 智者</div>
            <div id="chat"></div>
            <div id="input-area">
                <textarea id="t" placeholder="继续请教智者，阿佳..."></textarea>
                <button onclick="s()">咨询</button>
            </div>
            <script>
                const c = document.getElementById('chat');
                function copyText(btn, text) {
                    const cleanText = text.replace(/<[^>]*>/g, '');
                    navigator.clipboard.writeText(cleanText).then(() => {
                        const original = btn.innerText;
                        btn.innerText = '✅ 已复制';
                        setTimeout(() => btn.innerText = original, 2000);
                    });
                }
                function add(msg, type) {
                    const d = document.createElement('div');
                    d.className = 'm ' + type;
                    const content = type === 'a' ? marked.parse(msg) : msg;
                    d.innerHTML = content;
                    if(type === 'a') {
                        const btn = document.createElement('span');
                        btn.className = 'copy-btn';
                        btn.innerText = '📋 复制智慧语录';
                        btn.onclick = () => copyText(btn, msg);
                        d.appendChild(btn);
                    }
                    c.appendChild(d);
                    c.scrollTop = c.scrollHeight;
                    return d;
                }
                async function s() {
                    const v = document.getElementById('t').value;
                    if(!v) return;
                    add(v, 'u');
                    document.getElementById('t').value = '';
                    const loader = add('མཁྱེན། 智者正在回溯记忆...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: v }) });
                        const data = await r.json();
                        loader.innerHTML = marked.parse(data.reply);
                        const btn = document.createElement('span');
                        btn.className = 'copy-btn';
                        btn.innerText = '📋 复制智慧语录';
                        btn.onclick = () => copyText(btn, data.reply);
                        loader.appendChild(btn);
                    } catch(e) { loader.innerText = '连接中断。'; }
                    c.scrollTop = c.scrollHeight;
                }
            </script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                chatLog.push({ role: "user", content: message });
                if (chatLog.length > 10) chatLog.shift();

                const postData = JSON.stringify({ 
                    model: "claude-haiku-4-5-20251001", 
                    max_tokens: 2500,
                    system: "你叫 KHYEN AI མཁྱེན།。是一位精通藏、汉、英文化的睿智数字导师。你正在与一位虔诚的修行者（阿佳）对话。请保持谦逊、深刻、温暖的语气。在回复中自然融合藏汉双语。如果你觉得对话在深入，请主动引导对方思考。使用 Markdown 排版，确保藏文字符结构在网页上完美显示。",
                    messages: chatLog 
                });
                
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': MY_ANTHROPIC_KEY.trim(), 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', x => d += x);
                    apiRes.on('end', () => {
                        try {
                            const j = JSON.parse(d);
                            const reply = j.content[0].text;
                            chatLog.push({ role: "assistant", content: reply });
                            res.end(JSON.stringify({ reply }));
                        } catch(e) { res.end(JSON.stringify({ reply: "智者正在整理经书，请稍后再问。" })); }
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ reply: "系统开小差了。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
