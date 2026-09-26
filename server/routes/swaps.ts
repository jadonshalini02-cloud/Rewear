import { Router } from 'express';
import { db, saveDatabase, SwapRequestRecord, ConversationRecord, MessageRecord, NotificationRecord } from '../db/database.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Helper to enrich a swap record with full item and user details
function enrichSwap(swap: SwapRequestRecord) {
  const requester = db.users.find((u) => u.id === swap.requesterId);
  const receiver = db.users.find((u) => u.id === swap.receiverId);
  const offeredItem = db.items.find((i) => i.id === swap.offeredItemId);
  const requestedItem = db.items.find((i) => i.id === swap.requestedItemId);
  const conversation = db.conversations.find((c) => c.swapRequestId === swap.id);

  const valueDifference = (offeredItem?.estimatedValue || 0) - (requestedItem?.estimatedValue || 0);

  return {
    ...swap,
    valueDifference,
    conversationId: conversation?.id,
    requester: requester
      ? {
          id: requester.id,
          name: requester.name,
          email: requester.email,
          avatarUrl: requester.avatarUrl,
          location: requester.location,
          rating: requester.rating,
          reviewCount: requester.reviewCount,
        }
      : null,
    receiver: receiver
      ? {
          id: receiver.id,
          name: receiver.name,
          email: receiver.email,
          avatarUrl: receiver.avatarUrl,
          location: receiver.location,
          rating: receiver.rating,
          reviewCount: receiver.reviewCount,
        }
      : null,
    offeredItem: offeredItem || null,
    requestedItem: requestedItem || null,
  };
}

// POST /api/swaps - create a swap request
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { requestedItemId, offeredItemId, message } = req.body;
    const requesterId = req.user!.id;

    if (!requestedItemId || !offeredItemId) {
      return res.status(400).json({ error: 'Both offered item and requested item are required.' });
    }

    const requestedItem = db.items.find((i) => i.id === requestedItemId);
    if (!requestedItem) {
      return res.status(404).json({ error: 'The item you want to swap for could not be found.' });
    }

    if (requestedItem.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'This item is currently unavailable for swap.' });
    }

    if (requestedItem.ownerId === requesterId) {
      return res.status(400).json({ error: 'You cannot initiate a swap request with your own item.' });
    }

    const offeredItem = db.items.find((i) => i.id === offeredItemId);
    if (!offeredItem) {
      return res.status(404).json({ error: 'Your offered item could not be found.' });
    }

    if (offeredItem.ownerId !== requesterId) {
      return res.status(403).json({ error: 'You can only offer items that you personally own.' });
    }

    if (offeredItem.status !== 'AVAILABLE') {
      return res.status(400).json({ error: 'Your offered item is already in another swap process.' });
    }

    // Check if duplicate pending swap request exists
    const existingPending = db.swaps.find(
      (s) =>
        s.requesterId === requesterId &&
        s.requestedItemId === requestedItemId &&
        s.offeredItemId === offeredItemId &&
        (s.status === 'PENDING' || s.status === 'NEGOTIATING')
    );
    if (existingPending) {
      return res.status(409).json({ error: 'A pending swap request with these exact items is already open.' });
    }

    const swapId = `swap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newSwap: SwapRequestRecord = {
      id: swapId,
      requesterId,
      receiverId: requestedItem.ownerId,
      offeredItemId,
      requestedItemId,
      message: message?.trim() || `Hi! I would love to exchange my "${offeredItem.title}" for your "${requestedItem.title}".`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.swaps.unshift(newSwap);

    // Create connected conversation & initial message
    const convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const conversation: ConversationRecord = {
      id: convId,
      swapRequestId: swapId,
      participantIds: [requesterId, requestedItem.ownerId],
      lastMessage: newSwap.message,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.conversations.unshift(conversation);

    const firstMsg: MessageRecord = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      conversationId: convId,
      senderId: requesterId,
      content: newSwap.message,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(firstMsg);

    // Create notification for receiver
    const requesterUser = db.users.find((u) => u.id === requesterId);
    const notification: NotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: requestedItem.ownerId,
      type: 'SWAP_REQUEST',
      title: 'New Swap Request',
      message: `${requesterUser?.name || 'Someone'} offered "${offeredItem.title}" for your "${requestedItem.title}".`,
      link: `/swap-requests`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.notifications.unshift(notification);

    await saveDatabase();

    return res.status(201).json({
      message: 'Swap request submitted successfully! The owner has been notified.',
      swap: enrichSwap(newSwap),
    });
  } catch (err) {
    console.error('Create swap error:', err);
    return res.status(500).json({ error: 'Failed to submit swap request.' });
  }
});

// GET /api/swaps/incoming - swap requests received by current user
router.get('/incoming', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const incoming = db.swaps
      .filter((s) => s.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(enrichSwap);

    return res.json({ swaps: incoming });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve incoming swap requests.' });
  }
});

// GET /api/swaps/outgoing - swap requests sent by current user
router.get('/outgoing', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const outgoing = db.swaps
      .filter((s) => s.requesterId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(enrichSwap);

    return res.json({ swaps: outgoing });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve outgoing swap requests.' });
  }
});

// GET /api/swaps/:id - get single swap details
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const swap = db.swaps.find((s) => s.id === req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found.' });
    }

    if (swap.requesterId !== userId && swap.receiverId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not authorized to view this swap request.' });
    }

    return res.json({ swap: enrichSwap(swap) });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch swap request.' });
  }
});

// PATCH /api/swaps/:id/accept - accept incoming swap request
router.patch('/:id/accept', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const swap = db.swaps.find((s) => s.id === req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found.' });
    }

    if (swap.receiverId !== userId) {
      return res.status(403).json({ error: 'Only the item recipient can accept this swap request.' });
    }

    if (swap.status !== 'PENDING' && swap.status !== 'NEGOTIATING') {
      return res.status(400).json({ error: `Cannot accept a swap with status ${swap.status}.` });
    }

    const offered = db.items.find((i) => i.id === swap.offeredItemId);
    const requested = db.items.find((i) => i.id === swap.requestedItemId);

    if (!offered || !requested) {
      return res.status(400).json({ error: 'One or both clothing items are no longer available.' });
    }

    swap.status = 'ACCEPTED';
    swap.updatedAt = new Date().toISOString();

    // Mark both items as PENDING_SWAP
    offered.status = 'PENDING_SWAP';
    requested.status = 'PENDING_SWAP';

    // Notification to requester
    const receiverUser = db.users.find((u) => u.id === userId);
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: swap.requesterId,
      type: 'SWAP_ACCEPTED',
      title: 'Swap Request Accepted! 🎉',
      message: `${receiverUser?.name || 'The owner'} accepted your swap for "${requested.title}". Check your chat to coordinate delivery!`,
      link: `/swaps`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    await saveDatabase();

    return res.json({
      message: 'Swap accepted! You can now coordinate handover details in chat.',
      swap: enrichSwap(swap),
    });
  } catch (err) {
    console.error('Accept swap error:', err);
    return res.status(500).json({ error: 'Failed to accept swap.' });
  }
});

// PATCH /api/swaps/:id/reject - reject incoming swap request
router.patch('/:id/reject', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const swap = db.swaps.find((s) => s.id === req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found.' });
    }

    if (swap.receiverId !== userId) {
      return res.status(403).json({ error: 'Only the item recipient can decline this swap request.' });
    }

    swap.status = 'REJECTED';
    swap.updatedAt = new Date().toISOString();

    // Revert items to available if they were locked
    const offered = db.items.find((i) => i.id === swap.offeredItemId);
    const requested = db.items.find((i) => i.id === swap.requestedItemId);
    if (offered && offered.status === 'PENDING_SWAP') offered.status = 'AVAILABLE';
    if (requested && requested.status === 'PENDING_SWAP') requested.status = 'AVAILABLE';

    // Notification to requester
    const receiverUser = db.users.find((u) => u.id === userId);
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: swap.requesterId,
      type: 'SWAP_REJECTED',
      title: 'Swap Request Update',
      message: `${receiverUser?.name || 'The owner'} declined the swap request for "${requested?.title || 'clothing item'}".`,
      link: `/swap-requests`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    await saveDatabase();

    return res.json({
      message: 'Swap request declined.',
      swap: enrichSwap(swap),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reject swap.' });
  }
});

// PATCH /api/swaps/:id/cancel - cancel outgoing swap request
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const swap = db.swaps.find((s) => s.id === req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found.' });
    }

    if (swap.requesterId !== userId && swap.receiverId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to cancel this swap.' });
    }

    swap.status = 'CANCELLED';
    swap.updatedAt = new Date().toISOString();

    const offered = db.items.find((i) => i.id === swap.offeredItemId);
    const requested = db.items.find((i) => i.id === swap.requestedItemId);
    if (offered && offered.status === 'PENDING_SWAP') offered.status = 'AVAILABLE';
    if (requested && requested.status === 'PENDING_SWAP') requested.status = 'AVAILABLE';

    await saveDatabase();

    return res.json({
      message: 'Swap request cancelled.',
      swap: enrichSwap(swap),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to cancel swap.' });
  }
});

// PATCH /api/swaps/:id/negotiate - change state to NEGOTIATING
router.patch('/:id/negotiate', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const swap = db.swaps.find((s) => s.id === req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found.' });
    }

    if (swap.receiverId !== userId && swap.requesterId !== userId) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    swap.status = 'NEGOTIATING';
    swap.updatedAt = new Date().toISOString();
    await saveDatabase();

    return res.json({
      message: 'Swap is now in negotiation.',
      swap: enrichSwap(swap),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update swap status.' });
  }
});

// PATCH /api/swaps/:id/complete - mark swap as completed
router.patch('/:id/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const swap = db.swaps.find((s) => s.id === req.params.id);

    if (!swap) {
      return res.status(404).json({ error: 'Swap request not found.' });
    }

    if (swap.requesterId !== userId && swap.receiverId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not a participant in this swap.' });
    }

    swap.status = 'COMPLETED';
    swap.completedAt = new Date().toISOString();
    swap.updatedAt = new Date().toISOString();

    const offered = db.items.find((i) => i.id === swap.offeredItemId);
    const requested = db.items.find((i) => i.id === swap.requestedItemId);
    if (offered) offered.status = 'SWAPPED';
    if (requested) requested.status = 'SWAPPED';

    // Notify other party
    const otherUserId = swap.requesterId === userId ? swap.receiverId : swap.requesterId;
    db.notifications.unshift({
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: otherUserId,
      type: 'SWAP_COMPLETED',
      title: 'Swap Completed! 🌿',
      message: 'Your clothing swap was completed! Thank you for participating in sustainable fashion and circular wardrobe exchange.',
      link: `/swaps`,
      read: false,
      createdAt: new Date().toISOString(),
    });

    await saveDatabase();

    return res.json({
      message: 'Swap marked as completed! Thank you for keeping fashion circular.',
      swap: enrichSwap(swap),
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to complete swap.' });
  }
});

export default router;
