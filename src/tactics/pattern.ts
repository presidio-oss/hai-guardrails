import {
  TacticName,
  type Tactic,
  type TacticExecution,
} from "../types/tactics";
import { normalizeString } from "../utils/util";

/**
 * Pattern tactic: regular expression matching against suspicious prompt patterns.
 *
 * This tactic works by testing the input string against a set of regular
 * expressions that match known suspicious patterns. If any of the patterns
 * match, the tactic returns a score of 1.0. Otherwise, the score is 0.0. The
 * score is then thresholded to determine if the input string is a prompt
 * injection attack or not.
 *
 * @param threshold The default threshold for determining if a score indicates a
 * prompt injection attack. Defaults to 0.
 */
export class Pattern implements Tactic {
  readonly name = TacticName.Pattern;
  readonly defaultThreshold: number;

  constructor(threshold: number = 0, private readonly patterns: RegExp[]) {
    this.defaultThreshold = threshold;
  }

  async execute(
    input: string,
    thresholdOverride?: number
  ): Promise<TacticExecution> {
    const normalizedInput = normalizeString(input);

    let matchedPattern: RegExp | null = null;
    const result = this.patterns.some((pattern) => {
      if (pattern.test(normalizedInput)) {
        matchedPattern = pattern;
        return true;
      }
      return false;
    });

    const score = result ? 1 : 0;
    const threshold = thresholdOverride ?? this.defaultThreshold;

    return {
      score,
      additionalFields: {
        matchedPattern,
        threshold,
        isInjection: score >= threshold,
      },
    };
  }
}
