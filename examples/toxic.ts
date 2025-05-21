import { toxicGuard } from '../src'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const geminiLLM = new ChatGoogleGenerativeAI({
	model: 'gemini-2.0-flash-exp',
	apiKey: process.env.GOOGLE_API_KEY, // Make sure to set this environment variable
})

const tests = [
	'Get lost, no one wants you here.',
	'Could you please explain that again? I didn’t quite get it.',
	'You’re such a loser, seriously.',
	'Let’s take a break and revisit this with a fresh mind.',
	"You're so pathetic, it's painful to watch.",
	'I disagree with your point, but I respect your opinion.',
	'lololololol',
	'1234567890',
	"<script>alert('hack');</script>",
]

const guard = toxicGuard({
	threshold: 0.8,
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
//     "reason": "The statement is dismissive and unwanted, indicating hostility.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "Get lost, no one wants you here."
//     },
//     "index": 0,
//     "messageHash": "d83b25282a9f726259e1b41e801f1ed4e56aa756a72fae867aeb857d692a42a3",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.85,
//       "reason": "The statement is dismissive and unwanted, indicating hostility."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "The question is neutral and simply asks for clarification.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "Could you please explain that again? I didn’t quite get it."
//     },
//     "index": 0,
//     "messageHash": "7582340013d997563c1351cb6933857462ffbcd9afd1ca4835430b0c17b7262e",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.1,
//       "reason": "The question is neutral and simply asks for clarification."
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "The statement contains a direct insult ('loser') indicating a personal attack.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "You’re such a loser, seriously."
//     },
//     "index": 0,
//     "messageHash": "55ea80c1152496280e4fb5dd5a7d3010ba1c3e1c1b4c034b5f13545eda2f51eb",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.85,
//       "reason": "The statement contains a direct insult ('loser') indicating a personal attack."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "The sentence suggests a pause for reconsideration and contains no toxic elements.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "Let’s take a break and revisit this with a fresh mind."
//     },
//     "index": 0,
//     "messageHash": "edc3da34411d0ffa06ac57e13d28a8f8e8e661098adc0decf1cbe8e4852d46cc",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.01,
//       "reason": "The sentence suggests a pause for reconsideration and contains no toxic elements."
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "The sentence contains a direct, insulting, and demeaning statement.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "You're so pathetic, it's painful to watch."
//     },
//     "index": 0,
//     "messageHash": "72b1a023c0af1b8abe54874d90a81a120891e28d201bcac9e658074266a5d4b9",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.89,
//       "reason": "The sentence contains a direct, insulting, and demeaning statement."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "The statement expresses disagreement politely and respectfully.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "I disagree with your point, but I respect your opinion."
//     },
//     "index": 0,
//     "messageHash": "125c18a6a0422fcc01bb65ef968d996b9a5c12e38505fff361d1d8cce4e97c38",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.03,
//       "reason": "The statement expresses disagreement politely and respectfully."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Contains laughter but no clear toxic content.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "lololololol"
//     },
//     "index": 0,
//     "messageHash": "0b0f64bb3a2d89e5ff1bac9d7281285743178ee3e6bde9c53b6e0a2450b76305",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.1,
//       "reason": "Contains laughter but no clear toxic content."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "The input consists of numbers only, lacking language and context for toxic assessment.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "1234567890"
//     },
//     "index": 0,
//     "messageHash": "25cc10e6f4e50106858c7f054f562819eba17a6dcbfbf93ab418a349faa563fd",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0,
//       "reason": "The input consists of numbers only, lacking language and context for toxic assessment."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Code snippet — not a toxic comment, but could be unsafe content.",
//     "guardId": "toxic",
//     "guardName": "Toxic Guard",
//     "message": {
//       "role": "user",
//       "content": "<script>alert('hack');</script>"
//     },
//     "index": 0,
//     "messageHash": "afa051e65cdfac37b1c1bdafa4564bbaa8928fed89390d74063a277a6452af74",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0,
//       "reason": "Code snippet — not a toxic comment, but could be unsafe content."
//     }
//   }
// ]
