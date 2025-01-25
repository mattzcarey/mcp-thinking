import { homedir } from 'node:os';
import { join } from 'node:path';

/**
 * This script is used to setup the config file for the desktop app.
 */

const CONFIG_PATH = join(
  homedir(),
  'Library/Application Support/Claude/claude_desktop_config.json'
);

let config = { mcpServers: {} };

try {
  config = await Bun.file(CONFIG_PATH).json();
} catch {
  // Config doesn't exist yet, use default empty config
}

// Get absolute paths
const bunPath = process.argv[0]; // Current bun executable
const serverPath = join(import.meta.dir, '../src/index.ts');

// input your api key
const apiKey = prompt('Enter your Deepseek API key: ');

config.mcpServers = {
  ...config.mcpServers,
  thinking: {
    command: bunPath,
    args: [serverPath],
    env: {
      DEEPSEEK_API_KEY: apiKey,
    },
  },
};

await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));

console.log(
  '\x1b[32m✨ Successfully added thinking server to Claude MCP config! 🎉\x1b[0m'
);
console.log(CONFIG_PATH.replace(homedir(), '~'));
