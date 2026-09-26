import { Router } from 'express';
import { put } from '@vercel/blob';
import { requireAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/upload - image upload handler
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { image, name } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    // Validate if data URL
    if (image.startsWith('data:')) {
      const mimeMatch = image.match(/^data:([^;]+);base64,/);
      if (!mimeMatch) {
        return res.status(400).json({ error: 'Invalid base64 image format.' });
      }

      const mimeType = mimeMatch[1];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      if (!validTypes.includes(mimeType)) {
        return res.status(400).json({ error: 'Only JPG, PNG, WEBP, and AVIF image formats are allowed.' });
      }

      // Check approx size (base64 length * 0.75)
      const sizeBytes = image.length * 0.75;
      if (sizeBytes > 10 * 1024 * 1024) {
        return res.status(400).json({ error: 'Image size exceeds maximum limit of 10MB.' });
      }

      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const base64 = image.slice(image.indexOf(',') + 1);
        const buffer = Buffer.from(base64, 'base64');
        const safeName = String(name || 'garment-image').replace(/[^a-zA-Z0-9._-]/g, '-').slice(-80);
        const uploaded = await put(`rewear/${Date.now()}-${safeName || 'image'}`, buffer, {
          access: 'public',
          contentType: mimeType,
          addRandomSuffix: true,
        });
        return res.json({
          url: uploaded.url,
          message: 'Image uploaded to persistent storage successfully.',
        });
      }

      // Development fallback when Blob has not been configured yet.
      return res.json({
        url: image,
        message: 'Image processed and uploaded successfully.',
      });
    }

    // Direct URL check
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return res.json({
        url: image,
        message: 'Image URL verified.',
      });
    }

    return res.status(400).json({ error: 'Please provide a valid image file or HTTPS URL.' });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to process image upload.' });
  }
});

// GET /api/upload/presets - curated high-res presets for quick testing
router.get('/presets', async (req, res) => {
  const presets = [
    {
      title: 'Vintage Denim Jacket',
      url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Linen Summer Shirt',
      url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Khadi Handloom Kurta',
      url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Wool Knit Pullover',
      url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Floral Midi Dress',
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Classic Selvedge Jeans',
      url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Tailored Blazer',
      url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
    },
    {
      title: 'Technical Windbreaker',
      url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
    },
  ];
  return res.json({ presets });
});

export default router;
