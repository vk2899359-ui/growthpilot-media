const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
import { storeMessage } from './lib/storage';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SALEOR_API = "https://auric.thecodemesh.online/graphql/";
const SALEOR_TOKEN = process.env.SALEOR_TOKEN || "fAPR16BVrzI4thcLtj8c4tUUG1wGU6";
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL;

// ─── Log to Google Sheets CRM ───────────────────────────────
async function logToSheets(data) {
  if (!GOOGLE_SHEETS_URL) return;
  try {
    await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch (e) {
    console.error("Sheets log error:", e.message);
  }
}

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

// ─── Product Images (hardcoded for reliability) ─────────────
const PRODUCT_IMAGES = {
  "rings":        "https://storage.googleapis.com/jewelscraft-media/products/BIDG0412R02_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-85179.webp",
  "earrings":     "https://storage.googleapis.com/jewelscraft-media/products/KE07049-2Y0000_1_lar.jpg",
  "necklaces":    "https://storage.googleapis.com/jewelscraft-media/products/BISP0428N44_YAA18DIG6XXXXXXXX_ABCD00-PICS-00003-1024-41547.webp",
  "pendants":     "https://storage.googleapis.com/jewelscraft-media/products/BISM0012P02_YAA18NAV2DIG6RUBY_ABCD00-PICS-00004-1024-3234.webp",
  "chains":       "https://storage.googleapis.com/jewelscraft-media/products/JS00777-1YP900_1_lar.jpg",
  "bracelets":    "https://storage.googleapis.com/jewelscraft-media/products/JT02017-1YP900_1_lar.jpg",
  "bangles":      "https://storage.googleapis.com/jewelscraft-media/products/BIDG0412R03_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-85178.webp",
  "solitaire":    "https://storage.googleapis.com/jewelscraft-media/products/BIDG0412R02_YAA18DIG6XXXXXXXX_ABCD00-PICS-00001-1024-85179.webp",
  "for-her":      "https://storage.googleapis.com/jewelscraft-media/products/BISP0428N44_YAA18DIG6XXXXXXXX_ABCD00-PICS-00003-1024-41547.webp",
  "for-him":      "https://storage.googleapis.com/jewelscraft-media/products/JS00777-1YP900_1_lar.jpg",
  "best-sellers": "https://storage.googleapis.com/jewelscraft-media/products/KE07049-2Y0000_1_lar.jpg",
};

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
6. IMAGES — The system automatically sends product images when customers ask about specific categories. You don't need to do anything special for images — just write your helpful text reply.

CATEGORY DETECTION:
The system handles category detection and image sending automatically. You just write a helpful, warm text reply about the jewellery they asked about. Include price ranges from the catalog above. NEVER output any JSON, code blocks, or structured data — only plain conversational text.

If NO specific category is mentioned, just respond naturally with helpful information.

RULES:
- NEVER output JSON, code blocks, curly braces, or any structured data format
- NEVER include {"category"} or {"text"} in your response
- Just write plain conversational English text — nothing else
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
  try {
    const resp = await fetch(`https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp", to, type: "image",
        image: { link: imageUrl, caption: caption || "" }
      })
    });
    const result = await resp.json();
    if (result.error) {
      console.error("WhatsApp image error:", JSON.stringify(result.error));
      // Fallback: send link as text instead
      await sendText(to, `${caption}\n\n🔗 View: ${imageUrl}`);
    }
  } catch (e) {
    console.error("sendImage failed:", e.message);
  }
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

// ─── Handle Category Response (Link + Text + Buttons) ───────
async function handleCategoryResponse(to, text, categorySlug) {
  const catInfo = CATEGORIES[categorySlug];

  if (catInfo) {
    // Send text with website link
    const fullMsg = `${text}\n\n${catInfo.emoji} *Browse ${catInfo.label}:*\n${catInfo.url}`;
    await sendButtons(to, fullMsg, [
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

        // Image/photo generic triggers → show category list
        if ((lower.includes("image") || lower.includes("photo") || lower.includes("picture") || lower.includes("pics") || lower.includes("catalog") || lower.includes("catalogue")) && !lower.includes("ring") && !lower.includes("necklace") && !lower.includes("earring") && !lower.includes("bangle") && !lower.includes("bracelet") && !lower.includes("pendant") && !lower.includes("chain") && !lower.includes("bridal") && !lower.includes("solitaire")) {
          await sendText(from, "Here are our stunning collections ✨\nTap any category to see pieces with images:");
          await sendCategoryList(from);
          return res.status(200).json({ status: "ok" });
        }

        // Detect specific category from user message → send image + Claude reply
        const categoryKeywords = {
          "rings": ["ring", "rings", "engagement ring", "wedding ring", "solitaire ring"],
          "earrings": ["earring", "earrings", "jhumka", "studs", "chandbali", "tops"],
          "necklaces": ["necklace", "necklaces", "haar", "choker", "chain set"],
          "pendants": ["pendant", "pendants", "locket"],
          "chains": ["chain", "chains"],
          "bracelets": ["bracelet", "bracelets", "kada"],
          "bangles": ["bangle", "bangles", "chudi"],
          "solitaire": ["solitaire", "solitaires"],
          "for-her": ["for her", "women", "ladies", "bridal", "bride", "wedding"],
          "for-him": ["for him", "men", "gents", "male"],
          "best-sellers": ["best seller", "bestseller", "popular", "trending"],
        };

        let detectedCategory = null;
        for (const [catSlug, keywords] of Object.entries(categoryKeywords)) {
          if (keywords.some(kw => lower.includes(kw))) {
            detectedCategory = catSlug;
            break;
          }
        }

        // Get Claude response (always)
        const reply = await getClaudeResponse(session, userText);

        // Clean any JSON/code that Claude might have returned
        let cleanReply = reply;
        // Remove markdown code blocks
        cleanReply = cleanReply.replace(/```json[\s\S]*?```/gi, "").trim();
        cleanReply = cleanReply.replace(/```[\s\S]*?```/gi, "").trim();
        // Remove JSON objects like {"text": "...", "category": "..."}
        cleanReply = cleanReply.replace(/\{[\s\S]*?"category"[\s\S]*?\}/g, "").trim();
        cleanReply = cleanReply.replace(/\{[\s\S]*?"text"[\s\S]*?\}/g, "").trim();
        // Remove standalone json word
        cleanReply = cleanReply.replace(/^json\s*/gim, "").trim();
        // If cleanup removed everything, use original minus JSON
        if (!cleanReply || cleanReply.length < 10) {
          cleanReply = reply.replace(/[{}"\n]/g, " ").replace(/category\s*:\s*\w+/gi, "").replace(/text\s*:/gi, "").replace(/\s+/g, " ").trim();
        }

        // If category detected → send image + text
        if (detectedCategory) {
          await handleCategoryResponse(from, cleanReply, detectedCategory);
          return res.status(200).json({ status: "ok" });
        }
         await storeMessage(from, userText, cleanReply);
        // Smart follow-up buttons based on context
        const hasPrice = lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("budget") || lower.includes("kitna") || lower.includes("range");
        const hasBridal = lower.includes("bridal") || lower.includes("wedding") || lower.includes("bride") || lower.includes("shaadi");
        const hasVisit = lower.includes("visit") || lower.includes("showroom") || lower.includes("store") || lower.includes("address") || lower.includes("location");

        if (hasVisit || hasBridal) {
          await sendButtons(from, cleanReply, [
            { id: "book_appointment", title: "📅 Book Visit" },
            { id: "browse_catalog", title: "💎 Browse More" },
            { id: "bridal_inquiry", title: "👰 Bridal Sets" }
          ]);
        } else if (hasPrice) {
          await sendButtons(from, cleanReply, [
            { id: "browse_catalog", title: "💎 View Collections" },
            { id: "book_appointment", title: "📅 Visit Store" },
            { id: "bridal_inquiry", title: "👰 Bridal Range" }
          ]);
        } else {
          // Regular reply — add buttons after every 3rd message for engagement
          if (session.messages.length % 6 === 0) {
            await sendButtons(from, cleanReply, [
              { id: "browse_catalog", title: "💎 Browse Collection" },
              { id: "book_appointment", title: "📅 Book Visit" },
              { id: "bridal_inquiry", title: "👰 Bridal" }
            ]);
          } else {
            await sendText(from, cleanReply);
          }
        }

        // Log to Google Sheets CRM
        logToSheets({ name: session.name, phone: from, source: "WhatsApp Bot", query: userText, reply: cleanReply.substring(0, 200) });

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
