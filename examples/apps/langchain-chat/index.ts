import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { HumanMessage, SystemMessage, BaseMessage } from '@langchain/core/messages'
import { stdin as input, stdout as output } from 'node:process'
import * as readline from 'node:readline/promises'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { GuardrailsEngine, makePIIGuard, makeSecretGuard } from '@presidio-dev/hai-guardrails'
import { LangChainChatGuardrails } from '@presidio-dev/hai-guardrails'

class ChatInstance {
	private llm: BaseChatModel
	private chatHistory: BaseMessage[]

	constructor(options: { llm: BaseChatModel; systemPrompt?: string }) {
		this.llm = options.llm
		this.chatHistory = [
			new SystemMessage(
				options.systemPrompt ??
					"You are a helpful assistant. Respond to the user's messages in a friendly and concise manner."
			),
		]
	}

	async sendMessage(userInput: string): Promise<string> {
		this.chatHistory.push(new HumanMessage(userInput))
		const response = await this.llm.invoke(this.chatHistory)
		this.chatHistory.push(response)
		// Ensure the response content is always a string
		if (typeof response.content === 'string') {
			return response.content
		} else if (Array.isArray(response.content)) {
			return response.content
				.map((c: any) => (typeof c === 'string' ? c : JSON.stringify(c)))
				.join('\n')
		} else {
			return JSON.stringify(response.content)
		}
	}
}

// CLI Chat handler, loosely coupled to LLM
async function runCliChat(llm: ChatInstance) {
	const rl = readline.createInterface({ input, output })
	console.log("Welcome to the LangChain Chat! Type 'exit' to quit.\n")
	while (true) {
		const userInput = await rl.question('You: ')
		if (userInput.toLowerCase() === 'exit') {
			console.log('Goodbye!')
			process.exit(0)
		}
		try {
			const response = await llm.sendMessage(userInput)
			console.log(`\nAssistant: ${response}\n`)
		} catch (error: any) {
			console.error('\nError:', error.message)
			console.log('Please try again.\n')
		}
	}
}

// Handle process termination
process.on('SIGINT', () => {
	console.log('\nGoodbye!')
	process.exit(0)
})

const model = new ChatGoogleGenerativeAI({
	apiKey: process.env.GOOGLE_API_KEY || '',
	model: 'gemini-2.0-flash-exp',
})

const guardRailsEngine = new GuardrailsEngine({
	guards: [
		makePIIGuard({
			selection: 'all',
		}),
		makeSecretGuard({
			selection: 'all',
		}),
	],
	enabled: true,
})

const llmWithGuardrails = LangChainChatGuardrails(model, guardRailsEngine)

// Instantiate LLM and start chat
const llm = new ChatInstance({
	llm: llmWithGuardrails,
})

runCliChat(llm).catch(console.error)
