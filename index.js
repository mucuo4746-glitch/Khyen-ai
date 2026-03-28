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
        body { font-family: sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #f4f1ea; overflow: hidden; }
        header { text-align: center; padding: 10px; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px); box-shadow: 0 1px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        #chat { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 14px 18px; border-radius: 18px; max-width: 85%; line-height: 1.8; font-size: 1rem; word-wrap: break-word; }
        .user { background: #4a3e35; color: #f1d592; align-self: flex-end; border-bottom-right-radius: 2px; }
        .ai { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .copy-btn { font-size: 0.7rem; color: #999; cursor: pointer; margin-top: 5px; display: block; text-align: right; }
        #input-container { padding: 10px; background: white; border-top: 1px solid #eee; display: flex; flex-direction: column; }
        textarea { width: 100%; border: 1px solid #ddd; border-radius: 15px; padding: 12px; font-size: 1rem; outline: none; background: #fafafa; resize: none; box-sizing: border-box; }
        .action-bar { display: flex; justify-content: flex-end; margin-top: 8px; gap: 10px; }
        .btn { padding: 8px 18px; border-radius: 20px; cursor: pointer; border: none; font-size: 0.9rem; }
        .send-btn { background: #4a3e35; color: white; }
        .opt-btn { background: #eee; color: #666; }
    </style>
</head>
<body>
    <header>
        <div style="width:50px"></div>
        <h3 style="margin:0;font-size:1.1rem;color:#4a3e35;">KHYEN AI མཁྱེན།</h3>
        <button class="btn opt-btn" style="padding:4px 8px;font-size:0.7rem" onclick="saveChat()">保存</button>
    </header>
    <div id="chat"></div>
    <div id="input-container">
        <textarea id="text" placeholder="向智者提议..." rows="1" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
        <div class="action-bar">
            <button class="btn opt-btn" onclick="document.getElementById('text').value='';document.getElementById('text').style.height='auto'">清空</button>
            <button class="btn send-btn" onclick="send()">发送</button>
        </div>
    </div>
    <script>
        const chat = document.getElementById('chat');
        window.onload = () => add("གང་ཚེ་རྐང་གཉིས་གཙོ་བོ་ཁྱོད་བལྟམས་ཚེ།...\\n两足尊者初降世，七步莲华踏大地...", 'ai');
        function add(t, type){
            const d = document.createElement('div'); d.className = 'msg ' + type;
            const c = document.createElement('div'); c.innerText = t; d.appendChild(c);
            if(type==='ai'){
                const s = document.createElement('span'); s.className='copy-btn'; s.innerText='复制';
                s.onclick=()=>{navigator.clipboard.writeText(t); s.innerText='已复制'; setTimeout(()=>s.innerText='复制',2000)};
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
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const postData = JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "你叫 KHYEN AI མཁྱེན།。你是一位博学睿智的藏族学者。请使用镜像语言回复，逻辑清晰，人文气息浓厚。" },
                    { role: "user", content: message }
                ]
            });
            const options = {
                hostname: 'api.deepseek.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY }
            };
            const apiReq = https.request(options, (apiRes) => {
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    try {
                        const j = JSON.parse(d);
                        res.end(JSON.stringify({ reply: j.choices[0].message.content }));
                    } catch (e) { res.end(JSON.stringify({ reply: '智慧连接中断，请稍后再试' })); }
                });
            });
            apiReq.on('error', (e) => res.end(JSON.stringify({ reply: '网络波动中...' })));
            apiReq.write(postData); apiReq.end();
        });
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
});
