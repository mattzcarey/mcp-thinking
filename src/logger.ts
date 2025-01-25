import { appendFileSync } from 'node:fs';
import { join } from 'node:path/posix';

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

const formatMessage = (
  level: LogLevel,
  message: unknown,
  meta?: Record<string, unknown>
) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level.padEnd(5)}] ${JSON.stringify(message)}${metaStr}\n`;
};

const log = (level: LogLevel, message: unknown, meta?: Record<string, unknown>) => {
  appendFileSync(
    join(import.meta.dir, '../server.log'),
    formatMessage(level, message, meta)
  );
};

export const debug = (message: unknown, meta?: Record<string, unknown>) =>
  log('DEBUG', message, meta);
export const info = (message: unknown, meta?: Record<string, unknown>) =>
  log('INFO', message, meta);
export const warn = (message: unknown, meta?: Record<string, unknown>) =>
  log('WARN', message, meta);
export const error = (message: unknown, meta?: Record<string, unknown>) =>
  log('ERROR', message, meta);
export const fatal = (message: unknown, meta?: Record<string, unknown>) =>
  log('FATAL', message, meta);

export default { debug, info, warn, error, fatal };
