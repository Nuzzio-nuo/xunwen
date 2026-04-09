import { callTextAI } from './textAIService';
import { cacheManager } from '../utils/cacheManager';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const textAI = {
  async generateResponse(messages: ChatMessage[], options?: { signal?: AbortSignal }): Promise<string> {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(messages);
    
    // 检查缓存
    const cachedResponse = cacheManager.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 调用AI服务
    const response = await callTextAI(messages, options?.signal);
    
    // 缓存结果
    cacheManager.set(cacheKey, response);
    
    return response;
  },
  
  generateCacheKey(messages: ChatMessage[]): string {
    return `text_ai_${messages.map(m => m.content).join('_')}`;
  },
  
  async batchGenerate(queries: string[]): Promise<string[]> {
    // 实现批处理逻辑
    const results: string[] = [];
    
    for (const query of queries) {
      const message: ChatMessage = { role: 'user', content: query };
      const result = await this.generateResponse([message]);
      results.push(result);
    }
    
    return results;
  }
};
