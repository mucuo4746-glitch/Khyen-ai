const http = require('http');
const https = require('https');

// --- 终极排查逻辑 ---
const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title><style>body{font-family:serif;background:#f7f3e8;display:flex;flex-direction:column;height:100vh;margin:0}#chat{flex:1;overflow-y:auto;padding:20px}#input{padding:20px;background:white;border-top:1px solid #ddd;display:flex}textarea{flex:1;padding:12px;border-radius:8px;border:1px solid #ccc;font-size:16px;outline:none}button{background:#5c4b3a;color:white;padding:10px 20px;margin-left:10px;border-radius:8px;border:none;cursor:pointer;font-weight:bold}</style></head><body><div id="chat"></div><div id="input"><textarea id="t" placeholder="向智者请教..."></textarea><button onclick="s()">发送</button></div><script>const c=document.getElementById('chat');function a(t,y){const d=document.createElement('div');d.innerText=t;d.style.margin='15px 0';d.style.padding='12px';d.style.lineHeight='1.6';d.style.background=y==='u'?'#eee':'white';d.style.borderRadius='8px';d.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';c.appendChild(d);c.scrollTop=c.scrollHeight}async function s(){const v=document.getElementById('t').value;if(!v)return;a('我: '+v,'u');document.getElementById('t').value='';a('མཁྱེན། Khyen 正在思索...','a');const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const d=await r.json();if(c.lastChild)c.lastChild.remove();a('KHYEN: '+d.reply,'a')}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
            if (!MY_ANTHROPIC_KEY || MY_ANTHROPIC_KEY.length < 10) {
                res.end(JSON.stringify({ reply: "⚠️ 警报：服务器没能读取到你的 Key！请检查 Render 的 Environment 变量名是否叫 ANTHROPIC_API_KEY。" }));
                return;
            }
            try {
                const { message } = JSON.parse(body);
                const postData = JSON.stringify({ 
                    model: "claude-3-5-sonnet-20241022", 
                    max_tokens: 1024, 
                    system: "你叫 KHYEN AI མཁྱེན།。是一位精通藏汉文化的睿智导师。请务必使用藏汉双语回复。",
                    messages: [{ role: "user", content: message }] 
                });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'x-api-key': MY_ANTHROPIC_KEY.trim(), 
                        'anthropic-version': '2023-06-01'
                    }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', x => d += x);
                    apiRes.on('end', () => {
                        const j = JSON.parse(d);
                        if (j.error) {
                            res.end(JSON.stringify({ reply: "智者闭关中，错误代码：" + j.error.type }));
                        } else {
                            res.end(JSON.stringify({ reply: j.content[0].text }));
                        }
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ reply: "逻辑电路阻断。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
