const { getConversations, getContacts } = require('./lib/storage');

module.exports = async function handler(req, res) {
  if (req.query.pass !== 'auric2026') return res.status(401).json({ error: 'Unauthorized' });

  const days = req.query.days ? parseInt(req.query.days) : null;
  const phone = req.query.phone || null;

  const conversations = await getConversations(days, phone);
  const contacts = await getContacts();

  const today = new Date().toISOString().slice(0, 10);
  const todayMsgs = conversations.filter(function(c) { return c.timestamp && c.timestamp.startsWith(today); });
  const uniquePhones = {};
  todayMsgs.forEach(function(c) { uniquePhones[c.phone] = true; });

  res.status(200).json({
    stats: {
      totalToday: todayMsgs.length,
      uniqueToday: Object.keys(uniquePhones).length,
      totalMonth: conversations.length,
      totalContacts: Object.keys(contacts).length
    },
    contacts: contacts,
    conversations: conversations
  });
};
