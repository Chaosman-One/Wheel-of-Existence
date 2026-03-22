# Changelog

All versions documented here were developed iteratively through conversation between Wake and Claude (Anthropic). Each entry represents decisions that emerged from testing, failed, survived, and were formalized into code.

## v4.11.0 — Entity Validation

Layer 4 applied to entity persistence — validating that the KNOWN WORLD block is mechanism, not ritual.

- `checkEntityReuse()` diagnostic detecting when the model ignores known entities (importance ≥2 unreferenced across multiple ticks)
- Entity staleness tracking: `introducedAge` and `lastReferencedAge` stamped on all entities, updated via text-presence detection in `UPDATE_NARRATIVE`
- `formatKnownWorld()` now flags stale entities with ⚠ markers so the prompt actively reminds the model of neglected characters/places
- `referencedEntities` audit field added to narrative JSON output contract — model must declare which KNOWN WORLD entities it used (forced derivation for continuity)
- Cross-check validation: model's declared references vs actual name presence in text, logged as phantom declarations or under-reporting
- Birth entity seeding fix: birth prompt now explicitly requires entity extraction with CRITICAL instruction. Fallback extraction API call fires when birth returns <2 entities from substantial text — prevents empty entity graph at tick 1

## v4.10.0 — Entity Persistence

- `knownEntities` array on state card captures named characters, places, and events with importance ranking (3=central, 2=recurring, 1=passing)
- Third `entities` field added to narrative JSON output contract
- `parseNarrativeResponse` returns `{narrative, entities}` across all 4 parser tiers
- `UPDATE_NARRATIVE` merges entities by name (higher importance wins, capped at 25)
- `formatKnownWorld()` injects KNOWN WORLD block into tick, posture, and crisis prompts
- Model instructed to prefer existing characters over inventing new ones for the same narrative role
- Addresses the state drift failure mode identified in the v2 architecture doc

## v4.9.1 — Crisis Context Fix

- Crisis narrative now receives `recent` entries from the narrative log, including the just-resolved triggering tick
- Provider crisis prompt includes IMMEDIATE CONTEXT block showing the last 2 entries so the crisis reads as continuation, not disconnected event

## v4.9.0 — Strain Crises

Non-terminal structural rupture system for all five strain axes. Health 100 remains the only terminal.

- Resource 100 → Destitution Crisis, Care 100 → Isolation Crisis, Institution 100 → Structural Rupture, Mobility 100 → Confinement Crisis
- Each crisis resets the triggering strain and cascades damage into other axes
- `resolveStrainCrises()` runs between pressure application and terminal check — cascade into Health 100 is lethal, making the causal chain visible
- Crisis entries with full RSP narrative generation
- Crises force pressure breaks
- Red border + STRUCTURAL CRISIS badge in UI

## v4.8.0 — Voice Refinement

System prompt audit against RSP methodology.

- Itemized inference MAY list removed (was creating formulaic returns), replaced with wide-latitude framing
- Restriction prompt flipped: "may NOT introduce" → "MAY introduce WITH state card support" (positive basin)
- Specificity mandate kept specific but introduced "such as" language for selection randomness
- Ledger voice fixed: grounding sentence rewritten from accounting register to lived-experience register
- Miracle/Crush rewritten from syntactic mechanics to felt-world register
- Recall bridge instruction sanded
- Formatting restrictions removed from all system prompts

## v4.7.1 — Knowledge Horizon

- `KNOWLEDGE_HORIZON = 2025` constant gating API calls for both packets and narrative past the model's training data
- Local fallback handles all post-horizon ticks
- One-time `⌛ Knowledge Horizon` notification injected into narrative log when a life crosses the line
- Architecturally aligned with RSP v2: empty shelves acknowledged, not papered over

## v4.7.0 — Layer 4: Validation & Persistence

- `compressTickSummary()` for deterministic tick distillation
- Evolving `continuityAnchor` in `UPDATE_NARRATIVE` reducer with FIFO trim (~600 chars, birth context always preserved)
- `LIFE SO FAR` block feeding compressed life arc into tick and posture prompts
- `packetSource` provenance tagging (api/local) through `getFactPacket` → dispatch → entry metadata → export record
- `checkRecallBridgeQuality()` diagnostic detecting decorative derivation when sceneContext word overlap with packet anchors exceeds 60%

## v4.6.0 — RSP v2 Governance + Intensity Gradient

- Explicit 5-tier source hierarchy added to system prompt (state card → hard code state → packet anchors → training knowledge → model defaults)
- Inference boundaries defining what the model may freely introduce vs. what requires state card support
- `getRollIntensity()` converting D1000 into continuous 0.0–1.0 gradient with fine-grained descriptors — Standard Load interior split into 4 distinct registers instead of 1
- `getPressureDeltas` intensity-modulated so roll position biases magnitude ranges
- Uncertainty piping from packet metadata into tick and posture prompts (high/medium/low confidence governs inference scope)

## v4.5.0 — RSP Pass 3

- `PACKET_SYSTEM_PROMPT` rewritten with `placeRecall` recall bridge — model reconstructs city-year knowledge before generating structured anchors
- `ROLE_CONTEXT` data structure: 10 countries × 5 developmental stages × era/class modifiers
- `getRoleContext()` replaces flat role labels with retrieval keys like "Young adult navigating License Raj employment"
- `buildPacket` parser hardened with newline sanitization

## v4.4.0 — RSP Pass 1 + Pass 2

- All negative prompting purged from `NARRATIVE_SYSTEM_PROMPT` and replaced with positive retrieval constraints
- `sceneContext` parametric recall bridge installed — model must reconstruct place-year material texture before committing to prose
- JSON output format with 4-tier `parseNarrativeResponse` (direct parse → newline sanitization → regex extraction → raw text fallback)
- Birth narrative API call added with full RSP architecture, replacing the hardcoded template
- Race-condition-safe name replacement via `birthPlaceholderName` in `UPDATE_BIRTH_NARRATIVE` reducer

## v4.3.0 — Enriched Local Fallback

- Packet buckets expanded from 4 countries to 10 (added India, Nigeria, China, Egypt, US, UK)
- Material anchors per bucket doubled from 3 to 6–8
- `seasonalTexture` and `yearSpecificDetail` piped through local packets
- `localNarrativeFromPacket` rewritten with 2-anchor rotation, stale-checking against recent entries, and multiple template variants per weight class
- `localPostureNarrative` upgraded to match

## v4.2.0 — Enriched Local Fallback (Initial)

Starting point for this version history. Core systems operational: weighted demographic rolls, 5-axis strain model, phase-based tick pacing, local narrative templates, basic API integration.
