const http = require('http');
const https = require('https');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI</title><style>body{font-family:serif;background:#f7f3e8;display:flex;flex-direction:column;height:100vh;margin:0}#chat{flex:1;overflow-y:auto;padding:20px}#input{padding:20px;background:white;border-top:1px solid #ddd;display:flex}textarea{flex:1;padding:12px;border-radius:8px;border:1px solid #ccc;font-size:16px}button{background:#5c4b3a;color:white;padding:10px 20px;margin-left:10px;border-radius:8px;border:none;cursor:pointer}</style></head><body><div id="chat"></div><div id="input"><textarea id="t" placeholder="向智者请教..." rows="2"></textarea><button onclick="s()">发送</button></div><script>const c=document.getElementById('chat');function a(t,y){const d=document.createElement('div');d.innerText=t;d.style.margin='15px 0';d.style.padding='10px';d.style.background=y==='u'?'#eee':'white';d.style.borderRadius='8px';c.appendChild(d);c.scrollTop=c.scrollHeight}async function s(){const v=document.getElementById('t').value;if(!v)return;a('我: '+v,'u');document.getElementById('t').value='';const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const d=await r.json();a('KHYEN: '+d.reply,'a')}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', async () => {
            const { message } = JSON.parse(body);
            const sys = "你叫 KHYEN AI མཁྱེན།。博学睿智。请用藏汉双语回复。";

            // 逻辑 1：调用 Claude
            const callClaude = () => new Promise(resolve => {
                const postData = JSON.stringify({ model: "claude-3-5-sonnet-latest", max_tokens: 1024, system: sys, messages: [{ role: "user", content: message }] });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => { try { const j = JSON.parse(d); resolve(j.content ? j.content[0].text : "CLAUDE_ERR"); } catch(e){ resolve("CLAUDE_ERR"); } });
                });
                reqApi.on('error', () => resolve("CLAUDE_ERR")); reqApi.write(postData); reqApi.end();
            });

            // 逻辑 2：调用 DeepSeek
            const callDeepSeek = () => new Promise(resolve => {
                const postData = JSON.stringify({ model: "deepseek-chat", messages: [{role:"system", content:sys}, {role:"user", content:message}] });
                const reqApi = https.request({
                    hostname: 'api.deepseek.com', path: '/chat/completions', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => { try { const j = JSON.parse(d); resolve(j.choices ? j.choices[0].message.content : "DEEPSEEK_ERR"); } catch(e){ resolve("DEEPSEEK_ERR"); } });
                });
                reqApi.on('error', () => resolve("DEEPSEEK_ERR")); reqApi.write(postData); reqApi.end();
            });

            let reply = await callClaude();
            // 核心补丁：如果 Claude 返回错误字样，立即强切
            if (reply === "CLAUDE_ERR" || reply.includes("model") || reply.includes("error")) {
                reply = await callDeepSeek();
            }

            if (reply === "DEEPSEEK_ERR") {
                reply = "❌ 两位智者都在闭关。请确认 5 美金是否真的到账，或者稍后再试。";
            }
            res.end(JSON.stringify({ reply }));
        });
    }
});
server.listen(process.env.PORT || 10000);
