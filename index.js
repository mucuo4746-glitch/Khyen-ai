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
            :root { --main-red: #8e2323; --bg-cream: #fdfbf7; --text-brown: #3d2b1f; --gold: #c9a84c; }
            * { box-sizing: border-box; }
            body { font-family: "Noto Serif SC", "Microsoft YaHei", serif; background: var(--bg-cream); margin: 0; display: flex; flex-direction: column; height: 100vh; color: var(--text-brown); -webkit-font-smoothing: antialiased; }
            
            /* 封面页 */
            #landing { position: fixed; inset: 0; background: linear-gradient(180deg, #fff8ee 0%, #faf7f2 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 100; padding: 20px; text-align: center; }
            .prayer-bar { position: fixed; top: 0; left: 0; right: 0; height: 5px; background: repeating-linear-gradient(90deg, #c9a84c 0%, #c9a84c 20%, #8e2323 20%, #8e2323 40%, #1a5a8a 40%, #1a5a8a 60%, #1a6b3a 60%, #1a6b3a 80%, #6b1a8a 80%, #6b1a8a 100%); z-index: 200; }
            .landing-icon { font-size: 64px; margin-bottom: 16px; }
            .landing-title { font-size: clamp(32px, 8vw, 56px); font-weight: 300; letter-spacing: 12px; color: #2a1a0a; margin-bottom: 8px; }
            .landing-tibetan { font-family: 'Noto Serif Tibetan', serif; font-size: clamp(18px, 4vw, 26px); color: var(--gold); letter-spacing: 4px; margin-bottom: 8px; }
            .landing-divider { width: 100px; height: 1px; background: linear-gradient(90deg, transparent, var(--gold), transparent); margin: 16px auto; }
            .landing-tagline { font-size: 13px; color: #8a7a6a; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 40px; }
            .landing-features { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-bottom: 40px; }
            .feat { background: white; border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; padding: 16px 20px; text-align: center; min-width: 100px; }
            .feat-icon { font-size: 24px; margin-bottom: 6px; }
            .feat-title { font-size: 12px; color: #2a1a0a; font-weight: 600; }
            .feat-bo { font-family: 'Noto Serif Tibetan', serif; font-size: 11px; color: var(--gold); margin-top: 2px; }
            .enter-btn { background: #2a1a0a; color: var(--gold); border: none; padding: 16px 48px; font-size: 14px; letter-spacing: 4px; cursor: pointer; border-radius: 2px; transition: all 0.3s; }
            .enter-btn:hover { background: var(--gold); color: white; }
            .landing-mantra { font-family: 'Noto Serif Tibetan', serif; font-size: 13px; color: rgba(201,168,76,0.5); margin-top: 20px; letter-spacing: 3px; }

            /* 对话页 */
            #app { display: none; flex-direction: column; height: 100vh; }
            #header { background: var(--main-red); color: #f7f3e8; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header-title { font-weight: bold; font-size: 1.1em; }
            .header-btns { display: flex; gap: 8px; }
            .hbtn { background: rgba(255,255,255,0.15); color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer; }
            #chat { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 16px; }
            .m { max-width: 88%; padding: 16px 20px; border-radius: 16px; position: relative; box-shadow: 0 2px 10px rgba(0,0,0,0.05); line-height: 1.8; overflow-wrap: break-word; }
            .m .tibetan { font-family: 'Noto Serif Tibetan', serif; line-height: 2.5; display: block; margin: 8px 0; }
            .u { align-self: flex-end; background: #e6d5b8; border-bottom-right-radius: 4px; }
            .a { align-self: flex-start; background: #fff; border: 1px solid #eee; border-bottom-left-radius: 4px; }
            .msg-actions { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; }
            .action-btn { background: #f5f0e8; border: 1px solid #ddd; color: #666; padding: 4px 10px; border-radius: 6px; font-size: 11px; cursor: pointer; }
            .action-btn:hover { background: #e8e0d0; }
            #input-area { padding: 12px; background: white; border-top: 1px solid #eee; display: flex; gap: 8px; align-items: flex-end; }
            textarea { flex: 1; min-height: 44px; max-height: 120px; border: 1px solid #ddd; border-radius: 12px; padding: 10px 14px; font-size: 15px; outline: none; resize: none; font-family: "Noto Serif SC", serif; line-height: 1.5; }
            #send-btn { background: var(--main-red); color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; white-space: nowrap; }
            .copy-toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 8px 16px; border-radius: 20px; font-size: 13px; animation: fadeout 2s forwards; z-index: 999; }
            @keyframes fadeout { 0%{opacity:1} 70%{opacity:1} 100%{opacity:0} }
        </style></head>
        <body>
            <div class="prayer-bar"></div>

            <!-- 封面页 -->
            <div id="landing">
                <div class="landing-icon">🏔️</div>
                <div class="landing-title">KHYEN</div>
                <div class="landing-tibetan">མཁྱེན། AI</div>
                <div class="landing-divider"></div>
                <div class="landing-tagline">Intelligence Rooted in Tibetan Wisdom</div>
                <div class="landing-features">
                    <div class="feat"><div class="feat-icon">🔤</div><div class="feat-title">翻译</div><div class="feat-bo">ཡིག་བསྒྱུར།</div></div>
                    <div class="feat"><div class="feat-icon">📚</div><div class="feat-title">文化</div><div class="feat-bo">རིག་གཞུང་།</div></div>
                    <div class="feat"><div class="feat-icon">☸️</div><div class="feat-title">佛法</div><div class="feat-bo">ཆོས།</div></div>
                    <div class="feat"><div class="feat-icon">🗓️</div><div class="feat-title">节日</div><div class="feat-bo">དུས་ཆེན།</div></div>
                </div>
                <button class="enter-btn" onclick="enterApp()">进入 · Enter</button>
                <div class="landing-mantra">ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།</div>
            </div>

            <!-- 对话页 -->
            <div id="app">
                <div id="header">
                    <div class="header-title">མཁྱེན། KHYEN AI</div>
                    <div class="header-btns">
                        <button class="hbtn" onclick="saveChat()">💾 保存</button>
                        <button class="hbtn" onclick="clearChat()">🗑️ 清空</button>
                        <button class="hbtn" onclick="document.getElementById('landing').style.display='flex';document.getElementById('app').style.display='none'">🏠 首页</button>
                    </div>
                </div>
                <div id="chat"></div>
                <div id="input-area">
                    <textarea id="t" placeholder="在此开启心灵对话..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();s()}"></textarea>
                    <button id="send-btn" onclick="s()">请教</button>
                </div>
            </div>
            <script>
                const c = document.getElementById('chat');
                let h = [];
                
                function enterApp() {
                    document.getElementById('landing').style.display = 'none';
                    document.getElementById('app').style.display = 'flex';
                    if(h.length === 0) {
                        add('བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！\n\n我是 KHYEN མཁྱེན། AI，您的藏文化智慧向导。\n\n您可以向我询问：藏传佛教、藏族文化、历史、节日、饮食，或进行藏汉英翻译。', 'a');
                    }
                }

                function showToast(msg) {
                    const t = document.createElement('div');
                    t.className = 'copy-toast';
                    t.innerText = msg;
                    document.body.appendChild(t);
                    setTimeout(() => t.remove(), 2000);
                }

                function copyText(text) {
                    navigator.clipboard.writeText(text).then(() => showToast('已复制 ✓'));
                }

                function saveChat() {
                    const msgs = Array.from(document.querySelectorAll('.m')).map(m => m.innerText).join('\n\n---\n\n');
                    const blob = new Blob([msgs], {type: 'text/plain;charset=utf-8'});
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'Khyen_AI_对话记录.txt';
                    a.click();
                    showToast('对话已保存！');
                }

                function clearChat() {
                    if(confirm('确定清空对话记录？')) {
                        document.getElementById('chat').innerHTML = '';
                        h = [];
                        add('对话已清空。བཀྲ་ཤིས་བདེ་ལེགས།', 'a');
                    }
                }

                function add(msg, type) {
                    const d = document.createElement('div');
                    d.className = 'm ' + type;
                    if(type === 'a') {
                        d.innerHTML = marked.parse(msg);
                        const actions = document.createElement('div');
                        actions.className = 'msg-actions';
                        const copyBtn = document.createElement('button');
                        copyBtn.className = 'action-btn';
                        copyBtn.innerText = '📋 复制';
                        copyBtn.onclick = () => copyText(d.innerText.replace('📋 复制', '').trim());
                        actions.appendChild(copyBtn);
                        d.appendChild(actions);
                    } else {
                        d.innerText = msg;
                    }
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
                    document.getElementById('send-btn').disabled = true;
                    const loader = add('智者正在斟酌...', 'a');
                    try {
                        const r = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ messages: h }) });
                        const data = await r.json();
                        loader.innerHTML = marked.parse(data.reply);
                        const actions = document.createElement('div');
                        actions.className = 'msg-actions';
                        const copyBtn = document.createElement('button');
                        copyBtn.className = 'action-btn';
                        copyBtn.innerText = '📋 复制';
                        copyBtn.onclick = () => copyText(data.reply);
                        actions.appendChild(copyBtn);
                        loader.appendChild(actions);
                        h.push({ role: 'assistant', content: data.reply });
                        if (h.length > 20) h = h.slice(-20);
                    } catch(e) { loader.innerText = '连接中断，请重试。'; }
                    document.getElementById('send-btn').disabled = false;
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
