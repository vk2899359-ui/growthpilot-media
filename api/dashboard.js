export default async function handler(req, res) {
  if (req.query.pass !== 'auric2026') {
    return res.status(200).send(`<!DOCTYPE html><html><body style="background:#111;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui"><h1>🔒 Unauthorized</h1></body></html>`);
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Auric Jewels — WhatsApp Dashboard</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0a;color:#e0e0e0;font-family:system-ui,-apple-system,sans-serif}
.header{background:linear-gradient(135deg,#1a1a1a,#111);border-bottom:2px solid #C5A54E;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
.logo{color:#C5A54E;font-size:22px;font-weight:700;letter-spacing:2px}
.refresh-info{color:#666;font-size:12px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;padding:16px 24px}
.stat-card{background:#1a1a1a;border:1px solid #333;border-radius:10px;padding:16px;text-align:center}
.stat-num{font-size:28px;font-weight:700;color:#C5A54E}
.stat-label{font-size:12px;color:#888;margin-top:4px}
.controls{padding:8px 24px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.controls input,.controls select,.controls button{background:#1a1a1a;border:1px solid #333;color:#e0e0e0;padding:8px 12px;border-radius:6px;font-size:13px}
.controls button{background:#C5A54E;color:#000;font-weight:600;cursor:pointer;border:none}
.controls button:hover{background:#d4b45e}
.main{display:flex;height:calc(100vh - 220px);padding:0 24px 16px}
.contact-list{width:320px;min-width:280px;overflow-y:auto;border:1px solid #333;border-radius:10px;background:#1a1a1a;margin-right:12px}
.contact-item{padding:14px 16px;border-bottom:1px solid #222;cursor:pointer;transition:background .2s}
.contact-item:hover,.contact-item.active{background:#252525}
.contact-phone{font-weight:600;color:#C5A54E;font-size:14px}
.contact-preview{font-size:12px;color:#888;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.contact-time{font-size:11px;color:#555;margin-top:2px}
.contact-count{display:inline-block;background:#C5A54E;color:#000;font-size:10px;padding:2px 6px;border-radius:10px;margin-left:8px}
.chat-panel{flex:1;border:1px solid #333;border-radius:10px;background:#1a1a1a;display:flex;flex-direction:column;overflow:hidden}
.chat-header{padding:14px 16px;border-bottom:1px solid #333;font-weight:600;color:#C5A54E}
.chat-messages{flex:1;overflow-y:auto;padding:16px}
.chat-empty{display:flex;align-items:center;justify-content:center;height:100%;color:#555;font-size:16px}
.msg-row{margin-bottom:12px;display:flex}
.msg-row.user{justify-content:flex-start}
.msg-row.bot{justify-content:flex-end}
.msg-bubble{max-width:70%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.5;word-wrap:break-word}
.msg-row.user .msg-bubble{background:#2a2a2a;border-bottom-left-radius:4px}
.msg-row.bot .msg-bubble{background:#C5A54E;color:#000;border-bottom-right-radius:4px}
.msg-time{font-size:10px;color:#666;margin-top:4px}
.msg-row.bot .msg-time{color:#555;text-align:right}
.date-divider{text-align:center;margin:16px 0;color:#555;font-size:11px}
.no-data{text-align:center;padding:40px;color:#555}
@media(max-width:768px){
  .main{flex-direction:column;height:auto}
  .contact-list{width:100%;max-height:40vh;margin-right:0;margin-bottom:12px}
  .chat-panel{min-height:50vh}
  .stats{grid-template-columns:repeat(2,1fr)}
}
</style>
</head>
<body>
<div class="header">
  <div class="logo">✦ AURIC JEWELS</div>
  <div class="refresh-info">Auto-refresh: <span id="countdown">60</span>s</div>
</div>
<div class="stats">
  <div class="stat-card"><div class="stat-num" id="s-today">-</div><div class="stat-label">Messages Today</div></div>
  <div class="stat-card"><div class="stat-num" id="s-unique">-</div><div class="stat-label">Customers Today</div></div>
  <div class="stat-card"><div class="stat-num" id="s-month">-</div><div class="stat-label">This Month</div></div>
  <div class="stat-card"><div class="stat-num" id="s-total">-</div><div class="stat-label">Total Contacts</div></div>
</div>
<div class="controls">
  <input type="text" id="search" placeholder="🔍 Search phone number...">
  <select id="dateFilter"><option value="">All Time</option><option value="1">Today</option><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option></select>
  <button onclick="exportCSV()">📥 Download CSV</button>
</div>
<div class="main">
  <div class="contact-list" id="contactList"><div class="no-data">Loading...</div></div>
  <div class="chat-panel">
    <div class="chat-header" id="chatHeader">Select a conversation</div>
    <div class="chat-messages" id="chatMessages"><div class="chat-empty">← Select a customer to view chat</div></div>
  </div>
</div>
<script>
const PASS='auric2026';
let allData={conversations:[],contacts:{},stats:{}};
let selectedPhone=null;

async function fetchData(){
  const days=document.getElementById('dateFilter').value;
  const ph=document.getElementById('search').value.trim();
  let url='/api/conversations?pass='+PASS;
  if(days)url+='&days='+days;
  if(ph)url+='&phone='+ph;
  try{
    const r=await fetch(url);
    allData=await r.json();
    renderStats();
    renderContacts();
    if(selectedPhone)renderChat(selectedPhone);
  }catch(e){console.log('Fetch error:',e)}
}

function renderStats(){
  document.getElementById('s-today').textContent=allData.stats.totalToday||0;
  document.getElementById('s-unique').textContent=allData.stats.uniqueToday||0;
  document.getElementById('s-month').textContent=allData.stats.totalMonth||0;
  document.getElementById('s-total').textContent=allData.stats.totalContacts||0;
}

function renderContacts(){
  const el=document.getElementById('contactList');
  const c=allData.contacts||{};
  const phones=Object.keys(c).sort((a,b)=>new Date(c[b].lastTime||0)-new Date(c[a].lastTime||0));
  if(!phones.length){el.innerHTML='<div class="no-data">No conversations yet</div>';return}
  el.innerHTML=phones.map(p=>{
    const d=c[p];
    const t=d.lastTime?new Date(d.lastTime).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
    return '<div class="contact-item'+(selectedPhone===p?' active':'')+'" onclick="selectContact(\\''+p+'\\')"><div><span class="contact-phone">+'+p+'</span><span class="contact-count">'+d.count+'</span></div><div class="contact-preview">'+((d.lastMsg||'').substring(0,50))+'</div><div class="contact-time">'+t+'</div></div>';
  }).join('');
}

function selectContact(p){
  selectedPhone=p;
  renderContacts();
  renderChat(p);
}

function renderChat(phone){
  document.getElementById('chatHeader').textContent='+'+phone;
  const msgs=allData.conversations.filter(c=>c.phone===phone).sort((a,b)=>a.ts-b.ts);
  const el=document.getElementById('chatMessages');
  if(!msgs.length){el.innerHTML='<div class="chat-empty">No messages</div>';return}
  let html='',lastDate='';
  msgs.forEach(m=>{
    const d=new Date(m.timestamp);
    const dateStr=d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
    if(dateStr!==lastDate){html+='<div class="date-divider">— '+dateStr+' —</div>';lastDate=dateStr}
    const time=d.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'});
    html+='<div class="msg-row user"><div class="msg-bubble">'+esc(m.userMsg)+'<div class="msg-time">'+time+'</div></div></div>';
    html+='<div class="msg-row bot"><div class="msg-bubble">'+esc(m.botReply)+'<div class="msg-time">'+time+'</div></div></div>';
  });
  el.innerHTML=html;
  el.scrollTop=el.scrollHeight;
}

function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function exportCSV(){
  const rows=[['Date','Time','Phone','Customer Message','Bot Reply']];
  allData.conversations.forEach(c=>{
    const d=new Date(c.timestamp);
    rows.push([d.toLocaleDateString(),d.toLocaleTimeString(),c.phone,'"'+(c.userMsg||'').replace(/"/g,'""')+'"','"'+(c.botReply||'').replace(/"/g,'""')+'"']);
  });
  const csv=rows.map(r=>r.join(',')).join('\\n');
  const blob=new Blob([csv],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='auric-whatsapp-'+new Date().toISOString().slice(0,10)+'.csv';a.click();
}

document.getElementById('search').addEventListener('input',()=>fetchData());
document.getElementById('dateFilter').addEventListener('change',()=>fetchData());

let count=60;
setInterval(()=>{count--;document.getElementById('countdown').textContent=count;if(count<=0){count=60;fetchData()}},1000);
fetchData();
</script>
</body>
</html>`;
  
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
