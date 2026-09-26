import { Router } from 'express';
import { db, saveDatabase } from '../db/database.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/users/:id - get public user profile and active items
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(404).json({ error: 'This user account is currently suspended.' });
    }

    const currentUserId = req.user?.id;
    const userFavorites = currentUserId ? new Set(db.favorites.filter((f) => f.userId === currentUserId).map((f) => f.clothingItemId)) : new Set();

    // Available listings
    const userItems = db.items
      .filter((i) => i.ownerId === user.id && i.status === 'AVAILABLE')
      .map((item) => ({
        ...item,
        isFavorited: userFavorites.has(item.id),
      }));

    // Count statistics
    const completedSwapsCount = db.swaps.filter(
      (s) => (s.receiverId === user.id || s.requesterId === user.id) && s.status === 'COMPLETED'
    ).length;

    const { passwordHash: _, ...safeProfile } = user;

    return res.json({
      user: {
        ...safeProfile,
        stats: {
          activeListings: userItems.length,
          completedSwaps: completedSwapsCount,
        },
      },
      items: userItems,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// PUT /api/users/me - update current user profile
router.put('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { name, bio, location, avatarUrl } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (location) user.location = location.trim();
    if (avatarUrl) user.avatarUrl = avatarUrl.trim();
    user.updatedAt = new Date().toISOString();

    await saveDatabase();

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      message: 'Profile updated successfully.',
      user: safeUser,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
