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

            // 这里的优化：兼容两种常见的命名方式
            const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
            const dsKey = process.env.DEEPSEEK_API_KEY;

            // 逻辑 1：调用 Claude
            const callClaude = () => new Promise(resolve => {
                if(!claudeKey) return resolve(null);
                const postData = JSON.stringify({ model: "claude-3-5-sonnet-latest", max_tokens: 1024, system: sys, messages: [{ role: "user", content: message }] });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': claudeKey, 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => { 
                        try { 
                            const j = JSON.parse(d); 
                            if(j.content) resolve(j.content[0].text);
                            else resolve("Claude 提示: " + (j.error ? j.error.message : "未知错误")); 
                        } catch(e){ resolve(null); } 
                    });
                });
                reqApi.on('error', () => resolve(null)); reqApi.write(postData); reqApi.end();
            });

            // 逻辑 2：调用 DeepSeek
            const callDeepSeek = () => new Promise(resolve => {
                if(!dsKey) return resolve(null);
                const postData = JSON.stringify({ model: "deepseek-chat", messages: [{role:"system", content:sys}, {role:"user", content:message}] });
                const reqApi = https.request({
                    hostname: 'api.deepseek.com', path: '/chat/completions', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${dsKey}` }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => { try { const j = JSON.parse(d); resolve(j.choices ? j.choices[0].message.content : null); } catch(e){ resolve(null); } });
                });
                reqApi.on('error', () => resolve(null)); reqApi.write(postData); reqApi.end();
            });

            let reply = await callClaude();
            // 如果 Claude 返回了具体的错误（比如权限、额度），我们直接显示，不再跳 DeepSeek，除非 Claude 完全拨不通
            if (!reply || reply.includes("Claude 提示")) {
                const dsReply = await callDeepSeek();
                if (dsReply) reply = "[Claude 暂不可用，已转接 DeepSeek] " + dsReply;
                else reply = reply || "❌ 所有通道均未拨通，请检查 Render 后台 Key 是否填对。";
            }
            res.end(JSON.stringify({ reply }));
        });
    }
});
server.listen(process.env.PORT || 10000);
