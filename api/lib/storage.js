// Storage module - Direct Upstash REST API (no packages needed)
const memoryStore = new Map();

function getRedisConfig() {
  // Try multiple possible env var names
  const url = process.env.KV_REST_API_URL || process.env.KV_REST_API_URL_REDIS_URL || process.env.REDIS_URL || process.env.STORAGE_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN_REDIS_TOKEN || process.env.REDIS_TOKEN || process.env.STORAGE_TOKEN;
  if (url && token) return { url, token };
  // Try to extract from REDIS_URL format
  if (url && url.startsWith('https://')) return { url, token: token || '' };
  return null;
}

async function redisCommand(args) {
  const config = getRedisConfig();
  if (!config) return null;
  try {
    const resp = await fetch(config.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + config.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    const data = await resp.json();
    return data.result;
  } catch (e) {
    console.log('Redis error:', e.message);
    return null;
  }
}

async function storeMessage(phone, userMsg, botReply) {
  const ts = Date.now();
  const data = JSON.stringify({ phone, userMsg, botReply, timestamp: new Date().toISOString(), ts });

  const config = getRedisConfig();
  if (config) {
    await redisCommand(['SET', 'chat:' + phone + ':' + ts, data, 'EX', String(90 * 86400)]);
    // Update contacts
    const raw = await redisCommand(['GET', 'contacts']);
    const contacts = raw ? JSON.parse(raw) : {};
    contacts[phone] = { lastMsg: userMsg, lastTime: new Date().toISOString(), count: (contacts[phone] ? contacts[phone].count : 0) + 1 };
    await redisCommand(['SET', 'contacts', JSON.stringify(contacts)]);
    console.log('Stored in Redis:', phone);
  } else {
    memoryStore.set('chat:' + phone + ':' + ts, data);
    const contacts = memoryStore.get('contacts') || {};
    contacts[phone] = { lastMsg: userMsg, lastTime: new Date().toISOString(), count: (contacts[phone] ? contacts[phone].count : 0) + 1 };
    memoryStore.set('contacts', contacts);
    console.log('Stored in memory (no Redis):', phone);
  }
}

async function getConversations(days, phone) {
  const cutoff = days ? Date.now() - days * 86400000 : 0;
  const results = [];

  const config = getRedisConfig();
  if (config) {
    let cursor = '0';
    do {
      const scanResult = await redisCommand(['SCAN', cursor, 'MATCH', 'chat:*', 'COUNT', '100']);
      if (!scanResult) break;
      cursor = scanResult[0];
      const keys = scanResult[1] || [];
      for (const k of keys) {
        const raw = await redisCommand(['GET', k]);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.ts >= cutoff && (!phone || d.phone === phone)) results.push(d);
        }
      }
    } while (cursor !== '0');
  } else {
    for (const [k, v] of memoryStore.entries()) {
      if (k.startsWith && k.startsWith('chat:')) {
        const d = typeof v === 'string' ? JSON.parse(v) : v;
        if (d.ts >= cutoff && (!phone || d.phone === phone)) results.push(d);
      }
    }
  }
  return results.sort(function(a, b) { return b.ts - a.ts; });
}

async function getContacts() {
  const config = getRedisConfig();
  if (config) {
    const raw = await redisCommand(['GET', 'contacts']);
    return raw ? JSON.parse(raw) : {};
  }
  return memoryStore.get('contacts') || {};
}

module.exports = { storeMessage, getConversations, getContacts };
