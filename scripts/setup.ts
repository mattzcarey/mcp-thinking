import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import type { BunFile } from 'bun';

/**
 * This script is used to setup the config file for the desktop app.
 * Modified to support cross-platform paths
 */

type Platform = 'win32' | 'darwin' | 'linux';
type ConfigPaths = Record<Platform, string>;
interface Config {
  mcpServers: {
    [key: string]: {
      command: string;
      args: string[];
      env: {
        DEEPSEEK_API_KEY?: string;
      };
    };
  };
}

const CONFIG_PATHS: ConfigPaths = {
  win32: '%APPDATA%/Claude/claude_desktop_config.json',
  darwin: '~/Library/Application Support/Claude/claude_desktop_config.json',
  linux: '~/.config/Claude/claude_desktop_config.json'
};

// Get the default path for current platform, fallback to linux path
const platform = process.platform as Platform;
const defaultPath = CONFIG_PATHS[platform] || CONFIG_PATHS.linux;

// Replace environment variables and home directory
const CONFIG_PATH = defaultPath
  .replace(/%([^%]+)%/g, (_, n) => process.env[n] || '')
  .replace(/^~/, homedir())
  .replace(/\//g, platform === 'win32' ? '\\' : '/');

let config: Config = { mcpServers: {} };

try {
  const configFile: BunFile = Bun.file(CONFIG_PATH);
  config = await configFile.json() as Config;
} catch (error: unknown) {
  // Config doesn't exist yet, use default empty config
  console.log(`No existing config found at ${CONFIG_PATH}, will create new one.`);
}

// Get absolute paths
const bunPath = process.argv[0]; // Current bun executable
const serverPath = join(import.meta.dir, '../src/index.ts');

// input your api key
const apiKey = prompt('Enter your Deepseek API key: ');
if (!apiKey) {
  console.error('API key is required');
  process.exit(1);
}

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

// Ensure directory exists
const configDir = CONFIG_PATH.substring(0, CONFIG_PATH.lastIndexOf(platform === 'win32' ? '\\' : '/'));
try {
  await mkdir(configDir, { recursive: true });
} catch (error: unknown) {
  const err = error as { code?: string; message: string };
  if (err.code !== 'EEXIST') {
    console.error(`Failed to create config directory: ${err.message}`);
    process.exit(1);
  }
}

// Write config
try {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
  console.log(
    '\x1b[32m✨ Successfully added thinking server to Claude MCP config! 🎉\x1b[0m'
  );
  console.log(CONFIG_PATH.replace(homedir(), '~'));
} catch (error: unknown) {
  const err = error as { message: string };
  console.error(`Failed to write config: ${err.message}`);
  process.exit(1);
}