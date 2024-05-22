import { Injectable, Scope, Logger } from '@nestjs/common';

// Define log levels based on the given specifications
enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

// Map log levels to their corresponding string representations
const logLevelString = {
  [LogLevel.VERBOSE]: 'VERBOSE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
};

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger extends Logger {
  private readonly logLevel: LogLevel;

  constructor(protected context?: string) {
    super(context);
    this.logLevel = this.getLogLevel();
  }

  // Override the log method to incorporate log levels
  log(message: any, contextData?: any) {
    const logLevel = contextData ? contextData.logLevel : LogLevel.INFO;
    if (logLevel >= this.logLevel) {
      const messageContext = contextData ? JSON.stringify(contextData) : '';
      const logMessage = `${logLevelString[logLevel]} [${this.context}] ${message} ${messageContext}`;
      super.log(logMessage);
    }
  }

  // Override other logger methods (error, warn, verbose, etc.) as needed

  private getLogLevel(): LogLevel {
    // Determine the log level based on the environment (e.g., production, development)
    // Return the appropriate LogLevel value
    // Example:
    return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.VERBOSE;
  }
}