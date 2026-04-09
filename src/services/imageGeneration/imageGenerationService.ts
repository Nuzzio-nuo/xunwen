import { API_CONFIG } from '../../config/api';

export interface ImageGenerationRequest {
  prompt: string;
  size?: '1024*1024' | '720*1280' | '1280*720';
  n?: number;
}

export interface ImageGenerationResponse {
  output: {
    task_id: string;
    task_status: string;
    results?: Array<{
      url: string;
    }>;
  };
  request_id: string;
}

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'wanx-v1',
        input: {
          prompt: prompt
        },
        parameters: {
          size: '1024*1024',
          n: 1
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `图片生成请求失败: ${response.status}`);
    }

    const data: ImageGenerationResponse = await response.json();
    
    if (data.output.task_status === 'PENDING' || data.output.task_status === 'RUNNING') {
      return await pollTaskResult(data.output.task_id);
    } else if (data.output.results && data.output.results.length > 0) {
      return data.output.results[0].url;
    } else {
      throw new Error('图片生成失败');
    }
  } catch (error) {
    console.error('图片生成错误:', error);
    throw error;
  }
};

const pollTaskResult = async (taskId: string, maxAttempts = 30): Promise<string> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`查询任务状态失败: ${response.status}`);
      }

      const data: ImageGenerationResponse = await response.json();
      
      if (data.output.task_status === 'SUCCEEDED' && data.output.results) {
        return data.output.results[0].url;
      } else if (data.output.task_status === 'FAILED') {
        throw new Error('图片生成任务失败');
      }
    } catch (error) {
      console.error(`轮询任务状态错误 (尝试 ${i + 1}/${maxAttempts}):`, error);
      if (i === maxAttempts - 1) throw error;
    }
  }
  
  throw new Error('图片生成超时');
};

export const generatePatternImage = async (prompt: string): Promise<string | null> => {
  try {
    // 保留完整 prompt，避免载体等关键信息被截断
    const optimizedPrompt = `中国传统非遗纹样，${prompt}，精美细腻，传统工艺风格，高质量，细节丰富`;
    return await generateImage(optimizedPrompt);
  } catch (error) {
    console.error('生成纹样图片失败:', error);
    return null;
  }
};
