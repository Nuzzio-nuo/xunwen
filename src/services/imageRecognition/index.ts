import { clipImageRecognition } from './clipService';
import { cacheManager } from '../utils/cacheManager';

export interface RecognitionResult {
  label: string;
  confidence: number;
  matches?: Array<{ label: string; score: number }>;
  details?: {
    era?: string;
    technique?: string;
    description?: string;
  };
}

export const imageRecognition = {
  async recognizeImage(imageUri: string): Promise<RecognitionResult> {
    // 生成缓存键
    const cacheKey = this.generateCacheKey(imageUri);
    
    // 检查缓存
    const cachedResult = cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
    
    // 调用CLIP模型进行识别
    const result = await clipImageRecognition(imageUri);
    
    // 缓存结果
    cacheManager.set(cacheKey, result);
    
    return result;
  },
  
  generateCacheKey(imageUri: string): string {
    // 简单的缓存键生成，实际项目中可能需要对图像进行哈希处理
    return `image_recognition_${imageUri}`;
  },
  
  async batchRecognize(images: string[]): Promise<RecognitionResult[]> {
    // 实现批处理逻辑
    const results: RecognitionResult[] = [];
    
    for (const image of images) {
      const result = await this.recognizeImage(image);
      results.push(result);
    }
    
    return results;
  }
};
