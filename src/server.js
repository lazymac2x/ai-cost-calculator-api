const express = require("express");
const cors = require("cors");
const { PRICING_VERSION, getAllModels, getModelsByProvider, getProviders } = require("./pricing");
const { calculateCost, estimateMonthly, compareModels, findCheapest, estimateTokens } = require("./calculator");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// ─── Health / Info ──────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    name: "AI Cost Calculator API",
    version: "1.0.0",
    description: "The world's first AI model cost estimation API. Calculate, compare, and optimize AI spending across all major providers.",
    pricing_data_version: PRICING_VERSION,
    endpoints: {
      calculate: "POST /api/v1/calculate",
      estimate: "POST /api/v1/estimate",
      compare: "POST /api/v1/compare",
      cheapest: "GET  /api/v1/cheapest?input_tokens=N&output_tokens=N&budget=N",
      models: "GET  /api/v1/models",
      models_by_provider: "GET  /api/v1/models/:provider",
      tokens: "POST /api/v1/tokens",
    },
    providers: Object.keys(getProviders()),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", pricing_version: PRICING_VERSION });
});

// ─── POST /api/v1/calculate ─────────────────────────────────
app.post("/api/v1/calculate", (req, res) => {
  const { model, input_tokens, output_tokens, batch } = req.body;

  if (!model) return res.status(400).json({ error: "model is required" });
  if (input_tokens == null || output_tokens == null) {
    return res.status(400).json({ error: "input_tokens and output_tokens are required" });
  }
  if (typeof input_tokens !== "number" || typeof output_tokens !== "number") {
    return res.status(400).json({ error: "input_tokens and output_tokens must be numbers" });
  }
  if (input_tokens < 0 || output_tokens < 0) {
    return res.status(400).json({ error: "Token counts must be non-negative" });
  }

  const result = calculateCost(model, input_tokens, output_tokens, { batch: !!batch });
  if (result.error) return res.status(404).json(result);

  res.json(result);
});

// ─── POST /api/v1/estimate ──────────────────────────────────
app.post("/api/v1/estimate", (req, res) => {
  const { model, requests_per_day, avg_input_tokens, avg_output_tokens, batch, days } = req.body;

  if (!model) return res.status(400).json({ error: "model is required" });
  if (!requests_per_day || !avg_input_tokens || !avg_output_tokens) {
    return res.status(400).json({ error: "requests_per_day, avg_input_tokens, and avg_output_tokens are required" });
  }

  const result = estimateMonthly(model, requests_per_day, avg_input_tokens, avg_output_tokens, {
    batch: !!batch,
    days: days || 30,
  });
  if (result.error) return res.status(404).json(result);

  res.json(result);
});

// ─── POST /api/v1/compare ───────────────────────────────────
app.post("/api/v1/compare", (req, res) => {
  const { input_tokens, output_tokens, batch, providers } = req.body;

  if (input_tokens == null || output_tokens == null) {
    return res.status(400).json({ error: "input_tokens and output_tokens are required" });
  }

  const result = compareModels(input_tokens, output_tokens, {
    batch: !!batch,
    providers: providers || null,
  });

  res.json(result);
});

// ─── GET /api/v1/cheapest ───────────────────────────────────
app.get("/api/v1/cheapest", (req, res) => {
  const input_tokens = parseInt(req.query.input_tokens);
  const output_tokens = parseInt(req.query.output_tokens);
  const budget = req.query.budget ? parseFloat(req.query.budget) : null;
  const providers = req.query.providers ? req.query.providers.split(",") : null;

  if (isNaN(input_tokens) || isNaN(output_tokens)) {
    return res.status(400).json({ error: "input_tokens and output_tokens query params are required" });
  }

  const result = findCheapest(input_tokens, output_tokens, { budget, providers });
  res.json(result);
});

// ─── GET /api/v1/models ─────────────────────────────────────
app.get("/api/v1/models", (_req, res) => {
  const all = getAllModels();
  const formatted = {};
  for (const [id, model] of Object.entries(all)) {
    formatted[id] = {
      ...model,
      pricing: {
        input_per_mtok: model.input_per_mtok,
        output_per_mtok: model.output_per_mtok,
        batch_input_per_mtok: model.batch_input_per_mtok,
        batch_output_per_mtok: model.batch_output_per_mtok,
      },
    };
  }
  res.json({
    pricing_version: PRICING_VERSION,
    total_models: Object.keys(formatted).length,
    providers: Object.keys(getProviders()),
    models: formatted,
  });
});

// ─── GET /api/v1/models/:provider ───────────────────────────
app.get("/api/v1/models/:provider", (req, res) => {
  const provider = req.params.provider.toLowerCase();
  const providerList = getProviders();

  if (!providerList[provider]) {
    return res.status(404).json({
      error: `Unknown provider: ${provider}`,
      available_providers: Object.keys(providerList),
    });
  }

  const models = getModelsByProvider(provider);
  res.json({
    provider: providerList[provider],
    total_models: Object.keys(models).length,
    models,
  });
});

// ─── POST /api/v1/tokens ────────────────────────────────────
app.post("/api/v1/tokens", (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: "text field is required" });

  const result = estimateTokens(text);
  if (result.error) return res.status(400).json(result);

  res.json(result);
});

// ─── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found. Visit / for available endpoints." });
});

// ─── Error handler ──────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`AI Cost Calculator API running on port ${PORT}`);
  console.log(`Pricing data version: ${PRICING_VERSION}`);
  console.log(`http://localhost:${PORT}`);
});

module.exports = app;
