// 缓存管理器
class CacheManager {
  private cache: Map<string, any>;
  private maxSize: number;
  private ttl: number; // 缓存有效期（毫秒）

  constructor(maxSize: number = 100, ttl: number = 3600000) { // 默认100个缓存项，1小时有效期
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  // 设置缓存
  set(key: string, value: any): void {
    // 检查缓存大小
    if (this.cache.size >= this.maxSize) {
      // 移除最早的缓存项
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // 存储缓存项和过期时间
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl
    });
  }

  // 获取缓存
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // 删除缓存
  delete(key: string): void {
    this.cache.delete(key);
  }

  // 清空缓存
  clear(): void {
    this.cache.clear();
  }

  // 获取缓存大小
  size(): number {
    return this.cache.size;
  }
}

// 导出单例
export const cacheManager = new CacheManager();
