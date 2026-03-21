#!/usr/bin/env node

/**
 * MCP (Model Context Protocol) Server for AI Cost Calculator
 * Exposes cost calculation tools via stdin/stdout JSON-RPC.
 */

const { calculateCost, estimateMonthly, compareModels, findCheapest, estimateTokens } = require("./calculator");
const { getAllModels, getModelsByProvider, getProviders, PRICING_VERSION } = require("./pricing");

const SERVER_INFO = {
  name: "ai-cost-calculator",
  version: "1.0.0",
};

const TOOLS = [
  {
    name: "calculate_cost",
    description: "Calculate the cost of a single AI API request for a specific model and token count",
    inputSchema: {
      type: "object",
      properties: {
        model: { type: "string", description: "Model ID (e.g. claude-sonnet-4, gpt-4o)" },
        input_tokens: { type: "number", description: "Number of input tokens" },
        output_tokens: { type: "number", description: "Number of output tokens" },
        batch: { type: "boolean", description: "Use batch pricing if available", default: false },
      },
      required: ["model", "input_tokens", "output_tokens"],
    },
  },
  {
    name: "estimate_monthly",
    description: "Estimate monthly cost based on daily usage patterns",
    inputSchema: {
      type: "object",
      properties: {
        model: { type: "string", description: "Model ID" },
        requests_per_day: { type: "number", description: "Average requests per day" },
        avg_input_tokens: { type: "number", description: "Average input tokens per request" },
        avg_output_tokens: { type: "number", description: "Average output tokens per request" },
        batch: { type: "boolean", default: false },
        days: { type: "number", description: "Number of days in billing period", default: 30 },
      },
      required: ["model", "requests_per_day", "avg_input_tokens", "avg_output_tokens"],
    },
  },
  {
    name: "compare_models",
    description: "Compare costs across all AI models for the same workload, sorted cheapest first",
    inputSchema: {
      type: "object",
      properties: {
        input_tokens: { type: "number", description: "Number of input tokens" },
        output_tokens: { type: "number", description: "Number of output tokens" },
        batch: { type: "boolean", default: false },
        providers: {
          type: "array",
          items: { type: "string" },
          description: "Filter by providers (e.g. ['openai', 'anthropic'])",
        },
      },
      required: ["input_tokens", "output_tokens"],
    },
  },
  {
    name: "find_cheapest",
    description: "Find the cheapest AI model(s) that fit within an optional budget",
    inputSchema: {
      type: "object",
      properties: {
        input_tokens: { type: "number", description: "Number of input tokens" },
        output_tokens: { type: "number", description: "Number of output tokens" },
        budget: { type: "number", description: "Maximum cost in USD per request" },
      },
      required: ["input_tokens", "output_tokens"],
    },
  },
  {
    name: "estimate_tokens",
    description: "Estimate token count from text input",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Text to estimate tokens for" },
      },
      required: ["text"],
    },
  },
  {
    name: "list_models",
    description: "List all available AI models with their pricing information",
    inputSchema: {
      type: "object",
      properties: {
        provider: { type: "string", description: "Filter by provider name (optional)" },
      },
    },
  },
];

function handleToolCall(name, args) {
  switch (name) {
    case "calculate_cost":
      return calculateCost(args.model, args.input_tokens, args.output_tokens, { batch: args.batch });
    case "estimate_monthly":
      return estimateMonthly(args.model, args.requests_per_day, args.avg_input_tokens, args.avg_output_tokens, {
        batch: args.batch,
        days: args.days || 30,
      });
    case "compare_models":
      return compareModels(args.input_tokens, args.output_tokens, {
        batch: args.batch,
        providers: args.providers,
      });
    case "find_cheapest":
      return findCheapest(args.input_tokens, args.output_tokens, { budget: args.budget });
    case "estimate_tokens":
      return estimateTokens(args.text);
    case "list_models":
      if (args.provider) {
        return { provider: args.provider, models: getModelsByProvider(args.provider) };
      }
      return { pricing_version: PRICING_VERSION, models: getAllModels() };
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function sendResponse(id, result) {
  const response = {
    jsonrpc: "2.0",
    id,
    result,
  };
  process.stdout.write(JSON.stringify(response) + "\n");
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: "2.0",
    id,
    error: { code, message },
  };
  process.stdout.write(JSON.stringify(response) + "\n");
}

function handleMessage(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      sendResponse(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
      });
      break;

    case "notifications/initialized":
      // No response needed
      break;

    case "tools/list":
      sendResponse(id, { tools: TOOLS });
      break;

    case "tools/call": {
      const { name, arguments: args } = params;
      const result = handleToolCall(name, args || {});
      const isError = result && result.error;
      sendResponse(id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        isError: !!isError,
      });
      break;
    }

    default:
      sendError(id, -32601, `Method not found: ${method}`);
  }
}

// ─── stdin line reader ──────────────────────────────────────
let buffer = "";
process.stdin.setEncoding("utf-8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop(); // keep incomplete line in buffer
  for (const line of lines) {
    if (line.trim()) {
      try {
        handleMessage(JSON.parse(line));
      } catch (e) {
        sendError(null, -32700, "Parse error");
      }
    }
  }
});

process.stderr.write("AI Cost Calculator MCP server started\n");
