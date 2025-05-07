# LangChain Chat with HAI Guardrails

A simple CLI chat application that demonstrates how **easily** you can integrate HAI Guardrails with LangChain to create a secure and responsible AI chat experience.

## Overview

This example application showcases:

- Building a command-line chat interface using LangChain and Google's Generative AI (Gemini model)
- **Seamlessly integrating** HAI Guardrails with LangChain in just a few lines of code
- Implementing PII (Personally Identifiable Information) and Secret guards to enhance security with minimal effort

## Prerequisites

- [Bun](https://bun.sh/) runtime environment
- Google API key for Gemini model access

## Setup

1. Clone the repository and navigate to this example:

```bash
cd examples/apps/langchain-chat
```

2. Install dependencies:

```bash
bun install
```

3. Install the HAI Guardrails package:

```bash
bun add @presidio-dev/hai-guardrails
```

4. Create a `.env` file with your Google API key:

```bash
cp .env.example .env
```

5. Edit the `.env` file and add your Google API key:

```
GOOGLE_API_KEY=your-google-api-key
```

## Running the Application

Start the chat application:

```bash
bun run index.ts
```

You'll be presented with a CLI chat interface where you can interact with the AI assistant. Type `exit` to quit the application.

## How It Works

### Chat Implementation

The application creates a simple chat interface in the terminal using Node.js's readline module. It maintains a chat history and sends messages to the LLM for processing.

### HAI Guardrails Integration - Simple and Powerful

This example demonstrates how **effortlessly** you can integrate HAI Guardrails with LangChain. With just a few lines of code, you can add robust security features to your LLM applications:

```typescript
import { GuardrailsEngine, makePIIGuard, makeSecretGuard } from '@presidio-dev/hai-guardrails'
import { LangChainChatGuardrails } from '@presidio-dev/hai-guardrails'

// 1. Create a guardrails engine with your desired guards
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

// 2. Wrap your LangChain model with guardrails - just one line!
const llmWithGuardrails = LangChainChatGuardrails(model, guardRailsEngine)

// 3. Use the protected model exactly like you would use the original model
// No changes needed to your existing code!
```

The integration adds two important security features with minimal code changes:

1. **PII Guard**: Prevents the model from revealing personally identifiable information
2. **Secret Guard**: Blocks the exposure of sensitive information like API keys, passwords, etc.

#### Why This Integration Is So Easy

- **Drop-in Replacement**: The guardrails-wrapped model is a drop-in replacement for your original LangChain model
- **No Changes to Existing Code**: Your application code remains the same after adding guardrails
- **Declarative Configuration**: Simply declare which guards you want to enable

## Security Features

The guardrails in this example provide:

- Protection against accidental exposure of sensitive user information
- Prevention of credential leakage
- Enhanced compliance with privacy regulations

## Customization

You can modify the guards or add additional ones by updating the `guardRailsEngine` configuration in `index.ts`. Refer to the HAI Guardrails documentation for more guard types and configuration options.

## Learn More

- [HAI Guardrails](https://github.com/presidio-oss/hai-guardrails)
