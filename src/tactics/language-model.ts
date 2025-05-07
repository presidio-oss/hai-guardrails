import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { TacticName, type LLMMessages, type Tactic, type TacticExecution } from '../types/tactics'
import type { LLM } from '../types/types'

/**
 * Language Model tactic: uses an LLM to assess prompt injection likelihood.
 *
 * This tactic works by generating a prompt that asks the LLM to assess the input
 * string for prompt injection likelihood. The LLM responds with a score between 0
 * and 1, which is then thresholded to determine if the input string is a prompt
 * injection attack or not.
 *
 * @param threshold The default threshold for determining if a score indicates a
 * prompt injection attack. Defaults to 0.
 * @param llm The language model to use for assessing prompt injection likelihood.
 * Must be an instance of BaseChatModel.
 */
export class LanguageModel implements Tactic {
	readonly name = TacticName.LanguageModel
	readonly defaultThreshold: number

	constructor(
		threshold: number = 0,
		private readonly llm: LLM,
		private renderPromptTemplate: (input: string) => string
	) {
		this.defaultThreshold = threshold
	}

	async execute(input: string, thresholdOverride?: number): Promise<TacticExecution> {
		const prompt = this.renderPromptTemplate(input.trim())
		let score = 0.0
		let resultText = ''
		try {
			const messages = [
				{
					role: 'system',
					content: prompt,
				},
				{
					role: 'human',
					content: input.trim(),
				},
			] satisfies LLMMessages
			if (this.llm instanceof BaseChatModel) {
				const result = await this.llm.invoke(messages)
				score = parseFloat(result.text || '0')
				resultText = result.text
			} else {
				const result = await this.llm(messages)
				score = parseFloat(result[result.length - 1]?.content || '0')
				resultText = result[result.length - 1]?.content || ''
			}
			const threshold = thresholdOverride ?? this.defaultThreshold
			return {
				score,
				additionalFields: {
					modelResponse: resultText,
					threshold,
					isInjection: score >= threshold,
				},
			}
		} catch (error) {
			console.error('Error executing language model:', error)
			return { score: 0, additionalFields: { error } }
		}
	}
}
