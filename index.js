const http = require('http');
const https = require('https');

console.log('--- 智者系统启动检查 ---');
console.log('Key exists:', !!process.env.ANTHROPIC_API_KEY);
if (process.env.ANTHROPIC_API_KEY) {
    console.log('Key length:', process.env.ANTHROPIC_API_KEY.length);
}
console.log('-----------------------');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><title>KHYEN AI མཁྱེན།</title><style>body{font-family:serif;background:#f7f3e8;display:flex;flex-direction:column;height:100vh;margin:0}#chat{flex:1;overflow-y:auto;padding:20px}#input{padding:20px;background:white;border-top:1px solid #ddd;display:flex}textarea{flex:1;padding:12px;border-radius:8px;border:1px solid #ccc;font-size:16px;outline:none}button{background:#5c4b3a;color:white;padding:10px 20px;margin-left:10px;border-radius:8px;border:none;cursor:pointer;font-weight:bold}</style></head><body><div id="chat"></div><div id="input"><textarea id="t" placeholder="向智者请教..."></textarea><button onclick="s()">发送</button></div><script>const c=document.getElementById('chat');function a(t,y){const d=document.createElement('div');d.innerText=t;d.style.margin='15px 0';d.style.padding='12px';d.style.lineHeight='1.6';d.style.background=y==='u'?'#eee':'white';d.style.borderRadius='8px';d.style.boxShadow='0 2px 5px rgba(0,0,0,0.05)';c.appendChild(d);c.scrollTop=c.scrollHeight}async function s(){const v=document.getElementById('t').value;if(!v)return;a('我: '+v,'u');document.getElementById('t').value='';a('正在连接智者...','a');try {const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const d=await r.json();if(c.lastChild)c.lastChild.remove();a('KHYEN: '+d.reply,'a')} catch(e) { if(c.lastChild)c.lastChild.remove();a('KHYEN: 连接失败。','a')}}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', x => body += x);
        req.on('end', async () => {
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
                    console.log('--- Anthropic API 响应详情 ---');
                    console.log('Status Code:', apiRes.statusCode); // 打印状态码
                    let d = ''; apiRes.on('data', x => d += x);
                    apiRes.on('end', () => {
                        console.log('Error Body:', d); // 在日志里打印完整报错文档
                        try {
                            const j = JSON.parse(d);
                            if (j.error) {
                                res.end(JSON.stringify({ reply: `智者整理经书中。状态码: ${apiRes.statusCode}，报错: ${JSON.stringify(j.error)}` }));
                            } else {
                                res.end(JSON.stringify({ reply: j.content[0].text }));
                            }
                        } catch(e) { res.end(JSON.stringify({ reply: "解析响应失败。" })); }
                    });
                });
                reqApi.on('error', e => res.end(JSON.stringify({ reply: "网络连接中断。" })));
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ reply: "请求异常。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
