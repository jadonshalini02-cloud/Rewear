import { Router } from 'express';
import { db, saveDatabase, FavoriteRecord } from '../db/database.js';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/favorites - list all favorites for current user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const favs = db.favorites.filter((f) => f.userId === userId);

    const items = favs
      .map((f) => {
        const item = db.items.find((i) => i.id === f.clothingItemId);
        if (!item) return null;
        const owner = db.users.find((u) => u.id === item.ownerId);
        return {
          ...item,
          isFavorited: true,
          favoritedAt: f.createdAt,
          owner: owner
            ? {
                id: owner.id,
                name: owner.name,
                avatarUrl: owner.avatarUrl,
                location: owner.location,
              }
            : null,
        };
      })
      .filter(Boolean);

    return res.json({ favorites: items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve saved favorites.' });
  }
});

// POST /api/favorites/:itemId - add to favorites
router.post('/:itemId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const item = db.items.find((i) => i.id === itemId);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    const existing = db.favorites.find((f) => f.userId === userId && f.clothingItemId === itemId);
    if (existing) {
      return res.json({ message: 'Item already in favorites.', isFavorited: true });
    }

    const newFav: FavoriteRecord = {
      id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      clothingItemId: itemId,
      createdAt: new Date().toISOString(),
    };

    db.favorites.push(newFav);
    await saveDatabase();

    return res.status(201).json({ message: 'Added to favorites.', isFavorited: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add to favorites.' });
  }
});

// DELETE /api/favorites/:itemId - remove from favorites
router.delete('/:itemId', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const initialLen = db.favorites.length;
    db.favorites = db.favorites.filter((f) => !(f.userId === userId && f.clothingItemId === itemId));

    if (db.favorites.length !== initialLen) {
      await saveDatabase();
    }

    return res.json({ message: 'Removed from favorites.', isFavorited: false });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove favorite.' });
  }
});

export default router;
