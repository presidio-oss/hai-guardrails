import { adultContentGuard } from '../src/guards/adult-content.guard'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const geminiLLM = new ChatGoogleGenerativeAI({
	model: 'gemini-2.0-flash-exp',
	apiKey: process.env.GOOGLE_API_KEY,
})

const tests = [
	'This novel explores the intimate relationship between two adults, with scenes implying sexual tension and private encounters.',
	'This is a family-friendly movie review',
	"A completely innocent children's story",
	'1234567890',
	'Hello, how are you today?',
]

const guard = adultContentGuard({
	threshold: 0.75,
	llm: geminiLLM,
})

for (const test of tests) {
	const res = await guard([
		{
			role: 'user',
			content: test,
		},
	])
	console.log(JSON.stringify(res, null, 2))
}

// Example output:
// [
//   {
//     "passed": false,
//     "reason": "Contains adult themes and implied sexual situations",
//     "guardId": "adult-content",
//     "guardName": "Adult Content Guard",
//     "message": {
//       "role": "user",
//       "content": "This novel explores the intimate relationship between two adults, with scenes implying sexual tension and private encounters."
//     },
//     "index": 0,
//     "messageHash": "670c8e64abb77be04fc4d592c9f665ec2d9669191c560496f9b00e6b792bb9b0",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.82,
//       "reason": "Contains adult themes and implied sexual situations",
//       "categories": [
//         "romance",
//         "suggestive"
//       ],
//       "isExplicit": false
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Content is appropriate for all audiences",
//     "guardId": "adult-content",
//     "guardName": "Adult Content Guard",
//     "message": {
//       "role": "user",
//       "content": "This is a family-friendly movie review"
//     },
//     "index": 0,
//     "messageHash": "854a9bfe14f20371a7d4329bfd5bf14bf3b00eca9ec477eb6150fb8a9c072e2f",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Content is appropriate for all audiences"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Content is appropriate for all audiences",
//     "guardId": "adult-content",
//     "guardName": "Adult Content Guard",
//     "message": {
//       "role": "user",
//       "content": "A completely innocent children's story"
//     },
//     "index": 0,
//     "messageHash": "e3938f06c45ef6dd25e758f0c0f87717e72678ced93e27b03191ed9d56f1ed79",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Content is appropriate for all audiences",
//       "isExplicit": false
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "The input is a sequence of numbers and does not contain adult content.",
//     "guardId": "adult-content",
//     "guardName": "Adult Content Guard",
//     "message": {
//       "role": "user",
//       "content": "1234567890"
//     },
//     "index": 0,
//     "messageHash": "25cc10e6f4e50106858c7f054f562819eba17a6dcbfbf93ab418a349faa563fd",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "The input is a sequence of numbers and does not contain adult content."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Neutral greeting with no adult content",
//     "guardId": "adult-content",
//     "guardName": "Adult Content Guard",
//     "message": {
//       "role": "user",
//       "content": "Hello, how are you today?"
//     },
//     "index": 0,
//     "messageHash": "9ba7644cfbcc966c134e229a9cb74c34d4a8ac47cc8fa695da4a7bc15535d9d1",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Neutral greeting with no adult content"
//     }
//   }
// ]
