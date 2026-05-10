/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_URL = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path: string, options: any = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {})
    },
    ...options
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      // Use replace to avoid back button loops and ensure clean state
      window.location.replace("/");
      return new Promise(() => {}); // Return a never-resolving promise to stop further execution in the caller
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  register: (body: any) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  login: (body: any) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  getProfile: () => request("/profile"),
  saveBusinessProfile: (body: any) =>
    request("/profile/business-profile", {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  createTransaction: (body: any) =>
    request("/transactions", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  getTransactions: () => request("/transactions"),
  updateTransaction: (id: string | number, body: any) =>
    request(`/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteTransaction: (id: string | number) =>
    request(`/transactions/${id}`, {
      method: "DELETE"
    }),
  getFinanceSummary: () => request("/finance/summary"),
  getAlerts: () => request("/alerts"),
  getHealthScore: () => request("/health-score"),
  getCommunityPosts: () => request("/community/posts"),
  createCommunityPost: (body: any) =>
    request("/community/posts", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  likePost: (id: string | number) =>
    request(`/community/posts/${id}/like`, {
      method: "POST"
    }),
  deletePost: (id: string | number) =>
    request(`/community/posts/${id}`, {
      method: "DELETE"
    }),
  addComment: (id: string | number, content: string) =>
    request(`/community/posts/${id}/comments`, {
      method: "POST",
      body: JSON.stringify({ content })
    }),

  // Marketplace
  getProducts: () => request("/marketplace/products"),
  createProduct: (body: any) =>
    request("/marketplace/products", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateProduct: (id: string | number, body: any) =>
    request(`/marketplace/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteProduct: (id: string | number) =>
    request(`/marketplace/products/${id}`, {
      method: "DELETE"
    }),
  getWishlist: () => request("/marketplace/wishlist"),
  addToWishlist: (productId: string | number) =>
    request("/marketplace/wishlist", {
      method: "POST",
      body: JSON.stringify({ product_id: productId })
    }),
  removeFromWishlist: (id: string | number) =>
    request(`/marketplace/wishlist/${id}`, {
      method: "DELETE"
    }),

  // Marketing
  getSavedMarketing: () => request("/marketing/saved"),
  saveMarketing: (body: any) =>
    request("/marketing/saved", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  deleteMarketing: (id: string | number) =>
    request(`/marketing/saved/${id}`, {
      method: "DELETE"
    }),

  addHoney: (amount: number, source?: string) =>
    request("/profile/honey", {
      method: "POST",
      body: JSON.stringify({ amount, source })
    }),
  acceptAnswer: (postId: string | number, commentId: string) =>
    request(`/community/posts/${postId}/accept-answer`, {
      method: "POST",
      body: JSON.stringify({ commentId })
    }),
  changePassword: (body: any) =>
    request("/profile/change-password", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateSubscription: (plan: string) =>
    request("/profile/subscription", {
      method: "POST",
      body: JSON.stringify({ plan })
    }),
  getCourses: () => request("/learning/courses"),
  getInventory: () => request("/inventory"),
  createInventoryItem: (body: any) =>
    request("/inventory", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateInventoryItem: (id: string | number, body: any) =>
    request(`/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteInventoryItem: (id: string | number) =>
    request(`/inventory/${id}`, {
      method: "DELETE"
    }),
  getLocations: () => request("/locations"),
  createLocation: (body: any) =>
    request("/locations", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateLocation: (id: string | number, body: any) =>
    request(`/locations/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteLocation: (id: string | number) =>
    request(`/locations/${id}`, {
      method: "DELETE"
    }),
  moveInventory: (body: any) =>
    request("/inventory/move", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  getMovements: () => request("/inventory/movements"),
  getChatSessions: () => request("/chat/sessions"),
  saveChatSessions: (body: any) =>
    request("/chat/sessions", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  
  // Tasks
  getTasks: () => request("/tasks"),
  createTask: (body: any) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(body)
    }),
  updateTask: (id: string, body: any) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    }),
  deleteTask: (id: string) =>
    request(`/tasks/${id}`, {
      method: "DELETE"
    }),
  getNotifications: () => request("/notifications"),
  markNotificationsAsRead: () =>
    request("/notifications/read", {
      method: "POST"
    }),
  markSingleNotificationRead: (id: string) =>
    request(`/notifications/${id}/read`, {
      method: "POST"
    }),
};
