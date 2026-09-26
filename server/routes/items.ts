import { Router } from 'express';
import { db, saveDatabase, ClothingItemRecord } from '../db/database.js';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/items - list items with filtering, searching, sorting, pagination
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const {
      category,
      subcategory,
      condition,
      size,
      brand,
      location,
      minVal,
      maxVal,
      search,
      sort = 'newest',
      ownerId,
      status = 'AVAILABLE',
      page = '1',
      limit = '12',
      excludeId,
    } = req.query as Record<string, string>;

    let result = db.items.filter((item) => {
      // Status check
      if (status && status !== 'ALL' && item.status !== status) {
        return false;
      }
      if (excludeId && item.id === excludeId) {
        return false;
      }
      if (ownerId && item.ownerId !== ownerId) {
        return false;
      }
      if (category && category !== 'All' && item.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
      if (subcategory && subcategory !== 'All' && item.subcategory.toLowerCase() !== subcategory.toLowerCase()) {
        return false;
      }
      if (condition && condition !== 'All' && item.condition.toLowerCase() !== condition.toLowerCase()) {
        return false;
      }
      if (size && size !== 'All') {
        const sizes = size.split(',').map((s) => s.trim().toLowerCase());
        if (!sizes.includes(item.size.toLowerCase())) {
          return false;
        }
      }
      if (brand && brand !== 'All') {
        const brands = brand.split(',').map((b) => b.trim().toLowerCase());
        if (!brands.some((b) => item.brand.toLowerCase().includes(b))) {
          return false;
        }
      }
      if (location && location !== 'All') {
        if (!item.location.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }
      if (minVal && item.estimatedValue < Number(minVal)) {
        return false;
      }
      if (maxVal && item.estimatedValue > Number(maxVal)) {
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesBrand = item.brand.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTags = item.tags?.some((t) => t.toLowerCase().includes(q));
        const matchesSubcat = item.subcategory.toLowerCase().includes(q);
        if (!matchesTitle && !matchesBrand && !matchesDesc && !matchesTags && !matchesSubcat) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'value_low_high') {
      result.sort((a, b) => a.estimatedValue - b.estimatedValue);
    } else if (sort === 'value_high_low') {
      result.sort((a, b) => b.estimatedValue - a.estimatedValue);
    } else if (sort === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    const total = result.length;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = result.slice(startIndex, startIndex + limitNum);

    // Enrich with owner basic details & favorite state
    const currentUserId = req.user?.id;
    const userFavorites = currentUserId ? new Set(db.favorites.filter((f) => f.userId === currentUserId).map((f) => f.clothingItemId)) : new Set();

    const enriched = paginatedItems.map((item) => {
      const owner = db.users.find((u) => u.id === item.ownerId);
      return {
        ...item,
        isFavorited: userFavorites.has(item.id),
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              avatarUrl: owner.avatarUrl,
              location: owner.location,
              rating: owner.rating,
              reviewCount: owner.reviewCount,
            }
          : null,
      };
    });

    return res.json({
      items: enriched,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('Fetch items error:', err);
    return res.status(500).json({ error: 'Failed to retrieve clothing items.' });
  }
});

// GET /api/items/:id - single item details with owner, similar items, fair swap suggestions
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const item = db.items.find((i) => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Clothing item not found.' });
    }

    // Increment view count
    item.views = (item.views || 0) + 1;
    await saveDatabase();

    const owner = db.users.find((u) => u.id === item.ownerId);
    const currentUserId = req.user?.id;
    const isFavorited = currentUserId ? db.favorites.some((f) => f.userId === currentUserId && f.clothingItemId === item.id) : false;

    // Similar items (same category or similar subcategory, excluding current item)
    const similarItems = db.items
      .filter((i) => i.id !== item.id && i.status === 'AVAILABLE' && (i.category === item.category || i.subcategory === item.subcategory))
      .slice(0, 4)
      .map((sim) => {
        const simOwner = db.users.find((u) => u.id === sim.ownerId);
        return {
          ...sim,
          owner: simOwner
            ? {
                id: simOwner.id,
                name: simOwner.name,
                avatarUrl: simOwner.avatarUrl,
                location: simOwner.location,
              }
            : null,
        };
      });

    // Potential Swap Matches algorithm (fair value within +/- 25%, compatible condition, nearby location or same category)
    const potentialMatches = db.items
      .filter((i) => {
        if (i.id === item.id || i.status !== 'AVAILABLE' || i.ownerId === item.ownerId) return false;
        // Fair value within 30% difference
        const valDiff = Math.abs(i.estimatedValue - item.estimatedValue);
        const valRatio = valDiff / item.estimatedValue;
        return valRatio <= 0.35;
      })
      .slice(0, 4)
      .map((match) => {
        const matchOwner = db.users.find((u) => u.id === match.ownerId);
        const valueDiff = match.estimatedValue - item.estimatedValue;
        let matchReason = 'Balanced swap value';
        if (match.category === item.category) {
          matchReason = 'Matching category & balanced value';
        } else if (match.location.split(',')[0] === item.location.split(',')[0]) {
          matchReason = 'Nearby city match with balanced value';
        }

        return {
          ...match,
          matchReason,
          valueDifference: valueDiff,
          owner: matchOwner
            ? {
                id: matchOwner.id,
                name: matchOwner.name,
                avatarUrl: matchOwner.avatarUrl,
                location: matchOwner.location,
                rating: matchOwner.rating,
              }
            : null,
        };
      });

    const ownerItemsCount = db.items.filter((i) => i.ownerId === item.ownerId && i.status === 'AVAILABLE').length;
    const ownerCompletedSwaps = db.swaps.filter(
      (s) => (s.receiverId === item.ownerId || s.requesterId === item.ownerId) && s.status === 'COMPLETED'
    ).length;

    return res.json({
      item: {
        ...item,
        isFavorited,
        owner: owner
          ? {
              id: owner.id,
              name: owner.name,
              avatarUrl: owner.avatarUrl,
              location: owner.location,
              bio: owner.bio,
              rating: owner.rating,
              reviewCount: owner.reviewCount,
              activeListingsCount: ownerItemsCount,
              completedSwapsCount: ownerCompletedSwaps,
              joinedAt: owner.createdAt,
            }
          : null,
      },
      similarItems,
      potentialMatches,
    });
  } catch (err) {
    console.error('Item detail error:', err);
    return res.status(500).json({ error: 'Failed to fetch item details.' });
  }
});

// POST /api/items - create new clothing listing
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      brand,
      size,
      condition,
      color,
      material,
      originalPrice,
      estimatedValue,
      location,
      images,
      tags,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !category || !subcategory || !brand?.trim() || !size?.trim() || !condition || estimatedValue === undefined || Number(estimatedValue) <= 0 || !Number.isFinite(Number(estimatedValue))) {
      return res.status(400).json({ error: 'Please fill in all required clothing details.' });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'At least one clothing image is required.' });
    }

    const newItem: ClothingItemRecord = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ownerId: req.user!.id,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory,
      brand: brand.trim(),
      size: size.trim(),
      condition,
      color: color?.trim() || 'Natural',
      material: material?.trim() || 'Cotton Blend',
      originalPrice: originalPrice !== undefined && Number(originalPrice) > 0 ? Number(originalPrice) : undefined,
      estimatedValue: Number(estimatedValue),
      location: location?.trim() || req.user!.location || 'Bangalore',
      status: 'AVAILABLE',
      images,
      views: 0,
      tags: tags && Array.isArray(tags) ? tags : [category.toLowerCase(), subcategory.toLowerCase(), brand.toLowerCase()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.items.unshift(newItem);
    await saveDatabase();

    return res.status(201).json({
      message: 'Clothing item listed successfully on ReWear!',
      item: newItem,
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ error: 'Failed to create clothing listing.' });
  }
});

// PUT /api/items/:id - update clothing listing (owner or admin)
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = db.items.find((i) => i.id === req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    // Permission check
    if (item.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have permission to edit this listing.' });
    }

    const {
      title,
      description,
      category,
      subcategory,
      brand,
      size,
      condition,
      color,
      material,
      originalPrice,
      estimatedValue,
      location,
      images,
      status,
      tags,
    } = req.body;

    if (title) item.title = title.trim();
    if (description) item.description = description.trim();
    if (category) item.category = category;
    if (subcategory) item.subcategory = subcategory;
    if (brand) item.brand = brand.trim();
    if (size) item.size = size.trim();
    if (condition) item.condition = condition;
    if (color) item.color = color.trim();
    if (material) item.material = material.trim();
    if (originalPrice !== undefined) {
      const parsedOriginalPrice = Number(originalPrice);
      if (!Number.isFinite(parsedOriginalPrice) || parsedOriginalPrice < 0) {
        return res.status(400).json({ error: 'Original price must be a non-negative number.' });
      }
      item.originalPrice = parsedOriginalPrice || undefined;
    }
    if (estimatedValue !== undefined) {
      const parsedEstimatedValue = Number(estimatedValue);
      if (!Number.isFinite(parsedEstimatedValue) || parsedEstimatedValue <= 0) {
        return res.status(400).json({ error: 'Estimated value must be greater than zero.' });
      }
      item.estimatedValue = parsedEstimatedValue;
    }
    if (location) item.location = location.trim();
    if (images && Array.isArray(images) && images.length > 0) item.images = images;
    if (status) {
      const validStatuses = ['AVAILABLE', 'PENDING_SWAP', 'SWAPPED', 'REMOVED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid clothing item status.' });
      }
      item.status = status as ClothingItemRecord['status'];
    }
    if (tags && Array.isArray(tags)) item.tags = tags;
    item.updatedAt = new Date().toISOString();

    await saveDatabase();

    return res.json({
      message: 'Listing updated successfully.',
      item,
    });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ error: 'Failed to update item.' });
  }
});

// DELETE /api/items/:id - delete item listing
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const index = db.items.findIndex((i) => i.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    const item = db.items[index];
    if (item.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You do not have permission to delete this listing.' });
    }

    // Also remove from favorites
    db.favorites = db.favorites.filter((f) => f.clothingItemId !== item.id);
    db.items.splice(index, 1);
    await saveDatabase();

    return res.json({ message: 'Clothing item removed successfully.' });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ error: 'Failed to delete listing.' });
  }
});

export default router;
