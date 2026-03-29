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
        <textarea id="text" placeholder="向智者提议（可输入多行）..." rows="1" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
        <div class="action-bar"><button class="btn opt-btn" onclick="document.getElementById('text').value='';document.getElementById('text').style.height='auto'">清空</button><button class="btn send-btn" onclick="send()">发送</button></div>
    </div>
    <script>
        const chat = document.getElementById('chat');
        window.onload = () => { add("གང་ཚེ་རྐང་གཉིས་གཙོ་བོ་ཁྱོད་བལྟམས་ཚེ།...\\n两足尊者初降世，七步莲华踏大地...", 'ai'); };
        function add(t, type){
            const d = document.createElement('div'); d.className = 'msg ' + type;
            const c = document.createElement('div');
            let clean = t.replace(/\\(([^)]+)\\)/g, '').replace(/（([^）]+)）/g, '').replace(/\\{([^}]+)\\}/g, '').trim();
            c.innerText = clean; d.appendChild(c);
            if(type==='ai'){
                const s = document.createElement('span'); s.className='copy-btn'; s.innerText='❐ 复制智慧';
                s.onclick=()=>{navigator.clipboard.writeText(clean); s.innerText='✓ 已存入法库'; setTimeout(()=>s.innerText='❐ 复制智慧',2000)};
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
            a.href=URL.createObjectURL(b); a.download='KHYEN_智慧对话录.txt'; a.click();
        }
    </script>
</body>
</html>
        `);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            // 💡 4.331：增加了绝不强行闭环、诚实回答“不确定”的逻辑
            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、温暖庄重的藏族学者。严禁输出动作描述或表情描述。必须严格镜像语言回复。重要铁律：1. 严禁与用户争执。如果用户提出质疑，必须礼貌地表示感谢并诚实地核实，而不是犟嘴。2. 绝对不能编造历史、人物或地理信息。如果对某个地理名称（如湖泊）不确定，或者只知道它是湖泊名称而非人物，必须明确回答‘那是一个湖泊名称，我对其相关的历史人物信息不够了解’，绝对不能强行将湖泊拟人化为特定的历史人物或神灵进行生平编造。宁可诚实回答‘我不确定’，也不可说一句编造的话。重要概念加粗。禁用表情。";
            const postData = JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }] });
            const options = { hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY } };
            const apiReq = https.request(options, (apiRes) => {
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    try { res.end(JSON.stringify({ reply: JSON.parse(d).choices[0].message.content })); } 
                    catch (e) { res.end(JSON.stringify({ reply: '智慧连接中断' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
