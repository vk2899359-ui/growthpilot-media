// GET /api/dashboard-feed
// Query params:
//   pass=auric2026          (required)
//   phone=919xxxxxxxxx      (optional — filter single contact)
//   intent=hot|warm|cold    (optional — filter by intent)
//   days=7                  (optional — last N days)
//   since=ISO_TIMESTAMP     (optional — only records newer than this, for polling)

const PASS = 'auric2026';

function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getRedisConfig() {
  const url   = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return { url, token };
  return null;
}

async function redisCmd(args) {
  const cfg = getRedisConfig();
  if (!cfg) return null;
  try {
    const resp = await fetch(cfg.url, {
      method:  'POST',
      headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json' },
      body:    JSON.stringify(args)
    });
    const data = await resp.json();
    return data.result;
  } catch (e) {
    console.log('Redis error:', e.message);
    return null;
  }
}

// Fetch all keys matching a pattern, return parsed JSON values
async function fetchByPattern(pattern) {
  const keys   = await redisCmd(['KEYS', pattern]) || [];
  const result = [];
  for (const key of keys) {
    const raw = await redisCmd(['GET', key]);
    if (raw) {
      try { result.push(JSON.parse(raw)); } catch (e) { /* skip malformed */ }
    }
  }
  return result;
}

module.exports = async function handler(req, res) {
  setCORS(res);

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (req.query.pass !== PASS) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!getRedisConfig()) {
    return res.status(500).json({ error: 'Redis not configured' });
  }

  try {
    // ── Parse filters ────────────────────────────────────────
    const filterPhone  = req.query.phone  || null;
    const filterIntent = req.query.intent || null;
    const filterDays   = req.query.days   ? parseInt(req.query.days, 10) : null;
    const sinceParam   = req.query.since  || null;

    // cutoff from 'days' param
    const dayCutoffTs  = filterDays ? Date.now() - filterDays * 86400000 : 0;
    // cutoff from 'since' param (takes precedence when both given)
    const sinceCutoffTs = sinceParam ? new Date(sinceParam).getTime() : 0;
    const cutoffTs      = Math.max(dayCutoffTs, sinceCutoffTs);

    // ── Load feed messages (user messages with intent tag) ───
    // feed:{phone}:{ts} → { from, name, message, timestamp, ts, type, intent, imageUrl }
    const feedMsgs = await fetchByPattern('feed:*');

    // Build intent + name map keyed by phone
    // Most-severe intent wins: hot > warm > cold
    const intentRank = { hot: 2, warm: 1, cold: 0 };
    const phoneIntentMap = {};   // phone → 'hot'|'warm'|'cold'
    const phoneNameMap   = {};   // phone → name

    for (const m of feedMsgs) {
      const p = m.from;
      if (!p) continue;
      if (m.name && !phoneNameMap[p]) phoneNameMap[p] = m.name;
      if (!phoneIntentMap[p]) phoneIntentMap[p] = 'cold';
      if ((intentRank[m.intent] || 0) > (intentRank[phoneIntentMap[p]] || 0)) {
        phoneIntentMap[p] = m.intent;
      }
    }

    // ── Load chat messages (user + bot pairs) ────────────────
    // chat:{phone}:{ts} → { phone, userMsg, botReply, timestamp, ts }
    const chatRecords = await fetchByPattern('chat:*');

    // Convert each chat record into two message objects: user + bot
    // Expand into per-phone message arrays
    const phoneMessages = {};  // phone → [{ from, text, timestamp, type, imageUrl }]

    for (const rec of chatRecords) {
      const p  = rec.phone;
      const ts = rec.ts || new Date(rec.timestamp).getTime();
      if (!p) continue;
      if (ts < cutoffTs) continue;
      if (filterPhone && p !== filterPhone) continue;

      if (!phoneMessages[p]) phoneMessages[p] = [];

      // Try to find matching feed entry for this ts to get imageUrl/type
      const matchFeed = feedMsgs.find(function(f) { return f.from === p && Math.abs(f.ts - ts) < 2000; });

      if (rec.userMsg && rec.userMsg !== '[Sent jewellery image]') {
        phoneMessages[p].push({
          from:      'user',
          text:      rec.userMsg,
          timestamp: rec.timestamp,
          ts:        ts,
          type:      'text',
          imageUrl:  null
        });
      } else if (rec.userMsg === '[Sent jewellery image]') {
        phoneMessages[p].push({
          from:      'user',
          text:      '[Image]',
          timestamp: rec.timestamp,
          ts:        ts,
          type:      'image',
          imageUrl:  matchFeed ? matchFeed.imageUrl : null
        });
      }

      if (rec.botReply) {
        phoneMessages[p].push({
          from:      'bot',
          text:      rec.botReply,
          timestamp: rec.timestamp,
          ts:        ts + 1,   // 1ms after so it sorts after the user msg
          type:      'text',
          imageUrl:  null
        });
      }
    }

    // ── Build conversations array ─────────────────────────────
    const allPhones = new Set([
      ...Object.keys(phoneMessages),
      ...Object.keys(phoneIntentMap)
    ]);

    const conversations = [];

    for (const phone of allPhones) {
      if (filterPhone && phone !== filterPhone) continue;

      const msgs    = (phoneMessages[phone] || []).sort(function(a, b) { return a.ts - b.ts; });
      const intent  = phoneIntentMap[phone] || 'cold';

      if (filterIntent && intent !== filterIntent) continue;
      if (!msgs.length) continue;

      const lastMsg = msgs[msgs.length - 1];

      conversations.push({
        phone:           phone,
        name:            phoneNameMap[phone] || null,
        lastMessage:     lastMsg.text,
        lastMessageTime: lastMsg.timestamp,
        intent:          intent,
        unread:          false,   // set by frontend when user reads it
        messages:        msgs.map(function(m) {
          return {
            from:      m.from,
            text:      m.text,
            timestamp: m.timestamp,
            type:      m.type,
            imageUrl:  m.imageUrl || null
          };
        })
      });
    }

    // Sort conversations: most recent last message first
    conversations.sort(function(a, b) {
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    // ── Stats ─────────────────────────────────────────────────
    const today     = new Date().toISOString().slice(0, 10);
    const hotLeads  = await fetchByPattern('lead:*');

    const stats = {
      total:  conversations.length,
      hot:    conversations.filter(function(c) { return c.intent === 'hot';  }).length,
      warm:   conversations.filter(function(c) { return c.intent === 'warm'; }).length,
      cold:   conversations.filter(function(c) { return c.intent === 'cold'; }).length,
      closed: 0,   // reserved for future use
      todayActive: conversations.filter(function(c) {
        return c.lastMessageTime && c.lastMessageTime.startsWith(today);
      }).length
    };

    return res.status(200).json({
      conversations: conversations,
      hotLeads:      hotLeads.sort(function(a, b) { return b.ts - a.ts; }),
      stats:         stats,
      // Echo back the timestamp client should use as next ?since= value
      fetchedAt:     new Date().toISOString()
    });

  } catch (e) {
    console.error('dashboard-feed error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
