import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import logger from './logger';
import { THINKING_TOOL } from './tools';

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

const TAG_START = '<thinking>';
const TAG_END = '</thinking>';

const getAPIKey = () => {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY is not set');
  }
  return apiKey;
};

export const callDeepseek = async (messages: Message[]): Promise<string> => {
  const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: getAPIKey(),
  });

  const stream = await openai.chat.completions.create({
    messages,
    model: 'deepseek-reasoner',
    stream: true,
  });

  let fullResponse = '';
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (!content) continue;

    if (fullResponse.includes(TAG_END)) break;
    fullResponse += content;
  }

  const start = fullResponse.indexOf(TAG_START) + TAG_START.length;
  const end = fullResponse.indexOf(TAG_END);
  return fullResponse.slice(start, end).trim();
};

const server = new Server(
  {
    name: 'thinking',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [THINKING_TOOL],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === 'thinking') {
    const { messages } = args as { messages: { role: string; content: string }[] };
    logger.debug('Thinking Tool', { messages });

    try {
      const text = await callDeepseek(messages as Message[]);
      logger.info('Thinking Tool Response', { text });

      return { content: [{ type: 'text', text }] };
    } catch (error) {
      logger.error('Thinking Tool Error', { error });
      return {
        content: [
          {
            type: 'text',
            text: 'Failed to invoke thinking tool, please try again later.',
          },
        ],
      };
    }
  }

  return { content: [{ type: 'text', text: 'Tool not found' }] };
});

async function startServer() {
  const transport = new StdioServerTransport();

  try {
    await server.connect(transport);
  } catch (err) {
    process.exit(1);
  }
}

startServer().catch(console.error);
