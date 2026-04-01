const http = require('http');
const https = require('https');

// --- 再次确认：双引号包裹，末尾分号 ---
const MY_ANTHROPIC_KEY = "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";
const MY_DEEPSEEK_KEY = "sk-CBahM3Cqj0Adl4YD828dEa5e0dB94e4a887bE42980FbA588";

// 关键修复：显式定义端口
const PORT = process.env.PORT || 10000;

const server = http.createServer((req, res) => {
    console.log('收到请求:', req.url);
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head><meta charset="UTF-8"><title>KHYEN AI</title></head><body><div id="chat"></div><input id="t"><button onclick="s()">发送</button><script>async function s(){const v=document.getElementById('t').value;const d=document.createElement('p');d.innerText='我: '+v;document.getElementById('chat').appendChild(d);const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({message:v})});const j=await r.json();const a=document.createElement('p');a.innerText='KHYEN: '+j.reply;document.getElementById('chat').appendChild(a)}</script></body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = ''; req.on('data', c => body += c);
        req.on('end', async () => {
            const { message } = JSON.parse(body);
            console.log('正在调用 Claude...');

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
                }
            };

            const reqApi = https.request(options, (apiRes) => {
                let d = ''; apiRes.on('data', c => d += c);
                apiRes.on('end', () => {
                    console.log('Claude 响应成功');
                    res.end(JSON.stringify({ reply: d }));
                });
            });

            reqApi.on('error', (e) => {
                console.log('错误:', e.message);
                res.end(JSON.stringify({ reply: "连接失败: " + e.message }));
            });

            reqApi.write(postData);
            reqApi.end();
        });
    }
});

// 关键修复：改用 0.0.0.0 监听，让 Render 必能扫到
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 门已打开！正在端口 ${PORT} 守候...`);
});
