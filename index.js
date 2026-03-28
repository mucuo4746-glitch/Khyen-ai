const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { res.writeHead(500); res.end('Error'); } 
            else { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(content); }
        });
    } 
    else if (req.url === '/chat') {
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
        header { text-align: center; padding: 12px; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px); box-shadow: 0 1px 5px rgba(0,0,0,0.05); }
        #chat { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 14px 18px; border-radius: 18px; max-width: 85%; line-height: 1.8; font-size: 1.1rem; word-wrap: break-word; }
        .user { background: #4a3e35; color: #f1d592; align-self: flex-end; border-bottom-right-radius: 2px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .ai { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        #input-container { display: flex; padding: 15px; background: white; border-top: 1px solid #eee; padding-bottom: calc(15px + env(safe-area-inset-bottom)); }
        input { flex: 1; padding: 12px 18px; border: 1px solid #ddd; border-radius: 25px; font-size: 1rem; outline: none; background: #fafafa; }
        .btn { padding: 8px 18px; margin-left: 8px; border-radius: 25px; cursor: pointer; border: none; font-size: 0.95rem; transition: 0.2s; }
        .send-btn { background: #4a3e35; color: white; }
        .clear-btn { background: #eee; color: #666; }
    </style>
</head>
<body>
    <header><h3>KHYEN AI མཁྱེན།</h3><span style="font-size:0.75rem;color:#999;letter-spacing:1px;">Intelligence Rooted in Tibetan Wisdom</span></header>
    <div id="chat"></div>
    <div id="input-container">
        <button class="btn clear-btn" onclick="document.getElementById('text').value=''">清</button>
        <input id="text" placeholder="向智者提议..." onkeypress="if(event.keyCode==13) send()" inputmode="search" />
        <button class="btn send-btn" onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        const quotes = [
            "གང་ཚེ་རྐང་གཉིས་གཙོ་བོ་ཁྱོད་བལྟམས་ཚེ། །\\nས་ཆེན་འདི་ལ་གོམ་པ་བདུན་བོར་ནས། །\\nང་ནི་འཇིག་རྟེན་འདི་ན་མཆོག་ཅེས་གསུངས། །\\nདེ་ཚེ་མཁས་པ་ཁྱོད་ལ་ཕྱག་འཚལ་ལོ།།\\n两足尊者初降世，七步莲华踏大地，朗声宣言我独尊，智者于此恭敬礼。",
            "ཁ་བཏགས་ནི་གངས་ལྟར་དཀར་བའི་ལྷག་བསམ་མཚོན་བྱེད་དུ་རེད།\\n哈达如雪山洁白，象征赤诚之心。",
            "བལྟས་ན་སྐྱིད་སྐྱིད་འདྲ་བའི་འཇིག་རྟེན་གྱི་ཕུན་ཚོགས།།\\n看似幸福的世间万物，闻来各有自身的千愁万绪。"
        ];
        window.onload = () => { add(quotes[Math.floor(Math.random()*quotes.length)], 'ai'); };
        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            div.innerText = text;
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }
        async function send(){
            const input = document.getElementById('text');
            const text = input.value.trim();
            if(!text) return;
            add(text, 'user');
            input.value = '';
            const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:text}) });
            const data = await res.json();
            add(data.reply, 'ai');
        }
    </script>
</body>
</html>
`);
    } 
    else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const { message } = JSON.parse(body);
            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、温暖庄重的藏族学者。规则：1.镜像语言。2.逻辑层次：复杂问题分要点解析，使用清晰的段落。3.人文深度：拒绝空洞辞令，从文化哲学视角切入。4.严禁文字表情。";

            const postData = JSON.stringify({
                model: "deepseek-chat",
                messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }]
            });

            const options = {
                hostname: 'api.deepseek.com',
                path: '/v1/chat/completions',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY }
            };

            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        const reply = json.choices[0].message.content || '...';
                        res.end(JSON.stringify({ reply }));
                    } catch (e) { res.end(JSON.stringify({ reply: '解析异常' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
