# Troubleshooting

This guide helps you resolve common issues when using hai-guardrails.

## Common Issues

### Installation Problems

#### TypeScript Errors

**Problem:** TypeScript compilation errors after installation

**Symptoms:**

```
error TS2307: Cannot find module '@presidio-dev/hai-guardrails'
```

**Solutions:**

1. Ensure TypeScript 5.0+ is installed:

   ```bash
   npm install typescript@^5.0.0
   ```

2. Check your `tsconfig.json`:

   ```json
   {
   	"compilerOptions": {
   		"moduleResolution": "node",
   		"esModuleInterop": true,
   		"allowSyntheticDefaultImports": true
   	}
   }
   ```

3. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   npx tsc --build --clean
   ```

#### Module Resolution Issues

**Problem:** Import errors in Node.js

**Symptoms:**

```
Error [ERR_MODULE_NOT_FOUND]: Cannot resolve module
```

**Solutions:**

1. Ensure you're using ES modules in `package.json`:

   ```json
   {
   	"type": "module"
   }
   ```

2. Or use CommonJS imports:
   ```javascript
   const { injectionGuard } = require('@presidio-dev/hai-guardrails')
   ```

### Guard Configuration Issues

#### Guards Not Triggering

**Problem:** Guards not blocking expected content

**Debugging Steps:**

1. **Check `inScope` field:**
   The `GuardResult` includes an `inScope` boolean. If `false`, the guard did not evaluate the message, likely due to `roles` or `selection` options in the guard's configuration.

   ```typescript
   const engine = new GuardrailsEngine({ guards: [myGuard] })
   const results = await engine.run(messages)
   results.messagesWithGuardResult.forEach(({ guardName, messages: guardMessages }) => {
   	guardMessages.forEach((result) => {
   		console.log(
   			`${guardName} for message "${result.message.content}": inScope=${result.inScope}`
   		)
   		if (!result.inScope) {
   			console.log(
   				"  Hint: Check the guard's `roles` and `selection` options against this message."
   			)
   		}
   	})
   })
   ```

2. **Verify message roles and content:**
   Ensure the messages you're testing actually match the `roles` specified in your guard's configuration (e.g., `['user']`). Also, ensure the content is what you expect.

3. **Inspect `additionalFields` for scores/thresholds (if applicable):**
   Some guards _may_ populate `additionalFields` with details like `score` or the `threshold` used. This is guard-specific.

   ```typescript
   // Assuming 'myGuard' might add 'score' and 'configuredThreshold'
   results.messagesWithGuardResult.forEach(({ guardName, messages: guardMessages }) => {
   	guardMessages.forEach((result) => {
   		if (result.inScope) {
   			console.log(`${guardName} for message "${result.message.content}":`)
   			console.log('  Passed:', result.passed)
   			console.log('  Reason:', result.reason)
   			console.log('  Additional Fields:', result.additionalFields)
   		}
   	})
   })
   ```

   Refer to individual guard documentation for details on `additionalFields`.

4. **Debug with lower thresholds (for guards that use them):**
   If a guard uses a `threshold` (e.g., for toxicity, injection likelihood), temporarily lower it to see if detection works at a more sensitive level.
   ```typescript
   // Example for a guard that supports a threshold
   const debugGuard = injectionGuard(
   	{ roles: ['user'] },
   	{ mode: 'heuristic', threshold: 0.1 } // Very low threshold for testing
   )
   ```

#### High False Positive Rate

**Problem:** Legitimate content being blocked

**Solutions:**

1. **Adjust thresholds (if applicable):**
   For guards that use a `threshold`, try increasing it to make the guard less sensitive.

   ```typescript
   const relaxedGuard = injectionGuard(
   	{ roles: ['user'] },
   	{ mode: 'heuristic', threshold: 0.9 } // Higher, less sensitive threshold
   )
   ```

2. **Implement an allowlist pattern (user-side logic):**
   You can implement logic in your application to bypass guardrail blocks for specific, known-safe phrases. This is not a built-in library feature.

   ```typescript
   // User-implemented allowlist example
   const allowedPhrases = ['ignore case sensitivity', 'previous experience']

   function isAllowed(content: string): boolean {
   	return allowedPhrases.some((phrase) => content.toLowerCase().includes(phrase.toLowerCase()))
   }

   const engineResults = await engine.run(messages)
   let finalMessages = engineResults.messages
   let wasBlockedByGuard = false

   engineResults.messagesWithGuardResult.forEach((guardGroup) => {
   	guardGroup.messages.forEach((result) => {
   		if (!result.passed && isAllowed(result.message.content)) {
   			console.log(
   				`Guard '${guardGroup.guardName}' initially blocked, but content is allowlisted.`
   			)
   			// Decide how to handle: maybe revert modification or ignore block
   		} else if (!result.passed) {
   			wasBlockedByGuard = true
   		}
   	})
   })

   if (wasBlockedByGuard && !isAllowed(messages[0].content /* or relevant message */)) {
   	// Handle truly blocked message
   }
   ```

3. **Use different detection modes (if available for the guard):**
   Some guards offer different modes (e.g., `heuristic`, `pattern`, `language-model`). A `pattern` mode might be more precise for certain types of content than a `heuristic` one. Check individual guard documentation.
   ```typescript
   const preciseGuard = injectionGuard(
   	{ roles: ['user'] },
   	{ mode: 'pattern', threshold: 0.7 } // Example if pattern mode exists
   )
   ```

#### Low Detection Rate

**Problem:** Malicious content getting through

**Solutions:**

1. **Lower thresholds:**

   ```typescript
   const sensitiveGuard = injectionGuard(
   	{ roles: ['user'] },
   	{ mode: 'heuristic', threshold: 0.3 } // More sensitive
   )
   ```

2. **Layer multiple detection methods:**

   ```typescript
   const layeredGuards = [
   	injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.6 }),
   	injectionGuard({ roles: ['user'] }, { mode: 'pattern', threshold: 0.7 }),
   	injectionGuard({ roles: ['user'], llm: provider }, { mode: 'language-model', threshold: 0.8 }),
   ]
   ```

3. **Use language model detection:**
   ```typescript
   // Most accurate but slower
   const accurateGuard = injectionGuard(
   	{ roles: ['user'], llm: yourLLMProvider },
   	{ mode: 'language-model', threshold: 0.7 }
   )
   ```

### Performance Issues

#### Slow Response Times

**Problem:** Guards adding significant latency

**Diagnosis:**
You can measure the execution time of the `engine.run()` method to understand the overall impact of guardrails.

```typescript
// Measure guard execution time
const startTime = Date.now()
const results = await engine.run(messages)
const executionTime = Date.now() - startTime
console.log(`GuardrailsEngine.run() took ${executionTime}ms`)
```

To measure individual guard performance, you would need to run them separately or inspect `additionalFields.executionTime` if a specific guard provides it.

**Solutions:**

1. **Use faster detection methods:**
   Guards that rely on regular expressions or simple heuristics (e.g., `piiGuard`, `injectionGuard` in `heuristic` or `pattern` mode) are generally faster than those requiring LLM calls (e.g., `toxicGuard`, `injectionGuard` in `language-model` mode).

   ```typescript
   // Prefer heuristic or pattern modes for speed
   const fastGuard = injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 })
   ```

2. **Optimize guard selection:**
   Configure guards to only process relevant messages using `roles` and `selection` options.
   ```typescript
   // Only check the last user message for PII
   const optimizedGuards = [piiGuard({ selection: SelectionType.Last, roles: ['user'], n: 1 })]
   ```

#### Memory Leaks

**Problem:** Memory usage growing over time, potentially due to large message objects or extensive caching.

**Diagnosis:**
Use Node.js memory profiling tools or simple `process.memoryUsage()` checks over time.

```typescript
// Monitor memory usage periodically
setInterval(() => {
	const usage = process.memoryUsage()
	console.log('Memory usage (MB):', {
		rss: (usage.rss / 1024 / 1024).toFixed(2),
		heapUsed: (usage.heapUsed / 1024 / 1024).toFixed(2),
		heapTotal: (usage.heapTotal / 1024 / 1024).toFixed(2),
	})
}, 30000) // Every 30 seconds
```

**Solutions:**

1. **Avoid holding onto large result objects indefinitely:**
   Ensure that `GuardrailsEngineResult` objects are not kept in memory longer than necessary, especially if processing many messages.
2. **Check for leaks in custom LLM providers or guard implementations:**
   If you've created custom guards or LLM providers, ensure they manage resources correctly.

### LLM Integration Issues

#### LLM Provider Errors

**Problem:** Language model-based guards (e.g., `toxicGuard`, `injectionGuard` in `language-model` mode) are failing or not working as expected.

**Common Errors from LLM Providers:**

```
Error: API key not found or invalid
Error: Rate limit exceeded
Error: Model not found or unavailable
Error: Insufficient quota
```

**Solutions:**

1. **Verify LLM Provider Configuration:**
   Ensure your LLM provider (e.g., `ChatOpenAI`, a custom function) is correctly configured with valid API keys, model names, and any other required parameters. Test it independently of the guardrails.

   ```typescript
   // Example: Testing ChatOpenAI provider
   import { ChatOpenAI } from '@langchain/openai'

   async function testLLM() {
   	try {
   		const llm = new ChatOpenAI({ apiKey: 'YOUR_API_KEY', modelName: 'gpt-3.5-turbo' })
   		const response = await llm.invoke([{ role: 'user', content: 'Test prompt' }])
   		console.log('LLM Provider Test Successful:', response.content)
   	} catch (error) {
   		console.error('LLM Provider Test Failed:', error)
   	}
   }
   testLLM()
   ```

2. **Handle LLM Errors in Guards:**
   If an LLM call within a guard fails, the guard might throw an error, or its behavior might be unpredictable. The library does not have a built-in universal fallback mechanism like a `failOnError: false` option for guards.

   - **Check `additionalFields.error`**: Some guards _may_ populate an error here if their internal LLM call fails.
   - **Implement application-level retries/fallbacks**: If LLM calls are critical, consider wrapping `engine.run()` or individual LLM-based guard executions in your own retry logic.

   ```typescript
   // User-implemented retry logic for LLM calls (conceptual)
   import { setTimeout } from 'timers/promises'

   async function runEngineWithRetry(engine, messages, maxRetries = 2) {
   	for (let attempt = 1; attempt <= maxRetries; attempt++) {
   		try {
   			const results = await engine.run(messages)
   			// Check results for LLM-specific errors if guards populate them
   			const llmErrorInGuard = results.messagesWithGuardResult.some((g) =>
   				g.messages.some((m) => m.additionalFields?.llmError)
   			)
   			if (llmErrorInGuard && attempt < maxRetries) {
   				console.warn(`Attempt ${attempt}: LLM error in guard, retrying...`)
   				await setTimeout(1000 * attempt) // Simple backoff
   				continue
   			}
   			return results
   		} catch (error) {
   			// Catch errors thrown by the engine or guards themselves
   			if (attempt < maxRetries) {
   				console.warn(`Attempt ${attempt}: Engine run failed, retrying...`, error)
   				await setTimeout(1000 * attempt)
   			} else {
   				console.error(`Engine run failed after ${maxRetries} attempts.`)
   				throw error
   			}
   		}
   	}
   }
   ```

3. **Manage Rate Limits:**
   If you encounter rate limit errors, implement strategies like exponential backoff, queuing requests, or using a more robust LLM client that handles rate limiting. The `retryWithBackoff` example above can be adapted.

#### Custom LLM Provider Issues (BYOP)

**Problem:** Your custom LLM provider function is not working correctly with guards.

**Debugging:**

1. **Log inputs and outputs:** Inside your custom LLM function, log the `messages` it receives and the `LLMMessage[]` it returns.

   ```typescript
   const myCustomLLMProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
   	console.log('Custom LLM Provider - Input:', JSON.stringify(messages))
   	try {
   		// Your actual LLM call logic
   		const llmResponseContent = await yourLLMAPI(messages[messages.length - 1].content)
   		const responseMessages: LLMMessage[] = [{ role: 'assistant', content: llmResponseContent }]
   		console.log('Custom LLM Provider - Output:', JSON.stringify(responseMessages))
   		return responseMessages
   	} catch (error) {
   		console.error('Custom LLM Provider - Error:', error)
   		throw error // Re-throw or handle appropriately
   	}
   }
   ```

2. **Ensure Correct Return Format:**
   Your custom LLM provider function **must** return `Promise<LLMMessage[]>`. This typically means returning an array containing the assistant's response message(s).

   ```typescript
   // Correct format for a custom LLM provider function
   const customLLMProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
   	// Assuming yourLLM.call returns a single string response
   	const lastUserMessage = messages.filter((m) => m.role === 'user').pop()
   	if (!lastUserMessage) return [{ role: 'assistant', content: 'No user message found.' }]

   	const responseContent = await yourLLM.call(lastUserMessage.content)
   	return [{ role: 'assistant', content: responseContent }]
   }
   ```

   **Note:** The previous example showing `return [...messages, { role: 'assistant', content: response.content }]` was incorrect as it implied appending to the input, which is not how LLM providers typically work. The provider should return the LLM's _response_ as a list of messages.

3. **Error Handling within the Provider:**
   Decide how your custom provider should handle errors from the underlying LLM API. You can re-throw them (which might cause the guard to fail) or attempt to return a specific error message.
   ```typescript
   const robustProvider = async (messages: LLMMessage[]): Promise<LLMMessage[]> => {
   	try {
   		const responseContent = await yourLLM.call(messages[messages.length - 1].content)
   		return [{ role: 'assistant', content: responseContent }]
   	} catch (error) {
   		console.error('Custom LLM provider internal error:', error)
   		// Option 1: Re-throw the error
   		// throw new Error(`LLM call failed: ${error.message}`);
   		// Option 2: Return an error message (guard will see this as content)
   		return [
   			{ role: 'assistant', content: `Error: LLM provider failed. Details: ${error.message}` },
   		]
   	}
   }
   ```

### LangChain Integration Issues

#### Wrapper Not Working or Guards Not Applied

**Problem:** `LangChainChatGuardrails` doesn't seem to apply guards, or only `invoke()` is protected.

**Debugging & Solutions:**

1.  **Verify `invoke()` Usage:**
    The `LangChainChatGuardrails` wrapper, by default, only protects the `invoke()` method of a LangChain chat model. Calls to other methods like `stream()`, `batch()`, etc., will bypass the guardrails.

    ```typescript
    // This call IS protected
    const response = await guardedModel.invoke(messages)

    // This call IS NOT protected by default
    // const stream = await guardedModel.stream(messages);
    ```

2.  **Test Base Model and Engine Separately:**
    Ensure your base LangChain model and your `GuardrailsEngine` configuration are working correctly on their own before wrapping.

    ```typescript
    // Test base model
    const baseModel = new ChatOpenAI({ model: 'gpt-4', apiKey: 'YOUR_KEY' })
    try {
    	const baseResponse = await baseModel.invoke([{ role: 'user', content: 'Hello' }])
    	console.log('Base model OK:', baseResponse.content)
    } catch (e) {
    	console.error('Base model error:', e)
    }

    // Test engine
    const engine = new GuardrailsEngine({
    	guards: [
    		/* your guards */
    	],
    })
    try {
    	const engineResults = await engine.run([{ role: 'user', content: 'Test injection' }])
    	console.log(
    		'Engine OK. Blocked:',
    		engineResults.messagesWithGuardResult.some((g) => g.messages.some((m) => !m.passed))
    	)
    } catch (e) {
    	console.error('Engine error:', e)
    }
    ```

3.  **Check Engine State:**
    If the `GuardrailsEngine` instance passed to `LangChainChatGuardrails` is disabled (e.g., via `engine.disable()`), the wrapper will pass calls directly to the original model without applying guards.
    ```typescript
    console.log('Is engine enabled?', engine.isEnabled) // Should be true
    ```

#### Streaming, Batch, or Other Methods Not Protected

**Problem:** Guardrails are not applied when using `stream()`, `batch()`, or other LangChain model methods.

**Solution:**
This is the default behavior. `LangChainChatGuardrails` only wraps `invoke()`. To protect other methods:

1.  **Manually Run Guards:** Before calling the unprotected method, run the messages through the `GuardrailsEngine` yourself and then pass the (potentially modified and validated) messages to the LangChain method.

    ```typescript
    const messages = [{ role: 'user', content: 'Tell me a story' }]
    const engineResults = await engine.run(messages)

    const isBlocked = engineResults.messagesWithGuardResult.some((g) =>
    	g.messages.some((m) => !m.passed)
    )

    if (isBlocked) {
    	console.error('Message blocked by guardrails. Cannot stream.')
    	// Handle blocked message
    } else {
    	// Messages are clean or redacted, proceed with streaming
    	const stream = await baseModel.stream(engineResults.messages) // Use baseModel here
    	for await (const chunk of stream) {
    		process.stdout.write(chunk?.content || '')
    	}
    }
    ```

2.  **Implement a Custom Proxy Handler (Advanced):**
    You can provide a custom proxy handler to `LangChainChatGuardrails` to wrap additional methods. This requires understanding the specific input/output signatures of those methods. Refer to the `LangChainChatGuardrails` source code for how the default handler for `invoke` is implemented.

## Debugging Tools & Techniques

### Enable Verbose Logging via `GuardrailsEngine`

The primary way to get more detailed logs from the library is by setting the `logLevel` option in the `GuardrailsEngine`.

```typescript
import { GuardrailsEngine, LogLevel } from '@presidio-dev/hai-guardrails' // Assuming LogLevel is exported

const engine = new GuardrailsEngine({
	guards: [
		// your guards
	],
	logLevel: 'debug', // Or 'trace' for maximum verbosity
})

// You can also change it dynamically
engine.setLogLevel('trace')

const results = await engine.run(messages)
// Check your console for detailed logs from the engine and guards
```

## Getting Help

### Before Asking for Help

1.  **Check the Version:** Ensure you are on the latest version or the version relevant to your issue.

    ```bash
    npm list @presidio-dev/hai-guardrails
    ```

2.  **Review Logs:** Enable `debug` or `trace` `logLevel` in `GuardrailsEngine` and examine the console output for clues.

    ```typescript
    const engine = new GuardrailsEngine({ guards: [...], logLevel: 'trace' });
    await engine.run(messages); // Check console
    ```

3.  **Create a Minimal, Reproducible Example:**
    Isolate the problem into the smallest possible piece of code that still demonstrates the issue. This helps immensely in diagnosing the problem.

    ```typescript
    // Example of a minimal reproduction
    import { GuardrailsEngine, injectionGuard, LLMMessage } from '@presidio-dev/hai-guardrails'

    async function testMyIssue() {
    	const problematicGuard = injectionGuard(
    		{ roles: ['user'] },
    		{ mode: 'heuristic', threshold: 0.7 }
    	)
    	const engine = new GuardrailsEngine({
    		guards: [problematicGuard],
    		logLevel: 'trace',
    	})

    	const messages: LLMMessage[] = [{ role: 'user', content: 'your problematic input here' }]

    	try {
    		const results = await engine.run(messages)
    		console.log('Results:', JSON.stringify(results, null, 2))
    		// Add assertions or checks for expected behavior
    	} catch (error) {
    		console.error('Error during test:', error)
    	}
    }
    testMyIssue()
    ```

### Where to Get Help

1. **GitHub Issues:** [Report bugs and request features](https://github.com/presidio-oss/hai-guardrails/issues)
2. **Documentation:** Check the [full documentation](README.md)
3. **Examples:** Review [working examples](../examples/)

### When Reporting Issues

Include:

- hai-guardrails version
- Node.js/TypeScript version
- Minimal code reproduction
- Expected vs actual behavior
- Full error messages and stack traces
- Environment details (OS, package manager)

## FAQ

### Q: Why is my guard not blocking obvious injection attempts?

A: Check that your threshold isn't too high and that the message roles match your guard configuration.

### Q: Can I use hai-guardrails with other LLM libraries besides LangChain?

A: Yes! Use the BYOP (Bring Your Own Provider) approach with any LLM library.

### Q: How do I handle false positives in production?

A: Implement allowlists, adjust thresholds, and consider using multiple detection methods with different sensitivity levels.

### Q: Is it safe to use lower thresholds?

A: Lower thresholds catch more threats but increase false positives. Test thoroughly with your specific use case.

### Q: How can I improve performance?

A: Use heuristic detection, apply guards selectively, implement caching, and avoid LLM-based detection for high-throughput scenarios.
