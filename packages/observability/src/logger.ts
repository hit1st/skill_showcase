export type LogLevel = "debug" | "info" | "warn" | "error";

export type CorrelationFields = {
  readonly trace_id?: string;
  readonly span_id?: string;
  readonly request_id?: string;
};

export type LogRecord = CorrelationFields & {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly service: string;
};

export type Logger = {
  readonly debug: (message: string, fields?: CorrelationFields) => void;
  readonly info: (message: string, fields?: CorrelationFields) => void;
  readonly warn: (message: string, fields?: CorrelationFields) => void;
  readonly error: (message: string, fields?: CorrelationFields) => void;
};

export type LoggerOptions = {
  readonly service: string;
  readonly write?: (line: string) => void;
};

const defaultWrite = (line: string): void => {
  process.stdout.write(`${line}\n`);
};

const serializeRecord = (
  level: LogLevel,
  message: string,
  service: string,
  fields: CorrelationFields = {},
): LogRecord => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  service,
  ...fields,
});

export const createLogger = (options: LoggerOptions): Logger => {
  const write = options.write ?? defaultWrite;

  const log = (level: LogLevel, message: string, fields?: CorrelationFields): void => {
    write(JSON.stringify(serializeRecord(level, message, options.service, fields)));
  };

  return {
    debug: (message, fields) => log("debug", message, fields),
    info: (message, fields) => log("info", message, fields),
    warn: (message, fields) => log("warn", message, fields),
    error: (message, fields) => log("error", message, fields),
  };
};
