import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import {
  TacticName,
  type Tactic,
  type TacticExecution,
} from "../types/tactics";

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
  readonly name = TacticName.LanguageModel;
  readonly defaultThreshold: number;

  constructor(
    threshold: number = 0,
    private readonly llm: BaseChatModel,
    private renderPromptTemplate: (input: string) => string
  ) {
    this.defaultThreshold = threshold;
    this.llm = llm;
  }

  async execute(
    input: string,
    thresholdOverride?: number
  ): Promise<TacticExecution> {
    const prompt = this.renderPromptTemplate(input);
    try {
      const result = await this.llm.invoke([
        {
          role: "human",
          content: prompt,
        },
      ]);
      const score = parseFloat(result.text || "0");
      const threshold = thresholdOverride ?? this.defaultThreshold;
      return {
        score,
        additionalFields: {
          modelResponse: result.text,
          threshold,
          isInjection: score >= threshold,
        },
      };
    } catch (error) {
      console.error("Error executing language model:", error);
      return { score: 0, additionalFields: { error } };
    }
  }
}
