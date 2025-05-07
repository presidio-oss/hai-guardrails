import stringSimilarity from 'string-similarity'
import { TacticName, type Tactic, type TacticExecution } from '@hai-guardrails/types'
import { normalizeString } from '@hai-guardrails/utils/util'

/**
 * Heuristic tactic: fuzzy matching and word overlap with known injection keywords.
 *
 * This tactic works by testing the input string against a set of known suspicious
 * keywords. For each keyword, the tactic computes a score based on the number of
 * matching words and the similarity between the keyword and the input string. The
 * highest score is then returned as the result of the tactic. The score is then
 * thresholded to determine if the input string is a prompt injection attack or
 * not.
 *
 * @param threshold The default threshold for determining if a score indicates a
 * prompt injection attack. Defaults to 0.
 */
export class Heuristic implements Tactic {
	readonly name = TacticName.Heuristic
	readonly defaultThreshold: number

	constructor(
		threshold: number,
		private readonly keywords: string[]
	) {
		this.defaultThreshold = threshold
	}

	async execute(input: string, thresholdOverride?: number): Promise<TacticExecution> {
		let highestScore = 0
		let bestKeyword = ''
		let bestSubstring = ''
		const normalizedInput = normalizeString(input)

		for (const keyword of this.keywords) {
			const normalizedKeyword = normalizeString(keyword)
			const keywordParts = normalizedKeyword.split(' ')
			const keywordLength = keywordParts.length
			const inputParts = normalizedInput.split(' ')
			for (let i = 0; i <= inputParts.length - keywordLength; i++) {
				const substring = inputParts.slice(i, i + keywordLength).join(' ')
				const similarityScore = stringSimilarity.compareTwoStrings(normalizedKeyword, substring)
				const matchedWordsCount = keywordParts.filter(
					(part, index) => substring.split(' ')[index] === part
				).length
				const maxMatchedWords = 5
				const baseScore =
					matchedWordsCount > 0 ? 0.5 + 0.5 * Math.min(matchedWordsCount / maxMatchedWords, 1) : 0
				const adjustedScore = baseScore + similarityScore * (1 / (maxMatchedWords * 2))
				if (adjustedScore > highestScore) {
					highestScore = adjustedScore
					bestKeyword = keyword
					bestSubstring = substring
				}
				if (highestScore >= 1.0) break
			}
			if (highestScore >= 1.0) break
		}

		const threshold = thresholdOverride ?? this.defaultThreshold
		return {
			score: highestScore,
			additionalFields: {
				bestKeyword,
				bestSubstring,
				threshold,
				isInjection: highestScore >= threshold,
			},
		}
	}
}
