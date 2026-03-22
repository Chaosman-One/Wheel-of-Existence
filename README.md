# Wheel of Existence

A probabilistic life-path simulator built as a single React artifact with the Anthropic Claude API. It generates entire human lives — birth to death — grounded in specific places, specific years, specific material realities.

The interesting part isn't the game. It's the architecture underneath it.

## What It Does

You roll dice. The dice determine where and when a person is born: continent, country, settlement, year, household, body. Five strain axes — Resource, Care, Institution, Health, Mobility — track the structural pressures on the life. Each tick, a D1000 roll determines what happens: a Miracle (2–25) eases pressure, a Crush (975–999) breaks something, and the vast Standard Load interior (151–750) is where most of life happens — maintenance, friction, small gains, slow erosion.

Claude generates the narrative for each tick. Not fiction. Not summary. Dense, material, sensory prose grounded in what daily life actually feels like in that specific city in that specific year: the transit, the food economy, the bureaucratic texture, the weather, the costs. The model's own training knowledge about place-year intersections is the product.

When strain thresholds cross, the player (called the Witness) chooses a posture — Anchor, Invest, Endure, Risk, or Withdraw — and the life pivots. When a non-Health strain hits 100, the life doesn't end; it suffers a structural crisis (Destitution, Isolation, Structural Rupture, Confinement) that resets the axis and cascades damage into others. Health 100 is the only terminal condition.

The simulation runs until death. Export produces a complete life record.

## The Architecture That Matters

The simulator is built on a four-layer architecture described in `docs/methodology_architecture_v2.md`. The short version:

**Layer 1 — Code handles combinatorics and hard state.** Weighted rolls, strain math, eligibility rules, demographics, historical validation (year-aware city/country renaming), phase transitions, crisis resolution. This layer defines the unfeeling reality of the situation. The model never touches it.

**Layer 2 — Context handles routing and governance.** The prompt isn't a request — it's a semantic execution environment. System prompts define a 5-tier source hierarchy (state card > hard code state > fact packet anchors > model training knowledge > model defaults), inference boundaries, specificity mandates, and output contracts. The key mechanism is the **recall bridge**: a `sceneContext` field the model must fill before writing the narrative, forcing it to reconstruct place-year material texture from its own knowledge before committing to prose.

**Layer 3 — The model resolves within a routed world.** It doesn't author the world. It doesn't decide what happened. It renders the consequences of state within the activated semantic basin. The phrase for this is "bounded semantic resolver."

**Layer 4 — Validation and persistence.** `checkRecallBridgeQuality()` detects when the recall bridge is decorative rather than functional (>60% word overlap with packet anchors). `checkEntityReuse()` validates that the model actually uses the KNOWN WORLD block rather than inventing parallel characters. `compressTickSummary()` distills each tick into a continuity anchor. Provenance tagging tracks whether each tick used API or local data.

### Retrieval-Shaped Prompting (RSP)

The core insight: **generic output is usually a routing failure, not a knowledge failure.** The model contains deep knowledge about what Kazan felt like in 1972 or what Belo Horizonte's bureaucracy looked like in 1995. A generic prompt activates the broadest, most overused paths. A routed prompt — anchored with specific material, institutional, and seasonal seeds — activates the right neighborhood of meaning.

Negative prompting ("don't be generic," "avoid clichés") keeps the model oriented around the basin you're trying to escape. RSP replaces it with positive basin activation: give the model specific seeds, force a retrieval step, and let it fill the space above the floor with its own place-year knowledge.

### Fact Packets

Each tick generates a structured fact packet for the city-year intersection: macro context (political/economic conditions as felt at household level), material anchors (specific foods, transit, costs, objects), institutional anchors (specific offices, schools, clinics by their real local names), seasonal texture, and year-specific detail. When the API is available, Claude generates these from its training data. When it isn't — or when the simulation crosses the knowledge horizon (2025) — a local fallback engine provides thick bucket data for 10 countries across multiple eras.

The fact packet is the **floor**, not the ceiling. The prompt tells the model to seed with these anchors, then layer in whatever it knows about that specific place-year.

### Entity Persistence

Named characters, places, and events introduced by the model are captured in a `knownEntities` array on the state card, ranked by importance (3 = central, 2 = recurring, 1 = passing). The KNOWN WORLD block is injected into every prompt. Stale entities — those unreferenced for multiple ticks — are flagged with warnings so the model sees what it's been neglecting.

The model must declare which known entities it referenced (`referencedEntities` field), and a cross-check validates this declaration against actual name presence in the text.

## Running It

The artifact is a single JSX file designed to run inside any React environment that supports the Anthropic API.

**Inside Claude.ai:** Upload `WheelOfExistence.jsx` as a React artifact. The API key is handled transparently — no configuration needed.

**Standalone:** The landing page includes an API key input field. Paste your Anthropic API key (sk-ant-...). It's stored in React state only — never logged, never persisted, never sent anywhere except api.anthropic.com. Without a key, all paths fall back to the local narrative engine, which produces structurally sound but less textured output.

**Requirements:** An Anthropic API key with access to `claude-sonnet-4-20250514`. The key must have the `anthropic-dangerous-direct-browser-access` header enabled for browser-based API calls.

## File Structure

```
WheelOfExistence.jsx     — Complete source (single-file React artifact)
docs/
  methodology_architecture_v2.md  — The general architecture pattern (RSP, four layers)
CHANGELOG.md             — Version history from v4.2.0 through v4.11.0
```

## The Methodology Is the Point

The Wheel of Existence is one implementation. The architecture is general. The same four-layer pattern — externalize combinatorics, route with context, constrain the model to resolve within the routed world, validate and persist — applies to any domain where you need high-coherence LLM output: character generation, campaign simulation, document synthesis, agent workflows, research pipelines.

The methodology doc (`docs/methodology_architecture_v2.md`) describes the pattern in its matured form. The changelog traces how it was discovered through iteration. The simulator is the proof that it works.

## License

MIT

## Author

Wake (whayconkilby@outlook.com)
Built in collaboration with Claude (Anthropic) across approximately five months of iterative development.
