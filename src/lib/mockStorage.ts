/**
 * Mock Local Storage System
 * Provides persistent storage using localStorage with automatic updates
 */

// Generic storage interface
export interface StorageItem {
  id: string;
  created_at: string;
  updated_at: string;
}

class MockStorage<T extends StorageItem> {
  private storageKey: string;

  constructor(key: string) {
    this.storageKey = `cms_${key}`;
  }

  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error loading ${this.storageKey}:`, error);
      return [];
    }
  }

  getOne(id: string): T | null {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): T {
    const items = this.getAll();
    const newItem = {
      ...item,
      id: `${this.storageKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as T;

    items.push(newItem);
    this.save(items);
    return newItem;
  }

  update(id: string, updates: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>): T | null {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    this.save(items);
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length === items.length) return false;

    this.save(filtered);
    return true;
  }

  private save(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
      // Trigger storage event for cross-tab communication
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error(`Error saving ${this.storageKey}:`, error);
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  seed(items: T[]): void {
    if (this.getAll().length === 0) {
      this.save(items);
    }
  }
}

// Export storage instances
export const mockStorage = {
  categories: new MockStorage('categories'),
  items: new MockStorage('items'),
  learningPaths: new MockStorage('learning_paths'),
  workshops: new MockStorage('workshops'),
};
