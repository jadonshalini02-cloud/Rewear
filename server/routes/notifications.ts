import { Router } from 'express';
import { db, saveDatabase } from '../db/database.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications - get current user's notifications
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const notifications = db.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = notifications.filter((n) => !n.read).length;

    return res.json({ notifications, unreadCount });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve notifications.' });
  }
});

// PATCH /api/notifications/:id/read - mark single notification as read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === userId);

    if (!notif) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    notif.read = true;
    await saveDatabase();

    return res.json({ success: true, notification: notif });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update notification.' });
  }
});

// PATCH /api/notifications/read-all - mark all as read
router.patch('/read-all', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    let changed = false;

    db.notifications.forEach((n) => {
      if (n.userId === userId && !n.read) {
        n.read = true;
        changed = true;
      }
    });

    if (changed) {
      await saveDatabase();
    }

    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to mark notifications read.' });
  }
});

export default router;
