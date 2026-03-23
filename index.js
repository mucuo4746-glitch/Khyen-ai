const http = require('http');

// 1. 生命维持系统：让服务器能呼吸
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>智库大脑运行中！指挥官，请开始你的提问。</h1>');
});

// 2. 智库大脑日志
console.log("智库大脑已就绪。");

// 3. 开启监听（这是防止服务器自杀的关键）
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`服务已启动，端口：${PORT}`);
});
