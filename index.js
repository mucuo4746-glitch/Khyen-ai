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
        header { text-align: center; padding: 12px; background: rgba(255,255,255,0.8); backdrop-filter: blur(4px); box-shadow: 0 1px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; }
        header h3 { margin: 0; font-size: 1.2rem; color: #4a3e35; }
        #chat { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; }
        .msg { margin: 10px 0; padding: 14px 18px; border-radius: 18px; max-width: 85%; line-height: 1.8; font-size: 1.05rem; word-wrap: break-word; position: relative; }
        .user { background: #4a3e35; color: #f1d592; align-self: flex-end; border-bottom-right-radius: 2px; }
        .ai { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        
        /* 复制按钮样式 */
        .copy-btn { font-size: 0.7rem; color: #999; cursor: pointer; margin-top: 5px; display: block; text-align: right; }
        
        #input-container { display: flex; flex-direction: column; padding: 10px; background: white; border-top: 1px solid #eee; }
        .toolbar { display: flex; justify-content: space-between; padding-bottom: 8px; }
        
        /* 💡 换行输入框优化 */
        textarea { width: 100%; border: 1px solid #ddd; border-radius: 15px; padding: 12px; font-size: 1rem; outline: none; background: #fafafa; resize: none; min-height: 44px; max-height: 150px; font-family: inherit; }
        
        .action-bar { display: flex; justify-content: flex-end; margin-top: 8px; gap: 10px; }
        .btn { padding: 8px 18px; border-radius: 20px; cursor: pointer; border: none; font-size: 0.9rem; font-weight: 500; }
        .send-btn { background: #4a3e35; color: white; }
        .opt-btn { background: #eee; color: #666; }
    </style>
</head>
<body>
    <header>
        <div style="width: 20px;"></div>
        <div><h3>KHYEN AI མཁྱེན།</h3></div>
        <button class="btn opt-btn" style="padding: 5px 10px; font-size: 0.7rem;" onclick="saveChat()">保存</button>
    </header>
    <div id="chat"></div>
    <div id="input-container">
        <textarea id="text" placeholder="向智者提议（可输入多行）..." rows="1" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
        <div class="action-bar">
            <button class="btn opt-btn" onclick="document.getElementById('text').value='';document.getElementById('text').style.height='auto'">清空</button>
            <button class="btn send-btn" onclick="send()">发送</button>
        </div>
    </div>
    <script>
        const chat = document.getElementById('chat');
        const quotes = [
            "གང་ཚེ་རྐང་གཉིས་གཙོ་བོ་ཁྱོད་བལྟམས་ཚེ། །\\nས་ཆེན་འདི་ལ་གོམ་པ་བདུན་བོར་ནས། །\\nང་ནི་འཇིག་རྟེན་འདི་ན་མཆོག་ཅེས་གསུངས། །\\nདེ་ཚེ་མཁས་པ་ཁྱོད་ལ་ཕྱག་འཚལ་ལོ།།\\n两足尊者初降世，七步莲华踏大地，朗声宣言我独尊，智者于此恭敬礼。"
        ];
        
        window.onload = () => { add(quotes[0], 'ai'); };

        function add(text, type){
            const div = document.createElement('div');
            div.className = 'msg ' + type;
            const content = document.createElement('div');
            content.innerText = text;
            div.appendChild(content);
            
            if(type === 'ai') {
                const copy = document.createElement('span');
                copy.className = 'copy-btn';
                copy.innerText = '复制智慧';
                copy.onclick = () => {
                    navigator.clipboard.writeText(text);
                    copy.innerText = '已存入法库';
                    setTimeout(() => copy.innerText = '复制智慧', 2000);
                };
                div.appendChild(copy);
            }
            
            chat.appendChild(div);
            chat.scrollTop = chat.scrollHeight;
        }

        async function send(){
            const input = document.getElementById('text');
            const text = input.value.trim();
            if(!text) return;
            add(text, 'user');
            input.value = '';
            input.style.height = 'auto';
            const res = await fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({message:text}) });
            const data = await res.json();
            add(data.reply, 'ai');
        }

        function saveChat() {
            const history = Array.from(document.querySelectorAll('.msg')).map(m => m.innerText).join('\\n\\n---内容分割---\\n\\n');
            const blob = new Blob([history], {type: 'text/plain'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'KHYEN_AI_智慧对话录.txt';
            a.click();
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
            const systemPrompt = "你叫 KHYEN AI མཁྱེན།。你是一位博学睿智、温暖庄重的藏族学者。规则：1.镜像语言。2.逻辑层次分明，使用清晰段落。3.人文哲学视角。4.严禁表情文字。";
            const postData = JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: message }] });
            const options = { hostname: 'api.deepseek.com', path: '/v1/chat/completions', method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + process.env.DEEPSEEK_API_KEY } };
            const apiReq = https.request(options, (apiRes) => {
                let data = '';
                apiRes.on('data', chunk => data += chunk);
                apiRes.on('end', () => {
                    try { const json = JSON.parse(data); res.end(JSON.stringify({ reply: json.choices[0].message.content || '...' })); } 
                    catch (e) { res.end(JSON.stringify({ reply: '解析异常' })); }
                });
            });
            apiReq.write(postData); apiReq.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
