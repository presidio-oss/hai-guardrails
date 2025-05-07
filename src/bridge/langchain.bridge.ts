import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import type { GuardrailsEngine } from '@hai-guardrails/engine'
import {
	convertToLLMMessages,
	updateMessagesFromLLMMessages,
} from '@hai-guardrails/utils/langchain.util'

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

const DEFAULT_HANDLER: ProxyHandler<BaseChatModel> = {
	async invoke(originalFn, target, thisArg, args, guardrailsEngine) {
		const [input, options] = args
		const llmMessages = convertToLLMMessages(input)
		const guardResult = await guardrailsEngine.run(llmMessages)
		const baseLanguageModelInput = updateMessagesFromLLMMessages(input, guardResult.messages)
		return originalFn.call(thisArg, baseLanguageModelInput, options)
	},
}
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
