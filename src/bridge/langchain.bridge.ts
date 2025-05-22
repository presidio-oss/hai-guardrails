import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { GuardrailsEngine } from '@hai-guardrails/engine'
import { LangChainLLMMessageTransformer } from '@hai-guardrails/bridge/transformer/langchain'

/**
 * Type definition for a proxy handler that can intercept and modify method calls
 * on a LangChain chat model.
 *
 * @template T The type of the LangChain chat model being proxied
 */
type ProxyHandler<T extends BaseChatModel> = {
	[K in keyof T]?: T[K] extends (...args: infer Args) => infer Return
		? (
				originalFn: T[K],
				target: T,
				thisArg: T,
				args: Args,
				guardrailsEngine: GuardrailsEngine
			) => Return | Promise<Return>
		: never
}

/**
 * Default handler implementation that wraps LangChain chat model invocations
 * with guardrails protection.
 *
 * @param originalFn The original method being called
 * @param target The target object (chat model instance)
 * @param thisArg The value of `this` in the original function
 * @param args Arguments passed to the original function
 * @param guardrailsEngine The guardrails engine instance
 * @returns The result of the original function call, after applying guardrails
 */
const DEFAULT_HANDLER: ProxyHandler<BaseChatModel> = {
	async invoke(originalFn, target, thisArg, args, guardrailsEngine) {
		const [input, options] = args
		const transformer = new LangChainLLMMessageTransformer(input)
		const llmMessages = transformer.toLLMMessages()
		const guardResult = await guardrailsEngine.run(llmMessages)
		const baseLanguageModelInput = transformer.applyLLMUpdates(guardResult.messages)
		return originalFn.call(thisArg, baseLanguageModelInput, options)
	},
}

/**
 * Creates a bridge LangChain chat model that applies guardrails protection
 * to all method calls.
 *
 * @template T The type of the LangChain chat model
 * @param model The LangChain chat model instance to protect
 * @param guardrailsEngine The guardrails engine instance to use
 * @param handler Optional custom handler to override default behavior
 * @returns Protected version of input model that applies guardrails protection
 *
 * @example
 * ```typescript
 * const model = new ChatOpenAI();
 * const engine = new GuardrailsEngine();
 * const protectedModel = LangChainChatGuardrails(model, engine);
 * ```
 */
export function LangChainChatGuardrails<T extends BaseChatModel>(
	model: T,
	guardrailsEngine: GuardrailsEngine,
	handler: ProxyHandler<T> = {}
): T {
	handler = { ...DEFAULT_HANDLER, ...handler }
	return new Proxy(model, {
		get(target, prop, receiver) {
			const originalValue = Reflect.get(target, prop, receiver)
			const methodName = prop as keyof T
			const method = originalValue as T[typeof methodName]
			const customHandler = handler?.[methodName]
			if (typeof originalValue !== 'function' || !customHandler || guardrailsEngine.isDisabled) {
				return originalValue
			}
			return function (this: T, ...args: unknown[]) {
				return (async () => {
					return customHandler(
						method,
						target,
						this === receiver ? target : this,
						args,
						guardrailsEngine
					)
				})()
			}
		},
	}) as T
}
