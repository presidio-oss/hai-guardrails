/**
 * @module @hai-guardrails/utils/logging
 *
 * Centralized logging utilities for the HAI Guardrails SDK.
 * Provides a flexible logging system with support for different logging implementations.
 *
 * @example
 * // Basic usage
 * import { logger } from '@hai-guardrails/utils/logging'
 * logger.info('Application started')
 *
 * // Advanced usage with custom configuration
 * import { createLogger, LoggerType } from '@hai-guardrails/utils/logging'
 * const customLogger = createLogger(LoggerType.PINO)
 */
import { createPinoLogger } from '@hai-guardrails/utils/logging/pino-logger'
import type { LoggerContract } from '@hai-guardrails/utils/logging/types'

/**
 * Enum defining supported logger types in the SDK.
 * Currently supports Pino as the default logging implementation.
 */
export enum LoggerType {
	/**
	 * Pino logger implementation - fast, performant JSON logging with pretty printing support
	 */
	PINO = 'pino',
}

/**
 * Factory function to create a logger instance based on the specified type.
 *
 * @param loggerType - The type of logger to create (currently only supports Pino)
 * @returns A new LoggerContract instance configured with the specified type
 * @throws Error if an unsupported logger type is requested
 *
 * @example
 * // Create a new logger instance
 * const customLogger = createLogger(LoggerType.PINO)
 */
const createLogger = (loggerType: LoggerType): LoggerContract => {
	switch (loggerType) {
		case LoggerType.PINO:
			return createPinoLogger()
		default:
			throw new Error(`Unsupported logger type: ${loggerType}`)
	}
}

/**
 * Default logger instance pre-configured with Pino implementation.
 * Ready to use out of the box with standard logging levels and formatting.
 *
 * @example
 * // Basic usage with default logger
 * logger.info('Application started')
 * logger.error('Something went wrong')
 */
export const logger: LoggerContract = createLogger(LoggerType.PINO)
