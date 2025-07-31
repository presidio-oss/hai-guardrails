import stringSimilarity from 'string-similarity'
import { normalizeString } from '@hai-guardrails/utils/util'

export default async function ({
	input,
	keyword,
	threshold = 0.8,
}: {
	input: string
	keyword: string
	threshold?: number
}) {
	const inputTokens = normalizeString(input).split(' ')
	const normalizedKeyword = normalizeString(keyword)
	const keywordTokens = normalizedKeyword.split(' ')
	const n = keywordTokens.length

	const substringCache: { raw: string; tokens: string[] }[] = []

	for (let i = 0; i <= inputTokens.length - n; i++) {
		const tokens = inputTokens.slice(i, i + n)
		substringCache.push({ raw: tokens.join(' '), tokens })
	}

	let highestScore = 0
	let bestSubstring = ''

	for (const { raw: candidate, tokens: candidateTokens } of substringCache) {
		const similarityScore = stringSimilarity.compareTwoStrings(normalizedKeyword, candidate)

		let matchedWordsCount = 0
		for (let j = 0; j < n; j++) {
			if (candidateTokens[j] === keywordTokens[j]) matchedWordsCount++
		}

		const maxMatchedWords = 5
		const baseScore =
			matchedWordsCount > 0 ? 0.5 + 0.5 * Math.min(matchedWordsCount / maxMatchedWords, 1) : 0
		const adjustedScore = baseScore + similarityScore * (1 / (maxMatchedWords * 2))

		if (adjustedScore > highestScore) {
			highestScore = adjustedScore
			bestSubstring = candidate
		}
	}

	return {
		score: highestScore,
		additionalFields: {
			bestKeyword: keyword,
			bestSubstring,
			threshold,
			isInjection: highestScore >= threshold,
		},
	}
}
