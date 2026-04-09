import { API_CONFIG } from '../../config/api';
import { ChatMessage } from './index';

export const callTextAI = async (messages: ChatMessage[], signal?: AbortSignal): Promise<string> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.API_KEY}`
      },
      signal,
      body: JSON.stringify({
        model: API_CONFIG.MODEL,
        messages: messages,
        temperature: 0.5,
        max_tokens: 600
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `AI 调用失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('文本AI调用错误:', error);
    throw error;
  }
};
