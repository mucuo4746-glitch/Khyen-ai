const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 1. 首页：显示你的 index.html 封面
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end('Error: index.html not found');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(content);
            }
        });
    } 
    // 2. 对话页：点击“进入”后跳转到这里
    else if (req.url === '/chat') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Khyen AI - 对话中</title>
                <style>
                    body { background: #faf7f2; display: flex; flex-direction: column; height: 100vh; margin: 0; font-family: serif; }
                    .header { background: #2a1a0a; color: #D4A017; padding: 15px; text-align: center; letter-spacing: 2px; }
                    #chat { flex: 1; padding: 20px; overflow-y: auto; }
                    .input-box { padding: 20px; border-top: 1px solid #ddd; display: flex; gap: 10px; background: white; }
                    input { flex: 1; padding: 10px; border: 1px solid #D4A017; border-radius: 4px; }
                    button { background: #2a1a0a; color: #D4A017; border: none; padding: 10px 20px; cursor: pointer; }
                </style>
            </head>
            <body>
                <div class="header">མཁྱེན། KHYEN AI 智库大脑</div>
                <div id="chat">智库已就绪，请输入您的问题...</div>
                <div class="input-box">
                    <input type="text" placeholder="聊聊藏文化...">
                    <button onclick="alert('大脑连接中，请稍候！')">发送</button>
                </div>
            </body>
            </html>
        `);
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log('Khyen AI 运行中...'); });
