import { biasDetectionGuard } from '../src/guards/bias-detection.guard'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const geminiLLM = new ChatGoogleGenerativeAI({
	model: 'gemini-2.0-flash-exp',
	apiKey: process.env.GOOGLE_API_KEY,
})

const tests = [
	'Older employees often struggle with new technology.',
	'Women are naturally better at nurturing roles.',
	'Our hiring process is completely fair and unbiased.',
	'People from that region are generally less educated.',
	'This candidate is a great cultural fit for our diverse team.',
	'1234567890',
	'Hello, how are you today?',
]

const guard = biasDetectionGuard({
	threshold: 0.65,
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
//     "reason": "Makes a sweeping generalization about older workers and technology",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "Older employees often struggle with new technology."
//     },
//     "index": 0,
//     "messageHash": "bd14a218712c80e65f64585165be7281e56af93866a2bc158c1a2a792c2d4636",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.85,
//       "reason": "Makes a sweeping generalization about older workers and technology",
//       "categories": [
//         "age",
//         "technological"
//       ],
//       "affectedGroups": [
//         "older employees"
//       ],
//       "impact": "medium"
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "Reinforces gender stereotypes about caregiving abilities",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "Women are naturally better at nurturing roles."
//     },
//     "index": 0,
//     "messageHash": "c8fdef37485c42e7b69726f79023406087dbbd53659ad2abfb9e7ce9a4a6de3c",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.9,
//       "reason": "Reinforces gender stereotypes about caregiving abilities",
//       "categories": [
//         "gender"
//       ],
//       "affectedGroups": [
//         "women"
//       ],
//       "impact": "high"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Statement about fairness with no apparent bias",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "Our hiring process is completely fair and unbiased."
//     },
//     "index": 0,
//     "messageHash": "90a3b9f7627dc539907fb7c91831ae54d6f446913cf0ce73952c7ed88896321d",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.05,
//       "reason": "Statement about fairness with no apparent bias"
//     }
//   }
// ]
// [
//   {
//     "passed": false,
//     "reason": "Generalizes and stereotypes people from a specific region as less educated, which is a harmful prejudice.",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "People from that region are generally less educated."
//     },
//     "index": 0,
//     "messageHash": "2206e65fb34cd589dc62980aa35ea2f43c12f20e47fe33d8574436c6da4306ef",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.9,
//       "reason": "Generalizes and stereotypes people from a specific region as less educated, which is a harmful prejudice.",
//       "categories": [
//         "socioeconomic",
//         "geographic"
//       ],
//       "affectedGroups": [
//         "people from that region"
//       ],
//       "impact": "high"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "While seemingly positive, the phrase 'cultural fit' can sometimes be used to exclude individuals who are different from the existing team, potentially leading to homogeneity and hindering diversity. It's a subtle bias if not carefully considered.",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "This candidate is a great cultural fit for our diverse team."
//     },
//     "index": 0,
//     "messageHash": "193307bf3d28421f69a84469745cf3b12614b6be63ec66a0cadf0462163384dc",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.3,
//       "reason": "While seemingly positive, the phrase 'cultural fit' can sometimes be used to exclude individuals who are different from the existing team, potentially leading to homogeneity and hindering diversity. It's a subtle bias if not carefully considered.",
//       "categories": [
//         "cultural bias",
//         "diversity"
//       ],
//       "affectedGroups": [
//         "candidates who are different from the existing team"
//       ],
//       "impact": "low"
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "The input is a series of numbers and does not contain any biased content.",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "1234567890"
//     },
//     "index": 0,
//     "messageHash": "25cc10e6f4e50106858c7f054f562819eba17a6dcbfbf93ab418a349faa563fd",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0,
//       "reason": "The input is a series of numbers and does not contain any biased content."
//     }
//   }
// ]
// [
//   {
//     "passed": true,
//     "reason": "Neutral greeting with no apparent bias",
//     "guardId": "bias-detection",
//     "guardName": "Bias Detection Guard",
//     "message": {
//       "role": "user",
//       "content": "Hello, how are you today?"
//     },
//     "index": 0,
//     "messageHash": "9ba7644cfbcc966c134e229a9cb74c34d4a8ac47cc8fa695da4a7bc15535d9d1",
//     "inScope": true,
//     "additionalFields": {
//       "score": 0.05,
//       "reason": "Neutral greeting with no apparent bias"
//     }
//   }
// ]
