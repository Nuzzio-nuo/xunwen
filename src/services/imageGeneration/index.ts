import { generatePatternImage } from './imageGenerationService';
import { cacheManager } from '../utils/cacheManager';

export const imageGeneration = {
  async generatePattern(prompt: string): Promise<string | null> {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(prompt);
    
    // 检查缓存
    const cachedResult = cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // 调用图像生成服务
    const result = await generatePatternImage(prompt);
    
    // 缓存结果
    if (result) {
      cacheManager.set(cacheKey, result);
    }
    
    return result;
  },
  
  generateCacheKey(prompt: string): string {
    // 使用完整 prompt 生成稳定哈希，避免不同载体命中同一缓存
    let hash = 0;
    for (let i = 0; i < prompt.length; i += 1) {
      hash = (hash << 5) - hash + prompt.charCodeAt(i);
      hash |= 0;
    }
    return `image_generation_${Math.abs(hash)}_${prompt.length}`;
  },
  
  async batchGenerate(prompts: string[]): Promise<(string | null)[]> {
    // 实现批处理逻辑
    const results: (string | null)[] = [];
    
    for (const prompt of prompts) {
      const result = await this.generatePattern(prompt);
      results.push(result);
    }
    
    return results;
  },
  
  // 优化提示词工程
  optimizePrompt(originalPrompt: string): string {
    return `中国传统非遗纹样，${originalPrompt}，精美细腻，传统工艺风格，高质量，细节丰富，色彩鲜艳，构图完整`;
  }
};
