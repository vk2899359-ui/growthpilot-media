module.exports = async function handler(req, res) {
  if (req.query.pass !== 'auric2026') return res.status(401).json({ error: 'Unauthorized' });
  var url = process.env.KV_REST_API_URL;
  var token = process.env.KV_REST_API_TOKEN;
  var debug = req.query.debug === 'true';
  var debugLog = [];
  var conversations = [];
  var contacts = {};

  if (!url || !token) {
    return res.status(200).json({ error: 'No Redis config', hasUrl: !!url, hasToken: !!token });
  }

  try {
    // Step 1: Check contacts key
    var cr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['GET', 'contacts']) });
    var cd = await cr.json();
    if (debug) debugLog.push({ step: 'GET contacts', status: cr.status, result: cd });
    contacts = cd.result ? JSON.parse(cd.result) : {};

    // Step 2: Try KEYS command instead of SCAN (more reliable for small datasets)
    var kr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['KEYS', 'chat:*']) });
    var kd = await kr.json();
    if (debug) debugLog.push({ step: 'KEYS chat:*', status: kr.status, result: kd });
    var allKeys = kd.result || [];

    // Step 3: Also try SCAN as fallback
    if (allKeys.length === 0) {
      var cursor = '0';
      var scanAttempts = 0;
      do {
        var sr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['SCAN', cursor, 'MATCH', 'chat:*', 'COUNT', '100']) });
        var sd = await sr.json();
        if (debug) debugLog.push({ step: 'SCAN attempt ' + scanAttempts, cursor: cursor, status: sr.status, result: sd });
        if (!sd.result) break;
        cursor = sd.result[0];
        var scanKeys = sd.result[1] || [];
        allKeys = allKeys.concat(scanKeys);
        scanAttempts++;
      } while (cursor !== '0' && scanAttempts < 10);
    }

    // Step 4: Also try a direct GET on a known key pattern to verify data exists
    if (debug && allKeys.length === 0) {
      // Try listing ALL keys to see what's actually in Redis
      var allKeysR = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['KEYS', '*']) });
      var allKeysD = await allKeysR.json();
      debugLog.push({ step: 'KEYS * (all keys in Redis)', status: allKeysR.status, result: allKeysD });

      // Try DBSIZE
      var dbr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['DBSIZE']) });
      var dbd = await dbr.json();
      debugLog.push({ step: 'DBSIZE', result: dbd });
    }

    // Step 5: Fetch all conversation data
    for (var i = 0; i < allKeys.length; i++) {
      var gr = await fetch(url, { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(['GET', allKeys[i]]) });
      var gd = await gr.json();
      if (gd.result) {
        try { conversations.push(JSON.parse(gd.result)); } catch(pe) { /* skip bad data */ }
      }
    }
  } catch(e) {
    if (debug) debugLog.push({ step: 'ERROR', message: e.message });
    console.log('Redis read error:', e.message);
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
  var result = { stats: { totalToday: todayMsgs.length, uniqueToday: Object.keys(uniquePhones).length, totalMonth: conversations.length, totalContacts: Object.keys(contacts).length }, contacts: contacts, conversations: conversations };
  if (debug) result._debug = debugLog;
  res.status(200).json(result);
};
