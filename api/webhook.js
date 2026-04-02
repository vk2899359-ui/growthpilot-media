const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SALEOR_API = "https://auric.thecodemesh.online/graphql/";
const SALEOR_TOKEN = process.env.SALEOR_TOKEN || "fAPR16BVrzI4thcLtj8c4tUUG1wGU6";

// ── Category & Collection links ─────────────────────────
const CATEGORIES = {
  rings:      { url: "https://www.auricjewels.com/categories/rings",      label: "Rings" },
  earrings:   { url: "https://www.auricjewels.com/categories/earrings",   label: "Earrings" },
  necklaces:  { url: "https://www.auricjewels.com/categories/necklaces",  label: "Necklaces" },
  pendants:   { url: "https://www.auricjewels.com/categories/pendants",   label: "Pendants" },
  chains:     { url: "https://www.auricjewels.com/categories/chains",     label: "Chains" },
  bracelets:  { url: "https://www.auricjewels.com/categories/bracelets",  label: "Bracelets" },
  bangles:    { url: "https://www.auricjewels.com/categories/bangles",    label: "Bangles" },
  solitaire:  { url: "https://www.auricjewels.com/collections/solitaire-collection", label: "Solitaire Collection" },
  "for-her":  { url: "https://www.auricjewels.com/collections/for-her",   label: "For Her" },
  "for-him":  { url: "https://www.auricjewels.com/collections/for-him",   label: "For Him" },
  "best-sellers": { url: "https://www.auricjewels.com/collections/best-sellers", label: "Best Sellers" },
};

// ── Image cache (populated from Saleor at runtime) ──────
let imageCache = null;
let imageCacheTime = 0;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

async function fetchImages() {
  if (imageCache && Date.now() - imageCacheTime < CACHE_TTL) return imageCache;
  try {
    const catRes = await fetch(SALEOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SALEOR_TOKEN },
      body: JSON.stringify({ query: `{ categories(first:20) { edges { node { name slug backgroundImage { url } } } } }` })
    });
    const catData = await catRes.json();
    const cats = catData?.data?.categories?.edges || [];

    const prodRes = await fetch(SALEOR_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SALEOR_TOKEN },
      body: JSON.stringify({ query: `{ products(first:30, channel:"default-channel") { edges { node { name slug category { name slug } thumbnail { url } } } } }` })
    });
    const prodData = await prodRes.json();
    const prods = prodData?.data?.products?.edges || [];

    const cache = { categories: {}, products: {} };
    cats.forEach(({ node }) => {
      if (node.backgroundImage?.url) {
        cache.categories[node.slug] = { name: node.name, image: node.backgroundImage.url };
      }
    });
    prods.forEach(({ node }) => {
      const catSlug = node.category?.slug;
      if (node.thumbnail?.url) {
        cache.products[node.slug] = { name: node.name, image: node.thumbnail.url, category: catSlug };
        // Use first product image as fallback for category if no background image
        if (catSlug && !cache.categories[catSlug]) {
          cache.categories[catSlug] = { name: node.category.name, image: node.thumbnail.url };
        }
      }
    });
    imageCache = cache;
    imageCacheTime = Date.now();
    console.log("Image cache loaded:", Object.keys(cache.categories).length, "categories,", Object.keys(cache.products).length, "products");
    return cache;
  } catch (e) {
    console.log("Saleor fetch error:", e.message);
    return { categories: {}, products: {} };
  }
}

// ── System prompt ───────────────────────────────────────
const SYSTEM_PROMPT = `You are a premium luxury jewelry concierge for Auric Jewels, an exclusive gold and diamond jewellery showroom in Gurgaon.

CRITICAL RULES:
- RESPOND ONLY IN ENGLISH. Never use Hindi, Hinglish, or any other language.
- Keep replies SHORT: 3-4 lines maximum.
- Be warm, elegant, and professional. Never pushy or salesy.
- Always respond in valid JSON format: {"text": "your reply here", "category": "category-slug-or-null"}

STORE DETAILS:
- Name: Auric Jewels
- Address: Greenwood Plaza, 201, Sector 45, Gurugram, Haryana 122003
- Phone: 0124-437-2846
- WhatsApp: +91 90124 95941
- Hours: 10 AM to 9 PM, all 7 days
- Website: www.auricjewels.com

TRUST SIGNALS:
- BIS Hallmarked Gold (18K & 22K)
- IGI/GIA Certified Diamonds
- 100% Buyback Guarantee
- Lifetime Exchange Policy
- Free Insured Shipping

CATEGORIES (use these exact slugs in the "category" field):
- "rings" — Gold & Diamond Rings → www.auricjewels.com/categories/rings
- "earrings" — Designer Earrings → www.auricjewels.com/categories/earrings
- "necklaces" — Gold & Diamond Necklaces → www.auricjewels.com/categories/necklaces
- "pendants" — Diamond & Gold Pendants → www.auricjewels.com/categories/pendants
- "chains" — Gold Chains → www.auricjewels.com/categories/chains
- "bracelets" — Diamond & Gold Bracelets → www.auricjewels.com/categories/bracelets
- "bangles" — Gold & Diamond Bangles → www.auricjewels.com/categories/bangles
- "solitaire" — Solitaire Diamond Collection → www.auricjewels.com/collections/solitaire-collection
- "for-her" — Jewellery for Her → www.auricjewels.com/collections/for-her
- "for-him" — Men's Jewellery → www.auricjewels.com/collections/for-him
- "best-sellers" — Best Sellers → www.auricjewels.com/collections/best-sellers

RESPONSE FORMAT (strict JSON):
If the message relates to a specific category, include the category slug:
{"text": "Your elegant reply with the relevant link.", "category": "rings"}

If no specific category applies:
{"text": "Your elegant reply.", "category": null}

Always include the relevant www.auricjewels.com link in your text reply when mentioning a category.`;

// ── WhatsApp message senders ────────────────────────────
const WA_API = "https://graph.facebook.com/v22.0/";

async function sendImage(to, imageUrl, caption) {
  const r = await fetch(WA_API + PHONE_NUMBER_ID + "/messages", {
    method: "POST",
    headers: { "Authorization": "Bearer " + WHATSAPP_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "image",
      image: { link: imageUrl, caption: caption }
    })
  });
  console.log("WA image status:", r.status);
  return r;
}

async function sendText(to, text) {
  const r = await fetch(WA_API + PHONE_NUMBER_ID + "/messages", {
    method: "POST",
    headers: { "Authorization": "Bearer " + WHATSAPP_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text }
    })
  });
  console.log("WA text status:", r.status);
  return r;
}

// ── Main handler ────────────────────────────────────────
export default async function handler(req, res) {
  // Webhook verification (GET)
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).send("Forbidden");
  }

  // Message handling (POST)
  if (req.method === "POST") {
    try {
      const body = req.body;
      const msgs = body?.entry?.[0]?.changes?.[0]?.value?.messages;
      if (!msgs || !msgs.length) return res.status(200).send("OK");

      const from = msgs[0].from;
      const userText = msgs[0].type === "text" ? msgs[0].text.body : "[media received]";

      // Fetch images from Saleor (cached)
      const images = await fetchImages();

      // Get Claude response
      let replyText = "Thank you for reaching out to Auric Jewels. Please call us at 0124-437-2846 or visit our showroom at Sector 45, Gurugram.";
      let category = null;

      try {
        const cr = await fetch("https://api.anthropic.com/v1/messages", {
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
            messages: [{ role: "user", content: userText }]
          })
        });
        const cd = await cr.json();
        const raw = cd.content?.[0]?.text || "";

        // Parse JSON response from Claude
        try {
          const parsed = JSON.parse(raw);
          replyText = parsed.text || replyText;
          category = parsed.category || null;
        } catch (parseErr) {
          // If Claude didn't return valid JSON, use raw text
          replyText = raw || replyText;
        }
      } catch (e) {
        console.log("Claude error:", e.message);
      }

      // Send image first if category has an image
      if (category && images.categories[category]) {
        const catImage = images.categories[category];
        const catInfo = CATEGORIES[category];
        const caption = catInfo
          ? `${catInfo.label} — Auric Jewels\nExplore: ${catInfo.url}`
          : `${catImage.name} — Auric Jewels`;
        await sendImage(from, catImage.image, caption);
        // Small delay between image and text
        await new Promise(r => setTimeout(r, 300));
      }

      // Send text reply
      await sendText(from, replyText);

      return res.status(200).send("OK");
    } catch (e) {
      console.log("Handler error:", e.message);
      return res.status(200).send("OK");
    }
  }

  return res.status(405).send("Method not allowed");
}
