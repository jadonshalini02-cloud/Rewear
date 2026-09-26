import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { neon } from '@neondatabase/serverless';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  location: string;
  bio: string;
  avatarUrl: string;
  status: 'ACTIVE' | 'SUSPENDED';
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingItemRecord {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: 'Women' | 'Men' | 'Unisex' | 'Kids';
  subcategory: string;
  brand: string;
  size: string;
  condition: 'Like New' | 'Excellent' | 'Good' | 'Fair';
  color: string;
  material: string;
  originalPrice?: number;
  estimatedValue: number; // in INR (₹)
  location: string;
  status: 'AVAILABLE' | 'PENDING_SWAP' | 'SWAPPED' | 'REMOVED';
  images: string[];
  views: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteRecord {
  id: string;
  userId: string;
  clothingItemId: string;
  createdAt: string;
}

export interface SwapRequestRecord {
  id: string;
  requesterId: string;
  receiverId: string;
  offeredItemId: string;
  requestedItemId: string;
  message: string;
  status: 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ConversationRecord {
  id: string;
  swapRequestId?: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'SWAP_REQUEST' | 'SWAP_ACCEPTED' | 'SWAP_REJECTED' | 'SWAP_COMPLETED' | 'NEW_MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedItemId?: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DatabaseState {
  users: UserRecord[];
  items: ClothingItemRecord[];
  favorites: FavoriteRecord[];
  swaps: SwapRequestRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  notifications: NotificationRecord[];
  reports: ReportRecord[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');
const DATABASE_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || process.env.STORAGE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;
let writeQueue: Promise<void> = Promise.resolve();

// Global in-memory DB reference. Neon is the source of truth in production;
// this in-memory copy keeps the existing route code and response shapes intact.
export let db: DatabaseState = {
  users: [],
  items: [],
  favorites: [],
  swaps: [],
  conversations: [],
  messages: [],
  notifications: [],
  reports: [],
};

export async function saveDatabase(): Promise<void> {
  const snapshot = JSON.stringify(db);
  if (sql) {
    writeQueue = writeQueue
      .then(async () => {
        await sql`
          INSERT INTO rewear_state (id, payload, updated_at)
          VALUES ('main', ${snapshot}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
        `;
      })
      .catch((err) => {
        console.error('Error persisting database to Neon:', err);
      });
    await writeQueue;
    return;
  }

  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database:', err);
  }
}

export async function flushDatabaseWrites(): Promise<void> {
  await writeQueue;
}

export async function initializeDatabase(): Promise<void> {
  if (sql) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS rewear_state (
          id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      const rows = await sql`SELECT payload FROM rewear_state WHERE id = 'main'`;
      if (rows.length > 0) {
        db = rows[0].payload as DatabaseState;
        console.log(`Loaded ReWear database from Neon with ${db.items.length} clothing items.`);
        return;
      }
      seedDatabase();
      await flushDatabaseWrites();
      return;
    } catch (err) {
      console.error('Failed to initialize Neon database:', err);
      throw err;
    }
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      console.log(`Loaded existing ReWear database with ${db.items.length} clothing items.`);
      return;
    } catch (e) {
      console.error('Failed to parse database file, reseeding data...', e);
    }
  }
  seedDatabase();
}

export function seedDatabase(): void {
  console.log('🌱 Seeding ReWear database with realistic sustainable fashion data...');

  const salt = bcrypt.genSaltSync(10);
  const demoUserHash = bcrypt.hashSync('DemoUser123!', salt);
  const adminHash = bcrypt.hashSync('Admin123!', salt);
  const commonUserHash = bcrypt.hashSync('Password123!', salt);

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

  // 1. Realistic Users
  const users: UserRecord[] = [
    {
      id: 'user_demo',
      name: 'Priya Sharma',
      email: 'demo.user@example.com',
      passwordHash: demoUserHash,
      role: 'USER',
      location: 'Bangalore, Indiranagar',
      bio: 'Eco-conscious fashion designer. Loving second-hand denim, linen tailoring, and artisanal handloom fabrics. Committed to zero-waste wardrobe swapping!',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 4.9,
      reviewCount: 14,
      createdAt: daysAgo(60),
      updatedAt: daysAgo(2),
    },
    {
      id: 'user_admin',
      name: 'ReWear Admin',
      email: 'admin@example.com',
      passwordHash: adminHash,
      role: 'ADMIN',
      location: 'Mumbai, Bandra',
      bio: 'Platform safety, community moderation and circular fashion sustainability coordinator.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 5.0,
      reviewCount: 48,
      createdAt: daysAgo(120),
      updatedAt: daysAgo(1),
    },
    {
      id: 'user_aarav',
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      passwordHash: commonUserHash,
      role: 'USER',
      location: 'Mumbai, Andheri West',
      bio: 'Streetwear collector & vintage enthusiast. Swapping jackets, hoodies, and limited drops.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 4.8,
      reviewCount: 9,
      createdAt: daysAgo(45),
      updatedAt: daysAgo(5),
    },
    {
      id: 'user_ananya',
      name: 'Ananya Iyer',
      email: 'ananya.iyer@example.com',
      passwordHash: commonUserHash,
      role: 'USER',
      location: 'Delhi, Hauz Khas',
      bio: 'Handloom lover and minimalist capsule wardrobe practitioner. Swapping ethnic & formal wear.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 5.0,
      reviewCount: 18,
      createdAt: daysAgo(90),
      updatedAt: daysAgo(3),
    },
    {
      id: 'user_rohan',
      name: 'Rohan Das',
      email: 'rohan.das@example.com',
      passwordHash: commonUserHash,
      role: 'USER',
      location: 'Pune, Koregaon Park',
      bio: 'Outdoor gear, rugged jackets & organic cotton shirts. Let us stop buying cheap synthetic clothes!',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 4.7,
      reviewCount: 7,
      createdAt: daysAgo(30),
      updatedAt: daysAgo(1),
    },
    {
      id: 'user_zara',
      name: 'Zara Khan',
      email: 'zara.khan@example.com',
      passwordHash: commonUserHash,
      role: 'USER',
      location: 'Hyderabad, Jubilee Hills',
      bio: 'Stylist curating premium ethnic kurtas, western trench coats, and boho midi dresses.',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 4.9,
      reviewCount: 22,
      createdAt: daysAgo(75),
      updatedAt: daysAgo(4),
    },
    {
      id: 'user_meera',
      name: 'Meera Nambiar',
      email: 'meera.nambiar@example.com',
      passwordHash: commonUserHash,
      role: 'USER',
      location: 'Kochi, Fort Kochi',
      bio: 'Slow fashion advocate. Swapping coastal cotton wear, breezy co-ords and handmade accessories.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      status: 'ACTIVE',
      rating: 4.8,
      reviewCount: 11,
      createdAt: daysAgo(40),
      updatedAt: daysAgo(2),
    },
  ];

  // 2. Realistic Clothing Items
  const items: ClothingItemRecord[] = [
    {
      id: 'item_1',
      ownerId: 'user_demo',
      title: 'Vintage 90s Trucker Denim Jacket',
      description: 'Authentic 90s heavyweight denim jacket with natural faded patina. Double chest pockets, copper rivets, and a classic boxy fit. 100% pure cotton selvedge denim. Cleaned and kept in smoke-free environment.',
      category: 'Unisex',
      subcategory: 'Jackets',
      brand: "Levi's",
      size: 'M',
      condition: 'Excellent',
      color: 'Indigo Blue',
      material: '100% Cotton Denim',
      estimatedValue: 2400,
      location: 'Bangalore, Indiranagar',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 142,
      tags: ['denim', 'vintage', 'outerwear', 'classic', 'cotton'],
      createdAt: daysAgo(14),
      updatedAt: daysAgo(2),
    },
    {
      id: 'item_2',
      ownerId: 'user_demo',
      title: 'Relaxed Pure Linen Resort Shirt',
      description: 'Breezy French flax linen shirt in sage green. Camp collar style with pearl shell buttons. Barely worn twice, perfect for summer getaways and cafe work sessions.',
      category: 'Men',
      subcategory: 'Shirts',
      brand: 'Zara',
      size: 'L',
      condition: 'Like New',
      color: 'Sage Green',
      material: '100% French Linen',
      estimatedValue: 1650,
      location: 'Bangalore, Indiranagar',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 98,
      tags: ['linen', 'summer', 'minimalist', 'sustainable'],
      createdAt: daysAgo(10),
      updatedAt: daysAgo(1),
    },
    {
      id: 'item_3',
      ownerId: 'user_demo',
      title: 'Handcrafted Khadi Cotton Tunic Kurta',
      description: 'Naturally dyed indigo khadi kurta with delicate wooden buttons and concealed side pockets. Super breathable handspun fabric from certified artisanal weavers in Wardha.',
      category: 'Women',
      subcategory: 'Ethnic Wear',
      brand: 'Fabindia',
      size: 'S',
      condition: 'Excellent',
      color: 'Deep Indigo',
      material: 'Handspun Khadi Cotton',
      estimatedValue: 1800,
      location: 'Bangalore, Indiranagar',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 76,
      tags: ['khadi', 'handloom', 'ethnic', 'artisanal'],
      createdAt: daysAgo(8),
      updatedAt: daysAgo(3),
    },
    {
      id: 'item_4',
      ownerId: 'user_aarav',
      title: 'Windrunner Retro Hooded Running Jacket',
      description: 'Lightweight technical windbreaker in retro monochrome colorway. Water-repellent recycled polyester fabric with chevron front design, mesh lining, and zip pockets.',
      category: 'Men',
      subcategory: 'Jackets',
      brand: 'Nike',
      size: 'M',
      condition: 'Like New',
      color: 'Black & White',
      material: 'Recycled Polyester',
      estimatedValue: 2800,
      location: 'Mumbai, Andheri West',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 184,
      tags: ['streetwear', 'sportswear', 'nike', 'windbreaker'],
      createdAt: daysAgo(18),
      updatedAt: daysAgo(4),
    },
    {
      id: 'item_5',
      ownerId: 'user_aarav',
      title: '501 Original Fit Selvedge Denim Jeans',
      description: 'Iconic straight-leg 501 jeans in medium wash. 100% heavyweight cotton with button fly and copper hardware. Hemmed to standard 32 inseam. Zero rips or fraying.',
      category: 'Men',
      subcategory: 'Jeans',
      brand: "Levi's",
      size: '32',
      condition: 'Excellent',
      color: 'Medium Blue',
      material: '100% Cotton',
      estimatedValue: 2200,
      location: 'Mumbai, Andheri West',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 210,
      tags: ['levis', 'jeans', 'classic', 'denim'],
      createdAt: daysAgo(21),
      updatedAt: daysAgo(6),
    },
    {
      id: 'item_6',
      ownerId: 'user_ananya',
      title: 'Oversized Chunky Wool Knit Sweater',
      description: 'Plush 100% merino wool knit pullover in oat cream. Ribbed crewneck with raglan sleeves and cozy dropped shoulder silhouette. Warm, soft, and completely non-itchy.',
      category: 'Women',
      subcategory: 'Sweaters',
      brand: 'Uniqlo',
      size: 'M',
      condition: 'Like New',
      color: 'Oatmeal Cream',
      material: '100% Merino Wool',
      estimatedValue: 2100,
      location: 'Delhi, Hauz Khas',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 312,
      tags: ['wool', 'knitwear', 'winter', 'minimalist', 'cream'],
      createdAt: daysAgo(12),
      updatedAt: daysAgo(1),
    },
    {
      id: 'item_7',
      ownerId: 'user_ananya',
      title: 'Tiered Meadow Floral Linen Midi Dress',
      description: 'Romantic tiered midi dress with square neckline and puff sleeves. Lined with organic cotton voile. Flattering smocked back panel for a comfortable fit.',
      category: 'Women',
      subcategory: 'Dresses',
      brand: 'H&M Conscious',
      size: 'S',
      condition: 'Like New',
      color: 'Olive Floral',
      material: 'Organic Linen & Cotton',
      estimatedValue: 1950,
      location: 'Delhi, Hauz Khas',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 245,
      tags: ['dress', 'floral', 'summer', 'cottagecore', 'linen'],
      createdAt: daysAgo(15),
      updatedAt: daysAgo(2),
    },
    {
      id: 'item_8',
      ownerId: 'user_rohan',
      title: 'Heavyweight Flannel Plaid Overshirt',
      description: 'Brushed twill cotton workwear overshirt with dual utility pockets and tortoise shell buttons. Built for layering over basic tees.',
      category: 'Men',
      subcategory: 'Shirts',
      brand: 'Uniqlo',
      size: 'L',
      condition: 'Good',
      color: 'Forest Green & Navy',
      material: '100% Brushed Cotton',
      estimatedValue: 1400,
      location: 'Pune, Koregaon Park',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 89,
      tags: ['flannel', 'workwear', 'layering', 'casual'],
      createdAt: daysAgo(9),
      updatedAt: daysAgo(2),
    },
    {
      id: 'item_9',
      ownerId: 'user_zara',
      title: 'Handloom Chanderi Silk Dupatta & Anarkali Set',
      description: 'Exquisite pastel mint Chanderi silk suit set with subtle zari border work. Worn once for a family ceremony. Professionally dry-cleaned with original garment bag.',
      category: 'Women',
      subcategory: 'Ethnic Wear',
      brand: 'Handloom Artisans',
      size: 'M',
      condition: 'Like New',
      color: 'Pastel Mint',
      material: 'Chanderi Silk & Cotton',
      estimatedValue: 3500,
      location: 'Hyderabad, Jubilee Hills',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 380,
      tags: ['chanderi', 'silk', 'festive', 'traditional', 'handloom'],
      createdAt: daysAgo(25),
      updatedAt: daysAgo(7),
    },
    {
      id: 'item_10',
      ownerId: 'user_zara',
      title: 'Double-Breasted Tailored Wool Blazer',
      description: 'Structured wool-blend blazer in charcoal herringbone pattern. Peak lapels, horn buttons, padded shoulders, and full satin interior lining.',
      category: 'Women',
      subcategory: 'Jackets',
      brand: 'Zara',
      size: 'M',
      condition: 'Excellent',
      color: 'Charcoal Grey',
      material: 'Wool Blend',
      estimatedValue: 2700,
      location: 'Hyderabad, Jubilee Hills',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 167,
      tags: ['blazer', 'formal', 'tailored', 'workwear'],
      createdAt: daysAgo(16),
      updatedAt: daysAgo(3),
    },
    {
      id: 'item_11',
      ownerId: 'user_meera',
      title: 'Artisanal Block-Printed Cotton Wrap Skirt',
      description: 'Bagh block print flared wrap skirt in natural terracotta and indigo dyes. Breathable pure cotton with adjustable tie waistband. Handmade by craftswomen in MP.',
      category: 'Women',
      subcategory: 'Skirts',
      brand: 'Artisan Collective',
      size: 'Free Size',
      condition: 'Like New',
      color: 'Terracotta & Indigo',
      material: '100% Organic Cotton',
      estimatedValue: 1500,
      location: 'Kochi, Fort Kochi',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 115,
      tags: ['skirt', 'blockprint', 'boho', 'handmade'],
      createdAt: daysAgo(7),
      updatedAt: daysAgo(1),
    },
    {
      id: 'item_12',
      ownerId: 'user_rohan',
      title: 'Waterproof All-Terrain Trail Hiking Boots',
      description: 'GORE-TEX membrane waterproof hiking boots with Vibram megagrip sole. Worn on one gentle trekking weekend in Sahyadris. In clean, sturdy shape.',
      category: 'Men',
      subcategory: 'Shoes',
      brand: 'Decathlon Quechua',
      size: 'UK 9 / EU 43',
      condition: 'Good',
      color: 'Earth Brown',
      material: 'Leather & Technical Mesh',
      estimatedValue: 2500,
      location: 'Pune, Koregaon Park',
      status: 'AVAILABLE',
      images: [
        'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1000&q=80',
      ],
      views: 130,
      tags: ['shoes', 'outdoor', 'hiking', 'boots'],
      createdAt: daysAgo(20),
      updatedAt: daysAgo(5),
    },
  ];

  // 3. Favorites for demo user
  const favorites: FavoriteRecord[] = [
    {
      id: 'fav_1',
      userId: 'user_demo',
      clothingItemId: 'item_4', // Nike Windrunner
      createdAt: daysAgo(3),
    },
    {
      id: 'fav_2',
      userId: 'user_demo',
      clothingItemId: 'item_6', // Uniqlo wool knit
      createdAt: daysAgo(2),
    },
    {
      id: 'fav_3',
      userId: 'user_demo',
      clothingItemId: 'item_10', // Zara tailored blazer
      createdAt: daysAgo(1),
    },
  ];

  // 4. Initial Real Swap Requests & Conversations
  const swaps: SwapRequestRecord[] = [
    // Incoming request to demo user: Aarav wants Demo's Vintage Denim Jacket (item_1) and offers his Nike Windrunner (item_4)
    {
      id: 'swap_req_1',
      requesterId: 'user_aarav',
      receiverId: 'user_demo',
      offeredItemId: 'item_4',
      requestedItemId: 'item_1',
      message: "Hey Priya! I've been searching everywhere for this exact 90s Levi's trucker jacket. My Nike windrunner is barely worn and is in pristine condition. Would love to swap!",
      status: 'PENDING',
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    // Outgoing request from demo user: Demo wants Ananya's Merino Wool Knit (item_6) and offers Linen Resort Shirt (item_2)
    {
      id: 'swap_req_2',
      requesterId: 'user_demo',
      receiverId: 'user_ananya',
      offeredItemId: 'item_2',
      requestedItemId: 'item_6',
      message: 'Hi Ananya! I love the texture and warm oat color of this knit sweater. Offering my French linen shirt from Zara. Let me know if you would like to swap!',
      status: 'NEGOTIATING',
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
    // Completed past swap between Demo and Zara
    {
      id: 'swap_req_3',
      requesterId: 'user_demo',
      receiverId: 'user_zara',
      offeredItemId: 'item_3',
      requestedItemId: 'item_9',
      message: 'Excited to do our first community handloom exchange!',
      status: 'COMPLETED',
      createdAt: daysAgo(28),
      updatedAt: daysAgo(20),
      completedAt: daysAgo(20),
    },
  ];

  // 5. Conversations & Messages
  const conversations: ConversationRecord[] = [
    {
      id: 'conv_1',
      swapRequestId: 'swap_req_1',
      participantIds: ['user_aarav', 'user_demo'],
      lastMessage: "Hey Priya! I've been searching everywhere for this exact 90s Levi's trucker jacket.",
      lastMessageAt: daysAgo(2),
      createdAt: daysAgo(2),
      updatedAt: daysAgo(2),
    },
    {
      id: 'conv_2',
      swapRequestId: 'swap_req_2',
      participantIds: ['user_demo', 'user_ananya'],
      lastMessage: 'Sounds great Priya! Could you share if the shirt is pre-washed and if the fit is true to size?',
      lastMessageAt: daysAgo(1),
      createdAt: daysAgo(4),
      updatedAt: daysAgo(1),
    },
  ];

  const messages: MessageRecord[] = [
    {
      id: 'msg_1',
      conversationId: 'conv_1',
      senderId: 'user_aarav',
      content: "Hey Priya! I've been searching everywhere for this exact 90s Levi's trucker jacket. My Nike windrunner is barely worn and is in pristine condition. Would love to swap!",
      createdAt: daysAgo(2),
    },
    {
      id: 'msg_2',
      conversationId: 'conv_2',
      senderId: 'user_demo',
      content: 'Hi Ananya! I love the texture and warm oat color of this knit sweater. Offering my French linen shirt from Zara. Let me know if you would like to swap!',
      createdAt: daysAgo(4),
    },
    {
      id: 'msg_3',
      conversationId: 'conv_2',
      senderId: 'user_ananya',
      content: 'Sounds great Priya! Could you share if the shirt is pre-washed and if the fit is true to size?',
      createdAt: daysAgo(1),
    },
  ];

  // 6. Notifications for demo user
  const notifications: NotificationRecord[] = [
    {
      id: 'notif_1',
      userId: 'user_demo',
      type: 'SWAP_REQUEST',
      title: 'New Swap Request Received',
      message: 'Aarav Patel offered Nike Windrunner Retro Jacket for your Vintage 90s Denim Jacket.',
      link: '/swap-requests',
      read: false,
      createdAt: daysAgo(2),
    },
    {
      id: 'notif_2',
      userId: 'user_demo',
      type: 'NEW_MESSAGE',
      title: 'New Message from Ananya Iyer',
      message: 'Sounds great Priya! Could you share if the shirt is pre-washed and if...',
      link: '/chat/conv_2',
      read: false,
      createdAt: daysAgo(1),
    },
    {
      id: 'notif_3',
      userId: 'user_demo',
      type: 'SWAP_COMPLETED',
      title: 'Swap Completed Successfully!',
      message: 'Your exchange with Zara Khan was marked complete. You saved ~2.4kg of CO2 and 4,000L of water!',
      link: '/swaps',
      read: true,
      createdAt: daysAgo(20),
    },
  ];

  // 7. Initial Moderation Reports
  const reports: ReportRecord[] = [
    {
      id: 'rep_1',
      reporterId: 'user_rohan',
      reportedItemId: 'item_12',
      reason: 'Incorrect Size Tagging',
      description: 'Item listing has shoe size in description as UK 9 but title says UK 8. Just need clarification for community members.',
      status: 'PENDING',
      createdAt: daysAgo(3),
    },
  ];

  db = {
    users,
    items,
    favorites,
    swaps,
    conversations,
    messages,
    notifications,
    reports,
  };

  saveDatabase();
  console.log('✅ ReWear database seeded successfully!');
}
