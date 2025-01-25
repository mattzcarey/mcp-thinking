import { describe, expect, test } from 'bun:test';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { type Message, callDeepseek } from '../index';

config();

describe('DeepSeek API Integration', () => {
  test('should successfully call DeepSeek API', async () => {
    const messages = [
      { role: 'system' as const, content: 'You are a helpful assistant.' },
      { role: 'user' as const, content: 'Say "test" and nothing else.' },
    ];

    const testDeepseekApi = async (messages: Message[]): Promise<string> => {
      const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        messages,
        model: 'deepseek-reasoner',
      });

      if (!completion.choices[0].message.content) {
        throw new Error('No text returned from DeepSeek API');
      }

      return completion.choices[0].message.content;
    };

    const response = await testDeepseekApi(messages);

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response.toLowerCase()).toContain('test');
  });

  test('should handle API errors appropriately', async () => {
    const messages = [{ role: 'invalid_role' as any, content: 'This should fail' }];

    try {
      await callDeepseek(messages);
      throw new Error('Should not reach here');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
}); 
