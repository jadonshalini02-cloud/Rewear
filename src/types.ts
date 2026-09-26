export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  bio?: string;
  avatarUrl?: string;
  status?: UserStatus;
  rating?: number;
  reviewCount?: number;
  swapCount?: number;
  createdAt: string;
  updatedAt?: string;
  stats?: {
    activeListings: number;
    pendingSwaps: number;
    completedSwaps: number;
    savedItems: number;
  };
}

export type Category = 'Women' | 'Men' | 'Unisex' | 'Kids';
export type Condition = 'Like New' | 'Excellent' | 'Good' | 'Fair';
export type ItemStatus = 'AVAILABLE' | 'PENDING_SWAP' | 'SWAPPED' | 'REMOVED';

export interface ClothingItem {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: Category;
  subcategory?: string;
  brand: string;
  size: string;
  condition: Condition;
  color?: string;
  material?: string;
  originalPrice?: number;
  estimatedValue: number;
  location: string;
  status: ItemStatus;
  images: string[];
  views?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  isFavorited?: boolean;
  favoritedAt?: string;
  owner?: {
    id: string;
    name: string;
    avatarUrl?: string;
    location: string;
    bio?: string;
    rating?: number;
    reviewCount?: number;
    activeListingsCount?: number;
    completedSwapsCount?: number;
    joinedAt?: string;
  } | null;
  matchReason?: string;
  valueDifference?: number;
}

export type SwapStatus = 'PENDING' | 'NEGOTIATING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface SwapRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  // Aliases for requester/receiver
  initiatorId?: string;
  recipientId?: string;
  offeredItemId: string;
  requestedItemId: string;
  message: string;
  status: SwapStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  valueDifference?: number;
  conversationId?: string;
  requester?: Partial<User> | null;
  receiver?: Partial<User> | null;
  // Aliases
  initiator?: Partial<User> | null;
  recipient?: Partial<User> | null;
  offeredItem?: ClothingItem | null;
  requestedItem?: ClothingItem | null;
}

export interface Conversation {
  id: string;
  swapRequestId?: string;
  swapStatus?: SwapStatus;
  offeredItemTitle?: string;
  requestedItemTitle?: string;
  participants?: Partial<User>[];
  otherUser?: {
    id: string;
    name: string;
    avatarUrl?: string;
    location?: string;
    rating?: number;
  } | null;
  item?: ClothingItem | null;
  lastMessage?: { text: string; createdAt?: string } | any;
  lastMessageAt?: string;
  unreadCount?: number;
  swap?: {
    id: string;
    status: SwapStatus;
    offeredItem?: ClothingItem | null;
    requestedItem?: ClothingItem | null;
  } | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  text?: string;
  readAt?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'SWAP_REQUEST' | 'SWAP_ACCEPTED' | 'SWAP_REJECTED' | 'SWAP_COMPLETED' | 'NEW_MESSAGE' | 'SYSTEM';
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedItemId?: string;
  reportedUserId?: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  actionTaken?: string;
  createdAt: string;
  resolvedAt?: string;
  reporter?: { id: string; name: string; email: string } | null;
  reportedItem?: { id: string; title: string; image?: string } | null;
  reportedUser?: { id: string; name: string; email: string } | null;
}

export type ReportItem = Report;

export interface UserStats {
  activeListings: number;
  pendingRequests: number;
  completedSwaps: number;
  favoritedCount: number;
  totalListings: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalItems: number;
  completedSwaps: number;
  pendingReports: number;
  estimatedCo2SavedKg: number;
  categoryDistribution?: Record<string, number>;
  swapsByStatus?: Record<string, number>;
}

export interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalListings: number;
  activeListings: number;
  pendingSwaps: number;
  acceptedSwaps: number;
  completedSwaps: number;
  totalSwaps: number;
  completionRate: number;
  co2SavedKg: number;
  waterSavedLiters: number;
  textileWastePreventedKg: number;
  categoryData: { name: string; value: number }[];
  cityData: { name: string; count: number }[];
  pendingReports: number;
}

export interface ValueEstimateResult {
  estimatedValue: number;
  confidence: string;
  explanationSteps: string[];
  breakdown: {
    categoryBase: number;
    brandMultiplier: number;
    brandTier: string;
    conditionFactor: number;
  };
}
