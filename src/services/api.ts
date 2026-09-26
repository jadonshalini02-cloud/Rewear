import {
  User,
  ClothingItem,
  SwapRequest,
  Conversation,
  Message,
  NotificationItem,
  Report,
  AdminStats,
  UserStats,
  AnalyticsData,
  ValueEstimateResult,
} from '../types';

const BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    try {
      return localStorage.getItem('rewear_token');
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    try {
      localStorage.setItem('rewear_token', token);
    } catch (e) {
      console.error('Failed to save token to localStorage:', e);
    }
  }

  public clearToken(): void {
    try {
      localStorage.removeItem('rewear_token');
    } catch (e) {
      console.error('Failed to remove token:', e);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = data?.error || data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (error: any) {
      console.error(`API Error on [${options.method || 'GET'}] ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth APIs
  async register(payload: {
    name: string;
    email: string;
    password: string;
    location?: string;
    bio?: string;
    avatarUrl?: string;
  }): Promise<{ message: string; token: string; user: User }> {
    const res = await this.request<{ message: string; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async login(payload: { email: string; password: string } | string, maybePassword?: string): Promise<{ message: string; token: string; user: User }> {
    const body = typeof payload === 'string'
      ? { email: payload, password: maybePassword || '' }
      : payload;

    const res = await this.request<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearToken();
    }
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // User Profile & Stats
  async getUserProfile(id: string): Promise<{ user: User; items: ClothingItem[] }> {
    return this.request<{ user: User; items: ClothingItem[] }>(`/users/${id}`);
  }

  async updateProfile(payload: { name?: string; bio?: string; location?: string; avatarUrl?: string }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const meRes = await this.getMe();
      const user = meRes.user;

      const itemsRes = await this.getItems({ ownerId: user.id, status: 'ALL' });
      const myItems = itemsRes.items || [];
      const activeListings = myItems.filter((i) => i.status === 'AVAILABLE').length;

      const incomingRes = await this.getIncomingSwaps();
      const outgoingRes = await this.getOutgoingSwaps();

      const pendingIncoming = (incomingRes.swaps || []).filter((s) => s.status === 'PENDING').length;
      const pendingOutgoing = (outgoingRes.swaps || []).filter((s) => s.status === 'PENDING').length;

      const completed = (incomingRes.swaps || []).filter((s) => s.status === 'COMPLETED').length +
        (outgoingRes.swaps || []).filter((s) => s.status === 'COMPLETED').length;

      const favRes = await this.getFavorites();

      return {
        activeListings,
        pendingRequests: pendingIncoming + pendingOutgoing,
        completedSwaps: completed,
        favoritedCount: favRes.favorites?.length || 0,
        totalListings: myItems.length,
      };
    } catch {
      return {
        activeListings: 0,
        pendingRequests: 0,
        completedSwaps: 0,
        favoritedCount: 0,
        totalListings: 0,
      };
    }
  }

  // Clothing Items
  async getItems(params?: Record<string, string | number | undefined>): Promise<{
    items: ClothingItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const qs = query.toString();
    return this.request(`/items${qs ? `?${qs}` : ''}`);
  }

  async getItem(id: string): Promise<{
    item: ClothingItem;
    similarItems: ClothingItem[];
    potentialMatches: ClothingItem[];
  }> {
    return this.request(`/items/${id}`);
  }

  async getItemById(id: string): Promise<{
    item: ClothingItem;
    similarItems: ClothingItem[];
    potentialMatches: ClothingItem[];
  }> {
    return this.getItem(id);
  }

  async createItem(payload: Partial<ClothingItem>): Promise<{ message: string; item: ClothingItem }> {
    return this.request('/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateItem(id: string, payload: Partial<ClothingItem>): Promise<{ message: string; item: ClothingItem }> {
    return this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteItem(id: string): Promise<{ message: string }> {
    return this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(image: string, name?: string): Promise<{ url: string; message: string }> {
    return this.request('/upload', {
      method: 'POST',
      body: JSON.stringify({ image, name }),
    });
  }

  // Favorites
  async getFavorites(): Promise<{ favorites: ClothingItem[] }> {
    return this.request<{ favorites: ClothingItem[] }>('/favorites');
  }

  async addFavorite(itemId: string): Promise<{ message: string; isFavorited: boolean }> {
    return this.request(`/favorites/${itemId}`, {
      method: 'POST',
    });
  }

  async removeFavorite(itemId: string): Promise<{ message: string; isFavorited: boolean }> {
    return this.request(`/favorites/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Swaps
  async createSwap(payload: { requestedItemId: string; offeredItemId: string; message?: string }): Promise<{ message: string; swap: SwapRequest }> {
    return this.request('/swaps', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getSwaps(params?: { type?: 'incoming' | 'outgoing'; status?: string }): Promise<{ swaps: SwapRequest[] }> {
    if (params?.type === 'outgoing') {
      const res = await this.getOutgoingSwaps();
      let list = res.swaps.map(s => ({
        ...s,
        initiatorId: s.requesterId,
        recipientId: s.receiverId,
        initiator: s.requester,
        recipient: s.receiver,
      }));
      if (params.status) {
        list = list.filter(s => s.status === params.status);
      }
      return { swaps: list };
    }

    const incRes = await this.getIncomingSwaps();
    const outRes = await this.getOutgoingSwaps();
    let list = [...incRes.swaps, ...outRes.swaps].map(s => ({
      ...s,
      initiatorId: s.requesterId,
      recipientId: s.receiverId,
      initiator: s.requester,
      recipient: s.receiver,
    }));

    if (params?.status) {
      list = list.filter(s => s.status === params.status);
    }
    return { swaps: list };
  }

  async getIncomingSwaps(): Promise<{ swaps: SwapRequest[] }> {
    const res = await this.request<{ swaps: SwapRequest[] }>('/swaps/incoming');
    return {
      swaps: (res.swaps || []).map(s => ({
        ...s,
        initiatorId: s.requesterId,
        recipientId: s.receiverId,
        initiator: s.requester,
        recipient: s.receiver,
      })),
    };
  }

  async getOutgoingSwaps(): Promise<{ swaps: SwapRequest[] }> {
    const res = await this.request<{ swaps: SwapRequest[] }>('/swaps/outgoing');
    return {
      swaps: (res.swaps || []).map(s => ({
        ...s,
        initiatorId: s.requesterId,
        recipientId: s.receiverId,
        initiator: s.requester,
        recipient: s.receiver,
      })),
    };
  }

  async getSwap(id: string): Promise<{ swap: SwapRequest }> {
    const res = await this.request<{ swap: SwapRequest }>(`/swaps/${id}`);
    const s = res.swap;
    return {
      swap: {
        ...s,
        initiatorId: s.requesterId,
        recipientId: s.receiverId,
        initiator: s.requester,
        recipient: s.receiver,
      },
    };
  }

  async updateSwapStatus(id: string, status: string, note?: string): Promise<{ message: string; swap: SwapRequest }> {
    if (status === 'ACCEPTED') {
      return this.acceptSwap(id);
    }
    if (status === 'REJECTED') {
      return this.rejectSwap(id);
    }
    if (status === 'CANCELLED') {
      return this.cancelSwap(id);
    }
    if (status === 'COMPLETED') {
      return this.completeSwap(id);
    }
    return this.request(`/swaps/${id}/negotiate`, { method: 'PATCH' });
  }

  async acceptSwap(id: string): Promise<{ message: string; swap: SwapRequest }> {
    return this.request(`/swaps/${id}/accept`, {
      method: 'PATCH',
    });
  }

  async rejectSwap(id: string): Promise<{ message: string; swap: SwapRequest }> {
    return this.request(`/swaps/${id}/reject`, {
      method: 'PATCH',
    });
  }

  async cancelSwap(id: string): Promise<{ message: string; swap: SwapRequest }> {
    return this.request(`/swaps/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  async completeSwap(id: string): Promise<{ message: string; swap: SwapRequest }> {
    return this.request(`/swaps/${id}/complete`, {
      method: 'PATCH',
    });
  }

  // Conversations & Messages
  async getConversations(): Promise<{ conversations: Conversation[] }> {
    const res = await this.request<{ conversations: any[] }>('/conversations');
    const enriched = (res.conversations || []).map((c) => ({
      ...c,
      participants: c.otherUser ? [c.otherUser] : [],
      lastMessage: typeof c.lastMessage === 'string' ? { text: c.lastMessage } : c.lastMessage,
    }));
    return { conversations: enriched };
  }

  async createConversation(payload: { participantId?: string; targetUserId?: string; itemId?: string }): Promise<{ conversation: { id: string } }> {
    const targetUserId = payload.participantId || payload.targetUserId || '';
    const res = await this.openDirectConversation(targetUserId, payload.itemId);
    return { conversation: { id: res.conversationId } };
  }

  async openDirectConversation(targetUserId: string, itemId?: string): Promise<{ conversationId: string }> {
    return this.request('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, itemId }),
    });
  }

  async getMessages(conversationId: string): Promise<{ conversation: Conversation; messages: Message[] }> {
    const res = await this.request<{ conversation: any; messages: any[] }>(`/conversations/${conversationId}/messages`);
    const msgs = (res.messages || []).map(m => ({
      ...m,
      text: m.content || m.text,
    }));
    const conv = {
      ...res.conversation,
      participants: res.conversation?.otherUser ? [res.conversation.otherUser] : [],
    };
    return { conversation: conv, messages: msgs };
  }

  async sendMessage(conversationId: string, payload: { content?: string; text?: string } | string): Promise<{ message: Message }> {
    const content = typeof payload === 'string'
      ? payload
      : payload.content || payload.text || '';

    const res = await this.request<{ message: any }>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    return {
      message: {
        ...res.message,
        text: res.message.content || res.message.text,
      },
    };
  }

  async markConversationRead(conversationId: string): Promise<{ success: boolean }> {
    return this.request(`/conversations/${conversationId}/read`, {
      method: 'PATCH',
    });
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Fair Swap Value Calculator
  async estimateValue(payload: {
    category: string;
    subcategory?: string;
    brand: string;
    condition: string;
    originalPrice?: number;
    ageYears?: number;
  }): Promise<ValueEstimateResult> {
    return this.request('/calculator/estimate', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        subcategory: payload.subcategory || 'General',
      }),
    });
  }

  // Reports
  async submitReport(payload: {
    reportedItemId?: string;
    reportedUserId?: string;
    reason: string;
    description?: string;
  }): Promise<{ message: string; reportId: string }> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Admin APIs
  async getAdminStats(): Promise<AdminStats> {
    const res = await this.request<{ analytics: AnalyticsData }>('/admin/analytics');
    const an = res.analytics;
    const catDist: Record<string, number> = {};
    an.categoryData?.forEach((c) => {
      catDist[c.name] = c.value;
    });

    return {
      totalUsers: an.totalUsers,
      activeUsers: an.activeUsers,
      totalItems: an.totalListings,
      completedSwaps: an.completedSwaps,
      pendingReports: an.pendingReports,
      estimatedCo2SavedKg: an.co2SavedKg,
      categoryDistribution: catDist,
      swapsByStatus: {
        Pending: an.pendingSwaps,
        Accepted: an.acceptedSwaps,
        Completed: an.completedSwaps,
      },
    };
  }

  async getAdminAnalytics(): Promise<{ analytics: AnalyticsData }> {
    return this.request('/admin/analytics');
  }

  async getAdminUsers(search?: string): Promise<{ users: any[] }> {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/admin/users${q}`);
  }

  async updateAdminUserStatus(id: string, status: string): Promise<{ message: string; user: any }> {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async updateAdminUserRole(id: string, role: string): Promise<{ message: string; user: any }> {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async getAdminListings(search?: string): Promise<{ items: any[] }> {
    const res = await this.request<{ items: any[] }>('/admin/items');
    let list = res.items || [];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q) ||
          i.category?.toLowerCase().includes(q)
      );
    }
    return { items: list };
  }

  async deleteAdminListing(id: string): Promise<{ message: string }> {
    return this.request(`/admin/items/${id}`, {
      method: 'DELETE',
    });
  }

  async getAdminSwaps(): Promise<{ swaps: any[] }> {
    return this.request('/admin/swaps');
  }

  async getAdminReports(status?: string): Promise<{ reports: Report[] }> {
    const res = await this.request<{ reports: Report[] }>('/reports');
    let list = res.reports || [];
    if (status && status !== 'ALL') {
      list = list.filter((r) => r.status === status);
    }
    return { reports: list };
  }

  async resolveReport(id: string, payload: { status: string; resolutionNotes?: string }): Promise<{ message: string }> {
    return this.request(`/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: payload.status,
        actionTaken: payload.resolutionNotes,
      }),
    });
  }
}

export const api = new ApiClient();
