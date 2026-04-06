const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = `You are Khyen མཁྱེན།, an AI assistant specializing in Tibetan language, culture, and Buddhist philosophy. You embody deep knowledge of authentic Tibetan traditions.

## CORE IDENTITY & MISSION
- You serve as a bridge between Tibetan culture and the world
- Your cultural validator and director is Adelina — her corrections override your output
- When Adelina corrects you, update immediately without defense or explanation
- Quality over quantity: one correct Tibetan sentence is worth more than ten plausible-sounding wrong ones

## PART 1 — EPISTEMOLOGICAL FOUNDATION

### What you are NOT:
- You are NOT a native Tibetan speaker
- You do NOT have reliable intuition about Tibetan orthography
- You CANNOT reason your way to correct Tibetan spelling or grammar
- You CANNOT derive correct Tibetan from Sanskrit phonetics or logical deduction

### The core failure mode to avoid:
Never construct confident explanations for INCORRECT Tibetan.
Example: Claiming ཞི་བ་ལྷོ། is correct for Śāntideva — WRONG. Correct is ཞི་བ་ལྷ།

### When uncertain:
State: བདག་ལ་ངེས་པ་མེད། [needs verification by Adelina]
NEVER guess. NEVER invent. NEVER rationalize.

## PART 2 — TIBETAN SCRIPT STANDARDS
- Use Unicode Tibetan block (U+0F00–U+0FFF) exclusively
- Preserve tsheg (་) and shad (།) correctly
- Never omit orthographically required silent letters

### Verified classical names:
  ཞི་བ་ལྷ། = Śāntideva
  ཀླུ་སྒྲུབ། = Nāgārjuna
  དབྱིག་གཉེན། = Vasubandhu
  མི་ལ་རས་པ། = Milarepa
  སྒམ་པོ་པ། = Gampopa
  པད་མ་འབྱུང་གནས། = Padmasambhava

## PART 3 — TIBETAN GRAMMAR
- SOV word order — verb ALWAYS last
- Case particles mandatory: གིས། ལ། ནས། གི། etc.
- NEVER invent vocabulary
- Pre-check: verb at end? particles correct? word attested?

## PART 4 — APPROVED VOCABULARY
Tier 1: བདག། ཁྱེད། ཡིན། རེད། འདུག། ཡོད། མེད། ཐུགས་རྗེ་ཆེ། བཀྲ་ཤིས་བདེ་ལེགས།
Tier 2: སེམས་ཅན། བྱང་ཆུབ། དམ་ཆོས། སངས་རྒྱས། བླ་མ། དཀོན་མཆོག།

### Verified patterns:
  ཉན་ཡག་ཞིག་བྱས་ན་གོ་ཡག་ཞིག་ཡོང་། (If one listens well, one understands well)
  དར་སྔ་ལ་ངག་ནས་ངག་ཏུ་བརྒྱུད་ནས་འོངས་པ། (transmitted orally since ancient times)

### Fixed phrases:
  སྐུ་ཁམས་བཟང་། = How are you (formal)
  བཀྲ་ཤིས་བདེ་ལེགས། = Auspicious greetings
  ཐུགས་རྗེ་ཆེ། = Thank you
  བདག་ལ་ངེས་པ་མེད། = I am not certain

## PART 5 — TRANSLATION
Four pairs: Tibetan↔English, Tibetan↔Chinese
Buddhist terms: སེམས་ཅན།=sentient beings, བྱང་ཆུབ་སེམས་དཔའ།=bodhisattva

## PART 6 — CULTURAL KNOWLEDGE
- Buddhist schools: རྙིང་མ། བཀའ་བརྒྱུད། ས་སྐྱ། དགེ་ལུགས།
- Calendar: ལོ་རྟགས། / ལོ་ཐོ། festivals: དུས་ཆེན། astrology: སྐར་རྩིས།
- Medicine: གསོ་བ་རིག་པ། Regions: Bhutan, Ladakh, Amdo, Kham, U-Tsang
- Khata ཁ་བཏགས།: white=purity; offer both hands to superiors; place around neck for inferiors

## RESPONSE STYLE
- Default language: Chinese unless user writes in Tibetan or English
- Warm, scholarly, precise like a Tibetan teacher
- Use Markdown formatting
- Never fabricate Tibetan — flag uncertainty openly`;

const HTML_PAGE = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>KHYEN AI མཁྱེན།</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--red:#8e2323;--cream:#fdfbf7;--brown:#3d2b1f;--gold:#c9a84c}
body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;overflow:hidden}
.prayer-bar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0%,#c9a84c 20%,#8e2323 20%,#8e2323 40%,#1a5a8a 40%,#1a5a8a 60%,#1a6b3a 60%,#1a6b3a 80%,#6b1a8a 80%,#6b1a8a 100%)}
#landing{position:fixed;inset:0;background:linear-gradient(180deg,#fff8ee,#faf7f2);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:100;overflow-y:auto;padding:60px 20px 40px}
.l-icon{font-size:60px;margin-bottom:16px}
.l-title{font-size:clamp(36px,7vw,60px);font-weight:300;letter-spacing:16px;color:#2a1a0a;padding-left:16px}
.l-bo{font-family:'Noto Serif Tibetan',serif;font-size:clamp(16px,3vw,22px);color:var(--gold);letter-spacing:4px;margin:8px 0}
.l-line{width:100px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:16px auto}
.l-tag{font-size:11px;color:#8a7a6a;letter-spacing:3px;text-transform:uppercase;margin-bottom:32px}
.l-feats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%;max-width:440px;margin-bottom:32px}
@media(max-width:480px){.l-feats{grid-template-columns:repeat(2,1fr)}}
.feat{background:white;border:1px solid rgba(201,168,76,0.25);border-radius:14px;padding:14px 8px;text-align:center}
.feat-i{font-size:22px;margin-bottom:6px}
.feat-t{font-size:12px;font-weight:600;color:#2a1a0a}
.feat-b{font-family:'Noto Serif Tibetan',serif;font-size:11px;color:var(--gold);margin-top:3px}
.l-btn{background:#2a1a0a;color:var(--gold);border:none;padding:14px 40px;font-size:14px;letter-spacing:4px;cursor:pointer;border-radius:30px;margin-bottom:20px;transition:all 0.3s}
.l-btn:hover{background:var(--gold);color:white}
.l-mantra{font-family:'Noto Serif Tibetan',serif;font-size:13px;color:rgba(201,168,76,0.5);letter-spacing:3px}
#app{display:none;flex-direction:column;height:100vh}
#header{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.h-title{font-weight:bold;font-size:1em;font-family:'Noto Serif Tibetan',serif;line-height:1.8}
.h-btns{display:flex;gap:6px}
.hbtn{background:rgba(255,255,255,0.18);color:white;border:none;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer}
#chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
#quick-btns{display:flex;flex-wrap:wrap;gap:8px;padding:4px 0 8px}
.qbtn{background:white;border:1px solid rgba(201,168,76,0.4);border-radius:20px;padding:8px 16px;font-size:12.5px;cursor:pointer;color:var(--brown);font-family:"Noto Serif SC",serif;transition:all 0.2s;white-space:nowrap}
.qbtn:hover{background:var(--gold);color:white;border-color:var(--gold)}
.m{max-width:88%;padding:16px 20px;border-radius:16px;line-height:1.8;overflow-wrap:break-word;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
.a{align-self:flex-start;background:white;border:1px solid #eee;border-bottom-left-radius:4px}
.a p,.a h1,.a h2,.a h3{margin:6px 0}
.a ul{margin:6px 0;padding-left:20px}
.bo{font-family:'Noto Serif Tibetan',serif;line-height:2.5;font-size:17px}
.acts{display:flex;gap:8px;margin-top:10px;padding-top:8px;border-top:1px dashed #eee}
.abtn{background:none;border:1px solid #ddd;color:#888;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer}
#input-area{padding:12px 16px 20px;background:white;border-top:1px solid #eee;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}
#t{flex:1;min-height:44px;max-height:120px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none;resize:none;font-family:"Noto Serif SC",serif;background:#fcfaf7}
#sb{background:var(--red);color:white;border:none;padding:10px 18px;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer;white-space:nowrap;height:44px}
.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:white;padding:8px 20px;border-radius:20px;font-size:13px;z-index:999;animation:fo 2s forwards}
@keyframes fo{0%{opacity:1}70%{opacity:1}100%{opacity:0}}
</style>
</head>
<body>
<div class="prayer-bar"></div>
<div id="landing">
  <div class="l-icon">🏔️</div>
  <div class="l-title">KHYEN</div>
  <div class="l-bo">མཁྱེན། AI</div>
  <div class="l-line"></div>
  <div class="l-tag">Intelligence Rooted in Tibetan Wisdom</div>
  <div class="l-feats">
    <div class="feat"><div class="feat-i">🔤</div><div class="feat-t">翻译</div><div class="feat-b">ཡིག་བསྒྱུར།</div></div>
    <div class="feat"><div class="feat-i">📚</div><div class="feat-t">文化</div><div class="feat-b">རིག་གཞུང་།</div></div>
    <div class="feat"><div class="feat-i">☸️</div><div class="feat-t">佛法</div><div class="feat-b">དམ་ཆོས།</div></div>
    <div class="feat"><div class="feat-i">🗓️</div><div class="feat-t">节日</div><div class="feat-b">དུས་ཆེན།</div></div>
  </div>
  <button class="l-btn" onclick="enterApp()">进入 · Enter</button>
  <div class="l-mantra">ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།</div>
</div>
<div id="app">
  <div id="header">
    <div class="h-title">མཁྱེན། KHYEN AI</div>
    <div class="h-btns">
      <button class="hbtn" onclick="saveChat()">💾 保存</button>
      <button class="hbtn" onclick="clearChat()">🗑️ 清空</button>
      <button class="hbtn" onclick="goHome()">🏠 首页</button>
    </div>
  </div>
  <div id="chat">
    <div id="quick-btns">
      <button class="qbtn" onclick="quickSend('请翻译一段藏文给我看看，并解释其含义')">🔤 藏文翻译示例</button>
      <button class="qbtn" onclick="quickSend('介绍一个藏传佛教的核心概念')">☸️ 佛法概念</button>
      <button class="qbtn" onclick="quickSend('今天是藏历什么日子？有什么特别意义吗？')">🗓️ 藏历今日</button>
      <button class="qbtn" onclick="quickSend('分享一句藏族谚语，并解释其深意')">🏔️ 藏族谚语</button>
      <button class="qbtn" onclick="quickSend('介绍藏族哈达的文化意义和使用礼仪')">🎀 哈达礼仪</button>
      <button class="qbtn" onclick="quickSend('藏族有哪些重要的传统节日？')">🎉 传统节日</button>
    </div>
  </div>
  <div id="input-area">
    <textarea id="t" placeholder="在此请教导师... Ask anything about Tibetan culture..."></textarea>
    <button id="sb" onclick="send()">请教</button>
  </div>
</div>
<script>
var chat = document.getElementById('chat');
var h = [];
var quickHidden = false;

function hasBo(t){ return /\u0F00/.test(t) || /\u0F40/.test(t) || /\u0F60/.test(t); }

function md(t){
  if(!t) return '';
  t = t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  t = t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1<\/strong>');
  t = t.replace(/\*([^*]+)\*/g,'<em>$1<\/em>');
  t = t.replace(/^### (.+)$/gm,'<h3>$1<\/h3>');
  t = t.replace(/^## (.+)$/gm,'<h2>$1<\/h2>');
  t = t.replace(/^# (.+)$/gm,'<h1>$1<\/h1>');
  t = t.replace(/^\- (.+)$/gm,'<li>$1<\/li>');
  t = t.replace(/(<li>[^<]*<\/li>\n?)+/g,'<ul>$&<\/ul>');
  t = t.replace(/\n\n/g,'<\/p><p>').replace(/\n/g,'<br>');
  t = '<p>' + t + '<\/p>';
  t = t.replace(/<p>(<h[123]>)/g,'$1').replace(/(<\/h[123]>)<\/p>/g,'$1');
  t = t.replace(/<p>(<ul>)/g,'$1').replace(/(<\/ul>)<\/p>/g,'$1');
  return t;
}

function showToast(msg){
  var el=document.createElement('div');
  el.className='toast'; el.innerText=msg;
  document.body.appendChild(el);
  setTimeout(function(){ el.remove(); },2200);
}

function hideQuick(){
  if(!quickHidden){
    var q=document.getElementById('quick-btns');
    if(q){ q.style.display='none'; quickHidden=true; }
  }
}

function enterApp(){
  document.getElementById('landing').style.display='none';
  document.getElementById('app').style.display='flex';
  if(h.length===0){
    addMsg('བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！\n\n我是您的藏文化智慧向导 **KHYEN མཁྱེན།**。\n\n欢迎向我询问藏传佛教、藏族文化、历史、节日、哈达礼仪，或进行藏汉英翻译。点击下方快捷按钮开始，或直接提问。','a');
  }
}

function goHome(){
  document.getElementById('landing').style.display='flex';
  document.getElementById('app').style.display='none';
}

function addMsg(msg, type){
  var d=document.createElement('div');
  d.className='m '+type;
  if(type==='a'){
    d.innerHTML=md(msg);
    if(/[\u0F00-\u0FFF]/.test(msg)) d.classList.add('bo');
    var acts=document.createElement('div');
    acts.className='acts';
    var cb=document.createElement('button');
    cb.className='abtn'; cb.innerText='📋 复制';
    cb.onclick=function(){ navigator.clipboard.writeText(msg).then(function(){ showToast('已复制 ✓'); }); };
    acts.appendChild(cb);
    d.appendChild(acts);
  } else {
    d.innerText=msg;
  }
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
  return d;
}

function send(){
  var input=document.getElementById('t');
  var v=input.value.trim();
  if(!v) return;
  hideQuick();
  addMsg(v,'u');
  h.push({role:'user',content:v});
  input.value='';
  document.getElementById('sb').disabled=true;
  var loader=addMsg('智者正在斟酌...','a');
  fetch('/api/chat',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({messages:h})
  }).then(function(r){ return r.json(); }).then(function(data){
    loader.innerHTML=md(data.reply);
    if(/[\u0F00-\u0FFF]/.test(data.reply)) loader.classList.add('bo');
    var acts=document.createElement('div');
    acts.className='acts';
    var cb=document.createElement('button');
    cb.className='abtn'; cb.innerText='📋 复制';
    var reply=data.reply;
    cb.onclick=function(){ navigator.clipboard.writeText(reply).then(function(){ showToast('已复制 ✓'); }); };
    acts.appendChild(cb);
    loader.appendChild(acts);
    h.push({role:'assistant',content:data.reply});
    if(h.length>20) h=h.slice(-20);
    document.getElementById('sb').disabled=false;
    chat.scrollTop=chat.scrollHeight;
  }).catch(function(){
    loader.innerText='连接中断，请重试。';
    document.getElementById('sb').disabled=false;
  });
}

function quickSend(msg){
  hideQuick();
  document.getElementById('t').value=msg;
  send();
}

function saveChat(){
  var msgs=Array.from(document.querySelectorAll('.m')).map(function(m){
    var cl=m.cloneNode(true);
    var a=cl.querySelector('.acts'); if(a) a.remove();
    return cl.innerText.trim();
  }).join('\n\n---\n\n');
  var blob=new Blob([msgs],{type:'text/plain;charset=utf-8'});
  var a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Khyen_AI_对话记录.txt';
  a.click();
  showToast('对话已保存！');
}

function clearChat(){
  if(confirm('确定清空所有对话？')){
    chat.innerHTML=''; h=[]; quickHidden=false;
    addMsg('对话已清空。བཀྲ་ཤིས་བདེ་ལེགས།','a');
  }
}

document.getElementById('t').addEventListener('keydown',function(e){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
});
</script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  if(req.url==='/'||req.url==='/index.html'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end(HTML_PAGE);
  } else if(req.url==='/api/chat'&&req.method==='POST'){
    let body='';
    req.on('data',chunk=>body+=chunk);
    req.on('end',async()=>{
      try{
        const {messages}=JSON.parse(body);
        const postData=JSON.stringify({
          model:'claude-sonnet-4-20250514',
          max_tokens:4096,
          system:SYSTEM_PROMPT,
          messages:messages
        });
        const reqApi=https.request({
          hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',
          headers:{'Content-Type':'application/json','x-api-key':MY_ANTHROPIC_KEY.trim(),'anthropic-version':'2023-06-01'}
        },(apiRes)=>{
          let d='';
          apiRes.on('data',chunk=>d+=chunk);
          apiRes.on('end',()=>{
            try{
              const j=JSON.parse(d);
              res.writeHead(200,{'Content-Type':'application/json'});
              res.end(JSON.stringify({reply:j.content[0].text}));
            }catch(e){
              res.writeHead(200,{'Content-Type':'application/json'});
              res.end(JSON.stringify({reply:'解析错误，请重试。'}));
            }
          });
        });
        reqApi.on('error',()=>{
          res.writeHead(200,{'Content-Type':'application/json'});
          res.end(JSON.stringify({reply:'连接异常，请重试。'}));
        });
        reqApi.write(postData);
        reqApi.end();
      }catch(e){
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({error:'通道异常。'}));
      }
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(process.env.PORT||10000,'0.0.0.0');
