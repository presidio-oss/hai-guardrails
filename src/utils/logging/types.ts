/**
 * @fileoverview Core logging types and interfaces for Hai Guardrails SDK
 *
 * This module defines the core types and interfaces for the logging system,
 * providing a standardized way to handle logging across the SDK.
 */

import type { LogLevel } from '@hai-guardrails/types'

/**
 * Options for configuring a logger instance
 *
 * @interface LoggerOptions
 * @property {LogLevel} [logLevel] - The minimum log level to output
 *                                   Defaults to the global DEFAULT_LOG_LEVEL
 */
export interface LoggerOptions {
	logLevel?: LogLevel
}

/**
 * Type definition for a logging function
 *
 * @interface LoggerFunction
 * @param {string} msg - The log message to output
 * @param {object} [obj] - Optional object to include in the log entry
 * @param {...any[]} args - Additional arguments to include in the log
 */
export interface LoggerFunction {
	(msg: string, obj?: object, ...args: any[]): void
}

/**
 * Default log level for all loggers in the SDK
 *
 * This constant defines the default log level that will be used when no
 * specific level is configured. The default is 'silent' to minimize noise
 * in production environments.
 */
export const DEFAULT_LOG_LEVEL: LogLevel = 'silent'

/**
 * Contract interface for all logger implementations
 *
 * This interface defines the standard API that all logger implementations
 * must adhere to. It provides methods for controlling log levels and
 * various logging methods at different severity levels.
 *
 * @interface LoggerContract
 * @property {LoggerFunction} trace - Logs extremely detailed information
 * @property {LoggerFunction} debug - Logs debugging information
 * @property {LoggerFunction} info - Logs informational messages
 * @property {LoggerFunction} warn - Logs warning messages
 * @property {LoggerFunction} error - Logs error messages
 * @property {LoggerFunction} fatal - Logs fatal error messages
 */
export interface LoggerContract {
	/**
	 * Set the current log level
	 *
	 * @param {LogLevel} level - The new log level to set
	 */
	setLevel(level: LogLevel): void

	/**
	 * Get the current log level
	 *
	 * @returns {LogLevel} The current log level
	 */
	getLevel(): LogLevel

	/**
	 * Log a trace-level message
	 *
	 * @param {string} msg - The log message
	 * @param {object} [obj] - Optional object to include in the log
	 * @param {...any[]} args - Additional arguments to include
	 */
	trace: LoggerFunction

	/**
	 * Log a debug-level message
	 *
	 * @param {string} msg - The log message
	 * @param {object} [obj] - Optional object to include in the log
	 * @param {...any[]} args - Additional arguments to include
	 */
	debug: LoggerFunction

	/**
	 * Log an info-level message
	 *
	 * @param {string} msg - The log message
	 * @param {object} [obj] - Optional object to include in the log
	 * @param {...any[]} args - Additional arguments to include
	 */
	info: LoggerFunction

	/**
	 * Log a warning-level message
	 *
	 * @param {string} msg - The log message
	 * @param {object} [obj] - Optional object to include in the log
	 * @param {...any[]} args - Additional arguments to include
	 */
	warn: LoggerFunction

	/**
	 * Log an error-level message
	 *
	 * @param {string} msg - The log message
	 * @param {object} [obj] - Optional object to include in the log
	 * @param {...any[]} args - Additional arguments to include
	 */
	error: LoggerFunction

	/**
	 * Log a fatal-level message
	 *
	 * @param {string} msg - The log message
	 * @param {object} [obj] - Optional object to include in the log
	 * @param {...any[]} args - Additional arguments to include
	 */
	fatal: LoggerFunction
}
