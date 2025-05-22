/**
 * @module guards/hate-speech
 * @description Provides hate speech detection functionality using language models.
 * This guard helps identify and filter out identity-based hate speech and harmful content.
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
 * Configuration options for the Hate Speech Guard.
 *
 * @property {number} [threshold=0.9] - The hate speech detection threshold (0-1).
 *   Inputs with scores at or above this threshold will be considered hate speech.
 *   Lower values make the guard more sensitive to potential hate speech.
 */
type HateSpeechGuardOptions = GuardOptions & {
	threshold?: number
}

/**
 * ## Creates a guard that detects hate speech and identity-based attacks in text inputs.
 *
 * The Hate Speech Guard uses a language model to identify content that attacks or uses
 * pejorative/discriminatory language about individuals or groups based on protected
 * characteristics such as race, ethnicity, religion, gender, sexual orientation, or disability.
 *
 * ## Configuration Options
 * - `threshold`: The hate speech detection threshold (0-1, default: 0.9)
 * - `llm`: Custom LLM instance to use (optional when used with {@link GuardrailsEngine} and provided in the {@link GuardrailsChainOptions.llm})
 * - `selection`: Which messages to evaluate (default: {@link SelectionType.Last})
 *
 * ## Response Format
 * The guard returns an array of {@link GuardResult} with the following additional properties:
 * - `score`: Confidence score between 0 and 1
 * - `reason`: Explanation of the hate speech detection
 * - `categories`: Array of detected hate speech categories (e.g., 'racial', 'religious', 'ableist')
 * - `targetedGroups`: Array of groups targeted by the hate speech
 *
 * @example
 * ```typescript
 * // Basic usage with default settings
 * const basicGuard = hateSpeechGuard({ threshold: 0.85 });
 *
 * // Advanced usage with custom selection and LLM
 * const customGuard = hateSpeechGuard({
 *   threshold: 0.8,
 *   selection: SelectionType.All, // Check all messages
 *   roles: ['user', 'assistant'], // Check specific roles
 *   llm: customLLM, // Use a custom LLM instance
 *   messageHashingAlgorithm: MessageHashingAlgorithm.SHA512 // Use SHA-512 for message hashing
 * });
 * ```
 *
 * @see {@link GuardOptions} for additional configuration options
 * @see {@link GuardResult} for the structure of the returned results
 * @see {@link profanityGuard} for detecting general profanity
 * @see {@link toxicGuard} for detecting general toxicity
 *
 * @throws {Error} If no LLM is provided either in the options or in the GuardrailsEngine
 *
 * @param {HateSpeechGuardOptions} opts - Configuration options for the Hate Speech Guard
 * @returns {Guard} A guard function that detects hate speech in text inputs
 */
export function hateSpeechGuard(opts: HateSpeechGuardOptions): Guard {
	const options = { ...{ threshold: 0.9 }, ...opts }
	return llmGuard({
		id: 'hate-speech',
		name: 'Hate Speech Guard',
		description: 'Detects identity-based hate speech targeting protected characteristics',
		...options,
		selection: SelectionType.Last,
		validationType: ValidationType.Score,
		roleDefinition:
			'You are a specialized hate speech detection system focused on identity-based attacks. ' +
			'Detect content that attacks or uses pejorative/discriminatory language about a person or group ' +
			'based on their race, ethnicity, national origin, religion, gender identity, sexual orientation, ' +
			'or disability status. Focus on clear cases of identity-based hate and dehumanization.',
		schema: z.object({
			score: z
				.float32()
				.min(0)
				.max(1)
				.describe(
					'Confidence score between 0 and 1 indicating likelihood of identity-based hate speech'
				),
			reason: z.string().describe('Explanation of the hate speech detection or why none was found'),
			categories: z
				.array(z.string())
				.optional()
				.describe('Specific categories of hate speech detected, if any'),
			targetedGroups: z
				.array(z.string())
				.optional()
				.describe('The specific groups being targeted, if applicable'),
		}),
		examples: {
			valid: [
				{
					input:
						'We should round up all [ethnicity] people and send them back where they came from.',
					score: 0.98,
					reason: 'Advocates for mass deportation based on ethnicity',
					categories: ['xenophobic', 'racial'],
					targetedGroups: ['specific ethnic group'],
				},
				{
					input: '[Religious group] are all terrorists and should be banned from our country.',
					score: 0.95,
					reason: 'Makes sweeping negative generalizations about a religious group',
					categories: ['religious', 'xenophobic'],
					targetedGroups: ['specific religious group'],
				},
				{
					input:
						'People with [disability] are a burden on society and should be institutionalized.',
					score: 0.93,
					reason: 'Dehumanizes people with disabilities',
					categories: ['ableist'],
					targetedGroups: ['people with specific disability'],
				},
			],
			invalid: [
				{
					input: 'This policy unfairly targets low-income communities.',
					score: 0.1,
					reason: 'Criticizes a policy, not an identity group',
				},
				{
					input: 'The data shows differences in outcomes between groups.',
					score: 0.05,
					reason: 'Neutral statement about data without targeting any group',
				},
				{
					input: 'I strongly disagree with that political position.',
					score: 0.02,
					reason: 'Expresses disagreement without targeting identity groups',
				},
				{
					input: 'This is f***ing ridiculous!',
					score: 0.05,
					reason: 'Contains profanity but no identity-based hate (handled by ProfanityGuard)',
				},
				{
					input: 'Older employees might need more training on new technology.',
					score: 0.1,
					reason: 'Potential bias but not hate speech (handled by BiasDetectionGuard)',
				},
			],
		},
	})
}
