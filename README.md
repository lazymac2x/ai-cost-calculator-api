<p align="center"><img src="logo.png" width="120" alt="logo"></p>

[![lazymac API Store](https://img.shields.io/badge/lazymac-API%20Store-blue?style=flat-square)](https://lazymac2x.github.io/lazymac-api-store/) [![Gumroad](https://img.shields.io/badge/Buy%20on-Gumroad-ff69b4?style=flat-square)](https://coindany.gumroad.com/) [![MCPize](https://img.shields.io/badge/MCP-MCPize-green?style=flat-square)](https://mcpize.com/mcp/ai-cost-calculator-api)

# AI Cost Calculator API

**The world's first AI model cost estimation API.**

Calculate, compare, and optimize your AI spending across every major provider -- Anthropic, OpenAI, Google, Meta, and Mistral -- with a single API call.

No other product does this. Every AI startup, developer, and enterprise building on LLMs needs to understand and control their costs. This API makes that trivial.

## Why This Exists

- There is no unified API to calculate AI model costs across providers.
- Pricing pages are scattered, inconsistent, and change frequently.
- Developers waste hours building internal cost-tracking spreadsheets.
- Finance teams have no programmatic way to forecast AI budgets.

This API solves all of that.

## Features

- **Instant cost calculation** for any model + token count
- **Monthly cost estimation** from daily usage patterns
- **Cross-provider comparison** sorted cheapest-first with savings analysis
- **Budget-aware model finder** -- find the best model under your cost ceiling
- **Token estimation** from raw text
- **Batch vs standard pricing** where providers offer discounts
- **MCP server** for integration with AI assistants (Claude, etc.)
- **15 models** across 5 providers, updated regularly

## Quick Start

```bash
npm install
npm start
# Server runs on http://localhost:5000
```

## API Endpoints

### Calculate Cost
```bash
curl -X POST http://localhost:5000/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4","input_tokens":1000,"output_tokens":500}'
```

### Monthly Estimate
```bash
curl -X POST http://localhost:5000/api/v1/estimate \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4o","requests_per_day":1000,"avg_input_tokens":2000,"avg_output_tokens":500}'
```

### Compare All Models
```bash
curl -X POST http://localhost:5000/api/v1/compare \
  -H "Content-Type: application/json" \
  -d '{"input_tokens":5000,"output_tokens":1000}'
```

### Find Cheapest Model
```bash
curl "http://localhost:5000/api/v1/cheapest?input_tokens=1000&output_tokens=500&budget=0.01"
```

### List All Models
```bash
curl http://localhost:5000/api/v1/models
```

### List by Provider
```bash
curl http://localhost:5000/api/v1/models/anthropic
```

### Estimate Tokens from Text
```bash
curl -X POST http://localhost:5000/api/v1/tokens \
  -H "Content-Type: application/json" \
  -d '{"text":"How much would it cost to process this sentence?"}'
```

## MCP Server

Use with Claude Desktop or any MCP-compatible client:

```json
{
  "mcpServers": {
    "ai-cost-calculator": {
      "command": "node",
      "args": ["src/mcp-server.js"]
    }
  }
}
```

## Supported Models

| Provider | Model | Input $/MTok | Output $/MTok |
|----------|-------|-------------|---------------|
| Anthropic | Claude Opus 4 | $15.00 | $75.00 |
| Anthropic | Claude Sonnet 4 | $3.00 | $15.00 |
| Anthropic | Claude Haiku 3.5 | $0.80 | $4.00 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| OpenAI | GPT-4o Mini | $0.15 | $0.60 |
| OpenAI | GPT-4 Turbo | $10.00 | $30.00 |
| OpenAI | o1 | $15.00 | $60.00 |
| OpenAI | o3-mini | $1.10 | $4.40 |
| Google | Gemini 2.0 Flash | $0.10 | $0.40 |
| Google | Gemini 1.5 Pro | $1.25 | $5.00 |
| Meta | Llama 3.1 405B | $3.00 | $3.00 |
| Meta | Llama 3.1 70B | $0.70 | $0.80 |
| Mistral | Mistral Large | $2.00 | $6.00 |
| Mistral | Mistral Small | $0.20 | $0.60 |

## Docker

```bash
docker build -t ai-cost-calculator-api .
docker run -p 5000:5000 ai-cost-calculator-api
```

## License

MIT
