/**
 * @module guards/bias-detection
 * @description Provides bias detection functionality using language models.
 * This guard helps identify stereotypes, prejudices, and unfair generalizations in text.
 */

import { llmGuard, ValidationType } from '@hai-guardrails/guards'
import {
	SelectionType,
	type Guard,
	type GuardOptions,
	type GuardResult,
	type GuardrailsChainOptions,
} from '@hai-guardrails/types'
import { z } from 'zod/v4'
import type { GuardrailsEngine } from '@hai-guardrails/engine'

/**
 * Configuration options for the Bias Detection Guard.
 *
 * @property {number} [threshold=0.7] - The bias detection threshold (0-1).
 *   Inputs with scores at or above this threshold will be flagged for potential bias.
 *   Lower values make the guard more sensitive to potential bias.
 */
type BiasDetectionGuardOptions = GuardOptions & {
	threshold?: number
}

/**
 * ## Creates a guard that detects potential bias in text inputs.
 *
 * The Bias Detection Guard uses a language model to identify stereotypes, prejudices,
 * and unfair generalizations about people based on their group membership. It helps ensure
 * that AI-generated content remains fair and inclusive.
 *
 * ## Configuration Options
 * - `threshold`: The bias detection threshold (0-1, default: 0.7)
 * - `llm`: Custom LLM instance to use (optional when used with {@link GuardrailsEngine} and provided in the {@link GuardrailsChainOptions.llm})
 * - `selection`: Which messages to evaluate (default: {@link SelectionType.Last})
 *
 * ## Response Format
 * The guard returns an array of {@link GuardResult} with the following additional properties:
 * - `score`: Confidence score between 0 and 1
 * - `reason`: Explanation of the bias detection
 * - `categories`: Array of detected bias types (e.g., 'age', 'gender', 'racial')
 * - `affectedGroups`: Groups that are the subject of potential bias
 * - `impact`: Estimated impact level of the detected bias ('low', 'medium', 'high')
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const basicGuard = biasDetectionGuard({ threshold: 0.75 });
 *
 * // Advanced usage with custom selection and LLM
 * const customGuard = biasDetectionGuard({
 *   threshold: 0.65,
 *   selection: SelectionType.All, // Check all messages
 *   roles: ['assistant'], // Only check assistant outputs
 *   llm: customLLM, // Use a custom LLM instance
 *   messageHashingAlgorithm: MessageHashingAlgorithm.SHA512 // Use SHA-512 for message hashing
 * });
 * ```
 *
 * @see {@link GuardOptions} for additional configuration options
 * @see {@link GuardResult} for the structure of the returned results
 * @see {@link hateSpeechGuard} for detecting identity-based hate speech
 * @see {@link toxicGuard} for detecting general toxicity
 *
 * @throws {Error} If no LLM is provided either in the options or in the GuardrailsEngine
 *
 * @param {BiasDetectionGuardOptions} opts - Configuration options for the Bias Detection Guard
 * @returns {Guard} A guard function that detects potential bias in text inputs
 */
export function biasDetectionGuard(opts: BiasDetectionGuardOptions): Guard {
	const options = { ...{ threshold: 0.7 }, ...opts }
	return llmGuard({
		id: 'bias-detection',
		name: 'Bias Detection Guard',
		description: 'Detects potential bias in text, including stereotypes and unfair generalizations',
		...options,
		selection: SelectionType.Last,
		validationType: ValidationType.Score,
		roleDefinition:
			'You are a bias detection system. Identify any statements that contain stereotypes, ' +
			'prejudices, or unfair generalizations about people based on their group membership. ' +
			'Focus on detecting subtle or systemic bias that might not be overtly hateful.',
		schema: z.object({
			score: z
				.float32()
				.min(0)
				.max(1)
				.describe('Confidence score between 0 and 1 indicating likelihood of biased content'),
			reason: z.string().describe('Explanation of the bias detection or why none was found'),
			categories: z.array(z.string()).optional().describe('Types of bias detected, if any'),
			affectedGroups: z
				.array(z.string())
				.optional()
				.describe('Groups that are the subject of potential bias'),
			impact: z
				.enum(['low', 'medium', 'high'])
				.optional()
				.describe('Estimated impact level of the detected bias'),
		}),
		examples: {
			valid: [
				{
					input: 'Older employees often struggle with new technology.',
					score: 0.85,
					reason: 'Makes a sweeping generalization about older workers and technology',
					categories: ['age', 'technological'],
					affectedGroups: ['older employees'],
					impact: 'medium',
				},
				{
					input: 'Women are naturally better at nurturing roles.',
					score: 0.9,
					reason: 'Reinforces gender stereotypes about caregiving abilities',
					categories: ['gender'],
					affectedGroups: ['women'],
					impact: 'high',
				},
				{
					input: 'Our hiring process is completely fair and unbiased.',
					score: 0.05,
					reason: 'Statement about fairness with no apparent bias',
				},
			],
			invalid: [
				{
					input: 'Hello, how are you today?',
					score: 0.0,
					reason: 'Neutral greeting with no biased content',
				},
			],
		},
	})
}
