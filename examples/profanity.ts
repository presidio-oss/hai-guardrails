import { profanityGuard } from '../src/guards/profanity.guard'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const geminiLLM = new ChatGoogleGenerativeAI({
	model: 'gemini-2.0-flash-exp',
	apiKey: process.env.GOOGLE_API_KEY,
})

const tests = [
	'This is a f***ing disaster!',
	'That movie was complete BS.',
	'I had a great day, thanks for asking!',
	'What the hell is going on here?',
	'This is a completely normal sentence.',
	'1234567890',
	'Hello, how are you today?',
]

const guard = profanityGuard({
	threshold: 0.7,
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
//     "reason": "Contains a masked profanity",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "This is a f***ing disaster!"
//     },
//     "index": 0,
//     "messageHash": "9950a80aadc3faacdf74b99b9981fbf5ece377d5ec88715191d60916bddcfeac",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.95,
//       "reason": "Contains a masked profanity",
//       "flaggedWords": [
//         "f***ing"
//       ],
//       "severity": "moderate"
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "Contains an abbreviation of a profanity",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "That movie was complete BS."
//     },
//     "index": 0,
//     "messageHash": "13be9728a4c48dba700484ce8a5875236b92dcb4fb3cda6830e01f7764454c91",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.85,
//       "reason": "Contains an abbreviation of a profanity",
//       "flaggedWords": [
//         "BS"
//       ],
//       "severity": "mild"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Polite and contains no profanity",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "I had a great day, thanks for asking!"
//     },
//     "index": 0,
//     "messageHash": "e1c9e87a38f73abfce4d7fab46ac07236c869dc608b840eea14b889317c89ad0",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Polite and contains no profanity"
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "Contains a mild profanity.",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "What the hell is going on here?"
//     },
//     "index": 0,
//     "messageHash": "a118a7bce1aae922b77892ad903da00a29a806d178bb4afd7e0bb34368fdc6eb",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.75,
//       "reason": "Contains a mild profanity.",
//       "flaggedWords": [
//         "hell"
//       ],
//       "severity": "mild"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Standard sentence with no profanity",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "This is a completely normal sentence."
//     },
//     "index": 0,
//     "messageHash": "2da00998dd0de39c902e15e327087d39191f1552d8ef2ad0c7eeed6d64abd16a",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Standard sentence with no profanity"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "No text to evaluate for profanity",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "1234567890"
//     },
//     "index": 0,
//     "messageHash": "25cc10e6f4e50106858c7f054f562819eba17a6dcbfbf93ab418a349faa563fd",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0,
//       "reason": "No text to evaluate for profanity"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Standard greeting with no profanity",
//     "guardId": "profanity",
//     "guardName": "Profanity Guard",
//     "message": {
//       "role": "user",
//       "content": "Hello, how are you today?"
//     },
//     "index": 0,
//     "messageHash": "9ba7644cfbcc966c134e229a9cb74c34d4a8ac47cc8fa695da4a7bc15535d9d1",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Standard greeting with no profanity"
//     }
//   }
// ]
