/**
 * Sistema de logging centralizado
 * Ayuda a trackear errores sin exponer información sensible al cliente
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  context: string;
  message: string;
  timestamp: string;
  error?: {
    message: string;
    stack?: string;
    name?: string;
  };
  metadata?: Record<string, unknown>;
}

export function log(
  level: LogLevel,
  context: string,
  message: string,
  error?: unknown,
  metadata?: Record<string, unknown>
): void {
  const entry: LogEntry = {
    level,
    context,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    if (error instanceof Error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    } else {
      entry.error = {
        message: String(error),
      };
    }
  }

  if (metadata) {
    entry.metadata = metadata;
  }

  // En producción, esto debería enviar a un servicio como Sentry, LogRocket, etc.
  // Por ahora, usamos console con formato estructurado
  const logFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  logFn(JSON.stringify(entry, null, process.env.NODE_ENV === 'development' ? 2 : 0));
}

export const logger = {
  info: (context: string, message: string, metadata?: Record<string, unknown>) =>
    log('info', context, message, undefined, metadata),

  warn: (context: string, message: string, metadata?: Record<string, unknown>) =>
    log('warn', context, message, undefined, metadata),

  error: (context: string, message: string, error?: unknown, metadata?: Record<string, unknown>) =>
    log('error', context, message, error, metadata),

  debug: (context: string, message: string, metadata?: Record<string, unknown>) =>
    log('debug', context, message, undefined, metadata),
};

export function logError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
  logger.error(context, 'Error occurred', error, metadata);
}
