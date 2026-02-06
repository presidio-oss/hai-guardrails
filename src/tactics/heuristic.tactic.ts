import stringSimilarity from 'string-similarity'
import { TacticName, type Tactic, type TacticExecution } from '@hai-guardrails/types'
import { normalizeString } from '@hai-guardrails/utils/util'
import Piscina from 'piscina'
import { dirname, resolve } from 'path'
import { cpus } from 'os'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const workerPath = resolve(__dirname, '../workers/heuristic.worker.mjs')

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
	private readonly piscina: Piscina

	constructor(
		threshold: number,
		private readonly keywords: string[]
	) {
		this.defaultThreshold = threshold
		this.piscina = new Piscina({
			filename: workerPath,
			maxThreads: Math.min(4, cpus().length),
			minThreads: 2,
			concurrentTasksPerWorker: 1,
		})
	}

	async execute(input: string, thresholdOverride?: number): Promise<TacticExecution> {
		const threshold = thresholdOverride ?? this.defaultThreshold

		// Run all keyword checks in parallel
		const results = await Promise.all(
			this.keywords.map((keyword) => this.piscina.run({ input, keyword, threshold }))
		)

		// Find the result with the highest score
		const bestResult = results.reduce((max, current) => (current.score > max.score ? current : max))

		return {
			score: bestResult.score,
			additionalFields: bestResult.additionalFields,
		}
	}
}
