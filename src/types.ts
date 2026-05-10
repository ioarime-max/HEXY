/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'owner' | 'mentor' | 'admin';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string; // pcs, kg, sheets
  quantity: number;
  min_stock: number;
  location_id: string;
  location_name?: string; // Derived
  supplier?: string;
  cost: number;
  status: 'available' | 'low stock' | 'out of stock';
  notes?: string;
  batch_lot?: string;
  created_at: string;
  updated_at: string;
}

export interface WarehouseLocation {
  id: string;
  name: string; // e.g., Warehouse A, Shelf 1
  description?: string;
  status: 'active' | 'inactive';
}

export interface StockMovement {
  id: string;
  inventory_id: string;
  item_name?: string; // Derived
  type: 'inbound' | 'outbound' | 'internal' | 'adjustment';
  quantity: number;
  from_location_id?: string;
  to_location_id?: string;
  reference_no?: string; // Order ID or Supplier ID
  user_id: string;
  user_name?: string; // Derived
  notes?: string;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  business_name?: string; // From backend
  avatar_url?: string; // From backend
  industry: string;
  type: string;
  revenueRange: string;
  revenue_range?: string; // From backend
  goals: string[];
  honey?: number;
  totalHoneyEarned?: number;
  totalHoneySpent?: number;
  honeyHistory?: HoneyTransaction[];
  marketplace_notif?: boolean;
  community_notif?: boolean;
  subscriptionPlan?: 'Worker Bee' | 'Drone Bee' | 'Queen Bee';
  subscription_plan?: 'Worker Bee' | 'Drone Bee' | 'Queen Bee';
  subscriptionRenewDate?: string;
  subscription_renew_date?: string;
  createdAt: string;
  created_at?: string; // From backend
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  notes?: string; // From backend
  date: string;
  txn_date?: string; // From backend
  createdAt: string;
  created_at?: string; // From backend
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert' | 'reply' | 'mentor' | 'task';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt?: string; // Used in UI
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  thumbnail?: string;
  thumbnail_url?: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  type?: 'video' | 'text' | 'slides';
  content: string;
  video_url?: string;
  duration?: string;
  order?: number;
}

export interface CommunityPost {
  id: string;
  authorId?: string; // Generic
  user_id?: string | number; // From backend
  userId?: string | number; // Used in UI
  author_name?: string; // From backend
  authorName?: string;
  author_avatar?: string | null; // From backend
  authorAvatar?: string | null;
  category: string;
  title: string;
  content: string;
  likes: number;
  likedBy?: (string | number)[];
  acceptedCommentId?: string;
  comments: any[]; // Changed from number to array
  image_url?: string;
  createdAt: string;
  created_at?: string; // From backend
}

export interface RiskAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  createdAt?: string;
  created_at?: string; // From backend
}

export interface HealthScore {
  score: number;
  factors: {
    revenue: number;
    expenses: number;
    retention: number;
    learning: number;
    [key: string]: any;
  };
  lastUpdated: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  seller_avatar?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
  image: string;
  image_url?: string;
  location: string;
}

export interface LoanCriterion {
  id: string;
  label: string;
  description: string;
  isMet: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface HoneyTransaction {
  id: string;
  type: 'earned' | 'spent';
  source: string;
  amount: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'completed';
  source: 'ai' | 'manual';
  createdAt?: string;
  updatedAt?: string;
}
