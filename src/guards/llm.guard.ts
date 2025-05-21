/**
 * @module guards/llm
 * @description Provides LLM-based validation guard functionality for content moderation and validation.
 * This module implements a flexible guard that uses language models to validate and score content
 * based on configurable schemas and validation types.
 */

import { z, ZodObject, type ZodRawShape } from 'zod/v4'
import type {
	Guard,
	GuardOptions,
	GuardResult,
	LLM,
	LLMMessages,
	MakeGuardConfig,
} from '@hai-guardrails/types'
import { makeGuard } from '@hai-guardrails/guards'
import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { jsonrepair } from 'jsonrepair'

/**
 * Supported validation types for the LLM guard.
 * - `Score`: Validates content and returns a numeric score (lower is better).
 * - `Binary`: Validates content with a simple pass/fail result.
 */
export enum ValidationType {
	/**
	 * Score-based validation where content is rated on a numeric scale.
	 * The guard passes if the score is below the configured threshold.
	 */
	Score = 'score',

	/**
	 * Binary validation where content is either accepted or rejected.
	 * The guard passes if the response indicates the content is valid.
	 */
	Binary = 'binary',
}

/**
 * Represents a single example of structured response with its corresponding input.
 * @template T - The type of the structured response.
 */
type StructuredResponseExampleSchemaType<T> = T & {
	/** The input text that produces this example response */
	input: string
}

/**
 * Collection of validation examples for both valid and invalid cases.
 * @template T - The type of the structured response.
 */
type StructuredResponseExamplesSchemaType<T> = {
	/** Array of examples that should pass validation */
	valid: StructuredResponseExampleSchemaType<T>[]

	/**
	 * Optional array of examples that should fail validation
	 * @default []
	 */
	invalid?: StructuredResponseExampleSchemaType<T>[]
}

/**
 * Configuration options for creating an LLM guard.
 * @template Shape - The shape of the Zod schema used for validation.
 */
type LLMGuardOptions<Shape extends ZodRawShape = ZodRawShape> = GuardOptions &
	Omit<Partial<MakeGuardConfig>, 'implementation'> & {
		/** Type of validation to perform */
		validationType: ValidationType

		/**
		 * Zod schema that defines the expected structure of the LLM's response.
		 * Must include a 'score' field for ValidationType.Score or a 'passed' field for ValidationType.Binary.
		 */
		schema: ZodObject<Shape>

		/**
		 * Optional examples to guide the LLM's responses.
		 * Helps improve the quality and consistency of validations.
		 */
		examples?: StructuredResponseExamplesSchemaType<z.infer<ZodObject<Shape>>>

		/**
		 * Clear description of the LLM's role and the validation criteria.
		 * This helps the LLM understand how to evaluate the input.
		 */
		roleDefinition: string

		/**
		 * Required for ValidationType.Score. The maximum score that is considered passing.
		 * Scores below this threshold will pass validation.
		 */
		threshold?: number
	}

/**
 * Formats an example into a string with input and output sections.
 * @param example - The example to format, containing input and output fields
 * @returns Formatted string showing input and corresponding output
 */
const generateExampleString = ({
	input,
	...example
}: StructuredResponseExampleSchemaType<object>) => {
	return `Input: ${input}
Output: \`\`\`json
${JSON.stringify(example, null, 2)}
\`\`\``
}

/**
 * Generates a formatted string containing all validation examples.
 * @param examples - Optional collection of valid and invalid examples
 * @returns Formatted string with all examples, or empty string if no examples provided
 */
const generateExamplesString = (
	examples?: StructuredResponseExamplesSchemaType<StructuredResponseExampleSchemaType<object>>
) => {
	if (!examples) {
		return ''
	}

	const validExamples = !examples.valid
		? ''
		: `Here are the valid examples:
---
${examples.valid.map((example) => generateExampleString(example)).join('\n\n')}`

	const invalidExamples = !examples.invalid
		? ''
		: `Here are the invalid examples:
---
${examples.invalid.map((example) => generateExampleString(example)).join('\n\n')}`

	return `${validExamples}${validExamples && invalidExamples ? '\n\n' : ''}${invalidExamples}`
}

/**
 * Safely invokes the language model with the provided messages.
 * Handles both BaseChatModel instances and custom LLM functions.
 *
 * @param llm - The language model to use for validation
 * @param messages - Messages to send to the language model
 * @returns Updated messages array including the model's response
 */
const invokeLLM = async (llm: LLM, messages: LLMMessages) => {
	try {
		if (llm instanceof BaseChatModel) {
			const response = await llm.invoke(messages)
			return [
				...messages,
				{
					role: response.getType(),
					content: response.content,
				},
			]
		}
		return llm(messages)
	} catch (error) {
		// On error, return the original messages to allow graceful degradation
		return messages
	}
}

/**
 * ## Creates a guard that uses a language model to validate content against a schema.
 *
 * ## Configuration Options
 *
 * The `llmGuard` function accepts the following configuration options:
 *
 * ### Required Options
 * - `validationType`: The type of validation to perform (`ValidationType.Score` or `ValidationType.Binary`)
 * - `schema`: A Zod schema that defines the expected response structure from the LLM
 * - `roleDefinition`: A clear description of the LLM's role and validation criteria
 * - `llm`: The language model to use for validation (optional if used with GuardrailsEngine and provided in the engine)
 *
 * ### Optional Options
 * - `examples`: Object containing `valid` and `invalid` example arrays to guide the LLM
 * - `threshold`: Required for `ValidationType.Score` - maximum score that is considered passing
 * - `id`: Unique identifier for the guard (default: 'llm')
 * - `name`: Human-readable name for the guard (default: 'LLM Guard')
 * - `description`: Description of what the guard does (default: 'Using LLM to validate messages')
 *
 * ### Schema Requirements
 * - For `ValidationType.Binary`: Schema must include a `passed: boolean` field
 * - For `ValidationType.Score`: Schema must include a `score: number` field
 *
 * ## Behavior
 * - When used with `ValidationType.Score` the `score` is compared to the `threshold` and the guard passes if the score is below the threshold
 * - When used with `ValidationType.Binary` the `passed` field is checked and the guard passes if the value is `true` otherwise it fails
 *
 * @example
 * ```typescript
 * // Basic binary validation
 * const schema = z.object({
 *   passed: z.boolean(),
 *   reason: z.string(),
 *   severity: z.enum(['low', 'medium', 'high'])
 * });
 *
 * const toxicGuard = llmGuard({
 *   validationType: ValidationType.Binary,
 *   schema,
 *   roleDefinition: 'You are a content moderator. Detect if the input contains toxic language.',
 *   examples: {
 *     valid: [
 *       { input: 'Hello, how are you?', passed: true, reason: 'Friendly greeting', severity: 'low' }
 *     ],
 *     invalid: [
 *       { input: 'I hate you!', passed: false, reason: 'Contains hate speech', severity: 'high' }
 *     ]
 *   }
 * });
 *
 * // Score-based validation with threshold
 * const scoringSchema = z.object({
 *   score: z.number().min(0).max(10),
 *   reason: z.string(),
 *   confidence: z.number().min(0).max(1)
 * });
 *
 * const qualityGuard = llmGuard({
 *   validationType: ValidationType.Score,
 *   schema: scoringSchema,
 *   threshold: 5, // Scores below 5 will pass
 *   roleDefinition: 'Rate the quality of the input text from 0-10 (lower is better).',
 *   examples: {
 *     valid: [
 *       { input: 'Well-written text with good grammar.', score: 2, reason: 'High quality', confidence: 0.9 }
 *     ],
 *     invalid: [
 *       { input: 'Bad text with many errors.', score: 8, reason: 'Poor quality', confidence: 0.8 }
 *     ]
 *   }
 * });
 * ```
 *
 * @template Shape - The shape of the Zod schema used for validation
 * @param opts - Configuration options for the LLM guard
 * @returns A guard function that validates content using the configured LLM
 * @throws {Error} If required configuration is missing or invalid (e.g., missing threshold for score validation)
 */
export function llmGuard<Shape extends ZodRawShape>(opts: LLMGuardOptions<Shape>): Guard {
	return makeGuard({
		id: 'llm',
		name: 'LLM Guard',
		description: 'Using LLM to validate messages',
		...opts,
		implementation: async (input, msg, config, idx, llm) => {
			const common = {
				passed: true,
				reason: 'No validation detected',
				guardId: config.id,
				guardName: config.name,
				message: msg.originalMessage,
				index: idx,
				messageHash: msg.messageHash,
				inScope: msg.inScope,
			} as GuardResult

			const { validationType, schema, roleDefinition, examples, threshold } = opts

			if (validationType === ValidationType.Score) {
				if (!('score' in schema.shape)) {
					throw new Error(`ValidationType.Score requires the schema to have a "score" field.`)
				}
				if (!threshold) {
					throw new Error(`ValidationType.Score requires a threshold to be specified.`)
				}
			}

			if (validationType === ValidationType.Binary && !('passed' in schema.shape)) {
				throw new Error(`ValidationType.Binary requires the schema to have a "passed" field.`)
			}

			if (!msg.inScope) {
				return {
					...common,
					passed: true,
					reason: 'Message is not in scope',
				}
			}

			const llmInstance = opts.llm ?? config.llm ?? llm

			if (!llmInstance) {
				return {
					...common,
					passed: false,
					reason: 'LLM is required for toxic guard',
				}
			}
			// Construct the system prompt with schema, examples, and instructions
			const systemPrompt = `${roleDefinition}
Your job is to analyze the given input string and return a structured JSON response following the Zod schema format below.

Only respond in JSON format, the response should be a valid json object following this schema:
---
\`\`\`json
${JSON.stringify(z.toJSONSchema(schema), null, 2)}
\`\`\`

${generateExamplesString(examples as StructuredResponseExamplesSchemaType<StructuredResponseExampleSchemaType<object>>)}

Note: Do not include any additional text or explanation in your response. Only return the JSON object.
`

			const result = await invokeLLM(llmInstance, [
				{
					role: 'system',
					content: systemPrompt,
				},
				{
					role: 'user',
					content: input,
				},
			])
			const message = result[result.length - 1]
			if (result.length < 1 || !message) {
				return {
					...common,
					passed: false,
					reason: 'LLM returned no messages',
				}
			}
			// Parse and validate the LLM's response
			const jsonResult = message.content
			// Attempt to repair any JSON formatting issues
			const repairedJsonResult = jsonrepair(jsonResult as string)
			const jsonObject = JSON.parse(repairedJsonResult)
			// Validate against the provided schema
			const parsedResult = schema.safeParse(jsonObject)
			if (!parsedResult.success) {
				return {
					...common,
					passed: false,
					reason: 'Failed to parse LLM response',
				}
			}
			if (validationType === ValidationType.Score) {
				const parsedResponse = parsedResult.data as z.infer<typeof schema> & {
					reason: string
					score: number
				}
				return {
					...common,
					passed: parsedResponse.score < threshold!,
					reason: parsedResponse.reason,
					additionalFields: {
						...parsedResult.data,
					},
				}
			} else if (validationType === ValidationType.Binary) {
				const parsedResponse = parsedResult.data as z.infer<typeof schema> & {
					reason: string
					passed: boolean
				}
				return {
					...common,
					passed: parsedResponse.passed,
					reason: parsedResponse.reason,
					additionalFields: {
						...parsedResult.data,
					},
				}
			}
			return common
		},
	})
}
