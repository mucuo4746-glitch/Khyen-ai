const http = require('http');
const https = require('https');

// --- ⚠️ 关键中的关键：请在这里填入完整且正确的 Key ---
// 必须以 "sk-ant-api03-..." 开头，确认中间没有空格，两边有双引号。
const MY_ANTHROPIC_KEY = "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";
const MY_DEEPSEEK_KEY = "sk-CBahM3Cqj0Adl4YD828dEa5e0dB94e4a887bE42980FbA588";

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>KHYEN AI མཁྱེན།</title><style>body{font-family:serif;background:#f7f3e8;display:flex;flex-direction:column;height:100vh;margin:0}#chat{flex:1;overflow-y:auto;padding:20px}#input{padding:20px;background:white;border-top:1px solid #ddd;display:flex}textarea{flex:1;padding:12px;border-radius:8px;border:1px solid #ccc;font-size:16px;outline:none}button{background:#5c4b3a;color:white;padding:10px 20px;margin-left:10px;border-radius:8px;border:none;cursor:pointer;font-weight:bold}</style></head><body><div id="chat"></div><div id="input"><textarea id="t" placeholder="向智者请教..."></textarea><button onclick="s()">发送</button></div><script>const c=document.getElementById('chat');function a(t,y){const d=document.createElement('div');d.innerText=t;d.style.margin='15px 0';d.style.padding='12px';d.style.lineHeight='1.6';d.style.background=y==='u'?'#eee':'white';d.style.borderRadius='8px';d.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';c.appendChild(d);c.scrollTop=c.scrollHeight}async function s(){const v=document.getElementById('t').value;if(!v)return;a('我: '+v,'u');document.getElementById('t').value='';a('མཁྱེན། Khyen 正在思索...','a');const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const d=await r.json();c.lastChild.remove();a('KHYEN: '+d.reply,'a')}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
            const { message } = JSON.parse(body);
            const sys = "你叫 KHYEN AI མཁྱེན།。是一位精通藏汉文化的睿智导师。请务必使用藏汉双语回复。";
            const postData = JSON.stringify({ model: "claude-3-5-sonnet-20241022", max_tokens: 1024, system: sys, messages: [{ role: "user", content: message }] });
            
            const reqApi = https.request({
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': MY_ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' }
            }, (apiRes) => {
                let d = ''; apiRes.on('data', x => d += x);
                apiRes.on('end', () => {
                    try {
                        const j = JSON.parse(d);
                        res.end(JSON.stringify({ reply: j.content ? j.content[0].text : "验证失败，请检查 Key。" }));
                    } catch(e) { res.end(JSON.stringify({ reply: "系统开小差了。" })); }
                });
            });
            reqApi.on('error', (e) => res.end(JSON.stringify({ reply: "连接中断: " + e.message })));
            reqApi.write(postData); reqApi.end();
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
