const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>KHYEN AI མཁྱེན།</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
        <style>
            :root { --main-red: #8e2323; --bg-cream: #fdfbf7; --text-brown: #3d2b1f; }
            body { font-family: "Noto Serif SC", "Microsoft YaHei", serif; background: var(--bg-cream); margin: 0; display: flex; flex-direction: column; height: 100vh; color: var(--text-brown); -webkit-font-smoothing: antialiased; }
            #header { background: var(--main-red); color: #f7f3e8; padding: 15px; text-align: center; font-weight: bold; font-size: 1.2em; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            .m { 
                max-width: 88%; padding: 18px 24px; border-radius: 18px; 
                font-family: 'Noto Serif Tibetan', serif; 
                line-height: 2.5; 
                word-break: keep-all; 
                white-space: pre-wrap;
                overflow-wrap: break-word;
                position: relative; 
                box-shadow: 0 4px 15px rgba(0,0,0,0.05); user-select: text;
            }
            .a p { margin: 15px 0; display: block; clear: both; }
            .u { align-self: flex-end; background: #e6d5b8; border-bottom-right-radius: 4px; }
            .a { align-self: flex-start; background: #fff; border: 1px solid #eee; border-bottom-left-radius: 4px; }
            #input-area { padding: 15px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: center; }
            textarea { flex: 1; height: 48px; border: 1px solid #ddd; border-radius: 15px; padding: 12px; font-size: 16px; outline: none; resize: none; font-family: "Noto Serif SC", serif; }
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
                    } catch(e) { loader.innerText = '连接中断。'; }
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
                    system: `你是 KHYEN AI མཁྱེན།，专注藏族文化、佛法与藏语的智慧导师。མཁྱེན། 意为"智慧、全知、洞见"。

【语言规则】
- 默认只用中文回答
- 只有用户明确用藏文提问时才用藏文回答
- 用藏文回答时，可以用标准藏语日常用语自然对话，复杂句子谨慎处理，不确定时用中文补充说明
- 不确定藏文写法时直接用中文替代，严禁猜测
- 藏文输出必须包含正确音节点（་），格式完整
- 藏文段落必须单独成行，不与中文混排

【知识范围】
- 藏传佛教、菩提行论经典、藏族节日与习俗
- 藏族饮食文化、藏医基础知识、藏族历史
- 藏汉英三语翻译
- 藏族艺术、唐卡、音乐、舞蹈

【回答风格】
- 温暖、有深度，像一位博学睿智的藏族学者
- 遇到哲学宗教问题展现智慧，用生动比喻解释深刻道理
- 遇到生活文化问题用自然亲切的方式回答
- 使用Markdown格式，回答有条理
- 不幼稚，不简单化，有藏族文化的气息`,
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
