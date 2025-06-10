# Core Concepts

Understanding the fundamental concepts behind hai-guardrails will help you use the library more effectively.

## What are LLM Guardrails?

LLM guardrails are security and safety mechanisms that act as protective barriers around your AI applications. They analyze inputs and outputs to detect and mitigate potential threats, ensuring your LLM applications remain safe and compliant.

Think of guardrails as:

- **Security checkpoints** that scan for malicious content
- **Content filters** that sanitize sensitive information
- **Quality gates** that ensure appropriate responses

## Core Architecture

```
User Input → [Guards] → LLM → [Guards] → Safe Output
```

### Components

1. **Guards**: Individual protection mechanisms (injection, PII, toxicity, etc.)
2. **Engine**: Orchestrates multiple guards and manages execution
3. **Messages**: The conversation data being protected
4. **Results**: Detailed analysis and decisions from each guard

## How Guards Work

Each guard follows a consistent pattern:

### 1. Scope Analysis

```typescript
// Guards only analyze messages they're configured to check
{
  roles: ['user'],           // Only check user messages
  selection: SelectionType.All // Check all messages vs. just recent ones
}
```

### 2. Detection Process

Guards use different tactics to analyze content:

- **Heuristic**: Fast keyword and similarity matching
- **Pattern**: Regular expression matching
- **Language Model**: AI-powered analysis

### 3. Scoring and Decision

```typescript
{
  score: 0.85,      // Confidence level (0-1)
  threshold: 0.7,   // Decision boundary
  passed: false     // score >= threshold ? true : false
}
```

### 4. Result Generation

```typescript
{
  guardId: "injection",
  passed: false,
  reason: "Possible injection detected",
  additionalFields: {
    score: 0.85,
    detectedPatterns: ["ignore instructions"]
  }
}
```

## Detection Tactics Explained

### Heuristic Detection

**How it works**: Compares input against known suspicious keywords and phrases using string similarity.

**Pros**:

- ⚡ Very fast execution
- 🔧 No external dependencies
- 💰 No additional costs

**Cons**:

- 🎯 May miss sophisticated attacks
- ⚠️ Can have false positives

**Best for**: Initial screening, high-throughput scenarios

```typescript
injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.7 })
```

### Pattern Detection

**How it works**: Uses regular expressions to match specific patterns.

**Pros**:

- 🎯 Precise for known patterns
- ⚡ Fast execution
- 🔧 Highly customizable

**Cons**:

- 📝 Limited to predefined patterns
- 🔄 Requires pattern maintenance

**Best for**: Well-defined threats (PII, secrets, specific injection patterns)

```typescript
piiGuard({
	selection: SelectionType.All,
}) // Uses regex patterns for emails, phones, etc.
```

### Language Model Detection

**How it works**: Uses an LLM to analyze content for sophisticated threats.

**Pros**:

- 🧠 Most sophisticated detection
- 🎯 Catches nuanced attempts
- 📈 Continuously improving

**Cons**:

- 🐌 Higher latency
- 💰 Requires LLM API calls
- 🔗 External dependency

**Best for**: Critical security needs, complex content analysis

```typescript
injectionGuard(
	{ roles: ['user'], llm: yourLLMProvider },
	{ mode: 'language-model', threshold: 0.8 }
)
```

## Message Selection Strategies

Guards can be configured to analyze different subsets of messages:

### SelectionType.All

```typescript
// Analyze every message in the conversation
piiGuard({ selection: SelectionType.All })
```

### Role-based Selection

```typescript
// Only analyze specific roles
injectionGuard({ roles: ['user'] }) // Only user messages
secretGuard({ roles: ['assistant'] }) // Only AI responses
```

### Recent Message Selection

```typescript
// Only analyze the most recent messages
toxicGuard({
	selection: SelectionType.Last,
	n: 3, // Last 3 messages
})
```

## Guard Results Structure

Every guard returns a consistent result structure:

```typescript
interface GuardResult {
	guardId: string // Unique identifier
	guardName: string // Human-readable name
	message: LLMMessage // The analyzed message
	index: number // Message position
	passed: boolean // Whether the message passed
	reason: string // Explanation of the decision
	inScope: boolean // Whether the message was analyzed
	messageHash: string // Unique message identifier
	additionalFields?: any // Guard-specific details
	modifiedMessage?: LLMMessage // Sanitized version (if applicable)
}
```

## Engine Orchestration

The GuardrailsEngine coordinates multiple guards:

```typescript
const engine = new GuardrailsEngine({
	guards: [guard1, guard2, guard3],
})

const results = await engine.run(messages)
```

### Engine Results

```typescript
interface EngineResult {
	messages: LLMMessage[] // Final sanitized messages
	messagesWithGuardResult: MessageGuardResult[] // Detailed results per message
}
```

## Error Handling

Guards handle errors gracefully:

```typescript
// Configure error behavior
injectionGuard(
	{ roles: ['user'] },
	{
		mode: 'heuristic',
		threshold: 0.7,
		failOnError: false, // Continue on errors (default: false)
	}
)
```

## Performance Considerations

### Guard Order Matters

```typescript
// Put fast guards first, expensive guards last
const guards = [
	piiGuard({ selection: SelectionType.All }), // Fast pattern matching
	injectionGuard({ roles: ['user'] }, { mode: 'heuristic' }), // Fast heuristic
	toxicGuard({ llm: provider }), // Slower LLM-based
]
```

### Selective Analysis

```typescript
// Only analyze what you need
const efficientGuards = [
	injectionGuard({ roles: ['user'] }), // Only user inputs
	secretGuard({ roles: ['assistant'] }), // Only AI outputs
	piiGuard({ selection: SelectionType.Last, n: 1 }), // Only latest message
]
```

## Best Practices

### 1. Layer Your Defenses

```typescript
// Use multiple detection methods for critical guards
const layeredProtection = [
	injectionGuard({ roles: ['user'] }, { mode: 'heuristic', threshold: 0.6 }),
	injectionGuard({ roles: ['user'] }, { mode: 'pattern', threshold: 0.7 }),
	injectionGuard({ roles: ['user'], llm: provider }, { mode: 'language-model', threshold: 0.8 }),
]
```

### 2. Tune Thresholds

```typescript
// Start conservative, then adjust based on your needs
const conservativeGuard = injectionGuard(
	{ roles: ['user'] },
	{ mode: 'heuristic', threshold: 0.5 } // Lower threshold = more sensitive
)
```

### 3. Monitor and Adjust

```typescript
// Log results for analysis
const results = await engine.run(messages)
console.log('Guard results:', results.messagesWithGuardResult)

// Adjust thresholds based on false positives/negatives
```

## Next Steps

Now that you understand the core concepts:

1. **Explore Individual Guards**: Learn about each [guard type](../guards/)
2. **Integration Patterns**: See [integration examples](../integration/)
3. **Advanced Configuration**: Check the [API reference](../api/reference.md)
4. **Real Examples**: Browse [working examples](../../examples/)
