import {
	type LoggerContract,
	type LoggerOptions,
	type LoggerFunction,
	DEFAULT_LOG_LEVEL,
} from '@hai-guardrails/utils/logging/types'
import type { LogLevel } from '@hai-guardrails/types'

/**
 * Abstract base class for logging implementations in the HAI Guardrails SDK.
 *
 * This class provides a standardized interface for logging functionality while allowing
 * concrete implementations (like PinoLogger) to handle the actual logging mechanism.
 * It implements the LoggerContract interface and provides default implementations for all
 * logging methods, delegating to the abstract `log` method.
 *
 * @example
 * ```typescript
 * // Example usage with a concrete implementation
 * class MyLogger extends AbstractLogger {
 *   protected log(level: LogLevel, message: string, ...args: any[]): void {
 *     // Implementation-specific logging logic
 *   }
 * }
 * ```
 */
export abstract class AbstractLogger implements LoggerContract {
	protected logLevel: LogLevel

	/**
	 * Creates a new AbstractLogger instance with the specified options.
	 *
	 * @param options - Configuration options for the logger
	 * @param options.logLevel - The initial log level (defaults to 'silent')
	 */
	constructor(options: LoggerOptions = {}) {
		this.logLevel = options.logLevel || DEFAULT_LOG_LEVEL
	}

	/**
	 * Sets the current log level for the logger.
	 *
	 * @param level - The new log level to set
	 */
	public setLevel(level: LogLevel): void {
		this.logLevel = level
	}

	/**
	 * Retrieves the current log level of the logger.
	 *
	 * @returns The current log level
	 */
	public getLevel(): LogLevel {
		return this.logLevel
	}

	public trace: LoggerFunction = (message: string, ...args: any[]): void => {
		this.log('trace', message, ...args)
	}

	public debug: LoggerFunction = (message: string, ...args: any[]): void => {
		this.log('debug', message, ...args)
	}

	public info: LoggerFunction = (message: string, ...args: any[]): void => {
		this.log('info', message, ...args)
	}

	public warn: LoggerFunction = (message: string, ...args: any[]): void => {
		this.log('warn', message, ...args)
	}

	public error: LoggerFunction = (message: string, ...args: any[]): void => {
		this.log('error', message, ...args)
	}

	public fatal: LoggerFunction = (message: string, ...args: any[]): void => {
		this.log('fatal', message, ...args)
	}

	/**
	 * Abstract method that must be implemented by concrete logger implementations.
	 *
	 * This method is responsible for the actual logging mechanism and should be
	 * implemented by subclasses to provide the specific logging behavior.
	 *
	 * @param level - The log level (trace, debug, info, warn, error, fatal)
	 * @param message - The log message to be recorded
	 * @param args - Additional arguments to be included in the log
	 */
	protected abstract log(level: LogLevel, message: string, ...args: any[]): void
}
