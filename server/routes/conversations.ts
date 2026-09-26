import { Router } from 'express';
import { db, saveDatabase, MessageRecord, ConversationRecord } from '../db/database.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/conversations - list all user conversations
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const userConvs = db.conversations
      .filter((c) => c.participantIds.includes(userId))
      .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    const enriched = userConvs.map((conv) => {
      const otherUserId = conv.participantIds.find((id) => id !== userId) || userId;
      const otherUser = db.users.find((u) => u.id === otherUserId);
      const swap = conv.swapRequestId ? db.swaps.find((s) => s.id === conv.swapRequestId) : null;
      const offeredItem = swap ? db.items.find((i) => i.id === swap.offeredItemId) : null;
      const requestedItem = swap ? db.items.find((i) => i.id === swap.requestedItemId) : null;

      // Count unread messages
      const unreadCount = db.messages.filter(
        (m) => m.conversationId === conv.id && m.senderId !== userId && !m.readAt
      ).length;

      return {
        id: conv.id,
        swapRequestId: conv.swapRequestId,
        swapStatus: swap?.status,
        offeredItemTitle: offeredItem?.title,
        requestedItemTitle: requestedItem?.title,
        otherUser: otherUser
          ? {
              id: otherUser.id,
              name: otherUser.name,
              avatarUrl: otherUser.avatarUrl,
              location: otherUser.location,
            }
          : null,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt || conv.createdAt,
        unreadCount,
      };
    });

    return res.json({ conversations: enriched });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ error: 'Failed to retrieve conversations.' });
  }
});

// POST /api/conversations/direct - create or get conversation with user (e.g. from "Message Owner")
router.post('/direct', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { targetUserId, itemId } = req.body;

    if (!targetUserId) {
      return res.status(400).json({ error: 'Target user ID is required.' });
    }

    if (targetUserId === userId) {
      return res.status(400).json({ error: 'You cannot start a conversation with yourself.' });
    }

    // Check if conversation already exists between these 2 users
    let conv = db.conversations.find(
      (c) => c.participantIds.includes(userId) && c.participantIds.includes(targetUserId)
    );

    if (!conv) {
      const item = itemId ? db.items.find((i) => i.id === itemId) : null;
      const initialText = item ? `Hi! I'm interested in your "${item.title}". Is it still available for swap?` : 'Hi there!';
      
      const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      conv = {
        id: convId,
        participantIds: [userId, targetUserId],
        lastMessage: initialText,
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.conversations.unshift(conv);

      const msg: MessageRecord = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conversationId: convId,
        senderId: userId,
        content: initialText,
        createdAt: new Date().toISOString(),
      };
      db.messages.push(msg);

      await saveDatabase();
    }

    return res.json({ conversationId: conv.id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to open conversation.' });
  }
});

// GET /api/conversations/:id/messages - get message history
router.get('/:id/messages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const conv = db.conversations.find((c) => c.id === req.params.id);

    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (!conv.participantIds.includes(userId) && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to access this conversation.' });
    }

    const messages = db.messages
      .filter((m) => m.conversationId === conv.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Mark messages as read
    let updatedAny = false;
    messages.forEach((m) => {
      if (m.senderId !== userId && !m.readAt) {
        m.readAt = new Date().toISOString();
        updatedAny = true;
      }
    });
    if (updatedAny) {
      await saveDatabase();
    }

    const otherUserId = conv.participantIds.find((id) => id !== userId) || userId;
    const otherUser = db.users.find((u) => u.id === otherUserId);
    const swap = conv.swapRequestId ? db.swaps.find((s) => s.id === conv.swapRequestId) : null;
    const offeredItem = swap ? db.items.find((i) => i.id === swap.offeredItemId) : null;
    const requestedItem = swap ? db.items.find((i) => i.id === swap.requestedItemId) : null;

    return res.json({
      conversation: {
        id: conv.id,
        swapRequestId: conv.swapRequestId,
        swap: swap
          ? {
              id: swap.id,
              status: swap.status,
              offeredItem,
              requestedItem,
            }
          : null,
        otherUser: otherUser
          ? {
              id: otherUser.id,
              name: otherUser.name,
              avatarUrl: otherUser.avatarUrl,
              location: otherUser.location,
              rating: otherUser.rating,
            }
          : null,
      },
      messages,
    });
  } catch (err) {
    console.error('Fetch messages error:', err);
    return res.status(500).json({ error: 'Failed to retrieve messages.' });
  }
});

// POST /api/conversations/:id/messages - send new message
router.post('/:id/messages', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const conv = db.conversations.find((c) => c.id === req.params.id);

    if (!conv) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    if (!conv.participantIds.includes(userId)) {
      return res.status(403).json({ error: 'You are not a participant in this conversation.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty.' });
    }

    const newMsg: MessageRecord = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: conv.id,
      senderId: userId,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    db.messages.push(newMsg);

    // Update conversation metadata
    conv.lastMessage = newMsg.content;
    conv.lastMessageAt = newMsg.createdAt;
    conv.updatedAt = newMsg.createdAt;

    // Send notification to recipient
    const recipientId = conv.participantIds.find((id) => id !== userId);
    if (recipientId) {
      const sender = db.users.find((u) => u.id === userId);
      db.notifications.unshift({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: `Message from ${sender?.name || 'ReWear member'}`,
        message: newMsg.content.length > 60 ? `${newMsg.content.substring(0, 60)}...` : newMsg.content,
        link: `/chat?convId=${encodeURIComponent(conv.id)}`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    await saveDatabase();

    return res.status(201).json({ message: newMsg });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ error: 'Failed to send message.' });
  }
});

// PATCH /api/conversations/:id/read - mark conversation messages as read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const conv = db.conversations.find((c) => c.id === req.params.id);

    if (!conv || !conv.participantIds.includes(userId)) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }

    let updated = false;
    db.messages.forEach((m) => {
      if (m.conversationId === conv.id && m.senderId !== userId && !m.readAt) {
        m.readAt = new Date().toISOString();
        updated = true;
      }
    });

    if (updated) {
      await saveDatabase();
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark read.' });
  }
});

export default router;
