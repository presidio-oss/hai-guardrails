/**
 * @fileoverview Pino-based logger implementation for Hai Guardrails SDK
 *
 * This module provides a Pino-based logger implementation that extends the
 * abstract logger functionality, offering structured logging with transport
 * options for pretty printing and customization.
 */

import pino from 'pino'
import type { Logger } from 'pino'
import { AbstractLogger } from '@hai-guardrails/utils/logging/abstract-logger'
import type { LogLevel } from '@hai-guardrails/types'
import {
	type LoggerOptions,
	type LoggerContract,
	DEFAULT_LOG_LEVEL,
} from '@hai-guardrails/utils/logging/types'

/**
 * Default transport options for the Pino logger
 *
 * These options configure the pino-pretty transport for better console output.
 * @type {Object}
 * @property {string} target - The transport target (pino-pretty)
 * @property {Object} options - Transport configuration options
 * @property {boolean} options.colorize - Enable colorized output
 * @property {string} options.translateTime - Time format specification
 * @property {string} options.ignore - Fields to ignore in output
 * @property {boolean} options.levelFirst - Show log level first
 * @property {boolean} options.hideObjects - Hide object details
 * @property {boolean} options.singleLine - Force single-line output
 */
const DEFAULT_TRANSPORT_OPTIONS = {
	target: 'pino-pretty',
	options: {
		colorize: true,
		translateTime: 'SYS:standard',
		ignore: 'pid,hostname',
		levelFirst: true,
		hideObjects: false,
		singleLine: false,
	},
}

/**
 * Options for the Pino logger
 *
 * Extends the base LoggerOptions with transport configuration.
 * @interface PinoLoggerOptions
 * @extends LoggerOptions
 * @property {Object} transport - Transport configuration
 * @property {string} transport.target - Transport target
 * @property {Object} transport.options - Transport configuration options
 * @property {boolean} transport.options.colorize - Enable colorized output
 * @property {string} transport.options.translateTime - Time format specification
 * @property {string} transport.options.ignore - Fields to ignore in output
 * @property {boolean} transport.options.levelFirst - Show log level first
 * @property {boolean} transport.options.hideObjects - Hide object details
 * @property {boolean} transport.options.singleLine - Force single-line output
 */
interface PinoLoggerOptions extends LoggerOptions {
	transport?: {
		target: string
		options: {
			colorize?: boolean
			translateTime?: string
			ignore?: string
			levelFirst?: boolean
			hideObjects?: boolean
			singleLine?: boolean
		}
	}
}

/**
 * Pino-based logger implementation
 *
 * This class extends the abstract logger to provide structured logging
 * capabilities using the Pino logging library. It supports both simple
 * and object-based logging with configurable transport options.
 *
 * @extends AbstractLogger
 * @implements LoggerContract
 */
export class PinoLogger extends AbstractLogger {
	/**
	 * The underlying Pino logger instance
	 * @type {Logger}
	 */
	private logger: Logger

	/**
	 * Creates a new Pino logger instance
	 *
	 * @param {PinoLoggerOptions} options - Configuration options for the logger
	 * @param {LogLevel} options.logLevel - The initial log level
	 * @param {Object} options.transport - Transport configuration
	 */
	constructor(options: PinoLoggerOptions) {
		super(options)
		this.logger = pino({
			level: options.logLevel,
			transport: options.transport,
		})
	}

	/**
	 * Get the underlying Pino logger instance
	 *
	 * @returns {Logger} The Pino logger instance
	 */
	public getLogger(): Logger {
		return this.logger
	}

	/**
	 * Set the log level for both this logger and the underlying Pino logger
	 *
	 * @param {LogLevel} level - The new log level to set
	 */
	public setLevel(level: LogLevel): void {
		super.setLevel(level)
		this.logger.level = level
	}

	/**
	 * Log a message at the specified level
	 *
	 * Supports both simple string messages and object-based logging. When
	 * an object is provided as the first argument, it will be logged as
	 * structured data alongside the message.
	 *
	 * @param {LogLevel} level - The log level
	 * @param {string} message - The log message
	 * @param {...any[]} args - Additional arguments to log
	 */
	protected log(level: LogLevel, message: string, ...args: any[]): void {
		if (typeof args[0] === 'object') {
			this.logger[level](args[0], message, ...args.slice(1))
		} else {
			this.logger[level](message, ...args)
		}
	}
}

/**
 * Create a new Pino logger instance with default settings
 *
 * This factory function creates a new Pino logger with configurable options.
 * If no options are provided, it will use the default log level and transport
 * settings that provide pretty-printed, colorized output.
 *
 * @param {PinoLoggerOptions} [options] - Configuration options for the logger
 * @param {LogLevel} [options.logLevel=DEFAULT_LOG_LEVEL] - Initial log level
 * @param {Object} [options.transport=DEFAULT_TRANSPORT_OPTIONS] - Transport configuration
 * @returns {LoggerContract} A new Pino logger instance
 *
 * @example
 * // Create a logger with default settings
 * const logger = createPinoLogger()
 *
 * // Create a logger with custom settings
 * const customLogger = createPinoLogger({
 *   logLevel: 'debug',
 *   transport: {
 *     target: 'pino-pretty',
 *     options: {
 *       colorize: true,
 *       translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l o',
 *       ignore: 'pid,hostname',
 *       levelFirst: true
 *     }
 *   }
 * })
 */
export const createPinoLogger = (
	options: PinoLoggerOptions = {
		logLevel: DEFAULT_LOG_LEVEL,
		transport: DEFAULT_TRANSPORT_OPTIONS,
	}
): LoggerContract => {
	return new PinoLogger(options)
}
