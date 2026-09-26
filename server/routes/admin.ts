import { Router } from 'express';
import { db, saveDatabase } from '../db/database.js';
import { requireAdmin, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/analytics - platform metrics calculated live from database
router.get('/analytics', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const totalUsers = db.users.length;
    const activeUsers = db.users.filter((u) => u.status === 'ACTIVE').length;
    const totalListings = db.items.length;
    const activeListings = db.items.filter((i) => i.status === 'AVAILABLE').length;
    const pendingSwaps = db.swaps.filter((s) => s.status === 'PENDING' || s.status === 'NEGOTIATING').length;
    const acceptedSwaps = db.swaps.filter((s) => s.status === 'ACCEPTED').length;
    const completedSwaps = db.swaps.filter((s) => s.status === 'COMPLETED').length;
    const totalSwaps = db.swaps.length;

    const completionRate = totalSwaps > 0 ? Math.round((completedSwaps / totalSwaps) * 100) : 0;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    db.items.forEach((item) => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      value: count,
    }));

    // City distribution
    const cityCounts: Record<string, number> = {};
    db.items.forEach((item) => {
      const city = item.location.split(',')[0].trim();
      cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const cityData = Object.entries(cityCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Environmental Impact Metrics
    // Estimated: each swapped clothing item saves ~2.5 kg CO2 and ~3,500 liters of water
    const co2SavedKg = completedSwaps * 2 * 2.5;
    const waterSavedLiters = completedSwaps * 2 * 3500;
    const textileWastePreventedKg = completedSwaps * 2 * 0.45;

    return res.json({
      analytics: {
        totalUsers,
        activeUsers,
        totalListings,
        activeListings,
        pendingSwaps,
        acceptedSwaps,
        completedSwaps,
        totalSwaps,
        completionRate,
        co2SavedKg,
        waterSavedLiters,
        textileWastePreventedKg,
        categoryData,
        cityData,
        pendingReports: db.reports.filter((r) => r.status === 'PENDING').length,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    return res.status(500).json({ error: 'Failed to generate analytics.' });
  }
});

// GET /api/admin/users - list users with search and filter
router.get('/users', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { search, role, status } = req.query as Record<string, string>;

    let users = db.users.map((u) => {
      const { passwordHash: _, ...safe } = u;
      const listingsCount = db.items.filter((i) => i.ownerId === u.id).length;
      const completedSwapsCount = db.swaps.filter(
        (s) => (s.receiverId === u.id || s.requesterId === u.id) && s.status === 'COMPLETED'
      ).length;

      return {
        ...safe,
        listingsCount,
        completedSwapsCount,
      };
    });

    if (role && role !== 'ALL') {
      users = users.filter((u) => u.role === role);
    }
    if (status && status !== 'ALL') {
      users = users.filter((u) => u.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.location.toLowerCase().includes(q)
      );
    }

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve users.' });
  }
});

// PATCH /api/admin/users/:id/status - toggle user status / role
router.patch('/users/:id/status', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const { status, role } = req.body;
    if (status) {
      if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid user status.' });
      }
      user.status = status;
    }
    if (role) {
      if (!['USER', 'ADMIN'].includes(role)) {
        return res.status(400).json({ error: 'Invalid user role.' });
      }
      user.role = role;
    }
    user.updatedAt = new Date().toISOString();

    await saveDatabase();

    const { passwordHash: _, ...safeUser } = user;
    return res.json({ message: 'User status updated successfully.', user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update user status.' });
  }
});

// GET /api/admin/items - list all items for moderation
router.get('/items', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const items = db.items.map((item) => {
      const owner = db.users.find((u) => u.id === item.ownerId);
      return {
        ...item,
        owner: owner ? { id: owner.id, name: owner.name, email: owner.email } : null,
      };
    });

    return res.json({ items });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch items.' });
  }
});

// DELETE /api/admin/items/:id - remove inappropriate item
router.delete('/items/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const index = db.items.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    const item = db.items[index];
    db.items.splice(index, 1);
    db.favorites = db.favorites.filter((f) => f.clothingItemId !== item.id);
    await saveDatabase();

    return res.json({ message: 'Item listing removed by admin.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete item.' });
  }
});

// GET /api/admin/swaps - all swaps audit
router.get('/swaps', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const swaps = db.swaps.map((s) => {
      const requester = db.users.find((u) => u.id === s.requesterId);
      const receiver = db.users.find((u) => u.id === s.receiverId);
      const offeredItem = db.items.find((i) => i.id === s.offeredItemId);
      const requestedItem = db.items.find((i) => i.id === s.requestedItemId);

      return {
        ...s,
        requester: requester ? { id: requester.id, name: requester.name, email: requester.email } : null,
        receiver: receiver ? { id: receiver.id, name: receiver.name, email: receiver.email } : null,
        offeredItem: offeredItem ? { id: offeredItem.id, title: offeredItem.title, image: offeredItem.images[0] } : null,
        requestedItem: requestedItem ? { id: requestedItem.id, title: requestedItem.title, image: requestedItem.images[0] } : null,
      };
    });

    return res.json({ swaps });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch swaps.' });
  }
});

export default router;
