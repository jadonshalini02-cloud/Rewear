import { Router } from 'express';

const router = Router();

interface EstimateRequest {
  category: string;
  subcategory: string;
  brand: string;
  condition: string;
  originalPrice?: number;
  ageYears?: number;
}

const CATEGORY_BASE_VALUES: Record<string, number> = {
  Jackets: 2200,
  Coats: 3000,
  Dresses: 1800,
  'Ethnic Wear': 2400,
  Jeans: 1900,
  Trousers: 1500,
  Sweaters: 1700,
  Shirts: 1400,
  Tops: 1100,
  'T-Shirts': 900,
  Skirts: 1300,
  Shoes: 2200,
  Activewear: 1500,
  Accessories: 850,
};

const BRAND_MULTIPLIERS: Record<string, { multiplier: number; tier: string }> = {
  "levi's": { multiplier: 1.25, tier: 'Heritage / Denim Leader' },
  levis: { multiplier: 1.25, tier: 'Heritage / Denim Leader' },
  zara: { multiplier: 1.15, tier: 'Modern High-Street' },
  uniqlo: { multiplier: 1.2, tier: 'Quality Minimalist' },
  fabindia: { multiplier: 1.3, tier: 'Artisanal Handloom' },
  nike: { multiplier: 1.3, tier: 'Premium Sportswear' },
  adidas: { multiplier: 1.25, tier: 'Sportswear' },
  'h&m conscious': { multiplier: 1.1, tier: 'Sustainable Line' },
  'h&m': { multiplier: 1.0, tier: 'Fast Fashion' },
  mango: { multiplier: 1.2, tier: 'Premium High-Street' },
  nicobar: { multiplier: 1.4, tier: 'Contemporary Sustainable' },
  'raw mango': { multiplier: 1.8, tier: 'Luxury Handloom' },
  patagonia: { multiplier: 1.5, tier: 'Eco Outdoor Leader' },
  marks: { multiplier: 1.2, tier: 'Quality Classic' },
  'marks & spencer': { multiplier: 1.2, tier: 'Quality Classic' },
  westside: { multiplier: 0.95, tier: 'Standard Value' },
  max: { multiplier: 0.85, tier: 'Budget Fashion' },
};

const CONDITION_FACTORS: Record<string, { factor: number; label: string }> = {
  'Like New': { factor: 0.85, label: 'Barely worn, flawless fabric and stitching (85% value retention)' },
  Excellent: { factor: 0.7, label: 'Gently worn, no marks, crisp structure (70% value retention)' },
  Good: { factor: 0.5, label: 'Normal wear, structurally sound and clean (50% value retention)' },
  Fair: { factor: 0.35, label: 'Visible wear or minor fading, still functional (35% value retention)' },
};

router.post('/estimate', async (req, res) => {
  try {
    const { category, subcategory, brand, condition, originalPrice, ageYears }: EstimateRequest = req.body;

    if (!category?.trim() || !brand?.trim() || !condition?.trim()) {
      return res.status(400).json({ error: 'Category, brand, and condition are required.' });
    }
    if (originalPrice !== undefined && (!Number.isFinite(Number(originalPrice)) || Number(originalPrice) < 0)) {
      return res.status(400).json({ error: 'Original price must be a non-negative number.' });
    }
    if (ageYears !== undefined && (!Number.isFinite(Number(ageYears)) || Number(ageYears) < 0)) {
      return res.status(400).json({ error: 'Age must be a non-negative number.' });
    }

    const baseVal = CATEGORY_BASE_VALUES[subcategory] || CATEGORY_BASE_VALUES[category] || 1500;

    // Brand matching
    const brandLower = (brand || '').toLowerCase().trim();
    let brandInfo = { multiplier: 1.0, tier: 'Standard Brand' };
    for (const [key, val] of Object.entries(BRAND_MULTIPLIERS)) {
      if (brandLower.includes(key)) {
        brandInfo = val;
        break;
      }
    }

    const condInfo = CONDITION_FACTORS[condition] || CONDITION_FACTORS['Good'];

    let estimatedValue = 0;
    const explanationSteps: string[] = [];

    if (originalPrice && Number(originalPrice) > 0) {
      // Direct price retention model
      const baseRetention = Number(originalPrice) * condInfo.factor;
      let ageFactor = 1.0;
      if (ageYears && Number(ageYears) > 1) {
        ageFactor = Math.max(0.65, 1.0 - (Number(ageYears) - 1) * 0.08);
      }
      estimatedValue = Math.round(baseRetention * ageFactor);

      explanationSteps.push(`Original Retail Price: ₹${Number(originalPrice).toLocaleString()}`);
      explanationSteps.push(`Condition (${condition}): ${condInfo.label}`);
      if (ageYears && Number(ageYears) > 1) {
        explanationSteps.push(`Age Adjustment (${ageYears} yrs): -${Math.round((1 - ageFactor) * 100)}% depreciation`);
      }
    } else {
      // Baseline calculation model
      const brandAdjusted = baseVal * brandInfo.multiplier;
      estimatedValue = Math.round(brandAdjusted * condInfo.factor);

      explanationSteps.push(`Category Benchmark (${subcategory || category}): Baseline value ₹${baseVal.toLocaleString()}`);
      explanationSteps.push(`Brand Index (${brand || 'Standard'}): ${brandInfo.tier} (${brandInfo.multiplier >= 1 ? '+' : ''}${Math.round((brandInfo.multiplier - 1) * 100)}%)`);
      explanationSteps.push(`Condition Grade (${condition}): ${condInfo.label}`);
    }

    // Round to nearest 50 for clean barter comparison
    estimatedValue = Math.max(250, Math.round(estimatedValue / 50) * 50);

    return res.json({
      estimatedValue,
      confidence: 'High (Rule-based transparent algorithm)',
      explanationSteps,
      breakdown: {
        categoryBase: baseVal,
        brandMultiplier: brandInfo.multiplier,
        brandTier: brandInfo.tier,
        conditionFactor: condInfo.factor,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compute swap value estimate.' });
  }
});

export default router;
