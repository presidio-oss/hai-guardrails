export enum TacticName {
	Heuristic = 'heuristic',
	LanguageModel = 'language_model',
	Pattern = 'pattern',
}

export interface TacticExecution {
	score: number
	additionalFields?: Record<string, unknown>
}

export interface Tactic {
	readonly name: TacticName
	readonly defaultThreshold: number
	execute(input: string, thresholdOverride?: number): Promise<TacticExecution>
}
