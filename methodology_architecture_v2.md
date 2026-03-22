# Retrieval-Shaped Architecture & Constrained Synthesis v2

## Purpose

This note describes a general architecture for producing high-coherence outputs from large language models in simulation, design, research, and synthesis tasks. It is a revision of an earlier methodology note that focused mainly on naming and worldbuilding. The underlying principle is broader:

**generic output is often not a knowledge failure; it is a routing failure.**

The model frequently contains access to richer cultural, structural, and semantic basins than a standard prompt will activate. The job of the surrounding architecture is to route the model into the correct basin, constrain what counts as admissible output, and preserve the resulting state.

This is not a theory of magical prompt wording. It is a systems pattern.

---

## The Core Problem: Restriction Prompting Backfires

A common failure mode in LLM use is **Top-Down Restriction Prompting**: large piles of "do not" instructions intended to suppress clichés, genericity, or undesirable defaults.

Examples:
- Do not use fantasy tropes.
- Do not make everyone an orphan.
- Do not be generic.
- Avoid cliché names.

In practice, this often fails. Heavy negative prompting tends to keep the model oriented around the very basin the user is trying to avoid. Even when the output avoids the literal prohibited token, it often remains semantically adjacent to the same broad attractor zone.

The result is familiar:
- flattened specificity
- sterile compliance
- “AI content” texture
- a simulation that feels signposted rather than lived-in

The point is not that negative constraints are useless. Some are necessary. The point is that **negative constraints are weak routing tools unless paired with stronger positive basin activation.**

---

## The Paradigm Shift: Empty Shelves vs. Lost Keys

When a model returns a generic or uninspired result, there are two broad possibilities:

1. **Empty shelves**: the model genuinely lacks enough usable knowledge for the task.
2. **Lost keys**: the model contains usable structure, but the prompt did not unlock the right basin.

Many practical failures are of the second type.

The model may contain relevant historical, linguistic, genre, regional, procedural, or stylistic structure, but a broad prompt activates the widest and most overused paths. The model then defaults to common tokens, common motifs, and high-probability stereotypes.

**Retrieval-shaped architecture treats prompt/context design as key-making.**

Instead of asking for “a gritty fantasy name,” “an interesting NPC,” or “a smart summary,” the system should route toward a specific neighborhood of possibility:

- 1830 -> Texas -> Tejano -> priest
- port city -> trade basin -> goblin apothecary -> scarcity economy
- campaign state -> party pressure -> local politics -> betrayal incentives
- uploaded dossier -> canonical facts -> bounded inference -> party scene

The important move is not ornamentation. It is **trajectory selection**.

---

## The Matured Architecture

The early version of this method used a three-layer split. The current form is better expressed as a four-part architecture.

## 1. Code / Systems Handle Combinatorics and Hard State

This layer manages what should not be left to free-form model improvisation:
- weighted randomization
- eligibility rules
- state transitions
- inventories
- demographics
- chronology
- availability
- explicit constraints
- hard world facts

This layer provides the scaffold. It defines the unfeeling reality of the situation.

The more the task depends on consistency, persistence, distribution, or formal rules, the more should live here.

## 2. Context / Prompting Handles Routing and Governance

This layer does more than "retrieval." It governs the semantic execution environment.

Its roles include:
- routing into the correct basin
- anchoring canonical source material
- defining role boundaries
- specifying epistemic rules
- setting priority order between sources
- establishing permitted inference scope
- clarifying output contract

This is where the system tells the model what kind of neighborhood it is in, what counts as truth, what may be inferred, and what must remain unresolved.

The prompt is not merely a request. It is a **routing and governance layer**.

## 3. Model Handles Structured Synthesis

The model should not be treated as the author of the entire world.

But neither should it be treated as a dead passive formatter.

The useful middle position is:

**the model is a bounded semantic resolver.**

Its job is to:
- reconstruct local logic within the activated basin
- integrate constraints into a coherent output
- render consequences of state and source material
- fill continuity gaps without rewriting the premises
- produce voice, texture, relation, and consequence under discipline

This preserves the load-bearing insight from the earlier note: the model works best when it is not inventing the entire ontology from scratch. But it updates the phrasing so the model is not reduced to a lifeless consequence printer. It is active, but locally active.

It does not decide the world. It **resolves within the world**.

## 4. Validation / State Update Handles Persistence and Correction

This layer checks the output and decides what survives.

It may include:
- schema validation
- contradiction checks
- provenance tagging
- confidence or certainty mode
- canon update rules
- memory writes
- evaluator passes
- rejection or reroll logic

This layer matters because even well-routed synthesis can drift. Without validation and persistence, high-quality single-turn outputs still decay across time.

---

## Source Hierarchy

One of the biggest causes of drift is unclear priority between sources. The architecture should define a hierarchy explicitly.

A typical order might look like this:

1. **Canonical source documents / user-supplied files**
2. **Hard state generated by code or system logic**
3. **Explicit task constraints and output contract**
4. **Prompt heuristics and stylistic framing**
5. **Model defaults and prior tendencies**

This ordering matters.

If the hierarchy is not explicit, the model will often substitute its own broad defaults where source-grounded reasoning should have prevailed.

---

## Structured Intermediate Derivation

The earlier note described a “hidden reasoning field.” The deeper principle is more general:

**force derivation before final rendering.**

Do not jump directly from prompt to polished answer when the task depends on reconstruction.

Insert an intermediate layer such as:
- derivation fields
- rationale summaries
- provenance slots
- basin-selection tags
- validation booleans
- tradition reconstruction fields
- latent-factor checklists

Examples:
- Before generating a name, reconstruct the naming tradition.
- Before writing a party scene, reconstruct each character’s motive and point of intersection.
- Before producing a summary, classify source priority and ambiguity.
- Before generating an NPC, reconstruct local social pressures, species norms, and region-specific patterns.

The derivation layer may be hidden from the final user-facing surface, but that is implementation detail. The actual requirement is that the model **must traverse an explicit reconstruction step** before it renders the final artifact.

---

## Uncertainty Tagging

Not all outputs have the same ontological status. The system should say so.

Useful tags might include:
- **ATTESTED**
- **DOCUMENTED VARIANT**
- **MORPHEME-CONSTRUCTED**
- **INFERRED FROM STATE**
- **STYLE-BOUND SYNTHESIS**
- **AMBIGUOUS / UNRESOLVED**

The goal is not bureaucratic clutter. The goal is epistemic clarity.

A system that distinguishes sourced fact, constrained inference, and constructed interpolation will stay healthier over time than one that flattens everything into the same tone of certainty.

---

## Why the “Passive Consequence Engine” Framing Was Almost Right

The earlier note said the LLM “simply renders the consequences.” That formulation was load-bearing because it suppressed a bad habit: letting the model silently author premises, fill in world logic arbitrarily, and drift back toward provider-default role priors.

That instinct was good.

But stated too strongly, the phrase risks two distortions:

1. It makes the model sound more passive than it really is.
2. It may encourage sterile outputs by under-describing the model’s active job in local reconstruction.

The better formulation is:

**The model should not author the world; it should actively resolve within a routed world.**

Or more compactly:

**bounded semantic resolver**

This keeps the anti-drift benefit of the original frame while admitting that the model still contributes interpolation, texture, compression, emphasis, and voice.

---

## Negotiated Emergence

When the architecture is working, the result is neither pure code output nor unconstrained model invention.

It is **negotiated emergence**.

- The system supplies scaffold and state.
- The prompt/context routes and governs.
- The model reconstructs and resolves.
- The validator decides what persists.

The resulting artifacts feel placed rather than dropped in. They become causally situated, historically loaded, and locally coherent.

This is how a generated result stops feeling like “content” and starts feeling like canon, state, or genuine consequence.

---

## Failure Modes

A mature method should name its own failure cases.

### 1. Wrong Basin Activation
The prompt routes to the wrong neighborhood of meaning. Output may still be coherent, but coherent in the wrong way.

### 2. Overconstraint
The system becomes so tight that the model cannot reconstruct anything vivid. Output is dry, brittle, and overly literal.

### 3. Thin Scaffold
Too much is left unspecified, forcing the model to backfill world logic from defaults.

### 4. Decorative Derivation
The intermediate layer exists, but does not meaningfully constrain final output. It becomes ritual rather than mechanism.

### 5. Source Hierarchy Collapse
The model prioritizes stylistic or generic defaults over canonical documents or system state.

### 6. State Drift
Single-turn outputs look good, but continuity degrades across turns because persistence and correction are weak.

### 7. False Confidence
The system emits authoritative-seeming outputs without tagging uncertainty or provenance.

---

## Portability Across Domains

This architecture is not limited to fantasy naming.

It applies to:
- NPC and character generation
- campaign simulation
- party formation logic
- life-sim systems
- canon extraction
- dossier synthesis
- document summarization
- agent workflows
- client-context rendering
- research synthesis
- embodied or robotic planning systems where language must resolve within external state

The surface task changes. The architecture does not.

---

## Practical Rule Set

1. Do not rely on negative prompting as the primary anti-generic mechanism.
2. Route toward specific basins before generation begins.
3. Externalize combinatorics, state, and hard facts whenever possible.
4. Treat prompt/context as a governance layer, not just a text request.
5. Force structured derivation before polished output.
6. Define source hierarchy explicitly.
7. Tag uncertainty instead of silently patching ambiguity.
8. Validate outputs and persist state deliberately.
9. Use the model as a bounded semantic resolver, not as the author of the ontology.
10. Judge success by causal placement, continuity, and specificity, not just surface fluency.

---

## Condensed Thesis

**High-coherence LLM systems emerge when combinatorics and hard state are externalized, context is used to route into the correct semantic basin, the model is constrained to resolve within that basin rather than author the world from scratch, and validation/state layers decide what persists.**

That is retrieval-shaped architecture in its matured form.
