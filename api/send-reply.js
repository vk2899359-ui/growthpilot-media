// POST /api/send-reply
// Body: { to: "919XXXXXXXXX", message: "text to send", pass: "auric2026" }
// Sends a manual WhatsApp message via Meta Cloud API

const PASS = 'auric2026';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  const pass = body.pass || req.query.pass;

  if (pass !== PASS) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const to      = (body.to || '').replace(/\D/g, '');
  const message = (body.message || '').trim();

  if (!to || !message) {
    return res.status(400).json({ error: 'Missing required fields: to, message' });
  }

  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
  const WHATSAPP_TOKEN  = process.env.WHATSAPP_TOKEN;

  if (!PHONE_NUMBER_ID || !WHATSAPP_TOKEN) {
    return res.status(500).json({ error: 'WhatsApp credentials not configured' });
  }

  try {
    const resp = await fetch(
      'https://graph.facebook.com/v21.0/' + PHONE_NUMBER_ID + '/messages',
      {
        method:  'POST',
        headers: {
          Authorization:  'Bearer ' + WHATSAPP_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to:                to,
          type:              'text',
          text:              { body: message }
        })
      }
    );

    const result = await resp.json();

    if (result.error) {
      console.error('WhatsApp send error:', JSON.stringify(result.error));
      return res.status(400).json({ error: result.error.message, details: result.error });
    }

    return res.status(200).json({
      success:   true,
      messageId: result.messages && result.messages[0] ? result.messages[0].id : null,
      to:        to
    });

  } catch (e) {
    console.error('send-reply error:', e.message);
    return res.status(500).json({ error: e.message });
  }
};
