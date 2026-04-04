const http = require('http');
const https = require('https');

// 1. 核心后端逻辑
const server = http.createServer((req, res) => {
  // 处理 API 对话请求
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const postData = JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 1024,
          messages: payload.messages
        });

        const apiReq = https.request({
          hostname: 'api.anthropic.com',
          path: '/v1/messages',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY.trim(),
            'anthropic-version': '2023-06-01'
          }
        }, apiRes => {
          let responseData = '';
          apiRes.on('data', d => { responseData += d; });
          apiRes.on('end', () => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            try {
              const json = JSON.parse(responseData);
              if (json.content && json.content[0]) {
                res.end(JSON.stringify({ reply: json.content[0].text }));
              } else {
                res.end(JSON.stringify({ error: "API未返回有效内容" }));
              }
            } catch (e) { res.end(JSON.stringify({ error: "响应解析失败" })); }
          });
        });
        apiReq.on('error', e => {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        });
        apiReq.write(postData);
        apiReq.end();
      } catch (e) {
        res.end(JSON.stringify({ error: "请求解析失败" }));
      }
    });
    return;
  }

  // 2. 默认返回前端界面（确保 HTML 始终能正确显示）
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>KHYEN AI</title>
    <style>
        body{font-family:serif;background:#fdfbf7;margin:0;display:flex;flex-direction:column;height:100vh}
        #h{background:#8e2323;color:#fff;padding:15px;text-align:center}
        #c{flex:1;overflow-y:auto;padding:20px}
        .m{margin-bottom:15px;padding:10px;border-radius:8px;max-width:80%}
        .u{background:#e6d5b8;align-self:flex-end;margin-left:auto}
        .a{background:#fff;border:1px solid #ddd}
        #i{padding:20px;display:flex;gap:10px;border-top:1px solid #ddd}
        input{flex:1;padding:10px}
        button{background:#8e2323;color:#fff;border:none;padding:10px 20px;cursor:pointer}
    </style>
</head>
<body>
    <div id="h">མཁྱེན། KHYEN AI</div>
    <div id="c"></div>
    <div id="i">
        <input id="t" placeholder="输入消息...">
        <button onclick="send()">发送</button>
    </div>
    <script>
        let h=[];
        const c=document.getElementById('c');
        function add(txt,cls){
            const d=document.createElement('div');
            d.className='m '+cls;d.innerText=txt;
            c.appendChild(d);c.scrollTop=c.scrollHeight;
        }
        async function send(){
            const v=document.getElementById('t').value;if(!v)return;
            add(v,'u');h.push({role:'user',content:v});
            document.getElementById('t').value='';
            try{
                const r=await fetch('/api/chat',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify({messages:h})
                });
                const d=await r.json();
                if(d.reply){add(d.reply,'a');h.push({role:'assistant',content:d.reply});}
                else{add("错误: "+d.error,'a');}
            }catch(e){add("连接失败",'a');}
        }
    </script>
</body>
</html>`);
});

server.listen(process.env.PORT || 10000);
