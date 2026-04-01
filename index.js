const http = require('http');
const https = require('https');

// --- 强制测试区域：请在这里直接填入你的 Key ---
const MY_ANTHROPIC_KEY = "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";
const MY_DEEPSEEK_KEY = "sk-CBahM3Cqj0Adl4YD828dEa5e0dB94e4a887bE42980FbA588";

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI</title><style>body{font-family:serif;background:#f7f3e8;display:flex;flex-direction:column;height:100vh;margin:0}#chat{flex:1;overflow-y:auto;padding:20px}#input{padding:20px;background:white;border-top:1px solid #ddd;display:flex}textarea{flex:1;padding:12px;border-radius:8px;border:1px solid #ccc;font-size:16px}button{background:#5c4b3a;color:white;padding:10px 20px;margin-left:10px;border-radius:8px;border:none;cursor:pointer}</style></head><body><div id="chat"></div><div id="input"><textarea id="t" placeholder="向智者请教..." rows="2"></textarea><button onclick="s()">发送</button></div><script>const c=document.getElementById('chat');function a(t,y){const d=document.createElement('div');d.innerText=t;d.style.margin='15px 0';d.style.padding='10px';d.style.background=y==='u'?'#eee':'white';d.style.borderRadius='8px';c.appendChild(d);c.scrollTop=c.scrollHeight}async function s(){const v=document.getElementById('t').value;if(!v)return;a('我: '+v,'u');document.getElementById('t').value='';const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const d=await r.json();a('KHYEN: '+d.reply,'a')}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', async () => {
            const { message } = JSON.parse(body);
            const sys = "你叫 KHYEN AI མཁྱེན།。博学睿智。请用藏汉双语回复。";

            const callApi = (hostname, path, headers, postData) => new Promise(resolve => {
                const reqApi = https.request({ hostname, path, method: 'POST', headers }, (apiRes) => {
                    let d = ''; apiRes.on('data', c => d += c);
                    apiRes.on('end', () => resolve(d));
                });
                reqApi.on('error', (e) => resolve("NET_ERR:" + e.message));
                reqApi.write(postData); reqApi.end();
            });

            // 1. 尝试 Claude
            const claudeData = JSON.stringify({ model: "claude-3-5-sonnet-20241022", max_tokens: 1024, system: sys, messages: [{ role: "user", content: message }] });
            let result = await callApi('api.anthropic.com', '/v1/messages', { 
                'Content-Type': 'application/json', 'x-api-key': MY_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' 
            }, claudeData);

            try {
                const j = JSON.parse(result);
                if (j.content) {
                    res.end(JSON.stringify({ reply: j.content[0].text }));
                    return;
                }
            } catch(e) {}

            // 2. 如果 Claude 失败，尝试 DeepSeek
            const dsData = JSON.stringify({ model: "deepseek-chat", messages: [{role:"system", content:sys}, {role:"user", content:message}] });
            let dsResult = await callApi('api.deepseek.com', '/chat/completions', {
                'Content-Type': 'application/json', 'Authorization': `Bearer ${MY_DEEPSEEK_KEY}`
            }, dsData);

            try {
                const dj = JSON.parse(dsResult);
                if (dj.choices) {
                    res.end(JSON.stringify({ reply: "[由 DeepSeek 强力驱动] " + dj.choices[0].message.content }));
                    return;
                }
            } catch(e) {}

            res.end(JSON.stringify({ reply: "⚠️ 强制测试报告：\nClaude 返回：" + result + "\nDeepSeek 返回：" + dsResult }));
        });
    }
});
server.listen(process.env.PORT || 10000);
