import { getConversations, getContacts } from './lib/storage';

export default async function handler(req, res) {
  if (req.query.pass !== 'auric2026') return res.status(401).json({ error: 'Unauthorized' });

  const days = req.query.days ? parseInt(req.query.days) : null;
  const phone = req.query.phone || null;
  
  const conversations = await getConversations(days, phone);
  const contacts = await getContacts();
  
  const today = new Date().toISOString().slice(0, 10);
  const todayMsgs = conversations.filter(c => c.timestamp?.startsWith(today));
  const uniqueToday = new Set(todayMsgs.map(c => c.phone));

  res.status(200).json({
    stats: {
      totalToday: todayMsgs.length,
      uniqueToday: uniqueToday.size,
      totalMonth: conversations.length,
      totalContacts: Object.keys(contacts).length
    },
    contacts,
    conversations
  });
}
