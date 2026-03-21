const { getModel, getAllModels, getModelIds } = require("./pricing");

/**
 * Calculate cost for a single API request.
 */
function calculateCost(modelId, inputTokens, outputTokens, { batch = false } = {}) {
  const model = getModel(modelId);
  if (!model) {
    return { error: `Unknown model: ${modelId}` };
  }

  let inputRate = model.input_per_mtok;
  let outputRate = model.output_per_mtok;
  let pricingType = "standard";

  if (batch) {
    if (model.batch_input_per_mtok != null && model.batch_output_per_mtok != null) {
      inputRate = model.batch_input_per_mtok;
      outputRate = model.batch_output_per_mtok;
      pricingType = "batch";
    } else {
      pricingType = "standard (batch not available)";
    }
  }

  const inputCost = (inputTokens / 1_000_000) * inputRate;
  const outputCost = (outputTokens / 1_000_000) * outputRate;
  const totalCost = inputCost + outputCost;

  return {
    model: modelId,
    model_name: model.name,
    provider: model.provider,
    pricing_type: pricingType,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    input_cost_usd: round(inputCost),
    output_cost_usd: round(outputCost),
    total_cost_usd: round(totalCost),
    rates: {
      input_per_mtok: inputRate,
      output_per_mtok: outputRate,
    },
  };
}

/**
 * Estimate monthly cost based on daily usage patterns.
 */
function estimateMonthly(modelId, requestsPerDay, avgInputTokens, avgOutputTokens, { batch = false, days = 30 } = {}) {
  const model = getModel(modelId);
  if (!model) {
    return { error: `Unknown model: ${modelId}` };
  }

  const singleCost = calculateCost(modelId, avgInputTokens, avgOutputTokens, { batch });
  if (singleCost.error) return singleCost;

  const dailyCost = singleCost.total_cost_usd * requestsPerDay;
  const monthlyCost = dailyCost * days;
  const totalRequests = requestsPerDay * days;
  const totalInputTokens = avgInputTokens * totalRequests;
  const totalOutputTokens = avgOutputTokens * totalRequests;

  return {
    model: modelId,
    model_name: model.name,
    provider: model.provider,
    pricing_type: singleCost.pricing_type,
    usage: {
      requests_per_day: requestsPerDay,
      days,
      total_requests: totalRequests,
      avg_input_tokens: avgInputTokens,
      avg_output_tokens: avgOutputTokens,
      total_input_tokens: totalInputTokens,
      total_output_tokens: totalOutputTokens,
    },
    cost: {
      per_request_usd: singleCost.total_cost_usd,
      daily_usd: round(dailyCost),
      monthly_usd: round(monthlyCost),
      yearly_estimate_usd: round(monthlyCost * 12),
    },
  };
}

/**
 * Compare all models for the same workload, sorted cheapest first.
 */
function compareModels(inputTokens, outputTokens, { batch = false, providers = null } = {}) {
  const modelIds = getModelIds();
  const results = [];

  for (const id of modelIds) {
    const model = getModel(id);
    if (providers && providers.length > 0 && !providers.includes(model.provider)) {
      continue;
    }

    const cost = calculateCost(id, inputTokens, outputTokens, { batch });
    if (!cost.error) {
      results.push(cost);
    }
  }

  results.sort((a, b) => a.total_cost_usd - b.total_cost_usd);

  const cheapest = results[0];
  const mostExpensive = results[results.length - 1];

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    models_compared: results.length,
    cheapest: cheapest
      ? { model: cheapest.model, cost_usd: cheapest.total_cost_usd }
      : null,
    most_expensive: mostExpensive
      ? { model: mostExpensive.model, cost_usd: mostExpensive.total_cost_usd }
      : null,
    savings_vs_most_expensive:
      cheapest && mostExpensive
        ? {
            absolute_usd: round(mostExpensive.total_cost_usd - cheapest.total_cost_usd),
            percentage: mostExpensive.total_cost_usd > 0
              ? round(((mostExpensive.total_cost_usd - cheapest.total_cost_usd) / mostExpensive.total_cost_usd) * 100)
              : 0,
          }
        : null,
    comparison: results,
  };
}

/**
 * Find cheapest model(s) that fit within a budget per request.
 */
function findCheapest(inputTokens, outputTokens, { budget = null, providers = null } = {}) {
  const comparison = compareModels(inputTokens, outputTokens, { providers });
  let eligible = comparison.comparison;

  if (budget != null) {
    eligible = eligible.filter((m) => m.total_cost_usd <= budget);
  }

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    budget_usd: budget,
    models_within_budget: eligible.length,
    recommendations: eligible.slice(0, 5),
  };
}

/**
 * Estimate token count from text.
 * Rough heuristic: ~4 characters per token for English text.
 * This is a simplification; actual tokenizers vary by model.
 */
function estimateTokens(text) {
  if (!text || typeof text !== "string") {
    return { error: "Text is required" };
  }

  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const estimatedTokens = Math.ceil(charCount / 4);

  // Also compute cost estimates for a few popular models
  const sampleModels = ["gpt-4o-mini", "claude-sonnet-4", "gemini-2.0-flash"];
  const costSamples = {};
  for (const id of sampleModels) {
    const cost = calculateCost(id, estimatedTokens, 0);
    if (!cost.error) {
      costSamples[id] = {
        input_cost_usd: cost.input_cost_usd,
      };
    }
  }

  return {
    text_length: charCount,
    word_count: wordCount,
    estimated_tokens: estimatedTokens,
    method: "chars/4 (English heuristic)",
    note: "Actual token counts vary by model tokenizer. Use provider-specific tokenizers for precise counts.",
    sample_input_costs: costSamples,
  };
}

function round(value, decimals = 8) {
  return parseFloat(value.toFixed(decimals));
}

module.exports = {
  calculateCost,
  estimateMonthly,
  compareModels,
  findCheapest,
  estimateTokens,
};
