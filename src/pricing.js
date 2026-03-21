/**
 * AI Model Pricing Database
 * Last updated: 2026-03-21
 *
 * Prices are in USD per 1 million tokens (MTok).
 * batch_input / batch_output are discounted prices for batch API calls where available.
 */

const PRICING_VERSION = "2026-03-21";

const models = {
  // ─── Anthropic ────────────────────────────────────────────
  "claude-opus-4": {
    provider: "anthropic",
    name: "Claude Opus 4",
    input_per_mtok: 15.0,
    output_per_mtok: 75.0,
    batch_input_per_mtok: 7.5,
    batch_output_per_mtok: 37.5,
    context_window: 200000,
    max_output: 32000,
    category: "flagship",
    description: "Most capable Anthropic model for complex reasoning and analysis",
  },
  "claude-sonnet-4": {
    provider: "anthropic",
    name: "Claude Sonnet 4",
    input_per_mtok: 3.0,
    output_per_mtok: 15.0,
    batch_input_per_mtok: 1.5,
    batch_output_per_mtok: 7.5,
    context_window: 200000,
    max_output: 64000,
    category: "balanced",
    description: "Best balance of performance and cost for most tasks",
  },
  "claude-haiku-3.5": {
    provider: "anthropic",
    name: "Claude Haiku 3.5",
    input_per_mtok: 0.8,
    output_per_mtok: 4.0,
    batch_input_per_mtok: 0.4,
    batch_output_per_mtok: 2.0,
    context_window: 200000,
    max_output: 8192,
    category: "fast",
    description: "Fastest and most affordable Anthropic model",
  },

  // ─── OpenAI ───────────────────────────────────────────────
  "gpt-4o": {
    provider: "openai",
    name: "GPT-4o",
    input_per_mtok: 2.5,
    output_per_mtok: 10.0,
    batch_input_per_mtok: 1.25,
    batch_output_per_mtok: 5.0,
    context_window: 128000,
    max_output: 16384,
    category: "flagship",
    description: "OpenAI flagship multimodal model",
  },
  "gpt-4o-mini": {
    provider: "openai",
    name: "GPT-4o Mini",
    input_per_mtok: 0.15,
    output_per_mtok: 0.6,
    batch_input_per_mtok: 0.075,
    batch_output_per_mtok: 0.3,
    context_window: 128000,
    max_output: 16384,
    category: "fast",
    description: "Small and affordable model for lightweight tasks",
  },
  "gpt-4-turbo": {
    provider: "openai",
    name: "GPT-4 Turbo",
    input_per_mtok: 10.0,
    output_per_mtok: 30.0,
    batch_input_per_mtok: 5.0,
    batch_output_per_mtok: 15.0,
    context_window: 128000,
    max_output: 4096,
    category: "legacy",
    description: "Previous generation GPT-4 with vision capabilities",
  },
  o1: {
    provider: "openai",
    name: "o1",
    input_per_mtok: 15.0,
    output_per_mtok: 60.0,
    batch_input_per_mtok: 7.5,
    batch_output_per_mtok: 30.0,
    context_window: 200000,
    max_output: 100000,
    category: "reasoning",
    description: "Advanced reasoning model for complex problems",
  },
  "o3-mini": {
    provider: "openai",
    name: "o3-mini",
    input_per_mtok: 1.1,
    output_per_mtok: 4.4,
    batch_input_per_mtok: 0.55,
    batch_output_per_mtok: 2.2,
    context_window: 200000,
    max_output: 100000,
    category: "reasoning",
    description: "Cost-efficient reasoning model",
  },

  // ─── Google ───────────────────────────────────────────────
  "gemini-2.0-flash": {
    provider: "google",
    name: "Gemini 2.0 Flash",
    input_per_mtok: 0.1,
    output_per_mtok: 0.4,
    batch_input_per_mtok: null,
    batch_output_per_mtok: null,
    context_window: 1048576,
    max_output: 8192,
    category: "fast",
    description: "Ultra-fast and ultra-cheap Google model with 1M context",
  },
  "gemini-1.5-pro": {
    provider: "google",
    name: "Gemini 1.5 Pro",
    input_per_mtok: 1.25,
    output_per_mtok: 5.0,
    batch_input_per_mtok: null,
    batch_output_per_mtok: null,
    context_window: 2097152,
    max_output: 8192,
    category: "flagship",
    description: "Google flagship model with 2M token context window",
  },

  // ─── Meta (via API providers) ─────────────────────────────
  "llama-3.1-405b": {
    provider: "meta",
    name: "Llama 3.1 405B",
    input_per_mtok: 3.0,
    output_per_mtok: 3.0,
    batch_input_per_mtok: null,
    batch_output_per_mtok: null,
    context_window: 131072,
    max_output: 4096,
    category: "flagship",
    description: "Largest open-source model, hosted via third-party providers",
  },
  "llama-3.1-70b": {
    provider: "meta",
    name: "Llama 3.1 70B",
    input_per_mtok: 0.7,
    output_per_mtok: 0.8,
    batch_input_per_mtok: null,
    batch_output_per_mtok: null,
    context_window: 131072,
    max_output: 4096,
    category: "balanced",
    description: "High-performance open-source model at competitive pricing",
  },

  // ─── Mistral ──────────────────────────────────────────────
  "mistral-large": {
    provider: "mistral",
    name: "Mistral Large",
    input_per_mtok: 2.0,
    output_per_mtok: 6.0,
    batch_input_per_mtok: null,
    batch_output_per_mtok: null,
    context_window: 128000,
    max_output: 8192,
    category: "flagship",
    description: "Mistral flagship model for complex tasks",
  },
  "mistral-small": {
    provider: "mistral",
    name: "Mistral Small",
    input_per_mtok: 0.2,
    output_per_mtok: 0.6,
    batch_input_per_mtok: null,
    batch_output_per_mtok: null,
    context_window: 128000,
    max_output: 8192,
    category: "fast",
    description: "Efficient model for simple, high-volume tasks",
  },
};

const providers = {
  anthropic: {
    name: "Anthropic",
    website: "https://anthropic.com",
    api_docs: "https://docs.anthropic.com",
  },
  openai: {
    name: "OpenAI",
    website: "https://openai.com",
    api_docs: "https://platform.openai.com/docs",
  },
  google: {
    name: "Google",
    website: "https://ai.google.dev",
    api_docs: "https://ai.google.dev/docs",
  },
  meta: {
    name: "Meta",
    website: "https://ai.meta.com",
    api_docs: "https://llama.meta.com",
  },
  mistral: {
    name: "Mistral",
    website: "https://mistral.ai",
    api_docs: "https://docs.mistral.ai",
  },
};

function getModel(modelId) {
  return models[modelId] || null;
}

function getAllModels() {
  return models;
}

function getModelsByProvider(provider) {
  const result = {};
  for (const [id, model] of Object.entries(models)) {
    if (model.provider === provider) {
      result[id] = model;
    }
  }
  return result;
}

function getProviders() {
  return providers;
}

function getModelIds() {
  return Object.keys(models);
}

module.exports = {
  PRICING_VERSION,
  models,
  providers,
  getModel,
  getAllModels,
  getModelsByProvider,
  getProviders,
  getModelIds,
};
