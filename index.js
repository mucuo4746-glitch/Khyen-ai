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

            // 核心逻辑：逐个尝试 Claude 的不同模型别名
            const models = ["claude-3-5-sonnet-latest", "claude-3-5-sonnet-20240620", "claude-3-haiku-20240307"];
            
            const callClaude = (modelName) => new Promise(resolve => {
                const postData = JSON.stringify({ model: modelName, max_tokens: 1024, system: sys, messages: [{ role: "user", content: message }] });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => { try { const j = JSON.parse(d); resolve(j.content ? j.content[0].text : "ERR:" + j.error.type); } catch(e){ resolve("ERR:parse"); } });
                });
                reqApi.on('error', () => resolve("ERR:net")); reqApi.write(postData); reqApi.end();
            });

            const callDeepSeek = () => new Promise(resolve => {
                const postData = JSON.stringify({ model: "deepseek-chat", messages: [{role:"system", content:sys}, {role:"user", content:message}] });
                const reqApi = https.request({
                    hostname: 'api.deepseek.com', path: '/chat/completions', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => { try { const j = JSON.parse(d); resolve(j.choices ? j.choices[0].message.content : "DS_ERR"); } catch(e){ resolve("DS_ERR"); } });
                });
                reqApi.on('error', () => resolve("DS_ERR")); reqApi.write(postData); reqApi.end();
            });

            let reply = "";
            for (let m of models) {
                reply = await callClaude(m);
                if (!reply.startsWith("ERR:")) break; // 只要有一个模型通了，就收工
            }

            if (reply.startsWith("ERR:")) {
                const dsReply = await callDeepSeek();
                reply = dsReply !== "DS_ERR" ? "[Claude 握手失败，已转接 DeepSeek] " + dsReply : "⚠️ 所有模型均未响应。请检查 Render 后台 Key 填写的空格或特殊字符。";
            }
            
            res.end(JSON.stringify({ reply }));
        });
    }
});
server.listen(process.env.PORT || 10000);
