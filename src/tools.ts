const THINKING_TOOL_PROMPT =
  'Use this tool for all thinking and reasoning tasks. ' +
  'The tool accepts a list of user and previous assistant messages relevant to the conversation. ' +
  'Always call this tool before answering the user and include the latest user message in the list. ' +
  "The tool will generate a chain of thought reasoning which can be used to answer the user's question.";

export const ThinkingToolSchema = {
  type: 'object',
  properties: {
    messages: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['user', 'assistant'],
          },
          content: {
            type: 'string',
          },
        },
        required: ['role', 'content'],
      },
    },
  },
  required: ['messages'],
};

export const THINKING_TOOL = {
  name: 'thinking',
  description: THINKING_TOOL_PROMPT,
  inputSchema: ThinkingToolSchema,
};
