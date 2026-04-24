type Level = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: Level;
  message: string;
  meta?: Record<string, unknown>;
}

function log(level: Level, message: string, meta?: Record<string, unknown>) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta && { meta }),
  };

  const formatted = JSON.stringify(entry);

  switch (level) {
    case 'error': console.error(formatted); break;
    case 'warn':  console.warn(formatted);  break;
    case 'debug':
      if (process.env.NODE_ENV === 'development') console.debug(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => log('debug', msg, meta),
};
