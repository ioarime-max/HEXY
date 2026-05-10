/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessProfile, Transaction, ChatSession, CommunityPost, Course, RiskAlert, InventoryItem, WarehouseLocation } from "../types";

const STORAGE_KEYS = {
  PROFILE: "honeybee_profile",
  TRANSACTIONS: "honeybee_transactions",
  CHATS: "honeybee_chats",
  POSTS: "honeybee_posts",
  ALERTS: "honeybee_alerts",
  INVENTORY: "honeybee_inventory",
  LOCATIONS: "honeybee_locations",
};

// Reusable helpers for safer localStorage operations
const safeParse = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (data === null) return defaultValue;
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Error parsing localStorage key "${key}":`, error);
    return defaultValue;
  }
};

const safeSet = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error);
  }
};

export const storageService = {
  // Clearing helper
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },

  getProfile: (): BusinessProfile | null => {
    return safeParse<BusinessProfile | null>(STORAGE_KEYS.PROFILE, null);
  },
  saveProfile: (profile: BusinessProfile) => {
    safeSet(STORAGE_KEYS.PROFILE, profile);
  },
  
  getTransactions: (): Transaction[] => {
    return safeParse<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
  },
  saveTransaction: (transaction: Transaction) => {
    const transactions = storageService.getTransactions();
    transactions.push(transaction);
    safeSet(STORAGE_KEYS.TRANSACTIONS, transactions);
  },
  saveTransactions: (transactions: Transaction[]) => {
    safeSet(STORAGE_KEYS.TRANSACTIONS, transactions);
  },
  deleteTransaction: (id: string) => {
    const transactions = storageService.getTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    safeSet(STORAGE_KEYS.TRANSACTIONS, filtered);
  },
  
  getChats: (): ChatSession[] => {
    return safeParse<ChatSession[]>(STORAGE_KEYS.CHATS, []);
  },
  saveChat: (chat: ChatSession) => {
    const chats = storageService.getChats();
    const index = chats.findIndex(c => c.id === chat.id);
    if (index >= 0) {
      chats[index] = chat;
    } else {
      chats.push(chat);
    }
    safeSet(STORAGE_KEYS.CHATS, chats);
  },
  
  getPosts: (): CommunityPost[] => {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (data !== null) return safeParse<CommunityPost[]>(STORAGE_KEYS.POSTS, []);

    // Initial default posts if nothing in storage
    const defaults: CommunityPost[] = [
      {
        id: "1",
        authorId: "honeybee-team",
        authorName: "HoneyBee Support",
        category: "General",
        title: "Welcome to our SME Community!",
        content: "Join the conversation and grow your business with peers. We're here to support your journey.",
        likes: 12,
        comments: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        authorId: "expert-1",
        authorName: "Market Specialist",
        category: "Advice Needed",
        title: "Optimizing your supply chain",
        content: "Diversifying suppliers can reduce risk. Has anyone explored local sourcing recently?",
        likes: 8,
        comments: [],
        createdAt: new Date().toISOString(),
      }
    ];
    safeSet(STORAGE_KEYS.POSTS, defaults);
    return defaults;
  },
  
  getAlerts: (): RiskAlert[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    if (data !== null) return safeParse<RiskAlert[]>(STORAGE_KEYS.ALERTS, []);

    const defaults: RiskAlert[] = [
      {
        id: "1",
        type: "financial",
        title: "High Expenses",
        description: "Your marketing spend is 30% higher than last month.",
        severity: "medium",
        createdAt: new Date().toISOString(),
      }
    ];
    safeSet(STORAGE_KEYS.ALERTS, defaults);
    return defaults;
  },

  // Inventory
  getInventory: (): InventoryItem[] => {
    return safeParse<InventoryItem[]>(STORAGE_KEYS.INVENTORY, []);
  },
  saveInventoryItem: (item: InventoryItem) => {
    const items = storageService.getInventory();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = { ...item, updated_at: new Date().toISOString() };
    } else {
      items.push({ ...item, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    }
    safeSet(STORAGE_KEYS.INVENTORY, items);
  },
  deleteInventoryItem: (id: string) => {
    const items = storageService.getInventory();
    const filtered = items.filter(i => i.id !== id);
    safeSet(STORAGE_KEYS.INVENTORY, filtered);
  },

  // Locations
  getLocations: (): WarehouseLocation[] => {
    return safeParse<WarehouseLocation[]>(STORAGE_KEYS.LOCATIONS, []);
  },
  saveLocation: (location: WarehouseLocation) => {
    const locations = storageService.getLocations();
    const index = locations.findIndex(l => l.id === location.id);
    if (index >= 0) {
      locations[index] = location;
    } else {
      locations.push(location);
    }
    safeSet(STORAGE_KEYS.LOCATIONS, locations);
  },
  deleteLocation: (id: string) => {
    const locations = storageService.getLocations();
    const filtered = locations.filter(l => l.id !== id);
    safeSet(STORAGE_KEYS.LOCATIONS, filtered);
  },

  rewardHoney: (amount: number, source: string) => {
    const profile = storageService.getProfile();
    if (!profile) return;

    const newHoney = (profile.honey || 0) + amount;
    const newTotalEarned = (profile.totalHoneyEarned || 0) + amount;
    const tx: any = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'earned',
      source,
      amount,
      createdAt: new Date().toISOString()
    };

    const updatedProfile: BusinessProfile = {
      ...profile,
      honey: newHoney,
      totalHoneyEarned: newTotalEarned,
      honeyHistory: [tx, ...(profile.honeyHistory || [])]
    };

    storageService.saveProfile(updatedProfile);
    window.dispatchEvent(new CustomEvent('honey-updated', { detail: { amount, source } }));
    window.dispatchEvent(new CustomEvent('profile-updated'));
  },
  
  getCourses: (): Course[] => {
    // Courses are usually static resources in this context
    return [
      {
        id: "c1",
        title: "Find Your First 100 Customers",
        description: "Learn low-cost marketing strategies for SMEs.",
        category: "Marketing",
        level: "beginner",
        duration: "45 mins",
        thumbnail: "https://picsum.photos/seed/marketing/400/200",
        lessons: [
          { id: "l1", title: "Define Your Audience", type: "text", content: "Identify who needs your product most.", duration: "10 mins" },
          { id: "l2", title: "Low-Cost Channels", type: "text", content: "Social media, local groups, and referrals.", duration: "15 mins" }
        ]
      },
      {
        id: "c2",
        title: "Pricing for Profit",
        description: "How to price your products correctly.",
        category: "Finance",
        level: "intermediate",
        duration: "30 mins",
        thumbnail: "https://picsum.photos/seed/finance/400/200",
        lessons: [
          { id: "l3", title: "Cost-Plus Pricing", type: "text", content: "Calculating your base costs.", duration: "15 mins" }
        ]
      }
    ];
  }
};
