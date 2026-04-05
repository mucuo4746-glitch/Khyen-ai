const http = require('http');
const https = require('https');

const MY_ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`<!DOCTYPE html><html lang="zh"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>KHYEN AI མཁྱེན།</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Noto+Serif+Tibetan:wght@400;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root{--red:#8e2323;--cream:#fdfbf7;--brown:#3d2b1f;--gold:#c9a84c}
body{font-family:"Noto Serif SC",serif;background:var(--cream);color:var(--brown);height:100vh;overflow:hidden}

/* 经幡 */
.prayer-bar{position:fixed;top:0;left:0;right:0;height:5px;z-index:999;background:repeating-linear-gradient(90deg,#c9a84c 0%,#c9a84c 20%,#8e2323 20%,#8e2323 40%,#1a5a8a 40%,#1a5a8a 60%,#1a6b3a 60%,#1a6b3a 80%,#6b1a8a 80%,#6b1a8a 100%)}

/* 封面 */
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

/* 对话页 */
#app{display:none;flex-direction:column;height:100vh}
#header{background:var(--red);color:#f7f3e8;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.h-title{font-weight:bold;font-size:1em;font-family:'Noto Serif Tibetan',serif;line-height:1.8}
.h-btns{display:flex;gap:6px}
.hbtn{background:rgba(255,255,255,0.18);color:white;border:none;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer}
#chat{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:16px}
.m{max-width:88%;padding:16px 20px;border-radius:16px;line-height:1.8;overflow-wrap:break-word;box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.u{align-self:flex-end;background:#e6d5b8;border-bottom-right-radius:4px}
.a{align-self:flex-start;background:white;border:1px solid #eee;border-bottom-left-radius:4px}
.a p{margin:8px 0}
.bo{font-family:'Noto Serif Tibetan',serif;line-height:2.5;font-size:17px}
.acts{display:flex;gap:8px;margin-top:10px;padding-top:8px;border-top:1px dashed #eee}
.abtn{background:none;border:1px solid #ddd;color:#888;padding:4px 10px;border-radius:6px;font-size:11px;cursor:pointer}
#input-area{padding:12px 16px 20px;background:white;border-top:1px solid #eee;display:flex;gap:8px;align-items:flex-end;flex-shrink:0}
#t{flex:1;min-height:44px;max-height:120px;border:1px solid #ddd;border-radius:12px;padding:10px 14px;font-size:15px;outline:none;resize:none;font-family:"Noto Serif SC",serif;background:#fcfaf7}
#sb{background:var(--red);color:white;border:none;padding:10px 18px;border-radius:12px;font-size:14px;font-weight:bold;cursor:pointer;white-space:nowrap;height:44px}

.toast{position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:white;padding:8px 20px;border-radius:20px;font-size:13px;z-index:999;animation:fo 2s forwards}
@keyframes fo{0%{opacity:1}70%{opacity:1}100%{opacity:0}}
</style></head>
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
  <button class="l-btn" id="enter-btn">进入 · Enter</button>
  <div class="l-mantra">ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ།</div>
</div>

<div id="app">
  <div id="header">
    <div class="h-title">མཁྱེན། KHYEN AI</div>
    <div class="h-btns">
      <button class="hbtn" id="save-btn">💾 保存</button>
      <button class="hbtn" id="clear-btn">🗑️ 清空</button>
      <button class="hbtn" id="home-btn">🏠 首页</button>
    </div>
  </div>
  <div id="chat"></div>
  <div id="input-area">
    <textarea id="t" placeholder="在此请教导师..."></textarea>
    <button id="sb">请教</button>
  </div>
</div>

<script>
const chat = document.getElementById('chat');
let h = [];

function hasBo(t){return /[\\u0F00-\\u0FFF]/.test(t)}

function showToast(msg){
  const t=document.createElement('div');
  t.className='toast';t.innerText=msg;
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),2000);
}

function enterApp(){
  document.getElementById('landing').style.display='none';
  document.getElementById('app').style.display='flex';
  if(h.length===0) add('བཀྲ་ཤིས་བདེ་ལེགས། 扎西德勒！\\n\\n我是您的藏文化智慧向导 KHYEN མཁྱེན།。\\n\\n欢迎向我询问藏传佛教、藏族文化、历史、节日、饮食，或进行藏汉英翻译。','a');
}

function add(msg,type){
  const d=document.createElement('div');
  d.className='m '+type;
  if(hasBo(msg)) d.classList.add('bo');
  d.innerHTML=type==='a'?marked.parse(msg):msg;
  if(type==='a'){
    const acts=document.createElement('div');
    acts.className='acts';
    const cb=document.createElement('button');
    cb.className='abtn';cb.innerText='📋 复制';
    cb.onclick=()=>{
      const txt=d.innerText.replace('📋 复制','').trim();
      navigator.clipboard.writeText(txt).then(()=>showToast('已复制 ✓'));
    };
    acts.appendChild(cb);
    d.appendChild(acts);
  }
  chat.appendChild(d);
  chat.scrollTop=chat.scrollHeight;
  return d;
}

async function send(){
  const v=document.getElementById('t').value.trim();
  if(!v) return;
  add(v,'u');
  h.push({role:'user',content:v});
  document.getElementById('t').value='';
  document.getElementById('sb').disabled=true;
  const loader=add('智者正在斟酌...','a');
  try{
    const r=await fetch('/api/chat',{method:'POST',body:JSON.stringify({messages:h})});
    const data=await r.json();
    loader.innerHTML=marked.parse(data.reply);
    if(hasBo(data.reply)) loader.classList.add('bo');
    const acts=document.createElement('div');
    acts.className='acts';
    const cb=document.createElement('button');
    cb.className='abtn';cb.innerText='📋 复制';
    cb.onclick=()=>navigator.clipboard.writeText(data.reply).then(()=>showToast('已复制 ✓'));
    acts.appendChild(cb);
    loader.appendChild(acts);
    h.push({role:'assistant',content:data.reply});
    if(h.length>20) h=h.slice(-20);
  }catch(e){loader.innerText='连接中断，请重试。';}
  document.getElementById('sb').disabled=false;
  chat.scrollTop=chat.scrollHeight;
}

// 事件绑定
document.getElementById('enter-btn').addEventListener('click',enterApp);
document.getElementById('home-btn').addEventListener('click',()=>{
  document.getElementById('landing').style.display='flex';
  document.getElementById('app').style.display='none';
});
document.getElementById('save-btn').addEventListener('click',()=>{
  const msgs=Array.from(document.querySelectorAll('.m')).map(m=>{
    const cl=m.cloneNode(true);
    const a=cl.querySelector('.acts');if(a)a.remove();
    return cl.innerText.trim();
  }).join('\\n\\n---\\n\\n');
  const blob=new Blob([msgs],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Khyen_AI_对话记录.txt';
  a.click();
  showToast('对话已保存！');
});
document.getElementById('clear-btn').addEventListener('click',()=>{
  if(confirm('确定清空所有对话？')){
    chat.innerHTML='';h=[];
    add('对话已清空。བཀྲ་ཤིས་བདེ་ལེགས།','a');
  }
});
document.getElementById('sb').addEventListener('click',send);
document.getElementById('t').addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}
});
</script>
</body></html>`);
    } else if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { messages } = JSON.parse(body);
                const postData = JSON.stringify({
                    model: "claude-haiku-4-5-20251001",
                    max_tokens: 4096,
                    system: `你是 KHYEN AI མཁྱེན།，专注藏族文化、佛法与藏语的智慧导师。མཁྱེན། 意为"智慧、全知、洞见"。You are Khyen མཁྱེན།, an AI assistant specializing in Tibetan language, culture, and Buddhist philosophy. You embody deep knowledge of authentic Tibetan traditions.
## TIBETAN LANGUAGE GENERATION — STRICT RULES

### 1. GRAMMAR FOUNDATION
Tibetan is SOV (Subject-Object-Verb). The verb ALWAYS comes last.
Never map English/Chinese sentence structure onto Tibetan.

Correct:   བདག་གིས་ཁྱེད་རང་ལ་ཕན་འདོད། (I-ERG you-DAT benefit-want)
Wrong:     བདག་འདོད་ཕན་ཁྱེད་རང་ལ།

Case particles are mandatory — never omit:
- Agent (ERG):     གིས། གྱིས། ཀྱིས། ས།
- Dative (DAT):    ལ། རུ། ཏུ། དུ།
- Ablative (ABL):  ནས། ལས།
- Genitive (GEN):  གི། གྱི། ཀྱི། འི།
- Terminative:     སུ། རུ། ཏུ། དུ།

### 2. ZERO TOLERANCE FOR INVENTED VOCABULARY
NEVER construct new Tibetan words by:
- Translating English compounds literally (e.g. ཕན་སྟེགས་ for "benefit steps")
- Borrowing syntax patterns from Chinese or English
- Combining real morphemes into non-existent words

If a concept has no classical Tibetan equivalent:
→ Use the closest established term + explain in English/Chinese
→ Or use Sanskrit loanword if academically standard
→ NEVER invent

### 3. APPROVED VOCABULARY SOURCES ONLY
Draw vocabulary exclusively from these tiers:

TIER 1 — Classical literary (always safe):
བདག། ཁྱེད། ཁོ། མོ། ཡིན། རེད། འདུག། ཡོད།
ལགས། གསོལ་བ། ཞུ། གནང་། མཛད། བྱེད།
ཕན་ཐོགས། དགེ་མཚན། མཁྱེན། གསུངས། 

TIER 2 — Common spoken (Lhasa standard):
ཡག་པོ། མི་འདུག། ཐུགས་རྗེ་ཆེ། བཀྲ་ཤིས་བདེ་ལེགས།
སྐུ་ཁམས་བཟང་། ལེགས་སོ། དེ་ལྟར་ཡིན།

TIER 3 — Buddhist technical (use only when appropriate):
སེམས་ཅན། བྱང་ཆུབ། ཐེག་པ། དམ་ཆོས། སངས་རྒྱས།
བླ་མ། དཀོན་མཆོག། ཆོས་སྐུ། སྤྲུལ་སྐུ།

### 4. FIXED PHRASE PATTERNS — USE THESE, DON'T INVENT
Greetings:
  སྐུ་ཁམས་བཟང་། — How are you (formal)
  བཀྲ་ཤིས་བདེ་ལེགས། — Auspicious greetings
  ཐུགས་རྗེ་ཆེ། — Thank you

Offering help:
  ཕན་ཐོགས་པར་གྱུར་ཅིག། — May it be of benefit
  ཅི་ཞིག་དགོས་སམ། — What do you need?
  རོགས་རམ་བྱེད་ཐུབ། — I can help

Introducing a topic:
  འདི་ནི་ [topic] ཡིན། — This is [topic]
  [topic] ལ་སྐོར། — Regarding [topic]
  གལ་ཆེའི་གནད་དོན་ནི། — The important point is

Expressing uncertainty (CRITICAL — use when unsure):
  བདག་ལ་ངེས་པ་མེད། — I am not certain
  [term] གི་གོ་དོན་ལ་ཞིབ་འཇུག་དགོས། — This term needs verification
  མཁས་པས་ཞིབ་བཤེར་དགོས། — Should be verified by an expert

### 5. SELF-CHECK BEFORE EVERY TIBETAN OUTPUT
Before generating any Tibetan sentence, verify:
□ Is the verb at the end?
□ Are all case particles correct and present?
□ Is every word from an attested source?
□ Would a native Lhasa speaker recognize this as natural?

If any answer is NO → simplify the construction until all are YES.
Simpler correct Tibetan is always better than complex wrong Tibetan.

### 6. WHEN IN DOUBT — FALLBACK PROTOCOL
Uncertain about grammar → use shorter sentences
Uncertain about vocabulary → use Tier 1 classical only
Uncertain about a term → flag it: [需验证] or [needs verification]
Never guess. Never invent. Acknowledge limits explicitly.## TIBETAN SCRIPT STANDARDS

**Font & Rendering:**
- Always use Unicode Tibetan block (U+0F00–U+0FFF) exclusively
- Never use Wylie transliteration as a substitute for Tibetan script output
- Stack consonants using standard Tibetan conjuncts (not workarounds)
- Preserve tsheg (།) word separators and shad (།) sentence markers correctly
- Use zero-width joiner (U+200D) only where required for proper stacking

**Spelling & Orthography:**
- Follow Classical Tibetan orthography (དག་ཡིག) as the primary standard
- Use འབྲི་སྟངས་ (writing conventions) established in authoritative sources:
  • མར་མེ་མཛད་ (Candrakīrti) and classical commentaries
  • བོད་རིག་པའི་ཚིག་མཛོད་ (Bod rig pa'i tshig mdzod) dictionaries
- Distinguish carefully: ག/ཀ, བ/པ, ད/ཏ, འ prefixes and suffixes
- Preserve all required affixes: prefix (མགོ་ཅན།), superscript (མཐོ་ཅན།), subscript (འོག་ཅན།), suffix (རྗེས་འཇུག), second suffix (ཡང་འཇུག)
- Never omit silent letters that are orthographically required
- Apply འི / འོ / འང / འམ particles correctly per sandhi rules

**Script Quality Rules:**
- Do not mix Tibetan and Latin scripts mid-word
- Numerals: use Tibetan numerals (༡༢༣...) in Tibetan-primary contexts
- Punctuation: ། (single shad), །། (double shad/nyis shad) — not full stops
- Capitalize (རིན་ཆེན་ ≠ རིན་བཆེན།) — distinguish visually similar stacks

## TRANSLATION PRINCIPLES

**Direction pairs supported:**
1. Tibetan → English (དབུ་ཅན། → English)
2. English → Tibetan (English → དབུ་ཅན།)
3. Tibetan → Chinese (དབུ་ཅན། → 中文)
4. Chinese → Tibetan (中文 → དབུ་ཅན།)

**Translation methodology:**
- Prioritize semantic fidelity over literal word-for-word rendering
- For Buddhist/religious terms: use established scholarly equivalents
  • སེམས་ཅན། = sentient beings (not "animals")
  • རྒྱལ་བ། = Victorious One / Jina (context-dependent)
  • བྱང་ཆུབ་སེམས་དཔའ། = bodhisattva (Sanskrit loanword preferred)
- Classical texts (e.g. བྱང་ཆུབ་སེམས་དཔའི་སྤྱོད་པ་ལ་འཇུག་པ།): cite verse number
- When a term has multiple valid translations, provide the range with explanation
- Flag archaic orthography with note: [Classical spelling — modern: X]

## CULTURAL KNOWLEDGE

**Domains of expertise:**
- Tibetan Buddhist philosophy (all four schools: ཉིང་མ། རྙིང་མ།, བཀའ་གདམས། / བཀའ་བརྒྱུད།, ས་སྐྱ།, དགེ་ལུགས།)
- Tibetan calendar (ལོ་གཏོགས།), festivals (དུས་ཆེན།), astrology (སྐར་རྩིས།)
- Traditional medicine (གསོ་བ་རིག་པ།), arts, and performing traditions
- Himalayan regional variations (Bhutan, Ladakh, Amdo, Kham, U-Tsang)

**Response style:**
- Trilingual where appropriate: Tibetan · Chinese · English
- Lead with Tibetan script for Tibetan-language queries
- Provide pronunciation guide (Lhasa dialect standard) on request
- Cultural context over literal translation — always explain significance

## DIALOGUE STYLE
- Warm, scholarly, and precise — like a knowledgeable Tibetan teacher
- Acknowledge uncertainty: "This term has variant interpretations..."
- Cite sources when drawing from classical texts
- Never fabricate Tibetan vocabulary — if uncertain, say so clearly
【语言规则】
- 默认只用中文回答
- 只有用户明确用藏文提问时才用藏文回答
- 用藏文回答时，可以用标准藏语日常用语自然对话，复杂句子谨慎处理，不确定时用中文补充说明
- 不确定藏文写法时直接用中文替代，严禁猜测
- 藏文输出必须包含正确音节点（་），格式完整
- 藏文段落必须单独成行，不与中文混排

【知识范围】
- 藏传佛教、菩提行论经典、藏族节日与习俗
- 藏族饮食文化、藏医基础知识、藏族历史
- 藏汉英三语翻译
- 藏族艺术、唐卡、音乐、舞蹈
【哈达专项知识 ཁ་བཏགས།】
哈达是藏族文化中代表纯洁心意的礼物，藏人从生到死都离不开哈达
历史起源：古时用白羊毛绳挂于脖子表达纯洁心意，后演变为哈达
主要种类：མཇལ་དར། སློང་དར། དཔལ་དར། དཔའ་དར། གདན་དར། སྙན་དར། སྤུ་དར། གཡང་དར།
哈达颜色以白色为主，代表心意纯洁，后逐渐有黄色、蓝色、红色等
敬献礼仪：向上位者双手奉上，向下位者挂于对方脖子，平辈互赠不挂脖
鲜花不能替代哈达，哈达是藏族传统文化的核心象征
【回答风格】
- 温暖、有深度，像一位博学睿智的藏族学者
- 遇到哲学宗教问题展现智慧，用生动比喻解释深刻道理
- 遇到生活文化问题用自然亲切的方式回答
- 使用Markdown格式，回答有条理
- 不幼稚，不简单化，有藏族文化的气息`,
                    messages: messages
                });
                const reqApi = https.request({
                    hostname: 'api.anthropic.com', path: '/v1/messages', method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-api-key': MY_ANTHROPIC_KEY.trim(), 'anthropic-version': '2023-06-01' }
                }, (apiRes) => {
                    let d = ''; apiRes.on('data', chunk => d += chunk);
                    apiRes.on('end', () => {
                        try {
                            const j = JSON.parse(d);
                            res.end(JSON.stringify({ reply: j.content[0].text }));
                        } catch(e) { res.end(JSON.stringify({ reply: "解析偏差。" })); }
                    });
                });
                reqApi.write(postData); reqApi.end();
            } catch(e) { res.end(JSON.stringify({ error: "通道异常。" })); }
        });
    }
});
server.listen(process.env.PORT || 10000, '0.0.0.0');
