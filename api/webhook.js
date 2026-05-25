const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

// ─── Auric Jewels System Prompt ──────────────────────────────
const SYSTEM_PROMPT = `You are a helpful assistant for Auric Jewels, a luxury gold and diamond jewellery showroom in Gurgaon.

About the showroom:
- Name: Auric Jewels
- Location: Greenwood Plaza, Sector 45, Gurgaon
- WhatsApp: +91 90124 95941
- Website: auricjewels.com
- Products: Gold jewellery, Diamond jewellery, Solitaire rings, Bridal sets, Platinum jewellery
- Price range: Rs.20,000 to Rs.2,00,000+
- Inventory: Rs.50 Crore worth of jewellery

Rules:
- Always reply in the same language the customer uses (Hindi, English, or Hinglish)
- Never use words like cheap, affordable, budget
- For location queries: share 'Greenwood Plaza, Sector 45, Gurgaon' and suggest Google Maps
- For appointment: share +91 90124 95941
- For gold rate: say current 22KT gold rate is approximately Rs.7,200 per gram (update daily)
- For making charges: typically 8-15% depending on design complexity
- For purity: we offer 18KT, 22KT gold and 950 platinum
- Be warm, professional, luxury brand tone
- Keep replies concise and helpful
- Never output JSON, code blocks, or structured data — only plain conversational text`;

// ─── Redis Helpers ───────────────────────────────────────────
function getRedisConfig() {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return { url, token };
  return null;
}

async function redisCmd(args) {
  const cfg = getRedisConfig();
  if (!cfg) return null;
  try {
    const resp = await fetch(cfg.url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    const data = await resp.json();
    return data.result;
  } catch (e) {
    console.log('Redis error:', e.message);
    return null;
  }
}

async function loadHistory(phone) {
  try {
    const raw = await redisCmd(['GET', 'history:' + phone]);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function saveHistory(phone, messages) {
  try {
    await redisCmd(['SET', 'history:' + phone, JSON.stringify(messages), 'EX', '86400']);
  } catch (e) {
    console.log('History save error:', e.message);
  }
}

async function storeMessage(phone, userMsg, botReply) {
  const cfg = getRedisConfig();
  if (!cfg) return;
  try {
    const ts = Date.now();
    const data = JSON.stringify({ phone, userMsg, botReply, timestamp: new Date().toISOString(), ts });
    await redisCmd(['SET', 'chat:' + phone + ':' + ts, data, 'EX', String(90 * 86400)]);
    const raw = await redisCmd(['GET', 'contacts']);
    const contacts = raw ? JSON.parse(raw) : {};
    contacts[phone] = {
      lastMsg: userMsg,
      lastTime: new Date().toISOString(),
      count: (contacts[phone] ? contacts[phone].count : 0) + 1
    };
    await redisCmd(['SET', 'contacts', JSON.stringify(contacts)]);
  } catch (e) {
    console.log('storeMessage error:', e.message);
  }
}

async function logToSheets(data) {
  if (!GOOGLE_SHEETS_URL) return;
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error('Sheets log error:', e.message);
  }
}

// ─── In-memory Session (30-min TTL) ─────────────────────────
const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000;

function getSession(phone) {
  const s = sessions.get(phone);
  if (s && Date.now() - s.lastActive < SESSION_TTL) {
    s.lastActive = Date.now();
    return s;
  }
  const ns = { messages: [], lastActive: Date.now(), name: null, greeted: false, historyLoaded: false };
  sessions.set(phone, ns);
  return ns;
}

setInterval(() => {
  const now = Date.now();
  for (const [p, s] of sessions) {
    if (now - s.lastActive > SESSION_TTL) sessions.delete(p);
  }
}, 600000);

// ─── Categories & Catalog ────────────────────────────────────
const CATEGORIES = {
  rings:          { url: 'https://www.auricjewels.com/categories/rings',                 label: 'Rings',        emoji: '💍' },
  earrings:       { url: 'https://www.auricjewels.com/categories/earrings',              label: 'Earrings',     emoji: '✨' },
  necklaces:      { url: 'https://www.auricjewels.com/categories/necklaces',             label: 'Necklaces',    emoji: '📿' },
  pendants:       { url: 'https://www.auricjewels.com/categories/pendants',              label: 'Pendants',     emoji: '💎' },
  chains:         { url: 'https://www.auricjewels.com/categories/chains',                label: 'Chains',       emoji: '⛓️' },
  bracelets:      { url: 'https://www.auricjewels.com/categories/bracelets',             label: 'Bracelets',    emoji: '📿' },
  bangles:        { url: 'https://www.auricjewels.com/categories/bangles',               label: 'Bangles',      emoji: '⭕' },
  solitaire:      { url: 'https://www.auricjewels.com/collections/solitaire-collection', label: 'Solitaire',    emoji: '💎' },
  'for-her':      { url: 'https://www.auricjewels.com/collections/for-her',              label: 'For Her',      emoji: '👩' },
  'for-him':      { url: 'https://www.auricjewels.com/collections/for-him',              label: 'For Him',      emoji: '👨' },
  'best-sellers': { url: 'https://www.auricjewels.com/collections/best-sellers',         label: 'Best Sellers', emoji: '🔥' },
};

const CATALOG = {
  gold_necklaces: { label: 'Gold Necklaces',   range: 'Rs.45,000 to Rs.2,50,000+',    popular: 'Choker Sets, Temple Necklace, Layered Chain' },
  diamond_rings:  { label: 'Diamond Rings',    range: 'Rs.25,000 to Rs.3,00,000+',    popular: 'Solitaire Rings, Cocktail Rings, Eternity Bands' },
  bridal_sets:    { label: 'Bridal Jewellery', range: 'Rs.1,50,000 to Rs.15,00,000+', popular: 'Complete Bridal Set, Kundan Bridal, Diamond Bridal' },
  bangles:        { label: 'Bangles & Kadas',  range: 'Rs.20,000 to Rs.1,50,000+',    popular: 'Gold Bangles, Diamond Bangles, Platinum Kada' },
  earrings:       { label: 'Earrings',         range: 'Rs.15,000 to Rs.2,00,000+',    popular: 'Jhumkas, Diamond Studs, Chandbalis, Hoops' },
  mangalsutra:    { label: 'Mangalsutra',      range: 'Rs.30,000 to Rs.1,50,000+',    popular: 'Diamond Mangalsutra, Gold, Modern Designs' },
  men:            { label: 'Mens Jewellery',   range: 'Rs.20,000 to Rs.1,00,000+',    popular: 'Gold Chains, Bracelets, Rings, Kadas' },
  solitaire:      { label: 'Solitaire Rings',  range: 'Rs.50,000 to Rs.5,00,000+',    popular: 'Round Cut, Princess Cut, Oval Solitaire' },
};

const PRODUCT_IMAGES = {
  rings:          'https://www.auricjewels.com/images/rings.jpg',
  earrings:       'https://www.auricjewels.com/images/earrings.jpg',
  necklaces:      'https://www.auricjewels.com/images/necklaces.jpg',
  pendants:       'https://www.auricjewels.com/images/necklaces.jpg',
  chains:         'https://www.auricjewels.com/images/for-him.jpg',
  bracelets:      'https://www.auricjewels.com/images/bangles.jpg',
  bangles:        'https://www.auricjewels.com/images/bangles.jpg',
  solitaire:      'https://www.auricjewels.com/images/rings.jpg',
  'for-her':      'https://www.auricjewels.com/images/bridal.jpg',
  'for-him':      'https://www.auricjewels.com/images/for-him.jpg',
  'best-sellers': 'https://www.auricjewels.com/images/necklaces.jpg',
};

const CATEGORY_TO_CATALOG = {
  rings: 'diamond_rings', earrings: 'earrings', necklaces: 'gold_necklaces',
  pendants: 'gold_necklaces', chains: 'men', bracelets: 'bangles', bangles: 'bangles',
  solitaire: 'solitaire', 'for-her': 'bridal_sets', 'for-him': 'men', 'best-sellers': 'diamond_rings',
};

function buildImageCaption(categorySlug) {
  const catInfo = CATEGORIES[categorySlug];
  const catalogInfo = CATALOG[CATEGORY_TO_CATALOG[categorySlug]];
  const lines = [];
  if (catInfo) lines.push(catInfo.emoji + ' ' + catInfo.label + ' | Auric Jewels, Gurgaon');
  if (catalogInfo) {
    lines.push('Price: ' + catalogInfo.range);
    lines.push('Popular: ' + catalogInfo.popular);
  }
  lines.push('');
  lines.push('📅 Book a private appointment: wa.me/919012495941');
  lines.push('🌐 www.auricjewels.com');
  return lines.join('\n');
}

// ─── Claude AI (claude-sonnet-4-20250514) with Redis History ─
async function getClaudeResponse(session, userMessage, phone) {
  // On cold start, restore conversation history from Redis
  if (!session.historyLoaded) {
    const redisHistory = await loadHistory(phone);
    if (redisHistory.length > 0) session.messages = redisHistory;
    session.historyLoaded = true;
  }

  session.messages.push({ role: 'user', content: userMessage });
  if (session.messages.length > 20) session.messages = session.messages.slice(-20);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: session.messages
    })
  });

  const data = await response.json();

  if (data.error) {
    console.error('Claude API error:', JSON.stringify(data.error));
    return null;
  }

  const reply = data && data.content && data.content[0] ? data.content[0].text : null;

  if (reply) {
    session.messages.push({ role: 'assistant', content: reply });
    // Persist to Redis so history survives serverless cold starts
    await saveHistory(phone, session.messages);
  }

  if (!session.name) {
    const nameMatch = userMessage.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+)/i);
    if (nameMatch) session.name = nameMatch[1];
  }

  return reply;
}

// ─── WhatsApp Senders ────────────────────────────────────────
async function sendText(to, text) {
  const chunks = text.length > 4000 ? text.match(/.{1,4000}/gs) : [text];
  for (const chunk of chunks) {
    await fetch('https://graph.facebook.com/v21.0/' + PHONE_NUMBER_ID + '/messages', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body: chunk } })
    });
  }
}

async function sendImage(to, imageUrl, caption) {
  try {
    const resp = await fetch('https://graph.facebook.com/v21.0/' + PHONE_NUMBER_ID + '/messages', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp', to, type: 'image',
        image: { link: imageUrl, caption: caption || '' }
      })
    });
    const result = await resp.json();
    if (result.error) console.error('WhatsApp image error:', JSON.stringify(result.error));
  } catch (e) {
    console.error('sendImage failed:', e.message);
  }
}

async function sendButtons(to, bodyText, buttons) {
  await fetch('https://graph.facebook.com/v21.0/' + PHONE_NUMBER_ID + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to, type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(function(b) { return { type: 'reply', reply: { id: b.id, title: b.title } }; })
        }
      }
    })
  });
}

async function sendCategoryList(to) {
  const rows = Object.entries(CATEGORIES).map(function(entry) {
    const key = entry[0];
    const cat = entry[1];
    return {
      id: 'cat_' + key,
      title: cat.emoji + ' ' + cat.label,
      description: (CATALOG[key] && CATALOG[key].range) ? CATALOG[key].range : 'Explore collection'
    };
  });

  await fetch('https://graph.facebook.com/v21.0/' + PHONE_NUMBER_ID + '/messages', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + WHATSAPP_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to, type: 'interactive',
      interactive: {
        type: 'list',
        body: { text: 'Explore our exquisite collections ✨\nTap below to browse:' },
        action: { button: 'View Collections', sections: [{ title: 'Our Collections', rows: rows.slice(0, 10) }] }
      }
    })
  });
}

async function sendWelcomeMenu(to, name) {
  const greeting = name
    ? 'Welcome back, ' + name + '! ✨💎\nHow can I assist you today?'
    : 'Welcome to Auric Jewels ✨💎\nGurgaon\'s premier luxury jewellery showroom.\n\nHow can I help you today?';

  await sendButtons(to, greeting, [
    { id: 'browse_catalog',   title: '💎 Browse Collection' },
    { id: 'book_appointment', title: '📅 Book Appointment' },
    { id: 'bridal_inquiry',   title: '👰 Bridal Jewellery' }
  ]);
}

async function handleCategoryResponse(to, text, categorySlug) {
  const catInfo = CATEGORIES[categorySlug];
  const imgUrl  = PRODUCT_IMAGES[categorySlug];

  if (imgUrl) await sendImage(to, imgUrl, buildImageCaption(categorySlug));

  if (catInfo) {
    const body = text
      ? text + '\n\n' + catInfo.emoji + ' Browse ' + catInfo.label + ':\n' + catInfo.url
      : catInfo.emoji + ' Browse ' + catInfo.label + ':\n' + catInfo.url;
    await sendButtons(to, body, [
      { id: 'cat_' + categorySlug, title: catInfo.emoji + ' View More' },
      { id: 'book_appointment',    title: '📅 Book Visit' },
      { id: 'browse_catalog',      title: '💎 More Collections' }
    ]);
  } else if (text) {
    await sendText(to, text);
  }
}

// ─── Main Webhook Handler ────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified');
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  if (req.method === 'POST') {
    try {
      const body  = req.body;
      const value = body && body.entry && body.entry[0] && body.entry[0].changes &&
                    body.entry[0].changes[0] && body.entry[0].changes[0].value;

      if (value && value.statuses) return res.status(200).json({ status: 'ok' });

      const message = value && value.messages && value.messages[0];
      if (!message) return res.status(200).json({ status: 'no message' });

      const from = message.from;
      const session = getSession(from);
      const profileName = (value.contacts && value.contacts[0] &&
                           value.contacts[0].profile && value.contacts[0].profile.name)
        ? value.contacts[0].profile.name : null;
      if (profileName && !session.name) session.name = profileName.split(' ')[0];

      // ── Interactive replies ──────────────────────────────
      if (message.type === 'interactive') {
        const btnId = (message.interactive && message.interactive.button_reply && message.interactive.button_reply.id)
          || (message.interactive && message.interactive.list_reply && message.interactive.list_reply.id);

        if (btnId === 'browse_catalog') {
          await sendCategoryList(from);
          await storeMessage(from, '[Tapped: Browse Collection]', 'Sent category list');
          return res.status(200).json({ status: 'ok' });
        }

        if (btnId === 'book_appointment') {
          const reply = await getClaudeResponse(session, 'I want to book an appointment to visit the showroom.', from);
          await sendText(from, reply || 'To book an appointment, please WhatsApp us at +91 90124 95941. We look forward to welcoming you! ✨');
          await storeMessage(from, '[Tapped: Book Appointment]', reply);
          return res.status(200).json({ status: 'ok' });
        }

        if (btnId === 'bridal_inquiry') {
          const reply = await getClaudeResponse(session, 'I am looking for bridal jewellery for my wedding.', from);
          await handleCategoryResponse(from, reply, 'for-her');
          await storeMessage(from, '[Tapped: Bridal Jewellery]', reply);
          return res.status(200).json({ status: 'ok' });
        }

        if (btnId && btnId.indexOf('cat_') === 0) {
          const catKey = btnId.replace('cat_', '');
          const cat = CATEGORIES[catKey];
          if (cat) {
            const reply = await getClaudeResponse(session, 'Show me ' + cat.label + ' collection with prices.', from);
            await handleCategoryResponse(from, reply, catKey);
            await storeMessage(from, '[Selected: ' + cat.label + ']', reply);
            return res.status(200).json({ status: 'ok' });
          }
        }
      }

      // ── Text messages ────────────────────────────────────
      if (message.type === 'text') {
        const userText = message.text && message.text.body ? message.text.body.trim() : '';
        if (!userText) return res.status(200).json({ status: 'empty' });

        const lower = userText.toLowerCase();

        // Greeting - show welcome menu
        if (['hi', 'hello', 'hey', 'hii', 'hlo', 'menu', 'start', 'hyy', 'hy'].indexOf(lower) !== -1) {
          await sendWelcomeMenu(from, session.name);
          session.greeted = true;
          await storeMessage(from, userText, 'Welcome menu sent');
          return res.status(200).json({ status: 'ok' });
        }

        // Generic catalog request
        const isGenericCatalog =
          (lower.includes('image') || lower.includes('photo') || lower.includes('picture') ||
           lower.includes('pics') || lower.includes('catalog') || lower.includes('catalogue')) &&
          !lower.includes('ring') && !lower.includes('necklace') && !lower.includes('earring') &&
          !lower.includes('bangle') && !lower.includes('bracelet') && !lower.includes('pendant') &&
          !lower.includes('chain') && !lower.includes('bridal') && !lower.includes('solitaire');

        if (isGenericCatalog) {
          await sendText(from, 'Here are our stunning collections ✨\nTap any category to see pieces with images:');
          await sendCategoryList(from);
          await storeMessage(from, userText, 'Sent category catalog');
          return res.status(200).json({ status: 'ok' });
        }

        // Detect jewellery category from keywords
        const categoryKeywords = {
          rings:          ['ring', 'rings', 'engagement ring', 'wedding ring', 'solitaire ring'],
          earrings:       ['earring', 'earrings', 'jhumka', 'studs', 'chandbali', 'tops'],
          necklaces:      ['necklace', 'necklaces', 'haar', 'choker', 'chain set'],
          pendants:       ['pendant', 'pendants', 'locket'],
          chains:         ['chain', 'chains'],
          bracelets:      ['bracelet', 'bracelets', 'kada'],
          bangles:        ['bangle', 'bangles', 'chudi'],
          solitaire:      ['solitaire', 'solitaires'],
          'for-her':      ['for her', 'women', 'ladies', 'bridal', 'bride', 'wedding'],
          'for-him':      ['for him', 'men', 'gents', 'male', 'mens', 'groom'],
          'best-sellers': ['best seller', 'bestseller', 'popular', 'trending'],
        };

        let detectedCategory = null;
        for (const catSlug of Object.keys(categoryKeywords)) {
          if (categoryKeywords[catSlug].some(function(kw) { return lower.includes(kw); })) {
            detectedCategory = catSlug;
            break;
          }
        }

        // Get Claude AI response
        const reply = await getClaudeResponse(session, userText, from);
        const cleanReply = reply || 'Visit Auric Jewels at Greenwood Plaza, Sector 45, Gurgaon or WhatsApp +91 90124 95941 ✨';

        if (detectedCategory) {
          await handleCategoryResponse(from, cleanReply, detectedCategory);
          await storeMessage(from, userText, cleanReply);
          return res.status(200).json({ status: 'ok' });
        }

        // Smart follow-up buttons based on intent
        const hasVisit  = lower.includes('visit') || lower.includes('showroom') || lower.includes('store') || lower.includes('address') || lower.includes('location');
        const hasBridal = lower.includes('bridal') || lower.includes('wedding') || lower.includes('bride') || lower.includes('shaadi');
        const hasPrice  = lower.includes('price') || lower.includes('rate') || lower.includes('cost') || lower.includes('kitna') || lower.includes('range') || lower.includes('gold rate');

        if (hasVisit || hasBridal) {
          await sendButtons(from, cleanReply, [
            { id: 'book_appointment', title: '📅 Book Visit' },
            { id: 'browse_catalog',   title: '💎 Browse More' },
            { id: 'bridal_inquiry',   title: '👰 Bridal Sets' }
          ]);
        } else if (hasPrice) {
          await sendButtons(from, cleanReply, [
            { id: 'browse_catalog',   title: '💎 View Collections' },
            { id: 'book_appointment', title: '📅 Visit Store' },
            { id: 'bridal_inquiry',   title: '👰 Bridal Range' }
          ]);
        } else if (session.messages.length % 6 === 0) {
          await sendButtons(from, cleanReply, [
            { id: 'browse_catalog',   title: '💎 Browse Collection' },
            { id: 'book_appointment', title: '📅 Book Visit' },
            { id: 'bridal_inquiry',   title: '👰 Bridal' }
          ]);
        } else {
          await sendText(from, cleanReply);
        }

        await storeMessage(from, userText, cleanReply);
        logToSheets({ name: session.name, phone: from, source: 'WhatsApp Bot', query: userText, reply: cleanReply.substring(0, 200) });

        return res.status(200).json({ status: 'ok' });
      }

      // ── Image/Document messages ──────────────────────────
      if (message.type === 'image' || message.type === 'document') {
        const reply = session.name
          ? 'Thank you for sharing, ' + session.name + '! 💎 Our design team will review this. Share your metal preference or occasion and we will guide you. ✨'
          : 'Thank you for sharing! 💎 Our design team will review this. Share your metal preference or occasion and we will guide you. ✨';

        await sendButtons(from, reply, [
          { id: 'book_appointment', title: '📅 Discuss in Store' },
          { id: 'browse_catalog',   title: '💎 Browse Similar' }
        ]);
        await storeMessage(from, '[Sent image/document]', reply);
        return res.status(200).json({ status: 'ok' });
      }

      return res.status(200).json({ status: 'ok' });
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(200).json({ status: 'error handled' });
    }
  }

  return res.status(405).send('Method not allowed');
};
