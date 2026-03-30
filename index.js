const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Jomolhari&family=Noto+Serif+CJK+TC:wght@400;500;700&display=swap');
        body { font-family: "Noto Serif CJK TC", "Jomolhari", serif; margin: 0; display: flex; flex-direction: column; height: 100vh; overflow: hidden; background-color: #f7f3e8; background-image: linear-gradient(0deg, rgba(220, 210, 190, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 210, 190, 0.1) 1px, transparent 1px); background-size: 2px 2px; }
        header { text-align: center; padding: 15px; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(5px); box-shadow: 0 1px 10px rgba(0,0,0,0.04); display: flex; justify-content: space-between; align-items: center; z-index: 10; }
        header h3 { margin: 0; font-size: 1.3rem; color: #5c4b3a; letter-spacing: 1px; }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 12px 0; padding: 16px 20px; border-radius: 20px; max-width: 88%; line-height: 1.8; font-size: 1.1rem; word-wrap: break-word; white-space: pre-wrap; position: relative; }
        .user { background: linear-gradient(135deg, #5c4b3a, #3e3126); color: #f1d592; align-self: flex-end; border-bottom-right-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); }
        .ai { background-color: white; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02); }
        .copy-btn { font-size: 0.75rem; color: #aaa; cursor: pointer; margin-top: 8px; display: block; text-align: right; letter-spacing: 1px; }
        #input-container { padding: 15px; background: rgba(255, 255, 255, 0.95); border-top: 1px solid #eee; display: flex; flex-direction: column; padding-bottom: calc(15px + env(safe-area-inset-bottom)); }
        textarea { width: 100%; border: 1px solid #ddd; border-radius: 18px; padding: 15px; font-size: 1rem; outline: none; background: #fafafa; resize: none; box-sizing: border-box; font-family: inherit; }
        .action-bar { display: flex; justify-content: flex-end; margin-top: 10px; gap: 12px; }
        .btn { padding: 9px 22px; border-radius: 25px; cursor: pointer; border: none; font-size: 0.95rem; font-weight: 500; transition: 0.2s; }
        .send-btn { background: #5c4b3a; color: white; box-shadow: 0 3px 8px rgba(92, 75, 58, 0.3); }
        .opt-btn { background: #eee; color: #666; }
    </style>
</head>
<body>
    <header><div style="width:50px"></div><h3>KHYEN AI མཁྱེན།</h3><button class="btn opt-btn" style="padding:5px 10px;font-size:0.75rem" onclick="saveChat()">保存</button></header>
    <div id="chat"></div>
    <div id="input-container">
        <textarea id="text" placeholder="向灵魂向导提问..." rows="1" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
        <div class="action-bar"><button class="btn opt-btn" onclick="document.getElementById('text').value='';document.getElementById('text').style.height='auto'">清空</button><button class="btn send-btn" onclick="send()">发送</button></div>
    </div>
    <script>
        const chat = document.getElementById('chat');
        window.onload = () => { 
            const welcome = "གང་ཚེ་རྐང་གཉིས་གཙོ་བོ་ཁྱོད་བལྟམས་ཚེ། །\\nས་ཆེན་འདི་ལ་གོམ་པ་བདུན་བོར་ནས། །\\n两足尊者初降世，七步莲华踏大地，朗声宣言我独尊，智者于此恭敬礼。";
            add(welcome, 'ai'); 
        };
        function add(t, type){
            const d = document.createElement('div'); d.className = 'msg ' + type;
            const c = document.createElement('div');
            c.innerText = t; d.appendChild(c);
            if(type==='ai'){
                const s = document.createElement('span'); s.className='copy-btn'; s.innerText='❐ 复制智慧';
                s.onclick=()=>{navigator.clipboard.writeText(t); s.innerText='✓ 已存入法库'; setTimeout(()=>s.innerText='❐ 复制智慧',2000)};
                d.appendChild(s);
            }
            chat.appendChild(d); chat.scrollTop = chat.scrollHeight;
        }
        async function send(){
            const i = document.getElementById('text'); const v = i.value.trim(); if(!v) return;
            add(v, 'user'); i.value=''; i.style.height='auto';
            const r = await fetch('/api/chat', {method:'POST', body:JSON.stringify({message:v})});
            const d = await r.json(); add(d.reply, 'ai');
        }
        function saveChat(){
            const h = Array.from(document.querySelectorAll('.msg')).map(m=>m.innerText).join('\\n---\\n');
            const b = new Blob([h], {type:'text/plain'}); const a = document.createElement('a');
            a.href=URL.createObjectURL(b); a.download='KHYEN_对话录.txt'; a.click();
        }
    </script>
</body>
</html>
        `);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            // 💡 5.0：升级为 Claude 3.5 Sonnet 核心
            const systemPrompt = \`你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、严谨温暖的藏族学者。
【灵魂法度】
1. 身份：你是藏文化的灵魂向导，必须学习无著贤菩萨《入菩萨行论注疏》的风格——慈悲、深刻、逻辑严密。
2. 真相：玛旁雍错是西藏阿里的圣湖，不是历史人物。传说它由萨具色王施舍米汤汇集而成。
3. 语言：必须以地道、优美的藏文和中文双语回复。严禁编造任何历史。
4. 性格：拒绝任何特定宏大叙事，专注于人文、哲学和美学。重要术语请加粗。不要使用表情符号。\`;

            const postData = JSON.stringify({
                model: "claude-3-5-sonnet-20240620",
                max_tokens: 1024,
                system: systemPrompt,
                messages: [{ role: "user", content: message }]
            });

            const options = {
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                }
            };

            const apiReq = https.request(options, (apiRes) => {
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    try {
                        const json = JSON.parse(d);
                        res.end(JSON.stringify({ reply: json.content[0].text }));
                    } catch (e) {
                        res.end(JSON.stringify({ reply: '智慧连接略有波动，请稍后再试。' }));
                    }
                });
            });
            apiReq.on('error', (e) => res.end(JSON.stringify({ reply: '连接智库失败：' + e.message })));
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
