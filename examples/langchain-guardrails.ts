import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { GuardrailsEngine } from '../src'
import { LangChainChatGuardrails } from '../src'
import { piiGuard, secretGuard } from '../src'
import { SelectionType } from '../src'

async function main() {
	// 1. Initialize your base LangChain chat model
	const geminiLLM = new ChatGoogleGenerativeAI({
		model: 'gemini-2.0-flash-exp',
		apiKey: process.env.GOOGLE_API_KEY, // Make sure to set this environment variable
	})

	// 2. Initialize the Guardrails engine (configure as needed)
	const guardrailsEngine = new GuardrailsEngine({
		guards: [
			piiGuard({
				selection: SelectionType.All,
			}),
			secretGuard({
				selection: SelectionType.All,
			}),
		],
	})

	// 3. Wrap your model with guardrails
	const guardedModel = LangChainChatGuardrails(geminiLLM, guardrailsEngine)

	// 4. Use the guarded model as you would normally
	const response = await guardedModel.invoke([
		{
			role: 'user',
			content: 'My email is john.doe@example.com and my phone number is 555-555-5555.',
		},
		{ role: 'user', content: 'what is my email i shared as it is' },
	])

	console.log('Guarded response:', response.content)
	// Example output:
	// Guarded response: Your email, as you shared it, is [REDACTED-EMAIL].
}

main().catch(console.error)
