const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const SYSTEM_PROMPT = "You are a luxury jewelry sales assistant for Auric Jewels, Sector 45 Gurgaon. Be warm, use Hinglish. Keep replies SHORT 3-4 lines. Store timings 10AM-9PM. WhatsApp +91 90124 95941. BIS Hallmarked Gold, IGI Certified Diamonds, 100% Buyback.";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === VERIFY_TOKEN) return res.status(200).send(challenge);
    return res.status(403).send("Forbidden");
  }
  if (req.method === "POST") {
    try {
      const body = req.body;
      const msgs = body?.entry?.[0]?.changes?.[0]?.value?.messages;
      if (!msgs || !msgs.length) return res.status(200).send("OK");
      const from = msgs[0].from;
      const text = msgs[0].type === "text" ? msgs[0].text.body : "[media]";
      let reply = "Namaste! Call: +91 90124 95941";
      try {
        const cr = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: SYSTEM_PROMPT, messages: [{ role: "user", content: text }] })
        });
        const cd = await cr.json();
        reply = cd.content?.[0]?.text || reply;
      } catch (e) { console.log("Claude err:", e.message); }
      const wr = await fetch("https://graph.facebook.com/v22.0/" + PHONE_NUMBER_ID + "/messages", {
        method: "POST",
        headers: { Authorization: "Bearer " + WHATSAPP_TOKEN, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: from, type: "text", text: { body: reply } })
      });
      console.log("WA status:", wr.status, await wr.text());
      return res.status(200).send("OK");
    } catch (e) { console.log("Err:", e.message); return res.status(200).send("OK"); }
  }
  return res.status(405).send("Method not allowed");
}
