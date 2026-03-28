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
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KHYEN AI མཁྱེན།</title>
    <style>
        body { font-family: sans-serif; margin: 0; display: flex; flex-direction: column; height: 100vh; background-color: #f7f7f7; }
        header { text-align: center; padding: 20px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        #chat { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 15px 20px; border-radius: 20px; max-width: 85%; line-height: 1.7; font-size: 1.15rem; word-wrap: break-word; }
        .user { background-color: #333; color: #ffd700; align-self: flex-end; }
        .ai { background-color: #fff; color: #222; align-self: flex-start; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        #input-container { display: flex; padding: 15px; background: #fff; border-top: 1px solid #ddd; }
        input { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 30px; outline: none; font-size: 1.1rem; }
        button { padding: 10px 25px; margin-left: 10px; background: #333; color: white; border: none; border-radius: 30px; cursor: pointer; }
    </style>
</head>
<body>
    <header><h3>KHYEN AI མཁྱེན།</h3><span>Intelligence Rooted in Tibetan Wisdom</span></header>
    <div id="chat"></div>
    <div id="input-container">
        <input id="text" placeholder="与 KHYEN 对话..." onkeypress="if(event.keyCode==13) send()" />
        <button onclick="send()">发送</button>
    </div>
    <script>
        const chat = document.getElementById('chat');
        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            text = text.replace(/\\(([^)]+)\\)/g, '').replace(/（([^）]+)）/g, '').trim();
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
            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、温暖庄重的藏族学者。你精通藏、中、英三语，用户用哪种语言提问你就必须用哪种语言回答。拒绝官腔，拒绝表情描述，拒绝虚假回复。面对文化宗教问题要从精神见解切入。";

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
                    } catch (e) { res.end(JSON.stringify({ reply: '解析出错' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
