const http = require('http');
const https = require('https');

// --- 再次确认：双引号包裹，末尾分号 ---
const MY_ANTHROPIC_KEY = "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";
const MY_DEEPSEEK_KEY = "sk-CBahM3Cqj0Adl4YD828dEa5e0dB94e4a887bE42980FbA588";
const server = http.createServer((req, res) => {
    console.log('收到请求:', req.url); // 探针 1
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><title>KHYEN AI</title><style>body{font-family:serif;background:#f7f3e8;padding:20px}#chat{margin-bottom:20px}#input{display:flex}textarea{flex:1;padding:10px}button{margin-left:10px}</style></head><body><div id="chat"></div><div id="input"><textarea id="t" placeholder="输入内容..."></textarea><button onclick="s()">发送</button></div><script>async function s(){const v=document.getElementById('t').value;const d=document.createElement('div');d.innerText='我: '+v;document.getElementById('chat').appendChild(d);const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const j=await r.json();const a=document.createElement('div');a.innerText='KHYEN: '+j.reply;document.getElementById('chat').appendChild(a)}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', async () => {
            console.log('开始解析请求内容...'); // 探针 2
            const { message } = JSON.parse(body);
            
            // 构造最简单的请求
            const postData = JSON.stringify({ 
                model: "claude-3-5-sonnet-20241022", 
                max_tokens: 1024, 
                messages: [{ role: "user", content: message }] 
            });

            const options = {
                hostname: 'api.anthropic.com',
                path: '/v1/messages',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': MY_ANTHROPIC_KEY,
                    'anthropic-version': '2023-06-01'
                },
                timeout: 30000 // 30秒超时强制断开
            };

            console.log('正在向 Claude 发起连接...'); // 探针 3
            const reqApi = https.request(options, (apiRes) => {
                console.log('收到 Claude 响应状态码:', apiRes.statusCode); // 探针 4
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    console.log('Claude 响应读取完毕'); // 探针 5
                    res.end(JSON.stringify({ reply: d }));
                });
            });

            reqApi.on('error', (e) => {
                console.log('连接发生错误:', e.message); // 探针 6
                res.end(JSON.stringify({ reply: "连接失败: " + e.message }));
            });

            reqApi.on('timeout', () => {
                reqApi.destroy();
                console.log('请求超时了！'); // 探针 7
                res.end(JSON.stringify({ reply: "请求超时，对方不理我们。" }));
            });

            reqApi.write(postData);
            reqApi.end();
        });
    }
});
server.listen(process.env.PORT || 10000);
