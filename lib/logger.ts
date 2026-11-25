export type LogContext = Record<string, unknown>;

const log = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  context?: LogContext,
  error?: unknown
) => {
  if (!__DEV__ && (level === 'debug' || level === 'info')) return;

  const data = error !== undefined ? { ...context, error } : context;
  const args = data ? [`[${level}] ${message}`, data] : [`[${level}] ${message}`];
  if (level === 'error') console.error(...args);
  else if (level === 'warn') console.warn(...args);
  else if (level === 'info') console.info(...args);
  else console.debug(...args);
};

export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    log('error', message, context, error),
};
