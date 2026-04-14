module.exports = async function handler(req, res) {
  if (req.query.pass !== 'auric2026') return res.status(401).json({ error: 'Unauthorized' });
  var url = process.env.KV_REST_API_URL;
  var token = process.env.KV_REST_API_TOKEN;
  var conversations = [];
  var contacts = {};
  if (url && token) {
    try {
      var cr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['GET', 'contacts']) });
      var cd = await cr.json(); contacts = cd.result ? JSON.parse(cd.result) : {};
      var cursor = '0';
      do {
        var sr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['SCAN', cursor, 'MATCH', 'chat:*', 'COUNT', '100']) });
        var sd = await sr.json();
        if (!sd.result) break;
        cursor = sd.result[0];
        var keys = sd.result[1] || [];
        for (var i = 0; i < keys.length; i++) {
          var gr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['GET', keys[i]]) });
          var gd = await gr.json();
          if (gd.result) conversations.push(JSON.parse(gd.result));
        }
      } while (cursor !== '0');
    } catch(e) { console.log('Redis read error:', e.message); }
  }
  var days = req.query.days ? parseInt(req.query.days) : null;
  var phone = req.query.phone || null;
  var cutoff = days ? Date.now() - days * 86400000 : 0;
  conversations = conversations.filter(function(c) { return c.ts >= cutoff && (!phone || c.phone === phone); });
  conversations.sort(function(a, b) { return b.ts - a.ts; });
  var today = new Date().toISOString().slice(0, 10);
  var todayMsgs = conversations.filter(function(c) { return c.timestamp && c.timestamp.startsWith(today); });
  var uniquePhones = {};
  todayMsgs.forEach(function(c) { uniquePhones[c.phone] = true; });
  res.status(200).json({ stats: { totalToday: todayMsgs.length, uniqueToday: Object.keys(uniquePhones).length, totalMonth: conversations.length, totalContacts: Object.keys(contacts).length }, contacts: contacts, conversations: conversations });
};
