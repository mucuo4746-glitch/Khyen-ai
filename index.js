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
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        :root { --main-red: #8e2323; --bg-cream: #fdfbf7; --text-brown: #3d2b1f; --gold: #c9a84c; }
        * { box-sizing: border-box; }
        body { font-family: "Noto Serif Tibetan", "Noto Serif SC", serif; background: var(--bg-cream); margin: 0; display: flex; flex-direction: column; height: 100vh; color: var(--text-brown); -webkit-font-smoothing: antialiased; }

        /* 封面页优化：增加呼吸感 */
        #landing { position: fixed; inset: 0; background: linear-gradient(180deg, #fff8ee 0%, #faf7f2 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 40px 20px; text-align: center; }
        .prayer-bar { position: fixed; top: 0; left: 0; right: 0; height: 6px; background: repeating-linear-gradient(90deg, #c9a84c 0%, #c9a84c 20%, #8e2323 20%, #8e2323 40%, #1a5a8a 40%, #1a5a8a 60%, #1a6b3a 60%, #1a6b3a 80%, #6b1a8a 80%, #6b1a8a 100%); z-index: 200; }
        .landing-icon { font-size: 72px; margin-bottom: 24px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1)); }
        .landing-title { font-size: 48px; font-weight: 300; letter-spacing: 15px; color: #2a1a0a; margin: 0 0 10px 15px; } /* 修正间距 */
        .landing-tibetan { font-family: 'Noto Serif Tibetan', serif; font-size: 24px; color: var(--gold); letter-spacing: 4px; margin-bottom: 15px; }
        .landing-divider { width: 120px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 20px auto; }
        .landing-tagline { font-size: 12px; color: #8a7a6a; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 45px; opacity: 0.8; }
        
        /* 四宫格间距优化 */
        .landing-features { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; width: 100%; max-width: 320px; margin-bottom: 50px; }
        .feat { background: white; border: 1px solid rgba(201,168,76,0.2); border-radius: 16px; padding: 18px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
        .feat-icon { font-size: 22px; margin-bottom: 8px; }
        .feat-title { font-size: 13px; color: #2a1a0a; font-weight: 600; }
        .feat-bo { font-family: 'Noto Serif Tibetan', serif; font-size: 11px; color: var(--gold); margin-top: 4px; }

        .enter-btn { background: #2a1a0a; color: var(--gold); border: none; padding: 18px 60px; font-size: 15px; letter-spacing: 5px; cursor: pointer; border-radius: 50px; transition: all 0.3s; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .enter-btn:active { transform: scale(0.95); }
        .landing-mantra { font-family: 'Noto Serif Tibetan', serif; font-size: 14px; color: rgba(201,168,76,0.6); margin-top: 30px; letter-spacing: 4px; }

        /* 对话页 */
        #app { display: none; flex-direction: column; height: 100vh; }
        #header { background: var(--main-red); color: #f7f3e8; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.15); }
        .header-title { font-weight: bold; font-size: 1.1em; }
        .header-btns { display: flex; gap: 6px; }
        .hbtn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 7px 10px; border-radius: 8px; font-size: 11px; cursor: pointer; }
        
        #chat { flex: 1; overflow-y: auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 20px; }
        .m { max-width: 88%; padding: 16px 20px; border-radius: 18px; position: relative; box-shadow: 0 3px 12px rgba(0,0,0,0.05); line-height: 1.8; overflow-wrap: break-word; }
        .tibetan-mode { font-family: 'Noto Serif Tibetan', serif !important; line-height: 2.6 !important; font-size: 19px !important; }
        .u { align-self: flex-end; background: #e6d5b8; border-bottom-right-radius: 4px; color: #3d2b1f; }
        .a { align-self: flex-start; background: #fff; border: 1px solid #eee; border-bottom-left-radius: 4px; }
        .a p { margin: 10px 0; }
        
        .msg-actions { display: flex; gap: 8px; margin-top: 12px; border-top: 1px dashed #eee; padding-top: 8px; }
        .action-btn { background: transparent; border: none; color: #8a7a6a; padding: 4px 8px; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        
        #input-area { padding: 12px 16px 24px; background: white; border-top: 1px solid #eee; display: flex; gap: 10px; align-items: flex-end; }
        textarea { flex: 1; min-height: 46px; max-height: 150px; border: 1px solid #ddd; border-radius: 15px; padding: 12px 15px; font-size: 16px; outline: none; resize: none; font-family: "Noto Serif SC", serif; line-height: 1.4; background: #fcfaf7; }
        #send-btn { background: var(--main-red); color: white; border: none; width: 50px; height: 46px; border-radius: 15px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        
        .copy-toast { position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 25px; font-size: 13px; z-index: 1000; animation: fadeout 2s forwards; }
        @keyframes fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
    </style></head>
    <body>
        <div class="prayer-bar"></div>
        <div id="landing">
            <div class="landing-icon">🏔️</div>
            <div class="landing-title">KHYEN</div>
            <div class="landing-tibetan">མཁྱེན། AI</div>
            <div class="landing-divider"></div>
            <div class="landing-tagline">Intelligence Rooted in Wisdom</div>
            <div class="landing-features">
                <div class="feat"><div class="feat-icon">🔤</div><div class="feat-title">翻译</div><div class="feat-bo">ཡིག་བསྒྱུར།</div></div>
                <div class="feat"><div class="feat-icon">📚</div><div class="feat-title">文化</div><div class="feat-bo">རིག་གཞུང་།</div></div>
                <div class="feat"><div class="feat-icon">☸️</div><div class="feat-title">佛法</div><div class="feat-bo">ཆོས།</div></div>
                <div class="feat"><div class="feat-icon">🗓️</div><div class="feat-title">节日</div><div class="feat-bo">དུས་ཆེན།</div></div>
            </div>
            <button class="enter-btn" onclick="enterApp()">开启智慧之旅</button>
            <div class="landing-mantra">ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།</div>
        </div>
        <div id="app">
            <div id="header">
                <div class="header-title">མཁྱེན། KHYEN AI</div>
                <div class="header-btns">
                    <button class="hbtn" onclick="saveChat()">💾 保存</button>
                    <button class="hbtn" onclick="clearChat()">🗑️ 清空</button>
                    <button class="hbtn" onclick="location.reload()">🏠 首页</button>
                </div>
            </div>
            <div id="chat"></div>
            <div id="input-area">
                <textarea id="t" placeholder="在此请教导师..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();s()}"></textarea>
                <button id="send-btn" onclick="s()">🚀</button>
            </div>
        </div>
        <script>
            const c = document.getElementById('chat');
            let h = [];
            function hasBo(t) { return /[\\u0F00-\\u0FFF]/.test(t); }
            function enterApp() {
                document.getElementById('landing').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                if(h.length === 0) {
                    add('བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！\\n\\n我是您的藏文化智慧向导 KHYEN མཁྱེན།。', 'a');
                }
            }
            function showToast(msg) {
                const t = document.createElement('div');
                t.className = 'copy-toast'; t.innerText = msg;
                document.body.appendChild(t);
                setTimeout(() => t.remove(), 2000);
            }
            function copyText(text) {
                navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板 ✓'));
            }
            function saveChat() {
                const msgs = Array.from(document.querySelectorAll('.m')).map(m => {
                    const clone = m.cloneNode(true);
                    const actions = clone.querySelector('.msg-actions');
                    if(actions) actions.remove();
                    return clone.innerText.trim();
                }).join('\\n\\n---\\n\\n');
                const blob = new Blob([msgs], {type: 'text/plain;charset=utf-8'});
                const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'Khyen_AI_对话记录.txt'; a.click();
            }
            function clearChat() {
                if(confirm('确定清空所有对话？')) { c.innerHTML = ''; h = []; add('对话已清空。', 'a'); }
            }
            function add(msg, type) {
                const d = document.createElement('div');
                d.className = 'm ' + type;
                if(hasBo(msg)) d.classList.add('tibetan-mode');
                d.innerHTML = type === 'a' ? marked.parse(msg) : msg;
                if(type === 'a') {
                    const actions = document.createElement('div');
                    actions.className = 'msg-actions';
                    actions.innerHTML = '<button class="action-btn">📋 复制文本</button>';
                    actions.querySelector('button').onclick = () => {
                        const rawText = d.innerText.replace('📋 复制文本', '').trim();
                        copyText(rawText);
                    };
                    d.appendChild(actions);
                }
                c.appendChild(d); c.scrollTop = c.scrollHeight;
                return d;
            }
            async function s() {
                const v = document.getElementById('t').value.trim();
                if(!v) return;
                add(v, 'u'); h.push({ role: 'user', content: v });
                document.getElementById('t').value = '';
                const loader = add('智者正在斟酌...', 'a');
                try {
                    const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages: h }) });
                    const data = await r.json();
                    loader.innerHTML = marked.parse(data.reply);
                    if(hasBo(data.reply)) loader.classList.add('tibetan-mode');
                    const actions = document.createElement('div');
                    actions.className = 'msg-actions';
                    actions.innerHTML = '<button class="action-btn">📋 复制内容</button>';
                    actions.querySelector('button').onclick = () => copyText(data.reply);
                    loader.appendChild(actions);
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
                    system: "你叫 KHYEN AI མཁྱེན།。是一位睿智、温和的藏文化导师。请遵守：1.默认中文。2.藏文段落独立成行且不猜测写法。3.回答要有文化底蕴，使用比喻。4.支持藏汉英互译。",
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
