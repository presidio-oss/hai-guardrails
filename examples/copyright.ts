import { copyrightGuard } from '../src/guards/copyright.guard'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const geminiLLM = new ChatGoogleGenerativeAI({
	model: 'gemini-2.0-flash-exp',
	apiKey: process.env.GOOGLE_API_KEY,
})

const tests = [
	'To be, or not to be, that is the question',
	'The quick brown fox jumps over the lazy dog',
	'In a hole in the ground there lived a hobbit',
	'It was the best of times, it was the worst of times',
	'Hello, how are you today?',
	'1234567890',
]

const guard = copyrightGuard({
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
//     "reason": "Well-known quote from Shakespeare's Hamlet",
//     "guardId": "copyright",
//     "guardName": "Copyright Guard",
//     "message": {
//       "role": "user",
//       "content": "To be, or not to be, that is the question"
//     },
//     "index": 0,
//     "messageHash": "e387afea59cdab8e3cedf80433169e7c20ba517f25b3f3e2004aa8a322fceead",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.9,
//       "reason": "Well-known quote from Shakespeare's Hamlet",
//       "type": [
//         "book_excerpt"
//       ],
//       "source": "Hamlet by William Shakespeare",
//       "isDirectMatch": true
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Common pangram with no specific copyright",
//     "guardId": "copyright",
//     "guardName": "Copyright Guard",
//     "message": {
//       "role": "user",
//       "content": "The quick brown fox jumps over the lazy dog"
//     },
//     "index": 0,
//     "messageHash": "1ab42d228c904ad16ab644265126bfa7970d1ccff41e3cc02c62647cfb8f15ef",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.05,
//       "reason": "Common pangram with no specific copyright"
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "Opening line from J.R.R. Tolkien's 'The Hobbit'",
//     "guardId": "copyright",
//     "guardName": "Copyright Guard",
//     "message": {
//       "role": "user",
//       "content": "In a hole in the ground there lived a hobbit"
//     },
//     "index": 0,
//     "messageHash": "b10b86cd77ad4382ad60d94a65ffb1572d9e293a14588b330ff0157ae732e313",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.8,
//       "reason": "Opening line from J.R.R. Tolkien's 'The Hobbit'",
//       "type": [
//         "book_excerpt"
//       ],
//       "source": "The Hobbit by J.R.R. Tolkien",
//       "isDirectMatch": true
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "Opening line from A Tale of Two Cities",
//     "guardId": "copyright",
//     "guardName": "Copyright Guard",
//     "message": {
//       "role": "user",
//       "content": "It was the best of times, it was the worst of times"
//     },
//     "index": 0,
//     "messageHash": "f5d6b8c0d9852a7909af2a378a5cd039fe756f7ab9f5461a79f84bb363d7b12d",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.9,
//       "reason": "Opening line from A Tale of Two Cities",
//       "type": [
//         "book_excerpt"
//       ],
//       "source": "A Tale of Two Cities by Charles Dickens",
//       "isDirectMatch": true
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Common greeting with no copyright concerns",
//     "guardId": "copyright",
//     "guardName": "Copyright Guard",
//     "message": {
//       "role": "user",
//       "content": "Hello, how are you today?"
//     },
//     "index": 0,
//     "messageHash": "9ba7644cfbcc966c134e229a9cb74c34d4a8ac47cc8fa695da4a7bc15535d9d1",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "Common greeting with no copyright concerns"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Number sequence with no copyrightable content",
//     "guardId": "copyright",
//     "guardName": "Copyright Guard",
//     "message": {
//       "role": "user",
//       "content": "1234567890"
//     },
//     "index": 0,
//     "messageHash": "25cc10e6f4e50106858c7f054f562819eba17a6dcbfbf93ab418a349faa563fd",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0,
//       "reason": "Number sequence with no copyrightable content"
//     }
//   }
// ]
