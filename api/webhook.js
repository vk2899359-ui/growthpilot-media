const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SALEOR_API = "https://auric.thecodemesh.online/graphql/";
const SALEOR_TOKEN = process.env.SALEOR_TOKEN || "fAPR16BVrzI4thcLtj8c4tUUG1wGU6";

// ─── Session Memory (30 min per user) ───────────────────────
const sessions = new Map();
const SESSION_TTL = 30 * 60 * 1000;

function getSession(phone) {
  const s = sessions.get(phone);
  if (s && Date.now() - s.lastActive < SESSION_TTL) {
    s.lastActive = Date.now();
    return s;
  }
  const ns = { messages: [], lastActive: Date.now(), name: null, greeted: false };
  sessions.set(phone, ns);
  return ns;
}

setInterval(() => {
  const now = Date.now();
  for (const [p, s] of sessions) {
    if (now - s.lastActive > SESSION_TTL) sessions.delete(p);
  }
}, 600000);

// ─── Category & Collection Links ────────────────────────────
const CATEGORIES = {
  rings:       { url: "https://www.auricjewels.com/categories/rings",        label: "Rings",        emoji: "💍" },
  earrings:    { url: "https://www.auricjewels.com/categories/earrings",     label: "Earrings",     emoji: "✨" },
  necklaces:   { url: "https://www.auricjewels.com/categories/necklaces",    label: "Necklaces",    emoji: "📿" },
  pendants:    { url: "https://www.auricjewels.com/categories/pendants",     label: "Pendants",     emoji: "💎" },
  chains:      { url: "https://www.auricjewels.com/categories/chains",       label: "Chains",       emoji: "⛓️" },
  bracelets:   { url: "https://www.auricjewels.com/categories/bracelets",    label: "Bracelets",    emoji: "📿" },
  bangles:     { url: "https://www.auricjewels.com/categories/bangles",      label: "Bangles",      emoji: "⭕" },
  solitaire:   { url: "https://www.auricjewels.com/collections/solitaire-collection", label: "Solitaire Collection", emoji: "💎" },
  "for-her":   { url: "https://www.auricjewels.com/collections/for-her",     label: "For Her",      emoji: "👩" },
  "for-him":   { url: "https://www.auricjewels.com/collections/for-him",     label: "For Him",      emoji: "👨" },
  "best-sellers": { url: "https://www.auricjewels.com/collections/best-sellers", label: "Best Sellers", emoji: "🔥" },
};

// ─── Product Catalog with Price Ranges ──────────────────────
const CATALOG = {
  gold_necklaces:  { label: "Gold Necklaces",     range: "₹45,000 – ₹2,50,000+",  popular: "Choker Sets, Temple Necklace, Layered Chain" },
  diamond_rings:   { label: "Diamond Rings",       range: "₹25,000 – ₹3,00,000+",  popular: "Solitaire Rings, Cocktail Rings, Eternity Bands" },
  bridal_sets:     { label: "Bridal Jewellery",    range: "₹1,50,000 – ₹15,00,000+", popular: "Complete Bridal Set, Kundan Bridal, Diamond Bridal" },
  bangles:         { label: "Bangles & Kadas",     range: "₹20,000 – ₹1,50,000+",  popular: "Gold Bangles, Diamond Bangles, Platinum Kada" },
  earrings:        { label: "Earrings",            range: "₹15,000 – ₹2,00,000+",  popular: "Jhumkas, Diamond Studs, Chandbalis, Hoops" },
  mangalsutra:     { label: "Mangalsutra",         range: "₹30,000 – ₹1,50,000+",  popular: "Diamond Mangalsutra, Gold, Modern Designs" },
  men:             { label: "Men's Jewellery",     range: "₹20,000 – ₹1,00,000+",  popular: "Gold Chains, Bracelets, Rings, Kadas" },
  solitaire:       { label: "Solitaire Rings",     range: "₹50,000 – ₹5,00,000+",  popular: "Round Cut, Princess Cut, Oval Solitaire" },
};

function catalogText() {
  let t = "";
  for (const [, c] of Object.entries(CATALOG)) {
    t += `${c.label}: ${c.range} | Popular: ${c.popular}\n`;
  }
  return t;
}

// ─── Image Cache from Saleor ────────────────────────────────
let imageCache = null;
let imageCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000;

async function fetchImages() {
  if (imageCache && Date.now() - imageCacheTime < CACHE_TTL) return imageCache;
  try {
    const catRes = await fetch(SALEOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SALEOR_TOKEN },
      body: JSON.stringify({
        query: `{ categories(first: 20) { edges { node { slug name backgroundImage { url alt } } } } }`
      })
    });
    const catData = await catRes.json();
    const cats = {};
    if (catData?.data?.categories?.edges) {
      for (const edge of catData.data.categories.edges) {
        const node = edge.node;
        if (node.backgroundImage?.url) {
          cats[node.slug] = { url: node.backgroundImage.url, alt: node.backgroundImage.alt || node.name, name: node.name };
        }
      }
    }
    const colRes = await fetch(SALEOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SALEOR_TOKEN },
      body: JSON.stringify({
        query: `{ collections(first: 20) { edges { node { slug name backgroundImage { url alt } } } } }`
      })
    });
    const colData = await colRes.json();
    if (colData?.data?.collections?.edges) {
      for (const edge of colData.data.collections.edges) {
        const node = edge.node;
        if (node.backgroundImage?.url) {
          cats[node.slug] = { url: node.backgroundImage.url, alt: node.backgroundImage.alt || node.name, name: node.name };
        }
      }
    }
    imageCache = cats;
    imageCacheTime = Date.now();
    return cats;
  } catch (e) {
    console.error("Image fetch error:", e);
    return imageCache || {};
  }
}

// ─── System Prompt ──────────────────────────────────────────
const SYSTEM_PROMPT = `You are the virtual jewellery consultant for Auric Jewels, a luxury gold and diamond jewellery showroom in Sector 45, Gurugram.

TONE: Warm, elegant, professional. Like a trusted personal jeweller. Use emojis sparingly (✨💎🌟) for warmth. Never pushy.

LANGUAGE: English ONLY. Never Hindi/Hinglish.

PERSONALIZATION:
- If the customer shared their name, use it naturally (e.g., "Great choice, Priya!")
- Reference previous messages in the session — if they mentioned a budget or occasion, remember it
- Be conversational, not robotic

CAPABILITIES:
1. Product Discovery — suggest pieces by occasion, budget, style
2. Price Guidance — use this catalog:
${catalogText()}
Always say "starting from" or "range". Encourage visit for exact pricing.
3. Appointment Booking — collect: Name, preferred date/time, occasion. Confirm with: "Your appointment is noted! Our team will confirm shortly. We look forward to welcoming you ✨"
4. Store Info — Sector 45, Gurugram | WhatsApp: +91 90124 95941 | Hours: 10 AM – 8 PM daily
5. Custom Design — collect requirements, say design team will connect

CATEGORY DETECTION:
When user asks about a specific jewellery category, respond in this exact JSON format ONLY:
{"text": "your reply message here", "category": "category-slug-here"}

Valid category slugs: rings, earrings, necklaces, pendants, chains, bracelets, bangles, solitaire, for-her, for-him, best-sellers

Example: User says "show me rings" → {"text": "Here's our stunning ring collection! 💍 From solitaire diamonds to everyday gold bands, we have something for every occasion.", "category": "rings"}

If NO specific category is mentioned, respond with plain text (no JSON).

RULES:
- Discounts: "We focus on value and craftsmanship. Our pricing reflects hallmarked purity. Visit us for seasonal celebrations."
- Unrelated queries: Politely redirect to jewellery
- Keep responses SHORT (2-4 lines max) — this is WhatsApp, not email
- If someone shares a budget, recommend matching categories
- For bridal queries: Ask wedding date, style preference (traditional/modern/fusion), metals preferred`;

// ─── Claude API with Session Memory ─────────────────────────
async function getClaudeResponse(session, userMessage) {
  session.messages.push({ role: "user", content: userMessage });
  if (session.messages.length > 20) session.messages = session.messages.slice(-20);

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: session.messages
    })
  });

  const data = await res.json();
  const reply = data?.content?.[0]?.text || "Thank you for reaching out! Please try again. ✨";
  session.messages.push({ role: "assistant", content: reply });

  // Try to extract name from conversation
  if (!session.name) {
    const nameMatch = userMessage.match(/(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+)/i);
    if (nameMatch) session.name = nameMatch[1];
  }

  return reply;
}

// ─── Send WhatsApp Text ─────────────────────────────────────
async function sendText(to, text) {
  const chunks = text.length > 4000 ? text.match(/.{1,4000}/gs) : [text];
  for (const chunk of chunks) {
    await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: chunk } })
    });
  }
}

// ─── Send Image Message ─────────────────────────────────────
async function sendImage(to, imageUrl, caption) {
  await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "image",
      image: { link: imageUrl, caption: caption || "" }
    })
  });
}

// ─── Send Interactive Buttons ───────────────────────────────
async function sendButtons(to, bodyText, buttons) {
  await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({ type: "reply", reply: { id: b.id, title: b.title } }))
        }
      }
    })
  });
}

// ─── Send Category List ─────────────────────────────────────
async function sendCategoryList(to) {
  const rows = Object.entries(CATEGORIES).map(([key, cat]) => ({
    id: `cat_${key}`,
    title: `${cat.emoji} ${cat.label}`,
    description: CATALOG[key]?.range || "Explore collection"
  }));

  await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "interactive",
      interactive: {
        type: "list",
        body: { text: "Explore our exquisite collections ✨\nTap below to browse:" },
        action: {
          button: "View Collections",
          sections: [{ title: "Our Collections", rows: rows.slice(0, 10) }]
        }
      }
    })
  });
}

// ─── Welcome Menu with Buttons ──────────────────────────────
async function sendWelcomeMenu(to, name) {
  const greeting = name
    ? `Welcome back, ${name}! ✨💎\nHow can I assist you today?`
    : `Welcome to Auric Jewels ✨💎\nGurgaon's premier luxury jewellery showroom.\n\nHow can I help you today?`;

  await sendButtons(to, greeting, [
    { id: "browse_catalog", title: "💎 Browse Collection" },
    { id: "book_appointment", title: "📅 Book Appointment" },
    { id: "bridal_inquiry", title: "👰 Bridal Jewellery" }
  ]);
}

// ─── Handle Category Response (Image + Text) ────────────────
async function handleCategoryResponse(to, text, categorySlug) {
  const images = await fetchImages();
  const catImage = images[categorySlug];
  const catInfo = CATEGORIES[categorySlug];

  // Send image first if available
  if (catImage) {
    const caption = catInfo
      ? `${catInfo.emoji} ${catInfo.label} Collection\n🔗 ${catInfo.url}`
      : `${catImage.name} Collection`;
    await sendImage(to, catImage.url, caption);
  }

  // Then send text reply with browse button
  if (catInfo) {
    await sendButtons(to, text, [
      { id: `cat_${categorySlug}`, title: `${catInfo.emoji} View More` },
      { id: "book_appointment", title: "📅 Book Visit" },
      { id: "browse_catalog", title: "💎 More Collections" }
    ]);
  } else {
    await sendText(to, text);
  }
}

// ─── Main Webhook Handler ───────────────────────────────────
module.exports = async function handler(req, res) {
  // GET = webhook verification
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  }

  // POST = incoming messages
  if (req.method === "POST") {
    try {
      const body = req.body;
      const value = body?.entry?.[0]?.changes?.[0]?.value;

      // Skip status updates
      if (value?.statuses) return res.status(200).json({ status: "ok" });

      const message = value?.messages?.[0];
      if (!message) return res.status(200).json({ status: "no message" });

      const from = message.from;
      const session = getSession(from);
      const profileName = value?.contacts?.[0]?.profile?.name || null;
      if (profileName && !session.name) session.name = profileName.split(" ")[0];

      // ── Interactive button/list replies ──
      if (message.type === "interactive") {
        const btnId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id;

        if (btnId === "browse_catalog") {
          await sendCategoryList(from);
          return res.status(200).json({ status: "ok" });
        }

        if (btnId === "book_appointment") {
          const reply = await getClaudeResponse(session, "I want to book an appointment to visit the showroom.");
          await sendText(from, reply);
          return res.status(200).json({ status: "ok" });
        }

        if (btnId === "bridal_inquiry") {
          const reply = await getClaudeResponse(session, "I am looking for bridal jewellery for my wedding.");
          await handleCategoryResponse(from, reply, "for-her");
          return res.status(200).json({ status: "ok" });
        }

        // Category selection from list
        if (btnId?.startsWith("cat_")) {
          const catKey = btnId.replace("cat_", "");
          const cat = CATEGORIES[catKey];
          if (cat) {
            const reply = await getClaudeResponse(session, `Show me ${cat.label} collection with prices.`);
            await handleCategoryResponse(from, reply, catKey);
            return res.status(200).json({ status: "ok" });
          }
        }
      }

      // ── Text messages ──
      if (message.type === "text") {
        const userText = message.text?.body?.trim();
        if (!userText) return res.status(200).json({ status: "empty" });

        const lower = userText.toLowerCase();

        // Welcome triggers → send button menu
        if (["hi", "hello", "hey", "hii", "hlo", "menu", "start", "hyy", "hy"].includes(lower)) {
          await sendWelcomeMenu(from, session.name);
          session.greeted = true;
          return res.status(200).json({ status: "ok" });
        }

        // Get Claude response
        const reply = await getClaudeResponse(session, userText);

        // Check if Claude returned JSON with category
        try {
          const parsed = JSON.parse(reply);
          if (parsed.text && parsed.category) {
            await handleCategoryResponse(from, parsed.text, parsed.category);
            return res.status(200).json({ status: "ok" });
          }
        } catch (e) {
          // Not JSON, send as plain text with follow-up buttons
        }

        // Smart follow-up buttons based on context
        const hasPrice = lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("budget") || lower.includes("kitna") || lower.includes("range");
        const hasBridal = lower.includes("bridal") || lower.includes("wedding") || lower.includes("bride") || lower.includes("shaadi");
        const hasVisit = lower.includes("visit") || lower.includes("showroom") || lower.includes("store") || lower.includes("address") || lower.includes("location");

        if (hasVisit || hasBridal) {
          await sendButtons(from, reply, [
            { id: "book_appointment", title: "📅 Book Visit" },
            { id: "browse_catalog", title: "💎 Browse More" },
            { id: "bridal_inquiry", title: "👰 Bridal Sets" }
          ]);
        } else if (hasPrice) {
          await sendButtons(from, reply, [
            { id: "browse_catalog", title: "💎 View Collections" },
            { id: "book_appointment", title: "📅 Visit Store" },
            { id: "bridal_inquiry", title: "👰 Bridal Range" }
          ]);
        } else {
          // Regular reply — add buttons after every 3rd message for engagement
          if (session.messages.length % 6 === 0) {
            await sendButtons(from, reply, [
              { id: "browse_catalog", title: "💎 Browse Collection" },
              { id: "book_appointment", title: "📅 Book Visit" },
              { id: "bridal_inquiry", title: "👰 Bridal" }
            ]);
          } else {
            await sendText(from, reply);
          }
        }

        return res.status(200).json({ status: "ok" });
      }

      // ── Image/Document messages ──
      if (message.type === "image" || message.type === "document") {
        const reply = session.name
          ? `Thank you for sharing, ${session.name}! 💎 Our design team will review this. Share any details — metal preference, budget range, occasion — and we'll guide you. ✨`
          : `Thank you for sharing! 💎 Our design team will review this. Share any details — metal preference, budget range, occasion — and we'll guide you. ✨`;

        await sendButtons(from, reply, [
          { id: "book_appointment", title: "📅 Discuss in Store" },
          { id: "browse_catalog", title: "💎 Browse Similar" }
        ]);
        return res.status(200).json({ status: "ok" });
      }

      return res.status(200).json({ status: "ok" });
    } catch (error) {
      console.error("Webhook error:", error);
      return res.status(200).json({ status: "error handled" });
    }
  }

  return res.status(405).send("Method not allowed");
};
