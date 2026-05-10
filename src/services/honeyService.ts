import { api } from '../api';

export enum HoneyReward {
  LIKE_RECEIVED = 2,
  HELPFUL_ANSWER = 15,
  COURSE_COMPLETED = 20,
  VIDEO_WATCHED = 5,
  DAILY_LOGIN = 3,
  MARKETPLACE_SALE = 50,
  FINANCE_CONSISTENCY = 10,
  COMMENT_ADDED = 20,
  PRODUCT_LISTED = 25,
}

export type RewardType = keyof typeof HoneyReward;

class HoneyService {
  private static instance: HoneyService;
  private listeners: ((payload: { amount: number; source: string }) => void)[] = [];

  private constructor() {}

  public static getInstance(): HoneyService {
    if (!HoneyService.instance) {
      HoneyService.instance = new HoneyService();
    }
    return HoneyService.instance;
  }

  public subscribe(callback: (payload: { amount: number; source: string }) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(amount: number, source: string) {
    this.listeners.forEach(l => l({ amount, source }));
    window.dispatchEvent(new CustomEvent('honey-updated'));
  }

  public notifyProfileUpdated() {
    window.dispatchEvent(new CustomEvent('profile-updated'));
  }

  public async reward(type: RewardType, customSource?: string) {
    const amount = HoneyReward[type];
    const source = customSource || this.getDefaultSource(type);
    
    try {
      await api.addHoney(amount, source);
      this.notify(amount, source);
      return true;
    } catch (err) {
      console.error('Failed to award honey:', err);
      return false;
    }
  }

  public async spend(amount: number, source: string) {
    try {
      await api.addHoney(-amount, source);
      this.notify(-amount, source);
      return true;
    } catch (err) {
      console.error('Failed to spend honey:', err);
      throw err;
    }
  }

  private getDefaultSource(type: RewardType): string {
    switch (type) {
      case 'LIKE_RECEIVED': return 'Received a like on your post';
      case 'HELPFUL_ANSWER': return 'Your answer was marked as helpful';
      case 'COURSE_COMPLETED': return 'Completed a honey-learning course';
      case 'VIDEO_WATCHED': return 'Watched an educational video';
      case 'DAILY_LOGIN': return 'Daily check-in reward';
      case 'MARKETPLACE_SALE': return 'First marketplace sale milestone';
      case 'FINANCE_CONSISTENCY': return 'Maintained consistent financial tracking';
      case 'COMMENT_ADDED': return 'Commented on a community discussion';
      case 'PRODUCT_LISTED': return 'Listed a new product in marketplace';
      default: return 'Community contribution';
    }
  }
}

export const honeyService = HoneyService.getInstance();
