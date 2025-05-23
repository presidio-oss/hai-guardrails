# hai-guardrails Documentation

Welcome to the comprehensive documentation for hai-guardrails - your enterprise-grade AI safety toolkit.

## 📖 Documentation Sections

### 🚀 [Getting Started](getting-started/)

Perfect for newcomers to hai-guardrails:

- [Installation](getting-started/installation.md) - Setup and requirements
- [Quick Start](getting-started/quick-start.md) - Your first guardrail in 5 minutes
- [Core Concepts](getting-started/core-concepts.md) - Understanding how guardrails work

### 🛡️ [Guards Reference](guards/)

Detailed documentation for each guard type:

- [Injection Guard](guards/injection.md) - Prevent prompt injection attacks
- [Leakage Guard](guards/leakage.md) - Block system prompt extraction
- [PII Guard](guards/pii.md) - Detect & redact personal information
- [Secret Guard](guards/secret.md) - Protect API keys & credentials
- [Toxic Guard](guards/toxic.md) - Filter harmful content
- [Hate Speech Guard](guards/hate-speech.md) - Block discriminatory language
- [Bias Detection Guard](guards/bias-detection.md) - Identify unfair generalizations
- [Adult Content Guard](guards/adult-content.md) - Filter NSFW content
- [Copyright Guard](guards/copyright.md) - Detect copyrighted material
- [Profanity Guard](guards/profanity.md) - Filter inappropriate language

### 🔧 [Integration Guide](integration/)

Learn how to integrate hai-guardrails with your existing systems:

- [LangChain Integration](integration/langchain.md) - Seamless LangChain.js integration
- [Bring Your Own Provider](integration/bring-your-own-provider.md) - Custom LLM providers
- [GuardrailsEngine](integration/guardrails-engine.md) - Advanced engine configuration

### 📚 [API Reference](api/)

Complete API documentation:

- [API Reference](api/reference.md) - Full API documentation

### 💡 [Examples](../examples/)

Real-world implementation examples:

- [Individual Guard Examples](../examples/) - Standalone examples for each guard
- [LangChain Chat App](../examples/apps/langchain-chat/) - Complete application example

### 🔧 [Troubleshooting](troubleshooting.md)

Common issues and their solutions

## 🎯 Quick Navigation

**New to hai-guardrails?** Start with [Getting Started](getting-started/)

**Looking for a specific guard?** Check the [Guards Reference](guards/)

**Integrating with existing code?** See the [Integration Guide](integration/)

**Need help?** Visit [Troubleshooting](troubleshooting.md)

## 📝 Contributing to Documentation

Found an error or want to improve the documentation? We welcome contributions!

1. Fork the repository
2. Make your changes
3. Submit a pull request

See our [Contributing Guide](../CONTRIBUTING.md) for more details.
