const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    // 1. 路由：封面页
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, content) => {
            if (err) { 
                res.writeHead(500); 
                res.end('Error: Please ensure index.html exists in your GitHub repo.'); 
            }
            else { 
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); 
                res.end(content); 
            }
        });
    } 
    // 2. 路由：功能对话页 (点进入按钮后到这里)
    else if (req.url === '/chat') {
        const chatPage = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Khyen AI - 对话</title>
            <style>
                body { background: #faf7f2; font-family: 'Georgia', serif; display: flex; flex-direction: column; height: 100vh; margin: 0; }
                .chat-header { background: #2a1a0a; color: #D4A017; padding: 15px; text-align: center; letter-spacing: 4px; font-size: 14px; }
                #chat-box { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }
                .msg { max-width: 80%; padding: 12px 18px; border-radius: 15px; font-size: 15px; line-height: 1.6; }
                .ai-msg { background: white; border: 1px solid #D4A017; align-self: flex-start; color: #2a1a0a; }
                .user-msg { background: #D4A017; color: white; align-self: flex-end; }
                .input-area { background: white; padding: 20px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px; }
                input { flex: 1; padding: 12px; border: 1px solid #D4A017; border-radius: 5px; outline: none; }
                button { background: #2a1a0a; color: #D4A017; border: none; padding: 10px 25px; cursor: pointer; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="chat-header">མཁྱེན། KHYEN AI 智库大脑</div>
            <div id="chat-box">
                <div class="msg ai-msg">扎西德勒！指挥官，我是您的藏文化智库 AI。请问今天有什么我可以帮您的？</div>
            </div>
            <div class="input-area">
                <input type="text" id="user-input" placeholder="输入您想了解的藏文化知识...">
                <button onclick="sendMsg()">发送</button>
            </div>
            <script>
                function sendMsg() {
                    const input = document.getElementById('user-input');
                    const box = document.getElementById('chat-box');
                    if (!input.value) return;
                    
                    // 添加用户消息
                    box.innerHTML += '<div class="msg user-msg">' + input.value + '</div>';
                    // 模拟回复（未来这里会接入真正的AI）
                    setTimeout(() => {
                        box.innerHTML += '<div class="msg ai-msg">（智慧连接中）我已收到您的提问：“' + input.value + '”。</div>';
                        box.scrollTop = box.scrollHeight;
                    }, 800);
                    
                    input.value = '';
                    box.scrollTop = box.scrollHeight;
                }
            </script>
        </body>
        </html>`;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(chatPage);
    }
    else { 
        res.writeHead(404); 
        res.end('Page Not Found'); 
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => { console.log("Khyen AI 2.0 运行中..."); });
