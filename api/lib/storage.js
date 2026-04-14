// Storage module - Vercel KV with in-memory fallback
let kv = null;
const memoryStore = new Map();

async function getKV() {
  if (kv) return kv;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
    return kv;
  } catch (e) {
    console.log('KV not available, using in-memory storage');
    return null;
  }
}

export async function storeMessage(phone, userMsg, botReply) {
  const ts = Date.now();
  const key = `chat:${phone}:${ts}`;
  const data = { phone, userMsg, botReply, timestamp: new Date().toISOString(), ts };
  
  const store = await getKV();
  if (store) {
    try {
      await store.set(key, JSON.stringify(data), { ex: 90 * 86400 }); // 90 days
      // Update contacts list
      const contacts = JSON.parse(await store.get('contacts') || '{}');
      contacts[phone] = { lastMsg: userMsg, lastTime: data.timestamp, count: (contacts[phone]?.count || 0) + 1 };
      await store.set('contacts', JSON.stringify(contacts));
    } catch (e) { console.log('KV store error:', e.message); }
  } else {
    memoryStore.set(key, data);
    const contacts = memoryStore.get('contacts') || {};
    contacts[phone] = { lastMsg: userMsg, lastTime: data.timestamp, count: (contacts[phone]?.count || 0) + 1 };
    memoryStore.set('contacts', contacts);
  }
}

export async function getConversations(days, phone) {
  const store = await getKV();
  const cutoff = days ? Date.now() - days * 86400000 : 0;
  let results = [];

  if (store) {
    try {
      let cursor = 0;
      do {
        const [next, keys] = await store.scan(cursor, { match: 'chat:*', count: 100 });
        cursor = next;
        for (const k of keys) {
          const raw = await store.get(k);
          const d = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (d && d.ts >= cutoff && (!phone || d.phone === phone)) results.push(d);
        }
      } while (cursor !== 0);
    } catch (e) { console.log('KV read error:', e.message); }
  } else {
    for (const [k, v] of memoryStore.entries()) {
      if (k.startsWith('chat:') && v.ts >= cutoff && (!phone || v.phone === phone)) results.push(v);
    }
  }
  return results.sort((a, b) => b.ts - a.ts);
}

export async function getContacts() {
  const store = await getKV();
  if (store) {
    try {
      const raw = await store.get('contacts');
      return typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
    } catch (e) { return {}; }
  }
  return memoryStore.get('contacts') || {};
}
