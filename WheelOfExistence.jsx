import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";

// Wheel of Existence — v4.11.0 — Axiom Core
// - strain-axis semantics
// - canonical vs display location separation
// - year-aware place naming
// - local fact packet layer (used as SEED FLOOR, not ceiling)
// - async narrative queue fix
// - terminal death fix
// - ANTHROPIC API integration via provider adapter seam
// - culturally authentic name generation via Claude
// - SPECIFICITY PROMPT ARCHITECTURE: packets seed the frame,
//   model's own place-year knowledge provides texture
// - explicit repetition avoidance across recent entries
// - local fallback on all API paths
// - lightweight self-tests for core logic
// v4.3.0: ENRICHED LOCAL FALLBACK — thick bucket data for 10 countries,
//   seasonalTexture + yearSpecificDetail piped through local packets,
//   2-anchor rotation with stale-check against recent narrative,
//   richer local prose templates with multiple variants per weight class
// v4.4.0: RETRIEVAL-SHAPED PROMPTING (RSP) —
//   PASS 1: purged all negative prompting from NARRATIVE_SYSTEM_PROMPT,
//   replaced with positive retrieval constraints (every sentence earns
//   its place through physical objects, costs, distances, sensory texture),
//   installed parametric recall bridge (sceneContext) forcing the model
//   to reconstruct place-year material texture before committing to prose,
//   JSON output format with sceneContext stripped from display,
//   4-tier parseNarrativeResponse with newline sanitization + regex fallback
//   PASS 2: birth narrative API call with full RSP architecture,
//   replacing the hardcoded template with Sonnet-rendered arrival prose,
//   race-condition-safe name replacement in UPDATE_BIRTH_NARRATIVE reducer
//   PASS 3: placeRecall recall bridge in PACKET_SYSTEM_PROMPT forcing
//   the model to reconstruct city-year knowledge before generating anchors,
//   getRoleContext() replacing flat role labels with country/era/class-aware
//   retrieval keys (10 countries × 5 developmental stages × era/class modifiers),
//   newline-sanitized buildPacket JSON parser matching narrative parser hardening
// v4.6.0: RSP v2 ALIGNMENT — GOVERNANCE + INTENSITY GRADIENT
//   source hierarchy (5-tier) and inference boundaries in NARRATIVE_SYSTEM_PROMPT,
//   getRollIntensity() converting D1000 into continuous pressure gradient with
//   fine-grained descriptors as retrieval keys (4 distinct registers within
//   Standard Load instead of 1 flat label), intensity-modulated Standard Load
//   deltas in getPressureDeltas (roll position biases probability thresholds
//   and magnitude ranges), uncertainty piping from packet metadata into tick
//   and posture prompts (high/medium/low confidence governs model inference scope)
// v4.7.0: LAYER 4 — VALIDATION & PERSISTENCE
//   compressTickSummary() for deterministic tick distillation (metadata + first
//   sentence → ~100 char summary), evolving continuityAnchor in UPDATE_NARRATIVE
//   reducer (FIFO trim at ~600 chars, birth context always preserved), LIFE SO FAR
//   block in tick and posture prompts feeding compressed life arc to Sonnet,
//   packetSource provenance tagging (api|local) through getFactPacket → dispatch →
//   entry metadata → export record, checkRecallBridgeQuality() diagnostic detecting
//   decorative derivation when sceneContext word overlap with packet anchors >60%
// v4.7.1: KNOWLEDGE HORIZON — KNOWLEDGE_HORIZON constant (2025) gates API
//   calls for both packets and narrative, preventing model confabulation past
//   training data. Local fallback handles all post-horizon ticks. One-time
//   horizon-crossing notification injected into narrative log. Architecturally
//   aligned with RSP v2: empty shelves are acknowledged, not papered over.
// v4.8.0: VOICE REFINEMENT — system prompt audit against RSP methodology.
//   Inference boundaries sanded: removed itemized MAY list (was creating formulaic
//   returns) replaced with wide-latitude framing. Restriction prompt flipped:
//   "may NOT introduce" → "MAY introduce WITH state card support" (positive basin).
//   Specificity mandate kept specific but introduced "such as" language for
//   selection randomness. Fixed ledger voice: grounding sentence rewritten from
//   accounting-register ("cost, distance, named institution") to lived-experience
//   register ("whatever is truest to the moment"). Miracle/Crush rewritten from
//   syntactic mechanics ("opens syntactic space/closes like doors") to felt-world
//   register ("city opened a door/world shrinks to what is in front of the body").
//   "not by label" → "only through the prose". Recall bridge instruction sanded.
//   Removed "No markdown, no backticks, no preamble." formatting restriction.
// v4.9.0: STRAIN CRISES — structural rupture system for non-terminal strain axes.
//   STRAIN_CRISES data (Destitution, Isolation, Structural Rupture, Confinement)
//   with per-type reset ranges and cascade damage tables. resolveStrainCrises()
//   runs between pressure application and terminal check — cascade into Health 100
//   IS lethal, making the causal chain visible. Crisis entries injected into
//   narrative log with full RSP narrative generation (crisis prompt path in provider).
//   Crises force pressure breaks. Crisis events logged in majorEvents and shown
//   in TERMINAL/export. NarrativeEntry styled with red border + STRUCTURAL CRISIS badge.
// v4.9.1: CRISIS CONTEXT FIX — crisis narrative now receives recent entries
//   from the narrative log (including the just-resolved triggering tick),
//   provider crisis prompt includes IMMEDIATE CONTEXT block showing the
//   last 2 entries so the crisis reads as continuation, not disconnected event.
// v4.10.0: ENTITY PERSISTENCE — knownEntities array on state card captures
//   named characters, places, and events introduced by the model, with
//   importance ranking (3=central, 2=recurring, 1=passing). Entities extracted
//   via "entities" field in narrative JSON output (third field alongside
//   sceneContext and narrative). parseNarrativeResponse returns {narrative, entities}.
//   UPDATE_NARRATIVE merges entities (dedup by name, higher importance wins,
//   cap 25). formatKnownWorld() injects KNOWN WORLD block into all prompt
//   paths (tick, posture, crisis). Model instructed to prefer existing
//   characters over inventing new ones for the same narrative role.
//   Addresses state drift failure mode: Aunt Amina persists across ticks.
// v4.11.0: ENTITY VALIDATION — Layer 4 applied to entity persistence.
//   checkEntityReuse() diagnostic detecting when model ignores KNOWN WORLD
//   block (importance ≥2 entities unreferenced across multiple ticks).
//   Entity staleness tracking: introducedAge and lastReferencedAge stamped
//   on all entities, updated via text-presence detection in UPDATE_NARRATIVE.
//   formatKnownWorld() now flags stale entities with ⚠ markers so the prompt
//   actively reminds the model of neglected characters/places.
//   "referencedEntities" audit field added to narrative JSON output contract —
//   model must declare which KNOWN WORLD entities it used (forced derivation
//   for continuity, same pattern as sceneContext for place-year reconstruction).
//   Cross-check validation: model's declared references vs actual name presence
//   in text, logged as phantom declarations or under-reporting.
//   Addresses decorative derivation failure mode applied to entity persistence.
//   BIRTH ENTITY SEEDING FIX: birth prompt now explicitly requires entity
//   extraction (CRITICAL instruction + structured Return JSON). Fallback
//   extraction API call fires when birth returns <2 entities from substantial
//   narrative text — prevents the "empty world at tick 1" failure where the
//   model invents a parallel cast because knownEntities was never seeded.

// ═══════════════════════════════════════════════════════════════
// WORLD DATA
// ═══════════════════════════════════════════════════════════════

const WORLD = [
  {
    name: "Asia",
    weight: 600,
    countries: [
      {
        name: "China",
        weight: 280,
        settlements: ["Beijing", "Shanghai", "Chengdu", "Guangzhou", "Wuhan", "Xi'an"],
        namesMale: ["Wei", "Jun", "Lei", "Hao", "Ming", "Jian"],
        namesFemale: ["Mei", "Ling", "Xia", "Yan", "Hui", "Jing"],
        surnames: ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang"],
      },
      {
        name: "India",
        weight: 280,
        settlements: ["Mumbai", "Delhi", "Kolkata", "Chennai", "Bangalore", "Hyderabad"],
        namesMale: ["Raj", "Amit", "Vikram", "Arjun", "Rahul", "Deepak"],
        namesFemale: ["Priya", "Anita", "Sunita", "Lakshmi", "Meena", "Pooja"],
        surnames: ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Rao"],
      },
      {
        name: "Myanmar",
        weight: 40,
        settlements: ["Yangon", "Mandalay", "Naypyidaw", "Mawlamyine", "Bago", "Pathein"],
        namesMale: ["Aung", "Kyaw", "Min", "Thein", "Zaw", "Htun"],
        namesFemale: ["Aye", "Khin", "May", "Nwe", "Su", "Tin"],
        surnames: [],
      },
    ],
  },
  {
    name: "Africa",
    weight: 170,
    countries: [
      {
        name: "Nigeria",
        weight: 80,
        settlements: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City"],
        namesMale: ["Emeka", "Chinedu", "Adebayo", "Tunde", "Oluwaseun", "Chijioke"],
        namesFemale: ["Ngozi", "Amina", "Chioma", "Folake", "Aisha", "Blessing"],
        surnames: ["Okafor", "Adeyemi", "Ibrahim", "Okonkwo", "Balogun", "Abubakar"],
      },
      {
        name: "Egypt",
        weight: 50,
        settlements: ["Cairo", "Alexandria", "Giza", "Luxor", "Aswan", "Mansoura"],
        namesMale: ["Ahmed", "Mohamed", "Omar", "Youssef", "Ali", "Hassan"],
        namesFemale: ["Fatma", "Nour", "Mariam", "Sara", "Hana", "Layla"],
        surnames: ["Hassan", "Ali", "Mohamed", "Ibrahim", "Mahmoud", "Ahmed"],
      },
      {
        name: "Tanzania",
        weight: 40,
        settlements: ["Dar es Salaam", "Dodoma", "Mwanza", "Arusha", "Zanzibar City", "Mbeya"],
        namesMale: ["Baraka", "Juma", "Hassan", "Rajabu", "Omari", "Selemani"],
        namesFemale: ["Amina", "Halima", "Rehema", "Zuhura", "Mwanaisha", "Sauda"],
        surnames: ["Mwalimu", "Nyerere", "Mwinyi", "Mkapa", "Magufuli", "Kibaki"],
      },
    ],
  },
  {
    name: "Europe",
    weight: 100,
    countries: [
      {
        name: "Russia",
        weight: 25,
        settlements: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Samara"],
        namesMale: ["Ivan", "Dmitri", "Alexei", "Nikolai", "Sergei", "Andrei"],
        namesFemale: ["Anna", "Maria", "Olga", "Natalia", "Irina", "Elena"],
        surnames: ["Ivanov", "Smirnov", "Kuznetsov", "Popov", "Vasiliev", "Petrov"],
      },
      {
        name: "United Kingdom",
        weight: 20,
        settlements: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds"],
        namesMale: ["James", "Oliver", "William", "Thomas", "George", "Harry"],
        namesFemale: ["Olivia", "Emily", "Sophie", "Grace", "Lily", "Emma"],
        surnames: ["Smith", "Jones", "Williams", "Taylor", "Brown", "Davies"],
      },
      {
        name: "Germany",
        weight: 18,
        settlements: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Stuttgart"],
        namesMale: ["Thomas", "Michael", "Stefan", "Andreas", "Markus", "Christian"],
        namesFemale: ["Anna", "Maria", "Laura", "Julia", "Katharina", "Sarah"],
        surnames: ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer"],
      },
    ],
  },
  {
    name: "Latin America",
    weight: 85,
    countries: [
      {
        name: "Brazil",
        weight: 35,
        settlements: ["Sao Paulo", "Rio de Janeiro", "Salvador", "Brasilia", "Fortaleza", "Belo Horizonte"],
        namesMale: ["Joao", "Pedro", "Lucas", "Mateus", "Gabriel", "Rafael"],
        namesFemale: ["Ana", "Maria", "Juliana", "Fernanda", "Camila", "Beatriz"],
        surnames: ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Costa"],
      },
      {
        name: "Mexico",
        weight: 25,
        settlements: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Merida"],
        namesMale: ["Juan", "Carlos", "Jose", "Miguel", "Luis", "Alejandro"],
        namesFemale: ["Maria", "Guadalupe", "Ana", "Sofia", "Valentina", "Fernanda"],
        surnames: ["Garcia", "Hernandez", "Lopez", "Martinez", "Gonzalez", "Rodriguez"],
      },
      {
        name: "Argentina",
        weight: 12,
        settlements: ["Buenos Aires", "Cordoba", "Rosario", "Mendoza", "Tucuman", "La Plata"],
        namesMale: ["Mateo", "Thiago", "Benjamin", "Juan", "Santiago", "Lautaro"],
        namesFemale: ["Sofia", "Valentina", "Martina", "Isabella", "Camila", "Lucia"],
        surnames: ["Gonzalez", "Rodriguez", "Gomez", "Fernandez", "Lopez", "Diaz"],
      },
    ],
  },
  {
    name: "North America",
    weight: 35,
    countries: [
      {
        name: "United States",
        weight: 24,
        settlements: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Detroit"],
        namesMale: ["James", "Robert", "John", "Michael", "David", "William"],
        namesFemale: ["Mary", "Jennifer", "Linda", "Patricia", "Elizabeth", "Susan"],
        surnames: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia"],
      },
      {
        name: "Canada",
        weight: 11,
        settlements: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa"],
        namesMale: ["James", "William", "Alexander", "Benjamin", "Liam", "Ethan"],
        namesFemale: ["Emma", "Olivia", "Charlotte", "Sophia", "Ava", "Amelia"],
        surnames: ["Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson"],
      },
    ],
  },
  {
    name: "Oceania",
    weight: 10,
    countries: [
      {
        name: "Australia",
        weight: 6,
        settlements: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Canberra"],
        namesMale: ["Jack", "Oliver", "William", "Noah", "James", "Thomas"],
        namesFemale: ["Charlotte", "Olivia", "Amelia", "Isla", "Mia", "Ava"],
        surnames: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor"],
      },
      {
        name: "New Zealand",
        weight: 4,
        settlements: ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin"],
        namesMale: ["Jack", "Oliver", "James", "William", "Noah", "Liam"],
        namesFemale: ["Charlotte", "Olivia", "Amelia", "Isla", "Ella", "Ava"],
        surnames: ["Smith", "Williams", "Brown", "Wilson", "Taylor", "Campbell"],
      },
    ],
  },
];

const HOUSEHOLD_TYPES = {
  low: [
    { structure: "Two-parent household, stable income", careP: 15, resourceP: 20, desc: "nuclear family with steady employment" },
    { structure: "Extended family compound, multiple generations", careP: 10, resourceP: 25, desc: "multi-generational household with shared responsibilities" },
    { structure: "Two-parent household, one works away seasonally", careP: 20, resourceP: 18, desc: "intact family with periodic absence for work" },
  ],
  mid: [
    { structure: "Single parent with extended family support", careP: 35, resourceP: 40, desc: "single-parent household supplemented by extended kin" },
    { structure: "Two-parent household with financial strain", careP: 30, resourceP: 45, desc: "intact family under economic pressure" },
    { structure: "Blended family, step-parent relationship", careP: 38, resourceP: 35, desc: "reconstituted household finding its rhythm" },
  ],
  high: [
    { structure: "Single parent, no extended family nearby", careP: 55, resourceP: 55, desc: "isolated single-parent household" },
    { structure: "Institutional care (orphanage/group home)", careP: 65, resourceP: 45, desc: "state or institutional caregiving" },
    { structure: "Extended family, primary caregiver has chronic illness", careP: 50, resourceP: 50, desc: "household where illness shapes daily care capacity" },
  ],
};

const BODY_BASELINES = {
  low: [
    { desc: "Robust constitution, no known conditions", healthP: 10, note: "strong immune response, good birth weight" },
    { desc: "Healthy baseline, active temperament", healthP: 12, note: "energetic child, no early complications" },
    { desc: "Resilient, quick to recover from minor illness", healthP: 8, note: "rarely sick, good appetite" },
  ],
  mid: [
    { desc: "Average health, occasional childhood illness", healthP: 25, note: "normal development trajectory" },
    { desc: "Mild sensitivities (allergies, skin conditions)", healthP: 30, note: "manageable conditions that require attention" },
    { desc: "Average baseline with one resolved birth complication", healthP: 28, note: "early difficulty overcome, no lasting effect" },
  ],
  high: [
    { desc: "Chronic respiratory condition from birth", healthP: 50, note: "requires regular medical attention" },
    { desc: "Congenital condition affecting mobility", healthP: 55, note: "limits physical activity, shapes daily routine" },
    { desc: "Premature birth with developmental monitoring", healthP: 45, note: "catching up but requires extra care" },
  ],
};

const WEIGHT_CLASSES = [
  { name: "Lifetime Miracle", range: [1, 1], color: "#ffd700" },
  { name: "Miracle", range: [2, 25], color: "#4ec9b0" },
  { name: "Uplift", range: [26, 150], color: "#6ab04c" },
  { name: "Standard Load", range: [151, 750], color: "#a0a0a0" },
  { name: "Heavy Strain", range: [751, 974], color: "#d4773b" },
  { name: "Crush", range: [975, 999], color: "#c0392b" },
  { name: "Lifetime Catastrophe", range: [1000, 1000], color: "#8b0000" },
];

// The model's reliable knowledge horizon. Past this year, fact packets
// and narrative generation fall back to local-only — no API calls that
// would force the model to confabulate specificity it cannot retrieve.
const KNOWLEDGE_HORIZON = 2025;

const STRAIN_LABELS = {
  resourceStrain: "resource strain",
  careStrain: "care strain",
  institutionStrain: "institution strain",
  healthStrain: "health strain",
  mobilityStrain: "mobility strain",
};

const STRAIN_SHORT = {
  resourceStrain: "Resource",
  careStrain: "Care",
  institutionStrain: "Institution",
  healthStrain: "Health",
  mobilityStrain: "Mobility",
};

const ALL_STRAINS = [
  "resourceStrain",
  "careStrain",
  "institutionStrain",
  "healthStrain",
  "mobilityStrain",
];

function clampP(v) {
  return Math.max(0, Math.min(100, v));
}
function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function rollDice(sides) {
  return Math.floor(Math.random() * sides) + 1;
}
function sampleWeighted(items, roll, max = 1000) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let acc = 0;
  for (const item of items) {
    acc += Math.round((item.weight / totalWeight) * max);
    if (roll <= acc) return item;
  }
  return items[items.length - 1];
}
function getWeightClass(roll) {
  return WEIGHT_CLASSES.find((w) => roll >= w.range[0] && roll <= w.range[1]);
}
function getRollIntensity(roll) {
  // Normalize 1-1000 to 0.0-1.0 — continuous pressure gradient
  const intensity = (roll - 1) / 999;

  // Descriptor serves as a fine-grained retrieval key for the narrative prompt.
  // The extremes are already routed by weight class; the Standard Load interior
  // (151-750) gets four distinct descriptors instead of one flat label.
  let descriptor;
  if (roll <= 1) descriptor = "once-in-a-lifetime fortune — every system aligns at once";
  else if (roll <= 25) descriptor = "real opening — significant good fortune arrives";
  else if (roll <= 150) descriptor = "something eases — mild uplift without drama";
  else if (roll <= 300) descriptor = "maintenance leaning light — the household catches a marginal break this tick";
  else if (roll <= 450) descriptor = "dead-center maintenance — nothing improves, nothing breaks, the routine holds by grip";
  else if (roll <= 600) descriptor = "maintenance under gathering weight — small frictions compound, the margin thins";
  else if (roll <= 750) descriptor = "heavy maintenance tending toward strain — the margin shrinks visibly, something is about to give";
  else if (roll <= 974) descriptor = "serious structural strain — something gives way that had been holding";
  else if (roll <= 999) descriptor = "devastating pressure — multiple load-bearing systems fail simultaneously";
  else descriptor = "once-in-a-lifetime catastrophe — every vulnerability activates at once";

  return { intensity: Math.round(intensity * 1000) / 1000, descriptor, roll };
}
function getPhase(age) {
  if (age <= 12) return { num: "I", tickYears: 1, label: "Childhood" };
  if (age <= 25) return { num: "II", tickYears: 1, label: "Youth" };
  if (age <= 55) return { num: "III", tickYears: 3, label: "Adulthood" };
  return { num: "IV", tickYears: 5, label: "Elder Years" };
}

// ═══════════════════════════════════════════════════════════════
// HISTORICAL VALIDATION & DISPLAY
// ═══════════════════════════════════════════════════════════════

const SETTLEMENT_ERA = {
  Naypyidaw: { minYear: 2002, fallback: "Yangon" },
  Abuja: { minYear: 1980, fallback: "Lagos" },
  Brasilia: { minYear: 1960, fallback: "Rio de Janeiro" },
  Islamabad: { minYear: 1961, fallback: "Rawalpindi" },
  Dodoma: { minYear: 1996, fallback: "Dar es Salaam" },
};

const CITY_ERA_NAMES = {
  "Ho Chi Minh City": { oldName: "Saigon", renameYear: 1976 },
  Mumbai: { oldName: "Bombay", renameYear: 1996 },
  Chennai: { oldName: "Madras", renameYear: 1996 },
  Kolkata: { oldName: "Calcutta", renameYear: 2001 },
  "Saint Petersburg": { oldName: "Leningrad", renameYear: 1991 },
  Yangon: { oldName: "Rangoon", renameYear: 1989 },
};

const COUNTRY_ERA_NAMES = {
  Myanmar: { oldName: "Burma", renameYear: 1989 },
  "Sri Lanka": { oldName: "Ceylon", renameYear: 1972 },
  "DR Congo": { oldName: "Zaire", renameYear: 1997, oldStart: 1971 },
};

function getDisplayContext(settlementCanonical, countryCanonical, year) {
  let settlement = settlementCanonical;
  let country = countryCanonical;

  const cityRename = CITY_ERA_NAMES[settlementCanonical];
  if (cityRename && year < cityRename.renameYear) settlement = cityRename.oldName;

  const countryRename = COUNTRY_ERA_NAMES[countryCanonical];
  if (countryRename && year < countryRename.renameYear) {
    if (!countryRename.oldStart || year >= countryRename.oldStart) {
      country = countryRename.oldName;
    }
  }

  return { settlement, country, display: `${settlement}, ${country}` };
}

function validateHistoricalContext(settlement, countryName, birthYear) {
  let correctedSettlement = settlement;
  let correctedCountry = countryName;
  const eraNotes = [];

  const eraCheck = SETTLEMENT_ERA[settlement];
  if (eraCheck && birthYear < eraCheck.minYear) {
    correctedSettlement = eraCheck.fallback;
    eraNotes.push(`${settlement} did not exist as a major administrative settlement until about ${eraCheck.minYear}; birth location corrected to ${eraCheck.fallback}.`);
  }

  const cityRename = CITY_ERA_NAMES[correctedSettlement];
  if (cityRename && birthYear < cityRename.renameYear) {
    correctedSettlement = cityRename.oldName;
    eraNotes.push(`${cityRename.oldName} is the era-appropriate city name before ${cityRename.renameYear}.`);
  }

  const countryRename = COUNTRY_ERA_NAMES[countryName];
  if (countryRename && birthYear < countryRename.renameYear) {
    if (!countryRename.oldStart || birthYear >= countryRename.oldStart) {
      correctedCountry = countryRename.oldName;
      eraNotes.push(`${countryRename.oldName} is the era-appropriate country name in ${birthYear}.`);
    }
  }

  return {
    settlement: correctedSettlement,
    country: correctedCountry,
    eraNote: eraNotes.length ? `HISTORICAL CORRECTIONS: ${eraNotes.join(" ")}` : "",
  };
}

// ═══════════════════════════════════════════════════════════════
// FACT PACKETS
// ═══════════════════════════════════════════════════════════════

const PACKET_BUCKETS = {
  Brazil: [
    {
      start: 1930,
      end: 1984,
      macroContext: ["urban growth under uneven development", "inflation pressure on working households", "military government reshaping civil life"],
      materialAnchors: ["bus fare sensitivity", "rice and beans as household baseline", "crowded clinic waiting rooms", "kerosene stoves in favela kitchens", "feira libre fruit prices", "lottery ticket vendors on every corner", "tin-roofed extensions built without permits"],
      institutionalAnchors: ["public hospital with numbered queue tickets", "state school with triple-shift scheduling", "municipal office requiring proof of residence", "cartório for every notarized document"],
      seasonalTexture: ["tropical heat making tin roofs unbearable by noon", "rainy season flooding low-lying streets for days"],
      yearSpecificDetail: [],
    },
    {
      start: 1985,
      end: 2015,
      macroContext: ["democratic transition legacy", "volatile household budgeting under repeated currency reforms", "uneven social mobility after Plano Real stabilization"],
      materialAnchors: ["informal work patching income gaps", "rent pressure in peripheral neighborhoods", "crowded buses with two-hour commutes", "gas canisters carried uphill", "açaí and farinha as protein filler", "pirated DVD stalls doubling as news hubs", "prepaid cell phone minutes as household currency"],
      institutionalAnchors: ["public clinic with SUS card registration", "labor office for carteira de trabalho", "state school with merenda escolar feeding programs", "CRAS social assistance center"],
      seasonalTexture: ["Carnival season briefly reshuffling work schedules", "December heat driving families to public beaches and parks"],
      yearSpecificDetail: [],
    },
  ],
  Myanmar: [
    {
      start: 1930,
      end: 1988,
      macroContext: ["state restriction and limited political openness", "fragile household economics under socialist autarky", "military dominance over civilian institutions since 1962"],
      materialAnchors: ["queues for rationed rice and cooking oil", "family reliance on informal networks for medicine", "patchwork medical access through traditional healers", "longyi cloth as everyday dress regardless of class", "cheroot smoke in every teashop", "kyat notes stuffed in tin boxes as savings"],
      institutionalAnchors: ["state school with Burmese-only instruction", "local clinic with erratic drug supply", "ward office controlling travel permits", "People's Council meetings as compulsory civic ritual"],
      seasonalTexture: ["monsoon season turning unpaved roads to mud", "Thingyan water festival as the one reliable break from routine"],
      yearSpecificDetail: [],
    },
    {
      start: 1989,
      end: 2015,
      macroContext: ["controlled political life under SLORC/SPDC military junta", "household precarity under uneven reform and selective liberalization"],
      materialAnchors: ["market volatility on black-market kyat exchange", "kin-based support replacing absent state welfare", "transport friction on aging bus fleet", "SIM cards costing months of wages until 2013", "mohinga bowls as working breakfast currency", "diesel generator pooling among neighbors during outages"],
      institutionalAnchors: ["township office controlling household registration", "state clinic with pay-per-visit extraction", "school requiring unofficial fees for exams", "ward administrator as gatekeeper for permissions"],
      seasonalTexture: ["hot season in central dry zone reaching 42°C by April", "monsoon flooding isolating peripheral townships"],
      yearSpecificDetail: [],
    },
  ],
  Russia: [
    {
      start: 1930,
      end: 1991,
      macroContext: ["state-planned social order with guaranteed minimums", "bureaucratic stability mixed with consumer goods scarcity", "communal life structured around workplace and neighborhood"],
      materialAnchors: ["queues forming before dawn for deliveries", "communal apartment kitchen schedules", "clinic and housing paperwork at the ZhEK", "black bread and buckwheat as caloric baseline", "preserved vegetables in basement storage", "trolleybus season passes", "dacha garden plots as food supplement"],
      institutionalAnchors: ["district polyclinic with numbered registration books", "state school with mandatory after-school programs", "ZhEK housing office controlling repairs and registration", "propiska residency permit system", "workplace trade union distributing sanatorium vouchers"],
      seasonalTexture: ["winter darkness arriving by 3pm, heating pipes clanking all night", "brief white nights in summer when no one sleeps"],
      yearSpecificDetail: [],
    },
    {
      start: 1992,
      end: 2015,
      macroContext: ["market transition shock destroying household savings overnight", "uneven recovery with new oligarch wealth visible alongside poverty", "institutional collapse and improvised replacement"],
      materialAnchors: ["price volatility rendering yesterday's budget meaningless", "informal side income from shuttle trading and kiosk work", "transport fatigue on aging Soviet tram network", "Doshirak instant noodles as poverty food", "vodka as informal currency", "currency-exchange kiosk lines", "Chinese-made clothing replacing Soviet-era production", "dacha gardens shifting from leisure to survival"],
      institutionalAnchors: ["clinic still operating but without basic supplies", "employment office with Soviet-era furniture and new-era forms", "municipal desk requiring bribes for routine paperwork", "school teachers moonlighting to survive", "pension office with months-long payment delays"],
      seasonalTexture: ["February ice making every errand hazardous", "mushroom-picking season as both tradition and protein strategy"],
      yearSpecificDetail: [],
    },
  ],
  India: [
    {
      start: 1930,
      end: 1990,
      macroContext: ["post-independence planned economy with license raj controls", "caste and community structuring access to opportunity", "Green Revolution reshaping rural livelihoods unevenly"],
      materialAnchors: ["ration card as household identity document", "kerosene allocation for cooking", "autorickshaw fares negotiated daily", "dal-rice-roti as caloric floor", "hand-pump water collection before dawn", "ceiling fans as the line between bearable and unbearable"],
      institutionalAnchors: ["government hospital with general ward queues", "municipal school with Hindi-medium instruction", "ration shop with monthly allotment booklets", "tehsildar office for land and revenue paperwork", "post office savings accounts as only banking access"],
      seasonalTexture: ["monsoon arrival rewriting every plan for weeks", "summer heat making tin-roofed rooms uninhabitable by noon"],
      yearSpecificDetail: [],
    },
    {
      start: 1991,
      end: 2015,
      macroContext: ["liberalization opening new work but removing old protections", "IT-sector wealth visible but unreachable for most households", "mobile phone revolution compressing information barriers"],
      materialAnchors: ["LPG cylinder delivery wait as household stress point", "bus pass arithmetic for daily commuters", "chai stall as informal employment office", "prepaid recharge cards as budgeting tool", "steel tiffin carriers on suburban trains", "water tanker schedules dictating morning routines"],
      institutionalAnchors: ["primary health centre with single overworked doctor", "Aadhaar enrollment creating new bureaucratic dependency", "state school versus private coaching center economics", "MGNREGA employment guarantee office"],
      seasonalTexture: ["Diwali season reshuffling household budgets for weeks", "pre-monsoon humidity making outdoor labor dangerous"],
      yearSpecificDetail: [],
    },
  ],
  Nigeria: [
    {
      start: 1930,
      end: 1998,
      macroContext: ["oil boom and bust cycles felt at household level", "military governance reshaping civilian expectations", "ethnic and regional tensions inflecting institutional access"],
      materialAnchors: ["garri and palm oil as caloric baseline", "danfo bus fares rising with fuel scarcity", "NEPA power cuts structuring the entire day", "kerosene lanterns as primary evening light", "generator fuel pooling among compound neighbors", "market women's rotating savings (esusu) as credit system"],
      institutionalAnchors: ["general hospital with pay-before-treatment", "state primary school with irregular teacher pay", "local government secretariat for permits", "NYSC posting as gateway for young graduates"],
      seasonalTexture: ["harmattan dust coating everything indoors for weeks", "rainy season turning unpaved roads into ankle-deep mud"],
      yearSpecificDetail: [],
    },
    {
      start: 1999,
      end: 2015,
      macroContext: ["democratic transition with continued infrastructure decay", "mobile banking reshaping informal economies", "Boko Haram security crisis in the north"],
      materialAnchors: ["recharge card hawkers at every intersection", "okada motorcycle taxis as lifeline transport", "pure water sachets as primary hydration", "pepper soup joints doubling as neighborhood news offices", "inverter batteries as household investment against blackouts"],
      institutionalAnchors: ["INEC voter registration as new identity anchor", "NHIS health insurance cards rarely honored at clinics", "JAMB exam center as bottleneck for youth futures", "microfinance offices replacing formal banking for the poor"],
      seasonalTexture: ["December travel season emptying cities back to villages", "August break flooding Lagos Third Mainland Bridge approaches"],
      yearSpecificDetail: [],
    },
  ],
  China: [
    {
      start: 1930,
      end: 1978,
      macroContext: ["collective agriculture and danwei work-unit system", "political campaigns disrupting household stability cyclically", "famine memory as living household knowledge"],
      materialAnchors: ["grain coupons as second currency", "bicycle as primary transport across the city", "thermos flasks refilled at communal boiler rooms", "cabbage stored on balconies for winter", "cotton-padded jackets as winter uniform", "mantou and congee as daily caloric base"],
      institutionalAnchors: ["danwei work unit controlling housing and rations", "neighborhood committee monitoring household composition", "barefoot doctor as primary medical contact", "hukou registration determining all access"],
      seasonalTexture: ["coal dust winter settling over northern cities", "Spring Festival as the only reliable multi-day rest"],
      yearSpecificDetail: [],
    },
    {
      start: 1979,
      end: 2015,
      macroContext: ["reform-era growth lifting millions but creating new precarity", "migrant worker economy separating families across provinces", "one-child policy reshaping household structure and elderly care"],
      materialAnchors: ["factory dormitory life for migrant workers", "instant noodle cups as migrant meal currency", "QQ and later WeChat as family lifeline across distance", "electric scooters replacing bicycles in cities", "baijiu bottles as gift currency for favor exchanges", "street vendor jianbing as working breakfast"],
      institutionalAnchors: ["hukou system blocking migrant children from urban schools", "community health center with tiered pricing", "labor bureau for wage dispute mediation", "chengguan urban management officers harassing street vendors"],
      seasonalTexture: ["Spring Festival travel crush overwhelming every train station", "summer monsoon flooding southern factory districts"],
      yearSpecificDetail: [],
    },
  ],
  Egypt: [
    {
      start: 1930,
      end: 1999,
      macroContext: ["state-subsidized basics cushioning household budgets", "population growth outpacing housing and infrastructure", "public sector employment as aspiration anchor"],
      materialAnchors: ["baladi bread subsidized at piasters per loaf", "microbus fares negotiated at every stop", "tea with excessive sugar as social default", "rooftop pigeon coops as protein supplement", "Butagaz cylinder delivery as weekly anxiety"],
      institutionalAnchors: ["government hospital with overcrowded wards", "azhari or state school system forking futures", "mogamma building as bureaucratic labyrinth", "military service as unavoidable life interruption for men"],
      seasonalTexture: ["khamsin dust storms halting outdoor life for days", "Ramadan restructuring every schedule and market price"],
      yearSpecificDetail: [],
    },
    {
      start: 2000,
      end: 2015,
      macroContext: ["revolution and counter-revolution destabilizing daily assumptions", "subsidy cuts making basics suddenly expensive", "youth unemployment as structural crisis"],
      materialAnchors: ["tuk-tuk transport replacing microbus in informal areas", "mobile phone credit as household budget line item", "kushari carts as cheapest protein-and-carb meal", "satellite dish forests on apartment rooftops"],
      institutionalAnchors: ["national ID card renewal as recurring bureaucratic ordeal", "military hospital as parallel healthcare system", "private tutoring economy replacing functional schooling"],
      seasonalTexture: ["summer heat making concrete apartments unlivable without fans", "Eid al-Adha reshuffling household budgets for sacrifice purchases"],
      yearSpecificDetail: [],
    },
  ],
  "United States": [
    {
      start: 1930,
      end: 1979,
      macroContext: ["postwar prosperity unevenly distributed by race and region", "suburban expansion reshaping household geography", "industrial employment providing stability with physical cost"],
      materialAnchors: ["car payment as household's second-largest expense", "grocery store coupon clipping as budget discipline", "television reshaping evening family structure", "Sears catalog as aspiration index", "Wonder Bread and canned vegetables as pantry baseline"],
      institutionalAnchors: ["county hospital for the uninsured", "public school district quality tracking property values", "Social Security office for retirement paperwork", "VA hospital for veterans", "unemployment office with weekly check-in requirements"],
      seasonalTexture: ["heating oil bills reshaping winter budgets in the north", "summer without air conditioning driving families to public pools"],
      yearSpecificDetail: [],
    },
    {
      start: 1980,
      end: 2015,
      macroContext: ["deindustrialization hollowing out working-class stability", "healthcare costs as primary household financial risk", "two-income household becoming necessity not choice"],
      materialAnchors: ["health insurance premium as largest paycheck deduction", "Walmart replacing local stores as default shopping", "dollar menu as poverty meal architecture", "gas prices dictating commute viability", "prepaid phone cards at convenience stores", "payday loan storefronts on every commercial strip"],
      institutionalAnchors: ["emergency room as primary care for the uninsured", "DMV as universal bureaucratic ordeal", "community college as affordable education gateway", "Section 8 waitlist measured in years not months", "food stamp office with income verification paperwork"],
      seasonalTexture: ["back-to-school supply costs hitting in August", "heating bills creating winter payment plan anxiety"],
      yearSpecificDetail: [],
    },
  ],
  "United Kingdom": [
    {
      start: 1930,
      end: 1979,
      macroContext: ["postwar austerity giving way to welfare state expansion", "council housing as working-class stability anchor", "NHS eliminating medical bankruptcy but not waiting lists"],
      materialAnchors: ["ration books persisting into the 1950s", "fish and chips as default takeaway", "coal fire heating with morning ash clearing", "HP sauce and white bread as pantry constants", "bus pass as primary transport for non-car households"],
      institutionalAnchors: ["NHS GP surgery with appointment book queues", "council housing office controlling allocation", "labour exchange for job placement", "post office for savings books and pensions"],
      seasonalTexture: ["damp winter cold penetrating poorly insulated council flats", "summer bank holidays as the year's reliable break"],
      yearSpecificDetail: [],
    },
    {
      start: 1980,
      end: 2015,
      macroContext: ["deindustrialization and Right to Buy reshaping class geography", "benefits system as both safety net and bureaucratic maze", "NHS underfunding creating visible queue stress"],
      materialAnchors: ["Tesco value range as poverty-line shopping", "prepay electricity meter as budget discipline tool", "bus fare increases compressing travel radius", "takeaway kebab as late-shift meal default", "Primark clothing as household uniform"],
      institutionalAnchors: ["Jobcentre Plus with fortnightly signing-on requirements", "A&E as overflow primary care", "council tax office with payment plan negotiations", "Citizens Advice Bureau as last-resort guidance"],
      seasonalTexture: ["winter fuel allowance not quite covering January bills", "Christmas debt restructuring household budgets until March"],
      yearSpecificDetail: [],
    },
  ],
  default: [
    {
      start: 1930,
      end: 2015,
      macroContext: ["ordinary household life under unequal institutions", "local conditions shape survival more than abstract policy", "global forces felt through price changes at the nearest market"],
      materialAnchors: ["food budgeting around staple grain prices", "transport friction shaping the reachable world", "care work inside the household falling to women and girls", "water collection as daily time tax", "fuel costs for cooking as budget variable", "secondhand clothing markets as wardrobe source", "radio or television as household's window to the wider world"],
      institutionalAnchors: ["school with irregular teacher attendance", "clinic with limited drug supply", "municipal office requiring multiple visits for one document", "market licensing and informal taxation by local authorities"],
      seasonalTexture: ["harvest season temporarily easing food costs", "rainy or winter season compressing the day's possibilities"],
      yearSpecificDetail: [],
    },
  ],
};

function buildLocalFactPacket(settlementCanonical, countryCanonical, year, eraNote = "") {
  const placeDisplay = getDisplayContext(settlementCanonical, countryCanonical, year).display;
  const buckets = PACKET_BUCKETS[countryCanonical] || PACKET_BUCKETS.default;
  const bucket = buckets.find((b) => year >= b.start && year <= b.end) || buckets[buckets.length - 1];
  const validityNotes = eraNote ? [eraNote] : [];
  return {
    year,
    placeDisplay,
    placeCanonical: { settlement: settlementCanonical, country: countryCanonical },
    validityNotes,
    macroContext: bucket.macroContext,
    materialAnchors: bucket.materialAnchors,
    institutionalAnchors: bucket.institutionalAnchors,
    seasonalTexture: bucket.seasonalTexture || [],
    yearSpecificDetail: bucket.yearSpecificDetail || [],
    uncertainty: countryCanonical in PACKET_BUCKETS ? "medium" : "high",
  };
}

// ═══════════════════════════════════════════════════════════════
// ANTHROPIC API PROVIDER
// ═══════════════════════════════════════════════════════════════

const NARRATIVE_SYSTEM_PROMPT = `You are the narrative engine for the Wheel of Existence, a probabilistic life-path simulation. You write grounded, material, literary prose about ordinary human lives under structural pressure.

SOURCE PRIORITY (resolve conflicts in this order):
1. STATE CARD facts are canonical — name, age, sex, birth date/place, household structure, pressures, role. These override everything.
2. HARD CODE STATE — pressure deltas, weight class, phase, roll intensity. These are mechanically determined and define the tick's shape.
3. FACT PACKET ANCHORS — material, institutional, and macro-contextual seeds. Use as grounding floor.
4. YOUR TRAINING KNOWLEDGE — place-year texture, specific brands, costs, transit, bureaucratic names, seasonal detail. This fills the space above the floor.
5. MODEL DEFAULTS — last resort. If you reach here, flag uncertainty.

INFERENCE SCOPE:
You have wide latitude to render the texture of ordinary life — the feel of a day, what someone notices, how a room sounds, what a walk costs in effort or money, the small events and frictions that make up lived experience. Follow whatever thread the place-year and character suggest.
You MAY introduce structural life changes — such as relationships, household shifts, health developments, or changes in work — when the state card provides support for them through strain shifts, posture choices, or existing pressures. The state card is the authority on the shape of the life; your job is to render what that shape feels like from inside.

SPECIFICITY MANDATE:
- Ground the prose in real, named, particular things from this place and year — the kind of detail that could only be true here and now. This includes things like local foods by their real names, actual transit systems, real currencies and approximate costs, weather and light at this latitude, building materials, bureaucratic forms, brands on shelves. Select whichever specific details feel alive for this particular tick — there is no required category list.
- If you lack confident specific knowledge for a place-year, stay closer to the packet anchors — push toward the most specific version of the generic you can reach.

VOICE:
- Tight, embodied third-person. One paragraph, 4-7 sentences. Longer is fine if it's dense.
- The prose lives in the physical and the particular. A sentence might land on a cost, or a smell, or the weight of a bag, or a sound from the next room, or the distance to the clinic, or the look on someone's face — whatever is truest to the moment. The world is made of material, and the prose should feel like it.
- ROLL INTENSITY shapes prose register: a light-maintenance tick allows room for observation, small pleasures, the ordinary textures that make a day a day. A heavy-maintenance tick presses inward — the world feels tighter, the frictions multiply, the margin between holding and not-holding narrows. A Miracle feels expansive, as though the city itself opened a door. A Crush shrinks the world to what is immediately in front of the body. The intensity descriptor in each prompt tells you exactly where on this gradient to write.
- The tone is compassionate but unsentimental. The Witness observes. The prose reports what happened and what it felt like to be there.
- Close every paragraph on sensory texture — something seen, heard, tasted, touched, or smelled.
- The five strain axes are Resource, Care, Institution, Health, Mobility. Reference their material texture only through the prose.
- Rotate focal details systematically: each tick selects different anchors, different institutions, different foods, different routes from what appeared in recent entries. Fresh material every time.

OUTPUT FORMAT:
Return a JSON object with exactly four fields:
- "sceneContext": 2-3 sentences reconstructing what daily life materially feels like at this exact place-year-season intersection for this household. This is your retrieval bridge — prime your own latent knowledge of this city-year before writing the narrative.
- "narrative": The prose paragraph. Dense, embodied, 4-7 sentences minimum. This is the only field shown to the user.
- "referencedEntities": An array of names (strings) of any characters, places, or events from the KNOWN WORLD block that you referenced or incorporated in this tick's narrative. This is your continuity audit — if the KNOWN WORLD lists Aunt Amina as central and she is plausibly present in the character's life at this age, she should appear in the prose and in this array. Empty array if none are relevant or if KNOWN WORLD is empty.
- "entities": An array of any NEW named characters, specific places, or significant events you introduced in this narrative that should persist across future ticks. Each entry: {"name": "Aunt Amina", "type": "person|place|event", "detail": "maternal aunt, seamstress near the souk, has a Singer machine", "importance": 1-3}. Importance: 3 = central to the life (household members, key relationships), 2 = recurring (neighbors, specific shops, regular institutions), 1 = passing (one-time encounters). Only include entities that a future tick might need to reference for continuity. Empty array if none.`;

const PACKET_SYSTEM_PROMPT = `You are a historical fact-packet generator for a life simulation. Given a city, country, and specific year, you produce a structured JSON object containing the material, institutional, and macro-contextual texture of daily life for an ordinary working-class household in that exact place-year.

YOUR KNOWLEDGE IS THE PRODUCT. You carry deep training data about what specific cities felt like in specific years — the transit, the food economy, the bureaucratic texture, the costs, the seasonal rhythms. This is a retrieval task: access what you know about this exact intersection and render it as structured anchors.

OUTPUT FORMAT — return a JSON object with these keys:
- "placeRecall": 2-3 sentences reconstructing what you know about daily working-class life in this exact city-year. Name the actual transit system, the actual staple foods and their local names, the actual bureaucratic offices, the actual political/economic conditions as felt at household level. This is your retrieval bridge — prime your latent knowledge before generating the structured fields below.
- "macroContext": array of 2-3 items. The political/economic conditions felt at household level that year — the version a neighbor would complain about on the bus, not a textbook summary.
- "materialAnchors": array of 6-8 items. Each anchor is a specific, material detail: a named food with its local name and approximate cost, a specific transit vehicle or route, a specific household object, a specific market type, a specific seasonal texture. Example trajectory: Yekaterinburg 1994 → "a kilo of round black bread at 600 rubles from the produkty on Lenina Street."
- "institutionalAnchors": array of 4-6 items. Each anchor is a specific bureaucratic office, school, clinic, or administrative process by its real local name. Example trajectory: Yekaterinburg 1994 → "the ZhEK housing office on the second floor of the Soviet-era administration block."
- "seasonalTexture": array of 1-2 items. What the weather and light are doing to daily routines at this latitude and time of year.
- "yearSpecificDetail": array of 1-2 items. Something true in THIS year that was not true the year before or after — a price change, a policy shift, a closed factory, an election consequence felt at ground level.

Return only valid JSON.`;

const NAME_SYSTEM_PROMPT = `You are a cultural naming specialist. Generate an authentic, era-appropriate full name for a person born in a specific time and place. Consider:
- Regional naming conventions (patronymics, matronymics, clan names, mononymous cultures)
- Era-appropriate popularity (names common in that decade, not anachronistic modern names)
- Ethnic and religious diversity within the country
- For mononymous cultures (e.g., Myanmar/Burma), do NOT force a surname

Return ONLY a JSON object: {"fullName": "...", "nameDerivation": "brief explanation of cultural logic"}`;

// Module-level API key — set by the App component, used by callAnthropicAPI.
// Stored in React state for UI, mirrored here for access by module-level provider.
// Never logged, never persisted, never sent anywhere except the Anthropic API.
let _anthropicApiKey = null;
function setApiKey(key) { _anthropicApiKey = key; }
function hasApiKey() { return !!_anthropicApiKey; }

async function callAnthropicAPI(systemPrompt, userPrompt, maxTokens = 300) {
  if (!_anthropicApiKey) {
    console.warn("[WoE API] No API key set — falling back to local");
    return null;
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": _anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!response.ok) {
      console.warn(`[WoE API] ${response.status}: ${response.statusText}`);
      return null;
    }
    const data = await response.json();
    const text = data.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || null;
  } catch (err) {
    console.warn("[WoE API] Call failed, falling back to local:", err);
    return null;
  }
}

function parseNarrativeResponse(raw, packet) {
  if (!raw) return null;
  const stripped = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
  let entities = [];
  let referencedEntities = [];

  function extractResult(parsed) {
    if (parsed.sceneContext) {
      console.log("[WoE RSP] Recall bridge:", parsed.sceneContext.slice(0, 120));
      checkRecallBridgeQuality(parsed.sceneContext, packet);
    }
    if (Array.isArray(parsed.entities)) {
      entities = parsed.entities.filter((e) => e.name && e.type);
    }
    if (Array.isArray(parsed.referencedEntities)) {
      referencedEntities = parsed.referencedEntities.filter((e) => typeof e === "string");
    }
    return parsed.narrative?.trim() || null;
  }

  // Tier 1: direct JSON.parse
  try {
    const parsed = JSON.parse(stripped);
    const narrative = extractResult(parsed);
    if (narrative) return { narrative, entities, referencedEntities };
  } catch { /* fall through */ }

  // Tier 2: sanitize literal newlines
  try {
    const sanitized = stripped.replace(/\n/g, " ").replace(/\r/g, "");
    const parsed = JSON.parse(sanitized);
    const narrative = extractResult(parsed);
    if (narrative) return { narrative, entities, referencedEntities };
  } catch { /* fall through */ }

  // Tier 3: regex extraction
  try {
    const match = stripped.replace(/\n/g, " ").match(/"narrative"\s*:\s*"((?:[^"\\]|\\.)*)"/);
    if (match && match[1]) {
      console.log("[WoE RSP] Extracted narrative via regex fallback");
      return { narrative: match[1].replace(/\\"/g, '"').replace(/\\n/g, " ").trim(), entities, referencedEntities };
    }
  } catch { /* fall through */ }

  // Tier 4: raw text
  console.warn("[WoE RSP] All JSON extraction failed, using raw text as narrative");
  return { narrative: stripped, entities, referencedEntities };
}

// Format known entities for prompt injection — the model's persistent world memory.
// Staleness signals flag entities the model has been ignoring so the prompt
// actively reminds rather than passively listing.
function formatKnownWorld(entities, currentAge) {
  if (!entities || entities.length === 0) return "";
  const lines = entities.map((e) => {
    const impLabel = e.importance === 3 ? ", central" : e.importance === 2 ? ", recurring" : "";
    const staleAge = e.lastReferencedAge != null ? e.lastReferencedAge : (e.introducedAge || 0);
    const gap = currentAge - staleAge;
    // Flag entities not referenced in 5+ years of life as stale
    const staleNote = (e.importance || 1) >= 2 && gap > 5
      ? ` ⚠ last referenced age ${staleAge}, now age ${currentAge} — still present in this life?`
      : "";
    return `- ${e.name} (${e.type}${impLabel}): ${e.detail || "no detail"}${staleNote}`;
  }).join("\n");
  return `\nKNOWN WORLD — characters, places, and events already established in this life. Use them by name when relevant. Prefer existing characters over inventing new ones for the same narrative role:\n${lines}`;
}

const provider = {
  mode: "remote",

  async generateName({ country, settlement, sex, birthYear, continent }) {
    const prompt = `Generate a culturally authentic full name for:
- Sex: ${sex}
- Born: ${birthYear}
- Settlement: ${settlement}
- Country: ${country}
- Continent: ${continent}

The name should be plausible for an ordinary person born in this specific place and time period. Not a famous person's name. Era-appropriate.`;

    const raw = await callAnthropicAPI(NAME_SYSTEM_PROMPT, prompt, 200);
    if (!raw) return null;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.fullName) return parsed;
      return null;
    } catch {
      console.warn("[WoE API] Name parse failed:", raw);
      return null;
    }
  },

  async generateBirthNarrative({ card, packet, continent }) {
    const prompt = `Generate a narrative JSON for a BIRTH — the first moment of a life. Your sceneContext field is your retrieval bridge — reconstruct the material texture of this exact place-year before writing.

CHARACTER: ${card.name}, ${card.sexAtBirth}, born ${card.dateOfBirth}
LOCATION: ${card.placeOfBirth}
YEAR: ${card.birthYear}
HOUSEHOLD: ${card.householdDesc} (${card.householdStructure})
BODY: ${card.bodyDesc} — ${card.bodyNote}
CLASS: ${card.socioeconomicClass}
LINEAGE: ${card.communityLineage}

STARTING STRAINS: ${Object.entries(card.pressures).map(([k, v]) => `${STRAIN_SHORT[k]}: ${v}/100`).join(", ")}

FACT PACKET (FLOOR — seed these, then add what you know about ${card.placeOfBirth} in ${card.birthYear}):
- Macro context: ${packet.macroContext.join("; ")}
- Material anchors: ${packet.materialAnchors.join("; ")}
- Institutional anchors: ${packet.institutionalAnchors.join("; ")}
${packet.seasonalTexture?.length ? `- Seasonal texture: ${packet.seasonalTexture.join("; ")}` : ""}
${packet.yearSpecificDetail?.length ? `- Year-specific detail: ${packet.yearSpecificDetail.join("; ")}` : ""}
${card.eraNote ? `- Historical note: ${card.eraNote}` : ""}

This is the opening of an entire life. The Witness sees this person arrive into a specific place, a specific household, a specific body, a specific set of constraints. Ground the arrival in the material reality of ${card.placeOfBirth} in ${card.birthYear}: the room or building, the weather, the sounds, the smells, the household's current state, who is present, what the first hours look like. This paragraph sets the emotional register for everything that follows.

CRITICAL — ENTITY SEEDING: This birth narrative seeds the ENTIRE entity graph for the life. Every named character you introduce here — parents, grandparents, midwife, neighbors — will persist across all future ticks. You MUST populate the "entities" array with ALL named characters. Omitting entities here means the life starts with an empty world and continuity breaks immediately.

Return JSON: {"sceneContext": "...", "narrative": "dense paragraph, 5-8 sentences, grounding the birth in sensory and material reality, closing on texture", "referencedEntities": [], "entities": [REQUIRED — every named character: {"name": "full name", "type": "person", "detail": "relationship and one distinguishing trait", "importance": 2-3}]}`;

    const raw = await callAnthropicAPI(NARRATIVE_SYSTEM_PROMPT, prompt, 800);
    return parseNarrativeResponse(raw, packet);
  },

  async generateNarrative(ctx) {
    if (ctx.type === "tick") {
      const { card, weightClass, roll, deltas, age, phase, packet, recent } = ctx;
      const intensity = getRollIntensity(roll || 500);
      const deltaSummary = Object.entries(deltas || {})
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${STRAIN_SHORT[k]}: ${v > 0 ? "+" : ""}${v}`)
        .join(", ");
      const pressureSummary = Object.entries(card.pressures)
        .map(([k, v]) => `${STRAIN_SHORT[k]}: ${v}/100`)
        .join(", ");
      const yearspan = phase.tickYears > 1
        ? `${packet.year} to ${packet.year + phase.tickYears - 1}`
        : `${packet.year}`;

      const uncertaintyNote = packet.uncertainty === "high"
        ? `\nPACKET CONFIDENCE: LOW — this packet is generic. Lean harder on your own place-year knowledge. If you lack confident specifics for ${packet.placeDisplay} in ${yearspan}, stay material and grounded but acknowledge the limits of your knowledge through specificity of detail rather than vagueness.`
        : packet.uncertainty === "medium"
          ? `\nPACKET CONFIDENCE: MEDIUM — this packet covers the broad era. Supplement with your own year-specific knowledge of ${packet.placeDisplay}.`
          : `\nPACKET CONFIDENCE: HIGH — this packet is place-year specific. Use its anchors as primary seeds and layer texture on top.`;

      const prompt = `Generate a narrative JSON for this life-tick. Your sceneContext field is your retrieval bridge — reconstruct the material texture of this exact place-year before writing the narrative.

CHARACTER: ${card.name}, age ${age}, ${card.sexAtBirth}, born ${card.dateOfBirth}
LOCATION: ${packet.placeDisplay}
CURRENT ROLE: ${card.currentRole}
HOUSEHOLD: ${card.householdDesc}
PERIOD: ${yearspan} (Phase ${phase.num}: ${phase.label})
${card.continuityAnchor ? `\nLIFE SO FAR (compressed arc — the structural shape of this life to date, for continuity):\n${card.continuityAnchor}` : ""}
${formatKnownWorld(card.knownEntities, age)}

WEIGHT: D1000 → ${roll} · ${weightClass}
ROLL INTENSITY: ${intensity.intensity} — ${intensity.descriptor}
(This is your prose-register key. A 200 and a 741 are both "Standard Load" but they feel completely different. Write to the intensity, not just the class label.)

CURRENT STRAINS: ${pressureSummary}
STRAIN SHIFTS THIS TICK: ${deltaSummary || "minimal movement"}

FACT PACKET (this is your FLOOR — use these as seeds, then layer in what you actually know about ${packet.placeDisplay} in ${yearspan}):
- Macro context: ${packet.macroContext.join("; ")}
- Material anchors: ${packet.materialAnchors.join("; ")}
- Institutional anchors: ${packet.institutionalAnchors.join("; ")}
${packet.seasonalTexture?.length ? `- Seasonal texture: ${packet.seasonalTexture.join("; ")}` : ""}
${packet.yearSpecificDetail?.length ? `- Year-specific detail (unique to ${yearspan}): ${packet.yearSpecificDetail.join("; ")}` : ""}
${packet.validityNotes?.length ? `- Historical notes: ${packet.validityNotes.join("; ")}` : ""}
${uncertaintyNote}

ROTATION REFERENCE — select fresh focal material (different anchors, institutions, foods, routes, sensory details) from what appears in these recent entries:
${(recent || []).slice(-3).join("\n---\n") || "None yet."}

Return JSON: {"sceneContext": "...", "referencedEntities": ["names of KNOWN WORLD entities used in this narrative"], "narrative": "dense paragraph, 4-7+ sentences, matching the roll intensity register, closing on sensory texture", "entities": [new entities only]}`;

      const raw = await callAnthropicAPI(NARRATIVE_SYSTEM_PROMPT, prompt, 800);
      return parseNarrativeResponse(raw, packet);
    }

    if (ctx.type === "posture") {
      const { card, posture, deltas, age, packet } = ctx;
      const deltaSummary = Object.entries(deltas || {})
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${STRAIN_SHORT[k]}: ${v > 0 ? "+" : ""}${v}`)
        .join(", ");
      const pressureSummary = Object.entries(card.pressures)
        .map(([k, v]) => `${STRAIN_SHORT[k]}: ${v}/100`)
        .join(", ");

      const uncertaintyNote = packet.uncertainty === "high"
        ? `\nPACKET CONFIDENCE: LOW — lean harder on your own place-year knowledge for ${packet.placeDisplay} in ${packet.year}.`
        : packet.uncertainty === "medium"
          ? `\nPACKET CONFIDENCE: MEDIUM — supplement with your own year-specific knowledge.`
          : `\nPACKET CONFIDENCE: HIGH — use packet anchors as primary seeds.`;

      const prompt = `Generate a narrative JSON for a PRESSURE BREAK — a moment of deliberate agency. Your sceneContext field is your retrieval bridge — reconstruct the material texture of this exact place-year before writing.

CHARACTER: ${card.name}, age ${age}, ${card.sexAtBirth}, born ${card.dateOfBirth}
LOCATION: ${packet.placeDisplay}
YEAR: ${packet.year}
HOUSEHOLD: ${card.householdDesc}
CURRENT ROLE: ${card.currentRole}
POSTURE CHOSEN: ${posture.name} — "${posture.desc}"
${card.continuityAnchor ? `\nLIFE SO FAR:\n${card.continuityAnchor}` : ""}
${formatKnownWorld(card.knownEntities, age)}

CURRENT STRAINS: ${pressureSummary}
STRAIN SHIFTS FROM POSTURE: ${deltaSummary || "minimal shift"}

FACT PACKET (FLOOR — seed these, then add what you know about ${packet.placeDisplay} in ${packet.year}):
- Macro context: ${packet.macroContext.join("; ")}
- Material anchors: ${packet.materialAnchors.join("; ")}
- Institutional anchors: ${packet.institutionalAnchors.join("; ")}
${packet.seasonalTexture?.length ? `- Seasonal texture: ${packet.seasonalTexture.join("; ")}` : ""}
${packet.yearSpecificDetail?.length ? `- Year-specific detail: ${packet.yearSpecificDetail.join("; ")}` : ""}
${uncertaintyNote}

This is a turning point. The character makes a deliberate choice under pressure. Show the material shape of that choice — specific actions, specific places, specific costs. What does "${posture.name}" look like as a concrete sequence of decisions in ${packet.placeDisplay} in ${packet.year}?

Return JSON: {"sceneContext": "...", "referencedEntities": ["names of KNOWN WORLD entities used in this narrative"], "narrative": "dense paragraph, 4-7+ sentences, showing the posture as material action, closing on sensory texture", "entities": [new entities only]}`;

      const raw = await callAnthropicAPI(NARRATIVE_SYSTEM_PROMPT, prompt, 800);
      return parseNarrativeResponse(raw, packet);
    }

    if (ctx.type === "crisis") {
      const { card, crisisName, crisisDesc, crisisStrain, deltas, age, packet, recent } = ctx;
      const pressureSummary = Object.entries(card.pressures)
        .map(([k, v]) => `${STRAIN_SHORT[k]}: ${v}/100`)
        .join(", ");
      const cascadeSummary = Object.entries(deltas || {})
        .filter(([, v]) => v !== 0)
        .map(([k, v]) => `${STRAIN_SHORT[k]}: +${v}`)
        .join(", ");

      const prompt = `Generate a narrative JSON for a STRAIN CRISIS — a structural breaking point in the life. Your sceneContext field is your retrieval bridge.

CHARACTER: ${card.name}, age ${age}, ${card.sexAtBirth}, born ${card.dateOfBirth}
LOCATION: ${packet.placeDisplay}
YEAR: ${packet.year}
HOUSEHOLD: ${card.householdDesc}
CURRENT ROLE: ${card.currentRole}
${card.continuityAnchor ? `\nLIFE SO FAR:\n${card.continuityAnchor}` : ""}
${formatKnownWorld(card.knownEntities, age)}

CRISIS: ${crisisName}
${crisisDesc}
TRIGGERING STRAIN: ${STRAIN_SHORT[crisisStrain]} reached 100 — total structural failure on this axis.
CASCADE DAMAGE: ${cascadeSummary || "minimal cascade"}
CURRENT STRAINS (post-crisis): ${pressureSummary}

FACT PACKET (FLOOR):
- Macro context: ${packet.macroContext.join("; ")}
- Material anchors: ${packet.materialAnchors.join("; ")}
- Institutional anchors: ${packet.institutionalAnchors.join("; ")}
${packet.seasonalTexture?.length ? `- Seasonal texture: ${packet.seasonalTexture.join("; ")}` : ""}

IMMEDIATE CONTEXT — the tick that triggered this crisis just happened. Build on it, extend it, show the collapse as a continuation of what was already in motion:
${(recent || []).slice(-2).join("\n---\n") || "None yet."}

This is a before-and-after moment. Something structural in the life has broken — not a bad day, but a collapse that reorganizes everything after it. Show what the breaking point looks like materially: what was lost, what changed overnight, what the household wakes up to the next morning. Ground it in the specific reality of ${packet.placeDisplay} in ${packet.year}.

Return JSON: {"sceneContext": "...", "referencedEntities": ["names of KNOWN WORLD entities used in this narrative"], "narrative": "dense paragraph, 5-8 sentences, showing the structural break and its immediate material consequences, closing on sensory texture", "entities": [new entities only]}`;

      const raw = await callAnthropicAPI(NARRATIVE_SYSTEM_PROMPT, prompt, 800);
      return parseNarrativeResponse(raw, packet);
    }

    return null;
  },

  async buildPacket({ settlementCanonical, countryCanonical, year, eraNote }) {
    const displayCtx = getDisplayContext(settlementCanonical, countryCanonical, year);
    const prompt = `Generate a historical fact packet for daily life in:

CITY: ${displayCtx.settlement} (canonical: ${settlementCanonical})
COUNTRY: ${displayCtx.country} (canonical: ${countryCanonical})
YEAR: ${year}
${eraNote ? `HISTORICAL NOTE: ${eraNote}` : ""}

Your placeRecall field is your retrieval bridge — reconstruct what you know about working-class daily life in ${displayCtx.settlement} in ${year} before generating the structured anchors. Access the specific transit, food economy, bureaucratic texture, costs, and seasonal rhythms of this exact city-year intersection.`;

    const raw = await callAnthropicAPI(PACKET_SYSTEM_PROMPT, prompt, 700);
    if (!raw) return null;
    try {
      const cleaned = raw.replace(/```json\s*/g, "").replace(/```/g, "").replace(/\n/g, " ").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.placeRecall) {
        console.log("[WoE RSP] Packet recall bridge:", parsed.placeRecall.slice(0, 120));
      }
      // Merge API packet with required structure
      const localFallback = buildLocalFactPacket(settlementCanonical, countryCanonical, year, eraNote);
      return {
        year,
        placeDisplay: displayCtx.display,
        placeCanonical: { settlement: settlementCanonical, country: countryCanonical },
        validityNotes: eraNote ? [eraNote] : [],
        macroContext: parsed.macroContext || localFallback.macroContext,
        materialAnchors: parsed.materialAnchors || localFallback.materialAnchors,
        institutionalAnchors: parsed.institutionalAnchors || localFallback.institutionalAnchors,
        seasonalTexture: parsed.seasonalTexture || [],
        yearSpecificDetail: parsed.yearSpecificDetail || [],
        uncertainty: "low",
      };
    } catch {
      console.warn("[WoE API] Packet parse failed, using local fallback:", raw?.slice(0, 120));
      return null;
    }
  },
};

async function getFactPacket(args) {
  if (provider.mode === "remote" && args.year <= KNOWLEDGE_HORIZON) {
    const remote = await provider.buildPacket(args);
    if (remote) return { ...remote, packetSource: "api" };
  }
  const local = buildLocalFactPacket(args.settlementCanonical, args.countryCanonical, args.year, args.eraNote);
  return { ...local, packetSource: "local" };
}

// Deterministic tick compression for evolving continuity anchor.
// Extracts the structural shape of what happened without API overhead.
function compressTickSummary(entry) {
  const wcLabel = entry.weightClass?.name || "";
  const age = entry.age;
  const year = entry.year;

  // Extract first meaningful sentence from narrative (up to first period)
  const text = entry.text || "";
  const firstSentence = text.split(/\.\s/)[0] || "";
  // Truncate to ~100 chars for density
  const snippet = firstSentence.length > 100 ? firstSentence.slice(0, 97) + "…" : firstSentence;

  if (entry.isPosture) {
    const postureName = entry.postureId || "choice";
    return `Age ${age} (${year}): Posture — ${postureName}. ${snippet}.`;
  }

  // For extreme events, mark them
  if (["Miracle", "Lifetime Miracle", "Crush", "Lifetime Catastrophe"].includes(wcLabel)) {
    return `Age ${age} (${year}): ${wcLabel}. ${snippet}.`;
  }

  // For standard ticks, compress to bare arc
  const deltaKeys = Object.entries(entry.deltas || {})
    .filter(([, v]) => Math.abs(v) >= 3)
    .map(([k, v]) => `${STRAIN_SHORT[k]} ${v > 0 ? "↑" : "↓"}`)
    .join(", ");

  return `Age ${age} (${year}): ${deltaKeys || "maintenance"}. ${snippet}.`;
}

// Diagnostic: detect decorative derivation in sceneContext.
// If the recall bridge is just restating packet anchors, it's ritual not mechanism.
function checkRecallBridgeQuality(sceneContext, packet) {
  if (!sceneContext || !packet) return;
  const sceneWords = new Set(sceneContext.toLowerCase().split(/\s+/).filter(w => w.length > 4));
  const anchorWords = new Set(
    [...(packet.materialAnchors || []), ...(packet.institutionalAnchors || [])]
      .join(" ").toLowerCase().split(/\s+/).filter(w => w.length > 4)
  );
  if (anchorWords.size === 0 || sceneWords.size === 0) return;
  let overlap = 0;
  for (const w of sceneWords) {
    if (anchorWords.has(w)) overlap++;
  }
  const ratio = overlap / sceneWords.size;
  if (ratio > 0.6) {
    console.warn(`[WoE RSP] Recall bridge quality warning: ${Math.round(ratio * 100)}% overlap with packet anchors — bridge may be decorative`);
  }
}

// Entity reuse validation — detect whether the model is actually using
// the KNOWN WORLD block or just inventing parallel characters.
// Returns { reused, orphaned, reusedNames, orphanedNames } for diagnostics.
function checkEntityReuse(narrativeText, knownEntities, currentAge) {
  if (!narrativeText || !knownEntities || knownEntities.length === 0) {
    return { reused: [], orphaned: [], reusedNames: [], orphanedNames: [] };
  }

  const textLower = narrativeText.toLowerCase();
  const reused = [];
  const orphaned = [];

  for (const entity of knownEntities) {
    if (!entity.name) continue;
    // Check if any part of the entity name appears in narrative
    // Use first name for person entities (more likely to appear in prose)
    const searchTerms = [entity.name.toLowerCase()];
    if (entity.type === "person" && entity.name.includes(" ")) {
      searchTerms.push(entity.name.split(" ")[0].toLowerCase());
    }
    const found = searchTerms.some((term) => textLower.includes(term));

    if (found) {
      reused.push(entity);
    } else if ((entity.importance || 1) >= 2) {
      // Only flag orphaning for recurring/central entities
      const ticksSinceReferenced = entity.lastReferencedAge != null
        ? currentAge - entity.lastReferencedAge
        : currentAge - (entity.introducedAge || 0);
      orphaned.push({ ...entity, ticksSinceReferenced });
    }
  }

  // Diagnostic logging
  if (knownEntities.filter((e) => (e.importance || 1) >= 2).length >= 3 && reused.length === 0) {
    console.warn(
      `[WoE Entity] Reuse warning: ${knownEntities.filter((e) => (e.importance || 1) >= 2).length} known entities (importance ≥2) but NONE referenced in this tick's narrative. Model may be ignoring KNOWN WORLD block.`
    );
  }

  if (orphaned.some((e) => e.ticksSinceReferenced > 10)) {
    const staleNames = orphaned
      .filter((e) => e.ticksSinceReferenced > 10)
      .map((e) => `${e.name} (${e.ticksSinceReferenced} ticks stale)`)
      .join(", ");
    console.warn(`[WoE Entity] Stale entities: ${staleNames}`);
  }

  return {
    reused,
    orphaned,
    reusedNames: reused.map((e) => e.name),
    orphanedNames: orphaned.map((e) => e.name),
  };
}

// ═══════════════════════════════════════════════════════════════
// LOCAL NARRATIVE ENGINE (FALLBACK)
// ═══════════════════════════════════════════════════════════════

function dominantStrain(deltas) {
  const entries = Object.entries(deltas).filter(([, v]) => (v ?? 0) !== 0);
  if (!entries.length) return "resourceStrain";
  entries.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  return entries[0][0];
}

function deltaGloss(deltas) {
  const worst = dominantStrain(deltas);
  switch (worst) {
    case "resourceStrain":
      return (deltas[worst] ?? 0) > 0 ? "money tightens around something ordinary but unavoidable" : "the arithmetic of the household loosens a little";
    case "careStrain":
      return (deltas[worst] ?? 0) > 0 ? "someone cannot keep showing up the way they used to" : "another pair of hands appears at the right time";
    case "institutionStrain":
      return (deltas[worst] ?? 0) > 0 ? "the line, the form, or the rule becomes the day's real antagonist" : "a gate that is usually closed opens a crack";
    case "healthStrain":
      return (deltas[worst] ?? 0) > 0 ? "the body demands to be counted" : "the body gives a little room back";
    case "mobilityStrain":
      return (deltas[worst] ?? 0) > 0 ? "distance becomes heavier than it looks on paper" : "the world feels marginally more reachable";
    default:
      return "the pressures shift by degrees";
  }
}

function localNarrativeFromPacket(args) {
  const { card, weightClass, deltas, phase, packet, recent } = args;
  const first = card.name.split(" ")[0];

  // Rotate anchors: pick indices that avoid recently-used material
  const recentText = (recent || []).join(" ").toLowerCase();
  function pickFresh(arr, count = 2) {
    if (!arr || arr.length === 0) return ["daily household friction", "the nearest office"];
    const scored = arr.map((item, idx) => ({
      item,
      idx,
      stale: recentText.includes(item.toLowerCase().split(" ")[0]) ? 1 : 0,
    }));
    scored.sort((a, b) => a.stale - b.stale || Math.random() - 0.5);
    return scored.slice(0, Math.min(count, scored.length)).map((s) => s.item);
  }

  const [mat1, mat2] = pickFresh(packet.materialAnchors, 2);
  const [inst1, inst2] = pickFresh(packet.institutionalAnchors, 2);
  const macro = packet.macroContext[rng(0, packet.macroContext.length - 1)] || "uneven ordinary life";
  const season = packet.seasonalTexture?.length ? packet.seasonalTexture[rng(0, packet.seasonalTexture.length - 1)] : null;
  const yearDetail = packet.yearSpecificDetail?.length ? packet.yearSpecificDetail[rng(0, packet.yearSpecificDetail.length - 1)] : null;
  const strainSentence = deltaGloss(deltas);
  const yearspan = phase.tickYears > 1 ? `Over the stretch from ${packet.year} to ${packet.year + phase.tickYears - 1},` : `In ${packet.year},`;
  const yearshort = phase.tickYears > 1 ? `${packet.year}–${packet.year + phase.tickYears - 1}` : `${packet.year}`;

  // Build a seasonal/year-detail clause if available
  const seasonClause = season ? ` Outside, ${season.charAt(0).toLowerCase() + season.slice(1)}.` : "";
  const yearClause = yearDetail ? ` This year specifically: ${yearDetail.charAt(0).toLowerCase() + yearDetail.slice(1)}.` : "";

  // Multiple template variants per weight class, using 2 material + 2 institutional anchors
  const tones = {
    "Lifetime Miracle": [
      `${yearspan} something cracks open in ${packet.placeDisplay} that should not have been possible. The arithmetic of ${mat1} reverses without warning. ${first} walks into the ${inst1} and the line is short, the form is accepted, the answer is yes. Even ${mat2} loosens its grip. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}, and for a season the household breathes in a register it has forgotten.${seasonClause}`,
    ],
    Miracle: [
      `${yearspan} ${first} catches an opening that should not have been there. In ${packet.placeDisplay}, under ${macro}, the pressure on ${mat1} eases just enough to ripple outward — less panic around ${mat2}, one fewer deferred encounter with the ${inst1}. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}.${seasonClause} The change is quiet, physical, felt in the pace of the household's evenings.`,
      `${yearspan} a door opens. In ${packet.placeDisplay}, where ${macro} sets the daily terms, ${first} finds that ${mat1} no longer cuts the same way. The ${inst1} processes something that had been stuck for months. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}, and the household adjusts to having margin where there had been none.${yearClause}`,
    ],
    Uplift: [
      `${yearspan} the pressure slackens around ${first} just enough to notice. ${packet.placeDisplay} is still shaped by ${macro}, but ${mat1} no longer registers as the day's first anxiety. The ${inst1} moves a little faster than usual; ${mat2} finds a cheaper source.${seasonClause} ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}.`,
      `${yearspan} something marginal improves in ${packet.placeDisplay}. ${first} notices it through ${mat1} — the cost drops, or the supply holds, or the queue at the ${inst1} shortens by an hour. ${mat2} becomes slightly more manageable. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}.${yearClause}`,
    ],
    "Standard Load": [
      `${yearspan} ${first} lives inside the hum of maintenance in ${packet.placeDisplay}. The week organizes itself around ${mat1} and the timing of errands at the ${inst1}. ${macro.charAt(0).toUpperCase() + macro.slice(1)} sets the background, but the foreground is ${mat2} and the patience required by the ${inst2}. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}.${seasonClause}`,
      `${yearspan} nothing dramatic announces itself in ${packet.placeDisplay}. The household adjusts around ${mat1}, around the hours lost to the ${inst1}, around the steady friction of ${mat2}. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}. The rhythm holds because ${first} makes it hold.${yearClause}`,
      `${yearspan} ${packet.placeDisplay} continues as it does. ${first} measures the week through ${mat1} and ${mat2}, through the ${inst1}'s hours, through the small negotiations that keep the household level. Under ${macro}, ${strainSentence}.${seasonClause}`,
    ],
    "Heavy Strain": [
      `${yearspan} something that had been merely difficult becomes expensive in body or time. In ${packet.placeDisplay}, beneath ${macro}, ${mat1} stops being background and becomes the shape of the week. The ${inst1} demands more visits; ${mat2} tightens. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}.${seasonClause}`,
      `${yearspan} the margin disappears from ${first}'s week. In ${packet.placeDisplay}, ${mat1} and ${mat2} press simultaneously, and the ${inst1} offers no relief — only process. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}, and the household begins rationing something it did not used to ration.${yearClause}`,
    ],
    Crush: [
      `${yearspan} the structure gives way. Whatever buffer had existed in ${packet.placeDisplay} under ${macro} is gone. ${mat1} turns from pressure to emergency. The ${inst1} stops functioning as shelter and becomes another demand. ${mat2} collapses. ${first} discovers that ${strainSentence} — all at once, with no warning left.${seasonClause}`,
      `${yearspan} ${packet.placeDisplay} closes over ${first} like weather. ${mat1} becomes unbearable; ${mat2} follows. The ${inst1} and the ${inst2} both fail in the same month. ${strainSentence.charAt(0).toUpperCase() + strainSentence.slice(1)}, and the household absorbs what the structure will not.${yearClause}`,
    ],
    "Lifetime Catastrophe": [
      `${yearspan} every weakness becomes load-bearing at the same time. In ${packet.placeDisplay}, under ${macro}, ${mat1} turns brutal. The ${inst1} stops functioning. ${mat2} becomes unaffordable, and the ${inst2} offers nothing but forms. ${first} is forced to absorb what every system refuses — ${strainSentence}.${seasonClause}${yearClause}`,
    ],
  };

  const pool = tones[weightClass] || tones["Standard Load"];
  return pool[rng(0, pool.length - 1)];
}

function localPostureNarrative(args) {
  const { card, posture, deltas, age, packet } = args;
  const first = card.name.split(" ")[0];
  const [mat1, mat2] = packet.materialAnchors.length >= 2
    ? [packet.materialAnchors[rng(0, Math.floor(packet.materialAnchors.length / 2))], packet.materialAnchors[rng(Math.floor(packet.materialAnchors.length / 2), packet.materialAnchors.length - 1)]]
    : [packet.materialAnchors[0] || "daily household friction", "the nearest errand"];
  const inst1 = packet.institutionalAnchors[rng(0, packet.institutionalAnchors.length - 1)] || "local office";
  const macro = packet.macroContext[rng(0, packet.macroContext.length - 1)] || "uneven ordinary life";
  const twist = deltaGloss(deltas);
  const season = packet.seasonalTexture?.length ? packet.seasonalTexture[rng(0, packet.seasonalTexture.length - 1)] : null;
  const seasonClause = season ? ` ${season.charAt(0).toUpperCase() + season.slice(1)}.` : "";

  const variants = {
    anchor: `At age ${age}, ${first} decides that endurance without witnesses is no longer enough. In ${packet.placeDisplay}, under ${macro}, the choice takes material form — calls returned, meals shared across households, favors finally asked for. The friction of ${mat1} remains real, but now there are two pairs of hands where there was one. The ${inst1} still demands its visits.${seasonClause} ${twist.charAt(0).toUpperCase() + twist.slice(1)}, and the household finds a new shape around the decision.`,
    invest: `At age ${age}, ${first} spends scarce margin on a future that does not yet exist. In ${packet.placeDisplay}, where ${macro} governs the pace of ordinary life, the gamble runs through ${mat2}, through paperwork at the ${inst1}, through hours stolen from the household's maintenance rhythm. ${mat1} gets harder while the investment has not yet paid.${seasonClause} ${twist.charAt(0).toUpperCase() + twist.slice(1)}.`,
    endure: `At age ${age}, ${first} narrows the week to what can be kept from collapsing. In ${packet.placeDisplay}, against ${macro}, the decision is not glamorous but exact — less exposure, tighter routine, one fewer demand carried to the ${inst1}. ${mat1} stays manageable only because the radius of life contracts around it. ${mat2} gets deferred.${seasonClause} ${twist.charAt(0).toUpperCase() + twist.slice(1)}.`,
    risk: `At age ${age}, ${first} chooses motion over stasis. In ${packet.placeDisplay}, beneath ${macro}, that means accepting uncertainty around ${mat1} in exchange for a wider horizon. The ${inst1} may open a new door or slam one shut. ${mat2} may get worse before it gets better.${seasonClause} ${twist.charAt(0).toUpperCase() + twist.slice(1)}, and the household holds its breath.`,
    withdraw: `At age ${age}, ${first} makes the world smaller to survive it. In ${packet.placeDisplay}, under ${macro}, the circle contracts to the household, the nearest sources of ${mat1}, and whatever can be managed without another trip through the ${inst1}. ${mat2} fades from the week's concerns — not solved, just abandoned.${seasonClause} ${twist.charAt(0).toUpperCase() + twist.slice(1)}.`,
  };

  return variants[posture.id] || variants.endure;
}

// ═══════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════

function getPressureDeltas(weightClass, pressures, age, roll = 500) {
  const sorted = Object.entries(pressures).sort((a, b) => b[1] - a[1]);
  const [topP, secP, midP] = sorted.map((s) => s[0]);
  const lowP = sorted[sorted.length - 1][0];
  const d = {
    resourceStrain: 0,
    careStrain: 0,
    institutionStrain: 0,
    healthStrain: 0,
    mobilityStrain: 0,
  };

  for (const [k, v] of Object.entries(pressures)) {
    if (v > 70 && Math.random() < 0.35) d[k] -= rng(1, 3);
    else if (v > 55 && Math.random() < 0.2) d[k] -= rng(1, 2);
    if (v < 12 && Math.random() < 0.3) d[k] += rng(1, 2);
  }

  switch (weightClass.name) {
    case "Lifetime Miracle":
      for (const k of ALL_STRAINS) d[k] -= rng(15, 35);
      break;
    case "Miracle":
      d[topP] -= rng(10, 20);
      d[secP] -= rng(3, 8);
      break;
    case "Uplift":
      d[topP] -= rng(2, 7);
      if (Math.random() > 0.4) d[secP] -= rng(1, 4);
      break;
    case "Standard Load": {
      // Intensity-modulated: position within the 151-750 range biases outcomes
      // slPos 0.0 = roll 151 (lightest Standard Load), 1.0 = roll 750 (heaviest)
      const slPos = Math.max(0, Math.min(1, (roll - 151) / (750 - 151)));
      const r = Math.random();

      if (slPos < 0.25) {
        // Light end — more likely to get relief, smaller pressure increases
        if (r < 0.3) {
          d[topP] -= rng(1, 4);
          d[secP] -= rng(0, 2);
        } else if (r < 0.6) {
          d[topP] -= rng(1, 3);
          d[lowP] += rng(1, 2);
        } else {
          d[lowP] += rng(1, 3);
          if (Math.random() > 0.6) d[midP] += rng(0, 2);
        }
      } else if (slPos < 0.5) {
        // Lower-middle — slight relief bias, standard magnitudes
        if (r < 0.2) {
          d[topP] -= rng(1, 3);
          d[lowP] += rng(1, 2);
        } else if (r < 0.45) {
          d[lowP] += rng(2, 4);
          d[topP] -= rng(0, 2);
        } else if (r < 0.75) {
          d[lowP] += rng(2, 4);
          if (Math.random() > 0.4) d[midP] += rng(1, 3);
        } else {
          d[midP] += rng(1, 3);
          d[lowP] += rng(0, 2);
        }
      } else if (slPos < 0.75) {
        // Upper-middle — pressure bias, magnitudes start climbing
        if (r < 0.1) {
          d[topP] -= rng(0, 2);
          d[lowP] += rng(2, 4);
        } else if (r < 0.4) {
          d[lowP] += rng(2, 5);
          d[midP] += rng(1, 3);
        } else if (r < 0.75) {
          d[lowP] += rng(3, 5);
          d[midP] += rng(1, 3);
          if (Math.random() > 0.5) d[secP] += rng(1, 2);
        } else {
          d[midP] += rng(2, 4);
          d[lowP] += rng(1, 3);
          d[secP] += rng(0, 2);
        }
      } else {
        // Heavy end — significant pressure, multiple strains hit
        if (r < 0.15) {
          d[lowP] += rng(3, 5);
          d[midP] += rng(1, 3);
        } else if (r < 0.5) {
          d[lowP] += rng(3, 6);
          d[midP] += rng(2, 4);
          d[secP] += rng(1, 2);
        } else {
          d[lowP] += rng(4, 6);
          d[midP] += rng(2, 4);
          d[secP] += rng(1, 3);
          if (Math.random() > 0.6) d[topP] += rng(1, 2);
        }
      }
      break;
    }
    case "Heavy Strain":
      d[topP] += rng(8, 16);
      d[secP] += rng(3, 9);
      if (Math.random() > 0.5) d[midP] += rng(1, 5);
      break;
    case "Crush":
      d[topP] += rng(20, 32);
      d[secP] += rng(10, 20);
      d[midP] += rng(3, 9);
      break;
    case "Lifetime Catastrophe":
      for (const k of ALL_STRAINS) d[k] += rng(18, 35);
      break;
  }

  if (age > 45 && Math.random() < 0.3) d.healthStrain += rng(1, 2);
  if (age > 60) d.healthStrain += rng(1, 3);
  if (age > 75) d.healthStrain += rng(2, 5);
  if (age > 85) d.healthStrain += rng(3, 7);

  if (age > 60) {
    if (Math.random() < 0.35) d.careStrain += rng(1, 2);
    if (Math.random() < 0.25) d.mobilityStrain += rng(1, 2);
  }
  if (age > 75) {
    d.careStrain += rng(0, 2);
    d.mobilityStrain += rng(1, 3);
    if (Math.random() < 0.3) d.institutionStrain += rng(1, 2);
    if (Math.random() < 0.25) d.resourceStrain += rng(1, 2);
  }
  if (age > 85) {
    d.careStrain += rng(1, 3);
    d.mobilityStrain += rng(1, 3);
    d.institutionStrain += rng(0, 2);
    d.resourceStrain += rng(0, 2);
  }

  return d;
}

const POSTURES = [
  { id: "anchor", name: "Anchor", icon: "⚓", desc: "Strengthen a relationship or community tie.", effect: "Care Strain −2–8 · Resource Strain −0–3 · Mobility Strain may rise" },
  { id: "invest", name: "Invest", icon: "📚", desc: "Spend buffer now for future capability.", effect: "Institution Strain −2–6 · Resource Strain +1–4 short-term" },
  { id: "endure", name: "Endure", icon: "🛡️", desc: "Stability first. Minimize exposure.", effect: "Health Strain −1–4 · Resource Strain −0–3" },
  { id: "risk", name: "Risk", icon: "🎲", desc: "Attempt mobility or opportunity.", effect: "Mobility Strain −2–10 · Resource Strain may improve or worsen" },
  { id: "withdraw", name: "Withdraw", icon: "🚪", desc: "Shrink the world to protect the self.", effect: "Health Strain −2–8 · Resource Strain −1–4 · Care Strain may worsen" },
];

function applyPosture(postureId) {
  const d = {
    resourceStrain: 0,
    careStrain: 0,
    institutionStrain: 0,
    healthStrain: 0,
    mobilityStrain: 0,
  };
  switch (postureId) {
    case "anchor":
      d.careStrain = -rng(2, 8);
      d.resourceStrain = -rng(0, 3);
      d.institutionStrain = -rng(0, 4);
      d.mobilityStrain = rng(0, 3);
      break;
    case "invest":
      d.institutionStrain = -rng(2, 6);
      d.resourceStrain = rng(1, 4);
      break;
    case "endure":
      d.healthStrain = -rng(1, 4);
      d.resourceStrain = -rng(0, 3);
      d.mobilityStrain = rng(0, 2);
      break;
    case "risk":
      d.mobilityStrain = -rng(2, 10);
      d.resourceStrain = Math.random() > 0.4 ? -rng(2, 6) : rng(2, 5);
      d.healthStrain = rng(0, 3);
      break;
    case "withdraw":
      d.healthStrain = -rng(2, 8);
      d.resourceStrain = -rng(1, 4);
      d.careStrain = rng(1, 4);
      d.institutionStrain = -rng(0, 3);
      break;
  }
  return d;
}

function checkPressureBreak(p) {
  const v = Object.values(p);
  if (v.some((x) => x >= 75)) return true;
  if (v.filter((x) => x >= 65).length >= 2) return true;
  const systemicLoad = v.reduce((sum, x) => sum + Math.max(0, x - 40), 0);
  if (systemicLoad >= 100) return true;
  if (v.filter((x) => x >= 55).length >= 3) return true;
  return false;
}

// ═══════════════════════════════════════════════════════════════
// ROLE CONTEXT — code-side combinatorics for retrieval-key richness
// The role string goes into the prompt as CURRENT ROLE. A richer
// role primes a richer narrative basin. Code handles the intersection;
// the LLM renders the consequences.
// ═══════════════════════════════════════════════════════════════

const ROLE_CONTEXT = {
  India: {
    child: (era, cls) => era < 1991 ? "School-age child, municipal or state school" : "School-age child, government or low-cost private school",
    adolescent: (era, cls) => cls === "high" ? "Adolescent, likely working alongside schooling" : "Adolescent in secondary education",
    youngAdult: (era, cls) => era < 1991 ? "Young adult navigating License Raj employment" : "Young adult in liberalization-era labor market",
    adult: (era, cls) => cls === "high" ? "Adult in informal or precarious employment" : "Adult in settled employment",
    elder: () => "Elder, dependent on family structure for care",
  },
  China: {
    child: (era) => era < 1979 ? "School-age child in state collective system" : "School-age child in reform-era public school",
    adolescent: (era) => era < 1979 ? "Adolescent in collective-era education" : "Adolescent navigating gaokao pressure system",
    youngAdult: (era) => era < 1979 ? "Young adult assigned work through danwei system" : "Young adult in reform-era labor market or migrant work",
    adult: (era) => era < 1979 ? "Adult worker in state-assigned danwei" : "Adult in market-era employment",
    elder: (era) => era < 1979 ? "Elder within danwei welfare structure" : "Elder navigating eroded collective care systems",
  },
  Russia: {
    child: (era) => era < 1992 ? "School-age child in Soviet state school" : "School-age child in post-Soviet underfunded school",
    adolescent: (era) => era < 1992 ? "Adolescent preparing for vocational or university track" : "Adolescent in chaotic post-Soviet education",
    youngAdult: (era) => era < 1992 ? "Young adult in state-assigned employment" : "Young adult improvising in market transition",
    adult: (era) => era < 1992 ? "Adult worker in Soviet state enterprise" : "Adult navigating post-Soviet labor market",
    elder: (era) => era < 1992 ? "Elder receiving Soviet pension and polyclinic care" : "Elder on devalued pension",
  },
  Nigeria: {
    child: (era, cls) => cls === "high" ? "School-age child with irregular school attendance" : "School-age child in state primary school",
    adolescent: (era, cls) => cls === "high" ? "Adolescent combining school with market apprenticeship" : "Adolescent in secondary school",
    youngAdult: (era) => era < 1999 ? "Young adult under military-era employment constraints" : "Young adult hustling in democratic-era informal economy",
    adult: (era, cls) => cls === "high" ? "Adult in informal trade or day labor" : "Adult in formal or semi-formal employment",
    elder: () => "Elder relying on extended family and community care",
  },
  Egypt: {
    child: () => "School-age child in state or azhari school system",
    adolescent: (era, cls) => cls === "high" ? "Adolescent balancing school with family labor" : "Adolescent preparing for thanawiya amma exams",
    youngAdult: (era) => era < 2000 ? "Young adult seeking public sector employment" : "Young adult in overcrowded graduate labor market",
    adult: () => "Adult in formal or informal employment",
    elder: () => "Elder dependent on family and limited pension",
  },
  Brazil: {
    child: (era) => era < 1985 ? "School-age child in triple-shift state school" : "School-age child in public school with merenda escolar",
    adolescent: (era, cls) => cls === "high" ? "Adolescent combining school with informal work" : "Adolescent in secondary education",
    youngAdult: (era) => era < 1994 ? "Young adult navigating hyperinflation-era employment" : "Young adult in post-Plano Real labor market",
    adult: (era, cls) => cls === "high" ? "Adult in informal work with carteira pending" : "Adult with carteira de trabalho employment",
    elder: () => "Elder on minimal pension, dependent on household",
  },
  Myanmar: {
    child: (era) => era < 1989 ? "School-age child in Burmese-language state school" : "School-age child in junta-era state school with unofficial fees",
    adolescent: (era) => era < 1989 ? "Adolescent in restricted educational system" : "Adolescent navigating limited post-primary options",
    youngAdult: () => "Young adult in constrained employment landscape",
    adult: () => "Adult in formal or informal employment under military economy",
    elder: () => "Elder dependent on family network",
  },
  "United States": {
    child: () => "School-age child in public school district",
    adolescent: (era, cls) => cls === "high" ? "Adolescent working part-time alongside school" : "Adolescent in high school",
    youngAdult: (era) => era < 1980 ? "Young adult entering industrial or service employment" : "Young adult in deindustrialized labor market",
    adult: (era, cls) => cls === "high" ? "Adult in precarious or service-sector employment" : "Adult in stable employment",
    elder: (era) => era < 1980 ? "Elder on Social Security with employer pension" : "Elder on Social Security, pension uncertain",
  },
  "United Kingdom": {
    child: (era) => era < 1980 ? "School-age child in state comprehensive or grammar school" : "School-age child in state school",
    adolescent: (era, cls) => cls === "high" ? "Adolescent likely leaving school at 16" : "Adolescent in secondary education",
    youngAdult: (era) => era < 1980 ? "Young adult entering industrial or public-sector work" : "Young adult in post-industrial labor market",
    adult: (era, cls) => cls === "high" ? "Adult on benefits or in precarious employment" : "Adult in steady employment",
    elder: () => "Elder on state pension with NHS access",
  },
  Germany: {
    child: () => "School-age child in state Grundschule",
    adolescent: () => "Adolescent in Hauptschule, Realschule, or Gymnasium track",
    youngAdult: (era) => era < 1990 ? "Young adult in apprenticeship or post-reunification transition" : "Young adult in dual-education employment system",
    adult: () => "Adult in employment within social market economy",
    elder: () => "Elder on Rentenversicherung pension",
  },
};

function getRoleContext(age, countryCanonical, currentYear, classTier) {
  const lookup = ROLE_CONTEXT[countryCanonical];
  const cls = classTier || "mid";

  if (age < 5) return "Infant/toddler in household care";

  let stage;
  if (age < 13) stage = "child";
  else if (age < 18) stage = "adolescent";
  else if (age < 26) stage = "youngAdult";
  else if (age < 56) stage = "adult";
  else stage = "elder";

  if (lookup && lookup[stage]) {
    return lookup[stage](currentYear, cls);
  }

  // Generic fallback — still richer than bare labels
  const generic = {
    child: "School-age child in local primary system",
    adolescent: cls === "high" ? "Adolescent balancing school with household labor" : "Adolescent in secondary education",
    youngAdult: "Young adult entering local labor market",
    adult: cls === "high" ? "Adult in informal or precarious work" : "Adult in settled employment",
    elder: "Elder dependent on household and community care",
  };
  return generic[stage] || "Adult";
}

// ═══════════════════════════════════════════════════════════════
// STRAIN CRISES — non-terminal structural ruptures
// When a non-Health strain hits 100, the life doesn't end — it
// breaks and reorganizes. The crisis resets the strain, cascades
// damage into other axes, and injects a narrative moment.
// Health 100 remains the only terminal condition.
// ═══════════════════════════════════════════════════════════════

const STRAIN_CRISES = {
  resourceStrain: {
    name: "Destitution Crisis",
    icon: "💔",
    desc: "Total economic collapse — loss of shelter, complete poverty, the bottom falling out.",
    resetTo: [80, 85],
    cascade: { healthStrain: [10, 15], careStrain: [5, 10], mobilityStrain: [5, 8] },
  },
  careStrain: {
    name: "Isolation Crisis",
    icon: "🕳️",
    desc: "Complete loss of support structure — the last person who was showing up has stopped.",
    resetTo: [75, 80],
    cascade: { healthStrain: [8, 12], resourceStrain: [5, 8], mobilityStrain: [3, 5] },
  },
  institutionStrain: {
    name: "Structural Rupture",
    icon: "⛓️",
    desc: "The system has fully failed or expelled — imprisonment, displacement, loss of legal status, bureaucratic catastrophe.",
    resetTo: [70, 75],
    cascade: { resourceStrain: [8, 12], mobilityStrain: [10, 15], healthStrain: [5, 10], careStrain: [5, 8] },
  },
  mobilityStrain: {
    name: "Confinement Crisis",
    icon: "🚪",
    desc: "The world has shrunk to the room — bedridden, housebound, physically trapped.",
    resetTo: [80, 85],
    cascade: { healthStrain: [10, 15], careStrain: [8, 12], resourceStrain: [3, 5] },
  },
};

function resolveStrainCrises(pressures, age, ageLabel, year) {
  const crises = [];
  const np = { ...pressures };

  // Check each non-Health strain — Health 100 is handled separately as terminal
  for (const strain of ["resourceStrain", "careStrain", "institutionStrain", "mobilityStrain"]) {
    if (np[strain] >= 100) {
      const crisis = STRAIN_CRISES[strain];
      // Reset the triggering strain
      np[strain] = rng(crisis.resetTo[0], crisis.resetTo[1]);
      // Cascade into other strains
      for (const [target, range] of Object.entries(crisis.cascade)) {
        np[target] = clampP(np[target] + rng(range[0], range[1]));
      }
      crises.push({
        strain,
        crisis,
        entry: {
          id: crypto.randomUUID(),
          age,
          year,
          phase: getPhase(age).num,
          title: `${crisis.icon} ${crisis.name} — ${ageLabel}`,
          text: "…",
          pending: true,
          isCrisis: true,
          crisisStrain: strain,
          crisisName: crisis.name,
          crisisDesc: crisis.desc,
          roll: null,
          weightClass: null,
          deltas: Object.fromEntries(
            Object.entries(crisis.cascade).map(([k, range]) => [k, rng(range[0], range[1])])
          ),
        },
        majorEventLabel: `${ageLabel}: ${crisis.name}`,
      });
    }
  }

  return { pressures: np, crises };
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const init = {
  screen: "LANDING",
  stateCard: null,
  narrativeLog: [],
  currentAge: 0,
  birthYear: 0,
  lastRoll: null,
  lastWeightClass: null,
  lastDeltas: null,
  pendingPressureBreak: false,
  rollHistory: [],
  isRolling: false,
  rollDisplay: null,
  isGenerating: false,
  continent: null,
  country: null,
  nameGenerating: false,
  birthNarrativePending: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "START_GAME":
      return { ...state, screen: "PHASE_0_CONTINENT", isRolling: false };
    case "SET_ROLLING":
      return { ...state, isRolling: true, rollDisplay: null };
    case "RESOLVE_CONTINENT": {
      const continent = sampleWeighted(WORLD, action.roll);
      return { ...state, continent, isRolling: false, lastRoll: action.roll, rollDisplay: action.roll, screen: "PHASE_0_CONTINENT_RESULT" };
    }
    case "ADVANCE_TO_COUNTRY":
      return { ...state, rollDisplay: null, screen: "PHASE_0_COUNTRY" };
    case "RESOLVE_COUNTRY": {
      const country = sampleWeighted(state.continent.countries, action.roll);
      return { ...state, country, isRolling: false, lastRoll: action.roll, rollDisplay: action.roll, screen: "PHASE_0_COUNTRY_RESULT" };
    }
    case "ADVANCE_TO_IDENTITY":
      return { ...state, rollDisplay: null, screen: "PHASE_0_IDENTITY" };
    case "RESOLVE_IDENTITY": {
      const c = state.country;
      const sex = action.sexRoll <= 50 ? "Male" : "Female";
      const names = sex === "Male" ? c.namesMale : c.namesFemale;
      const nameIdx = Math.min(Math.floor((action.nameRoll / 100) * names.length), names.length - 1);
      const sIdx = c.surnames.length ? Math.floor(Math.random() * c.surnames.length) : -1;
      const fullName = sIdx >= 0 ? `${names[nameIdx]} ${c.surnames[sIdx]}` : names[nameIdx];

      const eraRoll = Math.random();
      const birthYear =
        eraRoll < 0.1 ? 1930 + Math.floor(Math.random() * 20) :
        eraRoll < 0.4 ? 1950 + Math.floor(Math.random() * 20) :
        eraRoll < 0.75 ? 1970 + Math.floor(Math.random() * 20) :
        1990 + Math.floor(Math.random() * 21);

      const validSettlements = c.settlements.filter((s) => {
        const eraCheck = SETTLEMENT_ERA[s];
        return !eraCheck || birthYear >= eraCheck.minYear;
      });
      const settlIdx = Math.min(Math.floor((action.settlementRoll / 1000) * validSettlements.length), validSettlements.length - 1);
      const rawSettlement = validSettlements[settlIdx];
      const hist = validateHistoricalContext(rawSettlement, c.name, birthYear);

      const hTier = action.householdRoll <= 300 ? "low" : action.householdRoll <= 700 ? "mid" : "high";
      const hh = HOUSEHOLD_TYPES[hTier][Math.floor(Math.random() * HOUSEHOLD_TYPES[hTier].length)];

      const bTier = action.bodyRoll <= 300 ? "low" : action.bodyRoll <= 700 ? "mid" : "high";
      const body = BODY_BASELINES[bTier][Math.floor(Math.random() * BODY_BASELINES[bTier].length)];

      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const bm = months[Math.floor(Math.random() * 12)];
      const bd = Math.floor(Math.random() * 28) + 1;
      const dev = ["United States", "Canada", "Australia", "New Zealand", "United Kingdom", "Germany", "Japan"].includes(c.name);
      const pressures = {
        resourceStrain: clampP(hh.resourceP + rng(-3, 3)),
        careStrain: clampP(hh.careP + rng(-3, 3)),
        institutionStrain: clampP(dev ? rng(15, 24) : rng(25, 39)),
        healthStrain: clampP(body.healthP + rng(-3, 3)),
        mobilityStrain: clampP(dev ? rng(15, 24) : rng(30, 44)),
      };

      const card = {
        schemaVersion: "4.11.0",
        name: fullName,
        dateOfBirth: `${bm} ${bd}, ${birthYear}`,
        birthYear,
        sexAtBirth: sex,
        communityLineage: `${state.continent.name} / ${c.name}`,
        birthPlaceCanonical: { settlement: rawSettlement, country: c.name },
        birthPlaceDisplay: `${hist.settlement}, ${hist.country}`,
        placeOfBirth: `${hist.settlement}, ${hist.country}`,
        currentLocationCanonical: { settlement: rawSettlement, country: c.name },
        currentRole: "Newborn",
        currentAge: 0,
        householdStructure: hh.structure,
        householdDesc: hh.desc,
        socioeconomicClass: hTier === "low" ? "Stable working / lower-middle" : hTier === "mid" ? "Strained working class" : "Precarious / marginalized",
        pressures,
        eraNote: hist.eraNote,
        assets: [hh.careP < 30 ? "Attentive primary caregiver" : "Extended family network", `Local community in ${hist.settlement}`],
        constraints: [body.healthP > 35 ? body.desc : null, hh.resourceP > 40 ? "Financial precarity" : null].filter(Boolean),
        majorEvents: [],
        continuityAnchor: `Born ${bm} ${bd}, ${birthYear} in ${hist.settlement}, ${hist.country}. ${hh.desc}. ${body.desc}.`,
        bodyDesc: body.desc,
        bodyNote: body.note,
        knownEntities: [],
      };

      const birthEntry = {
        id: crypto.randomUUID(),
        age: 0,
        year: birthYear,
        phase: "0",
        title: "Birth",
        text: `${fullName} is born in ${hist.settlement}, ${hist.country}, on ${bm} ${bd}, ${birthYear}. The household: ${hh.desc}. The body: ${body.note}. The five strains begin their count.`,
        isBirth: true,
        birthPlaceholderName: fullName,
        roll: null,
        weightClass: null,
        deltas: null,
      };

      return {
        ...state,
        isRolling: false,
        screen: "PHASE_0_COMPLETE",
        stateCard: card,
        birthYear,
        currentAge: 0,
        nameGenerating: true,
        birthNarrativePending: true,
        narrativeLog: [birthEntry],
      };
    }
    case "BEGIN_SIMULATION":
      return { ...state, screen: "PLAYING", currentAge: 1 };
    case "RESOLVE_TICK": {
      const wc = getWeightClass(action.roll);
      const phase = getPhase(state.currentAge);
      const deltas = getPressureDeltas(wc, state.stateCard.pressures, state.currentAge, action.roll);
      let np = Object.fromEntries(ALL_STRAINS.map((k) => [k, clampP(state.stateCard.pressures[k] + deltas[k])]));
      const endAge = state.currentAge + phase.tickYears - 1;
      const ageL = phase.tickYears > 1 ? `Age ${state.currentAge}–${endAge}` : `Age ${state.currentAge}`;
      const yearL = phase.tickYears > 1 ? `${state.birthYear + state.currentAge}–${state.birthYear + endAge}` : `${state.birthYear + state.currentAge}`;

      // Strain crisis resolution — non-Health strains at 100 trigger structural ruptures
      // that reset the strain, cascade damage, and inject narrative entries.
      // This runs BEFORE the terminal check so a cascade into Health 100 is lethal.
      const crisisResult = resolveStrainCrises(np, state.currentAge, ageL, state.birthYear + state.currentAge);
      np = crisisResult.pressures;
      const crisisEntries = crisisResult.crises.map((c) => c.entry);
      const crisisEvents = crisisResult.crises.map((c) => c.majorEventLabel);

      let role = state.stateCard.currentRole;
      const classTier = state.stateCard.socioeconomicClass.includes("Precarious") ? "high"
        : state.stateCard.socioeconomicClass.includes("Strained") ? "mid" : "low";
      const currentYear = state.birthYear + state.currentAge;
      role = getRoleContext(
        state.currentAge,
        state.stateCard.currentLocationCanonical.country,
        currentYear,
        classTier,
      );

      const pendingEntry = {
        id: crypto.randomUUID(),
        age: state.currentAge,
        year: state.birthYear + state.currentAge,
        phase: phase.num,
        title: `${ageL} (${yearL}) — Phase ${phase.num}`,
        text: "…",
        pending: true,
        roll: action.roll,
        weightClass: wc,
        deltas,
      };

      const isTerminal = np.healthStrain >= 100;
      const isPB = !isTerminal && (crisisEntries.length > 0 || checkPressureBreak(np));
      const newAge = state.currentAge + phase.tickYears;

      // Horizon crossing detection — inject notification once
      const tickYear = state.birthYear + state.currentAge;
      const crossedHorizon = tickYear > KNOWLEDGE_HORIZON && !state.narrativeLog.some((e) => e.isHorizonMarker);
      const horizonEntry = crossedHorizon ? {
        id: crypto.randomUUID(),
        age: state.currentAge,
        year: tickYear,
        phase: phase.num,
        title: "⌛ Knowledge Horizon",
        text: `The simulation has crossed the model's knowledge horizon (${KNOWLEDGE_HORIZON}). Narrative generation shifts to local fallback — structurally projected from era patterns rather than historically grounded in specific place-year data. The instrument's resolution decreases; the strains continue.`,
        isHorizonMarker: true,
        roll: null,
        weightClass: null,
        deltas: null,
      } : null;

      return {
        ...state,
        isRolling: false,
        isGenerating: true,
        rollDisplay: action.roll,
        lastRoll: action.roll,
        lastWeightClass: wc,
        lastDeltas: deltas,
        currentAge: newAge,
        stateCard: {
          ...state.stateCard,
          pressures: np,
          currentAge: newAge,
          currentRole: role,
          majorEvents: [
            ...state.stateCard.majorEvents,
            ...(["Miracle", "Lifetime Miracle", "Crush", "Lifetime Catastrophe"].includes(wc.name) ? [`${ageL}: ${wc.name}`] : []),
            ...crisisEvents,
          ],
        },
        narrativeLog: [...state.narrativeLog, ...(horizonEntry ? [horizonEntry] : []), pendingEntry, ...crisisEntries],
        pendingPressureBreak: isPB,
        screen: isTerminal ? "TERMINAL" : isPB ? "PRESSURE_BREAK" : "PLAYING",
        rollHistory: [...state.rollHistory, action.roll],
      };
    }
    case "UPDATE_NARRATIVE": {
      const nextNarrativeLog = state.narrativeLog.map((e) => (e.id === action.id ? { ...e, text: action.text, pending: false, packetSource: action.packetSource || null } : e));
      const stillPending = nextNarrativeLog.some((e) => e.pending);

      // Evolving continuity anchor — compress this tick and append (FIFO, ~500 char cap)
      const resolvedEntry = nextNarrativeLog.find((e) => e.id === action.id);
      let anchor = state.stateCard?.continuityAnchor || "";
      if (resolvedEntry && resolvedEntry.text !== "…") {
        const summary = compressTickSummary(resolvedEntry);
        anchor = anchor + " | " + summary;
        if (anchor.length > 600) {
          const parts = anchor.split(" | ");
          const birthPart = parts[0];
          let trimmed = birthPart;
          for (let i = parts.length - 1; i >= 1; i--) {
            if ((trimmed + " | " + parts[i]).length > 550) break;
            trimmed = trimmed + " | " + parts[i];
          }
          anchor = trimmed;
        }
      }

      // Merge new entities into knownEntities — dedupe by name, keep higher importance
      const existing = state.stateCard?.knownEntities || [];
      const incoming = action.entities || [];
      const currentAge = state.currentAge;
      const merged = [...existing];
      for (const ent of incoming) {
        const idx = merged.findIndex((e) => e.name === ent.name);
        if (idx >= 0) {
          // Update if incoming has higher importance or more detail
          if ((ent.importance || 1) >= (merged[idx].importance || 1)) {
            merged[idx] = { ...merged[idx], ...ent };
          }
        } else {
          // New entity — stamp with introducedAge
          merged.push({ ...ent, introducedAge: currentAge });
        }
      }

      // Entity reuse validation — cross-check model's declaration against actual text
      const reuseResult = checkEntityReuse(action.text, merged, currentAge);
      const modelDeclared = action.referencedEntities || [];

      // Cross-check: model declared a reference but name doesn't appear in text
      for (const declaredName of modelDeclared) {
        if (!reuseResult.reusedNames.some((n) => n.toLowerCase() === declaredName.toLowerCase())) {
          console.warn(`[WoE Entity] Cross-check: model declared "${declaredName}" in referencedEntities but name not found in narrative text — phantom declaration`);
        }
      }

      // Cross-check: name appears in text but model didn't declare it
      for (const foundName of reuseResult.reusedNames) {
        if (!modelDeclared.some((d) => d.toLowerCase() === foundName.toLowerCase())) {
          console.log(`[WoE Entity] Cross-check: "${foundName}" found in narrative but not in model's referencedEntities — model under-reporting`);
        }
      }

      // Update lastReferencedAge for entities that appear in the narrative text
      // (using actual text presence, not just the model's declaration — trust but verify)
      for (const ent of merged) {
        if (reuseResult.reusedNames.includes(ent.name)) {
          ent.lastReferencedAge = currentAge;
        }
      }

      // Sort by importance desc, cap at 25
      merged.sort((a, b) => (b.importance || 1) - (a.importance || 1));
      const cappedEntities = merged.slice(0, 25);

      return {
        ...state,
        isGenerating: stillPending,
        narrativeLog: nextNarrativeLog,
        stateCard: state.stateCard ? {
          ...state.stateCard,
          continuityAnchor: anchor,
          knownEntities: cappedEntities,
        } : state.stateCard,
      };
    }
    case "RESOLVE_POSTURE": {
      const pd = applyPosture(action.posture);
      const np = Object.fromEntries(ALL_STRAINS.map((k) => [k, clampP(state.stateCard.pressures[k] + pd[k])]));
      const pst = POSTURES.find((x) => x.id === action.posture);
      const postureEntry = {
        id: crypto.randomUUID(),
        age: state.currentAge,
        year: state.birthYear + state.currentAge,
        phase: getPhase(state.currentAge).num,
        title: `⚡ Pressure Break — Posture: ${pst.name}`,
        text: "…",
        pending: true,
        isPosture: true,
        postureId: action.posture,
        roll: null,
        weightClass: null,
        deltas: pd,
      };
      return {
        ...state,
        stateCard: { ...state.stateCard, pressures: np },
        pendingPressureBreak: false,
        screen: "PLAYING",
        isGenerating: true,
        narrativeLog: [...state.narrativeLog, postureEntry],
      };
    }
    case "UPDATE_NAME": {
      const oldName = state.stateCard.name;
      return {
        ...state,
        nameGenerating: false,
        stateCard: {
          ...state.stateCard,
          name: action.name,
          continuityAnchor: state.stateCard.continuityAnchor.replace(oldName, action.name),
        },
        narrativeLog: state.narrativeLog.map((e) => ({
          ...e,
          text: e.text.replaceAll(oldName, action.name),
          title: e.title.replaceAll(oldName, action.name),
        })),
      };
    }
    case "NAME_GENERATION_FAILED":
      return { ...state, nameGenerating: false };
    case "UPDATE_BIRTH_NARRATIVE": {
      const birthEntry = state.narrativeLog.find((e) => e.isBirth);
      if (!birthEntry) return { ...state, birthNarrativePending: false };
      let text = action.text;
      if (birthEntry.birthPlaceholderName && birthEntry.birthPlaceholderName !== state.stateCard.name) {
        text = text.replaceAll(birthEntry.birthPlaceholderName, state.stateCard.name);
      }
      const birthEntities = (action.entities || []).filter((e) => e.name && e.type)
        .map((e) => ({ ...e, introducedAge: 0, lastReferencedAge: 0 }));
      return {
        ...state,
        birthNarrativePending: false,
        narrativeLog: state.narrativeLog.map((e) => (e.isBirth ? { ...e, text } : e)),
        stateCard: state.stateCard ? {
          ...state.stateCard,
          knownEntities: [...(state.stateCard.knownEntities || []), ...birthEntities].slice(0, 25),
        } : state.stateCard,
      };
    }
    case "BIRTH_NARRATIVE_FAILED":
      return { ...state, birthNarrativePending: false };
    default:
      return state;
  }
}

// ═══════════════════════════════════════════════════════════════
// SELF TESTS
// ═══════════════════════════════════════════════════════════════

function makeTestCard() {
  return {
    schemaVersion: "4.11.0",
    name: "Test Person",
    dateOfBirth: "January 1, 1970",
    birthYear: 1970,
    sexAtBirth: "Male",
    communityLineage: "Asia / Myanmar",
    birthPlaceCanonical: { settlement: "Yangon", country: "Myanmar" },
    birthPlaceDisplay: "Rangoon, Burma",
    placeOfBirth: "Rangoon, Burma",
    currentLocationCanonical: { settlement: "Yangon", country: "Myanmar" },
    currentRole: "Adult",
    currentAge: 20,
    householdStructure: "Two-parent household, stable income",
    householdDesc: "nuclear family with steady employment",
    socioeconomicClass: "Stable working / lower-middle",
    pressures: {
      resourceStrain: 20,
      careStrain: 25,
      institutionStrain: 30,
      healthStrain: 35,
      mobilityStrain: 40,
    },
    assets: ["Extended family network"],
    constraints: [],
    majorEvents: [],
    continuityAnchor: "Test anchor",
    bodyDesc: "Healthy baseline",
    bodyNote: "No major conditions",
    eraNote: "",
  };
}

function runSelfTests() {
  const results = [];

  try {
    const display = getDisplayContext("Yangon", "Myanmar", 1980).display;
    results.push({
      name: "Historical display renames Yangon/Myanmar before 1989",
      pass: display === "Rangoon, Burma",
      detail: `Got: ${display}`,
    });
  } catch (err) {
    results.push({
      name: "Historical display renames Yangon/Myanmar before 1989",
      pass: false,
      detail: String(err),
    });
  }

  try {
    const posture = POSTURES.find((p) => p.id === "anchor");
    const packet = buildLocalFactPacket("Yangon", "Myanmar", 1980, "");
    const text = localPostureNarrative({
      card: makeTestCard(),
      posture,
      deltas: { careStrain: -2 },
      age: 20,
      packet,
    });
    results.push({
      name: "Posture narrative reads age without throwing",
      pass: typeof text === "string" && text.includes("age 20"),
      detail: text.slice(0, 80),
    });
  } catch (err) {
    results.push({
      name: "Posture narrative reads age without throwing",
      pass: false,
      detail: String(err),
    });
  }

  try {
    const terminal = {
      ...makeTestCard(),
      pressures: {
        resourceStrain: 20,
        careStrain: 25,
        institutionStrain: 30,
        healthStrain: 100,
        mobilityStrain: 40,
      },
    };
    const reducerState = {
      ...init,
      screen: "PLAYING",
      stateCard: terminal,
      narrativeLog: [],
      currentAge: 20,
      birthYear: 1970,
    };
    const next = reducer(reducerState, { type: "RESOLVE_TICK", roll: 500 });
    results.push({
      name: "Reducer can still resolve tick from a valid state",
      pass: typeof next.screen === "string",
      detail: `Next screen: ${next.screen}`,
    });
  } catch (err) {
    results.push({
      name: "Reducer can still resolve tick from a valid state",
      pass: false,
      detail: String(err),
    });
  }

  // API connectivity test
  results.push({
    name: "Provider mode set to remote (Anthropic API)",
    pass: provider.mode === "remote",
    detail: `Mode: ${provider.mode}. Key required — enter on landing page.`,
  });

  return results;
}

// ═══════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════

const C = {
  bg: "#08080e",
  panel: "#111119",
  pb: "#1e1e2a",
  text: "#d8d0c4",
  dim: "#7a756d",
  accent: "#c9a84c",
  accentD: "#8a7535",
  green: "#4a9e6e",
  red: "#b83a3a",
  orange: "#c47a2e",
  blue: "#4477aa",
};
const mono = "'JetBrains Mono', monospace";
const serif = "'Crimson Pro', Georgia, serif";

function PressureBar({ label, value, icon }) {
  const pct = Math.min(100, Math.max(0, value));
  const color = pct >= 75 ? C.red : pct >= 50 ? C.orange : pct >= 30 ? C.accent : C.green;
  const alert = pct >= 75;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3, color: alert ? C.red : C.dim, fontFamily: mono }}>
        <span>{icon} {label}</span>
        <span style={{ fontWeight: 700, color: alert ? C.red : C.text }}>{value}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "#1a1a24", overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 0.8s ease", boxShadow: alert ? `0 0 8px ${C.red}66` : "none" }} />
      </div>
    </div>
  );
}

function StateCardPanel({ card }) {
  if (!card) return null;
  const currentYear = card.birthYear + card.currentAge;
  const locationDisplay = getDisplayContext(card.currentLocationCanonical.settlement, card.currentLocationCanonical.country, currentYear).display;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.pb}`, borderRadius: 8, padding: 16, fontSize: 12, fontFamily: mono, color: C.text, overflowY: "auto", maxHeight: "100%" }}>
      <div style={{ textAlign: "center", borderBottom: `1px solid ${C.pb}`, paddingBottom: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 2, textTransform: "uppercase" }}>State Card</div>
        <div style={{ fontSize: 16, color: C.accent, fontWeight: 700, marginTop: 4 }}>{card.name}</div>
      </div>
      <div style={{ lineHeight: 1.8, fontSize: 11 }}>
        {[["Born", card.dateOfBirth], ["Place", card.placeOfBirth], ["Sex", card.sexAtBirth], ["Lineage", card.communityLineage], ["Household", card.householdStructure], ["Class", card.socioeconomicClass], ["Age", card.currentAge], ["Location", locationDisplay], ["Role", card.currentRole], ["Schema", card.schemaVersion]].map(([l, v]) => (
          <div key={String(l)}><span style={{ color: C.dim }}>{l}:</span> {String(v)}</div>
        ))}
      </div>
      <div style={{ marginTop: 14, borderTop: `1px solid ${C.pb}`, paddingTop: 10 }}>
        <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Strain Gauges</div>
        <PressureBar label="Resource Strain" value={card.pressures.resourceStrain} icon="💰" />
        <PressureBar label="Care Strain" value={card.pressures.careStrain} icon="🤲" />
        <PressureBar label="Institution Strain" value={card.pressures.institutionStrain} icon="🏛️" />
        <PressureBar label="Health Strain" value={card.pressures.healthStrain} icon="❤️" />
        <PressureBar label="Mobility Strain" value={card.pressures.mobilityStrain} icon="🚶" />
      </div>
      {card.assets.length > 0 && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${C.pb}`, paddingTop: 8 }}>
          <div style={{ fontSize: 10, color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Assets Online</div>
          {card.assets.map((a, i) => <div key={i} style={{ fontSize: 11, color: C.dim }}>+ {a}</div>)}
        </div>
      )}
      {card.constraints.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 10, color: C.red, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Constraints</div>
          {card.constraints.map((c, i) => <div key={i} style={{ fontSize: 11, color: C.dim }}>− {c}</div>)}
        </div>
      )}
      {card.majorEvents.length > 0 && (
        <div style={{ marginTop: 12, borderTop: `1px solid ${C.pb}`, paddingTop: 8 }}>
          <div style={{ fontSize: 10, color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Major Events</div>
          {card.majorEvents.map((e, i) => <div key={i} style={{ fontSize: 11, color: C.dim }}>◆ {e}</div>)}
        </div>
      )}
      <div style={{ marginTop: 12, borderTop: `1px solid ${C.pb}`, paddingTop: 8 }}>
        <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Continuity Anchor</div>
        <div style={{ fontSize: 11, color: C.dim, fontStyle: "italic", lineHeight: 1.5 }}>{card.continuityAnchor}</div>
      </div>
    </div>
  );
}

function DiceRoller({ sides, onRoll, label, isRolling, disabled }) {
  const [dv, setDv] = useState(null);
  const ref = useRef(null);
  const start = useCallback(() => {
    if (disabled) return;
    onRoll("start");
    setDv(null);
    let ct = 0;
    const total = 18 + Math.floor(Math.random() * 8);
    ref.current = setInterval(() => {
      ct++;
      setDv(Math.floor(Math.random() * sides) + 1);
      if (ct >= total) {
        clearInterval(ref.current);
        const f = Math.floor(Math.random() * sides) + 1;
        setDv(f);
        onRoll("resolve", f);
      }
    }, 60 + ct * 8);
  }, [disabled, onRoll, sides]);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 11, color: C.accentD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12, fontFamily: mono }}>{label}</div>
      <div style={{ width: 140, height: 140, margin: "0 auto 20px", borderRadius: 12, background: `radial-gradient(circle at 30% 30%, #1e1e2a, ${C.bg})`, border: `2px solid ${isRolling ? C.accent : C.pb}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isRolling ? `0 0 20px ${C.accent}33` : "none", transition: "all 0.3s" }}>
        <span style={{ fontSize: dv ? 42 : 28, fontWeight: 800, fontFamily: mono, color: isRolling ? C.accent : dv ? C.text : C.dim, textShadow: isRolling ? `0 0 12px ${C.accent}66` : "none" }}>{dv || `D${sides}`}</span>
      </div>
      {!isRolling && (
        <button onClick={start} disabled={disabled} style={{ background: disabled ? "#333" : `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, border: "none", borderRadius: 6, padding: "12px 32px", color: disabled ? "#666" : C.bg, fontWeight: 700, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", fontFamily: mono, letterSpacing: 1, opacity: disabled ? 0.5 : 1 }}>
          {disabled ? "GENERATING…" : "DROP WEIGHT"}
        </button>
      )}
    </div>
  );
}

function NarrativeEntry({ entry }) {
  const wc = entry.weightClass;
  const borderColor = wc ? wc.color : entry.isCrisis ? C.red : entry.isPosture ? C.blue : C.pb;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.pb}`, borderRadius: 8, padding: 16, marginBottom: 12, borderLeft: `3px solid ${borderColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: entry.isCrisis ? C.red : C.accent, fontFamily: mono }}>{entry.title}</span>
        {wc && <span style={{ fontSize: 10, fontWeight: 600, color: wc.color, fontFamily: mono, padding: "2px 8px", borderRadius: 4, background: `${wc.color}15` }}>D1000→{entry.roll} · {wc.name}</span>}
        {entry.isCrisis && <span style={{ fontSize: 10, fontWeight: 600, color: C.red, fontFamily: mono, padding: "2px 8px", borderRadius: 4, background: `${C.red}15` }}>STRUCTURAL CRISIS</span>}
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: C.text, margin: 0, fontFamily: serif }}>
        {entry.pending && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: entry.isCrisis ? C.red : C.accent, marginRight: 8, animation: "pulse 1.5s ease infinite" }} />}
        {entry.text}
      </p>
      {entry.deltas && (
        <div style={{ marginTop: 10, fontSize: 10, color: C.dim, fontFamily: mono, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(entry.deltas).filter(([, v]) => v !== 0).map(([k, v]) => (
            <span key={k} style={{ color: v > 0 ? C.red : C.green }}>{STRAIN_SHORT[k]} {v > 0 ? "+" : ""}{String(v)}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function PostureSelector({ onSelect, disabled }) {
  return (
    <div style={{ background: C.panel, border: `2px solid ${C.red}44`, borderRadius: 12, padding: 20, opacity: disabled ? 0.6 : 1 }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.red, letterSpacing: 3, textTransform: "uppercase", fontFamily: mono }}>⚡ Pressure Break</div>
        <div style={{ fontSize: 14, color: C.text, marginTop: 8, fontFamily: serif }}>Critical strain threshold reached. Choose your posture, Witness.</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {POSTURES.map((p) => (
          <button key={p.id} disabled={disabled} onClick={() => onSelect(p.id)} style={{ background: C.bg, border: `1px solid ${C.pb}`, borderRadius: 8, padding: "12px 16px", textAlign: "left", cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.2s", opacity: disabled ? 0.6 : 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, fontFamily: mono }}>{p.name}</div>
                <div style={{ fontSize: 11, color: C.dim, marginTop: 2 }}>{p.desc}</div>
                <div style={{ fontSize: 10, color: C.accentD, marginTop: 4, fontFamily: mono }}>{p.effect}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SelfTestPanel({ results }) {
  return (
    <div style={{ marginTop: 20, width: "100%", maxWidth: 640, background: C.panel, border: `1px solid ${C.pb}`, borderRadius: 8, padding: 14, fontFamily: mono }}>
      <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Self Tests</div>
      {results.map((result) => (
        <div key={result.name} style={{ fontSize: 11, color: result.pass ? C.green : C.red, marginBottom: 6 }}>
          {result.pass ? "PASS" : "FAIL"} — {result.name}
          <div style={{ color: C.dim, marginTop: 2 }}>{result.detail}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════

export default function WheelOfExistence() {
  const [state, dispatch] = useReducer(reducer, init);
  const [selfTests] = useState(() => runSelfTests());
  const [apiKey, setApiKeyState] = useState("");
  const logEnd = useRef(null);

  // Sync API key to module-level variable for provider access
  useEffect(() => {
    setApiKey(apiKey || null);
  }, [apiKey]);

  const pendingEntry = useMemo(() => state.narrativeLog.find((e) => e.pending), [state.narrativeLog]);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.narrativeLog.length]);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const s = document.createElement("style");
    s.textContent = `@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`;
    document.head.appendChild(s);
  }, []);

  // Name generation effect — fires on Phase 0 completion
  useEffect(() => {
    if (!state.nameGenerating || !state.stateCard || !state.country || !state.continent) return;
    const card = state.stateCard;
    const country = card.placeOfBirth.split(", ").slice(1).join(", ");
    const settlement = card.placeOfBirth.split(", ")[0];

    (async () => {
      const remote = await provider.generateName({
        country,
        settlement,
        sex: card.sexAtBirth,
        birthYear: state.birthYear,
        continent: state.continent.name,
      });
      if (remote?.fullName) dispatch({ type: "UPDATE_NAME", name: remote.fullName });
      else dispatch({ type: "NAME_GENERATION_FAILED" });
    })();
  }, [state.nameGenerating, state.stateCard, state.country, state.continent, state.birthYear]);

  // Birth narrative generation effect — fires on Phase 0 completion
  useEffect(() => {
    if (!state.birthNarrativePending || !state.stateCard || !state.continent) return;
    const card = state.stateCard;

    (async () => {
      const packet = await getFactPacket({
        settlementCanonical: card.birthPlaceCanonical.settlement,
        countryCanonical: card.birthPlaceCanonical.country,
        year: card.birthYear,
        eraNote: card.eraNote,
      });
      const result = await provider.generateBirthNarrative({
        card,
        packet,
        continent: state.continent.name,
      });
      if (result?.narrative) {
        let birthEntities = result.entities || [];

        // FALLBACK: if birth narrative is substantial but returned no/few entities,
        // fire a cheap extraction call. Birth is the seeding event for the entire
        // entity graph — an empty array here means the life starts with no world.
        if (birthEntities.length < 2 && result.narrative.length > 200) {
          console.warn(`[WoE Entity] Birth narrative returned only ${birthEntities.length} entities from substantial text — firing extraction fallback`);
          const extractionPrompt = `Extract ALL named characters from this birth narrative. Return ONLY a JSON array of entities.

TEXT:
${result.narrative}

Return ONLY a JSON array: [{"name": "full name as it appears", "type": "person", "detail": "relationship to the newborn and one distinguishing trait", "importance": 3 for parents, 2 for other relatives/midwife/neighbors}]`;
          const extractionRaw = await callAnthropicAPI(
            "You extract named entities from narrative text. Return only valid JSON arrays. No preamble.",
            extractionPrompt,
            400,
          );
          if (extractionRaw) {
            try {
              const cleaned = extractionRaw.replace(/```json\s*/g, "").replace(/```/g, "").trim();
              const extracted = JSON.parse(cleaned);
              if (Array.isArray(extracted) && extracted.length > 0) {
                birthEntities = extracted.filter((e) => e.name && e.type);
                console.log(`[WoE Entity] Fallback extraction recovered ${birthEntities.length} entities from birth narrative`);
              }
            } catch {
              console.warn("[WoE Entity] Fallback extraction parse failed:", extractionRaw?.slice(0, 120));
            }
          }
        }

        dispatch({ type: "UPDATE_BIRTH_NARRATIVE", text: result.narrative, entities: birthEntities });
      }
      else dispatch({ type: "BIRTH_NARRATIVE_FAILED" });
    })();
  }, [state.birthNarrativePending, state.stateCard, state.continent]);

  // Narrative generation effect — fires when a pending entry exists
  useEffect(() => {
    if (!pendingEntry || !state.stateCard) return;

    (async () => {
      const card = state.stateCard;
      const year = pendingEntry.year;
      const beyondHorizon = year > KNOWLEDGE_HORIZON;
      const packet = await getFactPacket({
        settlementCanonical: card.currentLocationCanonical.settlement,
        countryCanonical: card.currentLocationCanonical.country,
        year,
        eraNote: card.eraNote,
      });

      if (pendingEntry.isCrisis) {
        const recent = state.narrativeLog.slice(-4).map((e) => `${e.title}: ${e.text}`);
        const result = beyondHorizon ? null : await provider.generateNarrative({
          type: "crisis",
          card,
          crisisName: pendingEntry.crisisName,
          crisisDesc: pendingEntry.crisisDesc,
          crisisStrain: pendingEntry.crisisStrain,
          deltas: pendingEntry.deltas || {},
          age: pendingEntry.age,
          packet,
          recent,
        });
        const text = result?.narrative || `At age ${pendingEntry.age}, ${card.name.split(" ")[0]} reaches a breaking point. ${pendingEntry.crisisDesc} In ${packet.placeDisplay}, the consequences are immediate and material — the household reorganizes around what has been lost.`;
        dispatch({ type: "UPDATE_NARRATIVE", id: pendingEntry.id, text, entities: result?.entities || [], referencedEntities: result?.referencedEntities || [], packetSource: packet.packetSource });
      } else if (pendingEntry.isPosture) {
        const posture = POSTURES.find((p) => p.id === pendingEntry.postureId);
        const result = beyondHorizon ? null : await provider.generateNarrative({
          type: "posture",
          card,
          posture,
          deltas: pendingEntry.deltas || {},
          age: pendingEntry.age,
          packet,
        });
        const text = result?.narrative || localPostureNarrative({
          card,
          posture,
          deltas: pendingEntry.deltas || {},
          age: pendingEntry.age,
          packet,
        });
        dispatch({ type: "UPDATE_NARRATIVE", id: pendingEntry.id, text, entities: result?.entities || [], referencedEntities: result?.referencedEntities || [], packetSource: packet.packetSource });
      } else {
        const phase = getPhase(pendingEntry.age);
        const recent = state.narrativeLog.slice(-4).map((e) => `${e.title}: ${e.text}`);
        const result = beyondHorizon ? null : await provider.generateNarrative({
          type: "tick",
          card,
          weightClass: pendingEntry.weightClass?.name || "Standard Load",
          roll: pendingEntry.roll,
          deltas: pendingEntry.deltas || {},
          age: pendingEntry.age,
          phase,
          packet,
          recent,
        });
        const text = result?.narrative || localNarrativeFromPacket({
          card,
          weightClass: pendingEntry.weightClass?.name || "Standard Load",
          roll: pendingEntry.roll,
          deltas: pendingEntry.deltas || {},
          age: pendingEntry.age,
          phase,
          packet,
          recent,
        });
        dispatch({ type: "UPDATE_NARRATIVE", id: pendingEntry.id, text, entities: result?.entities || [], referencedEntities: result?.referencedEntities || [], packetSource: packet.packetSource });
      }
    })();
  }, [pendingEntry?.id, state.stateCard, state.narrativeLog]);

  const hContinent = useCallback((t, v) => {
    if (t === "start") dispatch({ type: "SET_ROLLING" });
    else dispatch({ type: "RESOLVE_CONTINENT", roll: v });
  }, []);
  const hCountry = useCallback((t, v) => {
    if (t === "start") dispatch({ type: "SET_ROLLING" });
    else dispatch({ type: "RESOLVE_COUNTRY", roll: v });
  }, []);
  const hIdentity = useCallback(() => {
    dispatch({ type: "RESOLVE_IDENTITY", sexRoll: rollDice(100), nameRoll: rollDice(100), settlementRoll: rollDice(1000), householdRoll: rollDice(1000), bodyRoll: rollDice(1000) });
  }, []);
  const hWeight = useCallback((t, v) => {
    if (t === "start") dispatch({ type: "SET_ROLLING" });
    else dispatch({ type: "RESOLVE_TICK", roll: v });
  }, []);

  const exportLog = useCallback(() => {
    const cd = state.stateCard;
    if (!cd) return;
    const dy = state.birthYear + state.currentAge;
    const divider = "═".repeat(60);
    const thinDiv = "─".repeat(60);
    let out = "";
    out += `${divider}\n`;
    out += `  WHEEL OF EXISTENCE — Life Record\n`;
    out += `  Axiom Core v4.11.0\n`;
    out += `${divider}\n\n`;
    out += `  Name:       ${cd.name}\n`;
    out += `  Born:       ${cd.dateOfBirth} in ${cd.placeOfBirth}\n`;
    out += `  Sex:        ${cd.sexAtBirth}\n`;
    out += `  Lineage:    ${cd.communityLineage}\n`;
    out += `  Household:  ${cd.householdStructure}\n`;
    out += `  Class:      ${cd.socioeconomicClass}\n`;
    out += `  Died:       Year ${dy}, age ${state.currentAge}\n`;
    out += `\n${thinDiv}\n`;
    out += `  FINAL STRAINS\n`;
    out += `${thinDiv}\n`;
    for (const [k, v] of Object.entries(cd.pressures)) {
      const bar = "█".repeat(Math.floor(v / 5)) + "░".repeat(20 - Math.floor(v / 5));
      out += `  ${STRAIN_SHORT[k].padEnd(18)} ${bar} ${v}/100\n`;
    }
    if (cd.majorEvents.length > 0) {
      out += `\n${thinDiv}\n`;
      out += `  DEFINING MOMENTS\n`;
      out += `${thinDiv}\n`;
      cd.majorEvents.forEach((e) => (out += `  ◆ ${e}\n`));
    }
    out += `\n${divider}\n`;
    out += `  NARRATIVE RECORD\n`;
    out += `${divider}\n\n`;
    state.narrativeLog.forEach((entry) => {
      out += `${thinDiv}\n`;
      out += `  ${entry.title}`;
      if (entry.weightClass) out += `  [D1000→${entry.roll} · ${entry.weightClass.name}]`;
      out += `\n${thinDiv}\n\n`;
      out += `${entry.text}\n\n`;
      if (entry.deltas) {
        const changes = Object.entries(entry.deltas)
          .filter(([, v]) => v !== 0)
          .map(([k, v]) => `${STRAIN_SHORT[k]} ${Number(v) > 0 ? "+" : ""}${v}`)
          .join("  ·  ");
        if (changes) out += `  Strain shifts: ${changes}\n`;
      }
      if (entry.packetSource) out += `  Packet: ${entry.packetSource}\n`;
      out += `\n`;
    });
    out += `${divider}\n`;
    out += `  END OF RECORD — ${cd.name}, ${state.birthYear}–${dy}\n`;
    out += `${divider}\n`;

    const blob = new Blob([out], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cd.name.replace(/\s+/g, "_")}_${state.birthYear}-${dy}_WoE.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.stateCard, state.birthYear, state.currentAge, state.narrativeLog]);

  const btn = (onClick, text, style = {}) => (
    <button onClick={onClick} style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, border: "none", borderRadius: 6, padding: "12px 32px", color: C.bg, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: mono, letterSpacing: 1, ...style }}>{text}</button>
  );
  const centered = (children) => <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: C.text, padding: 20 }}>{children}</div>;
  const stepLabel = (step) => <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 3, fontFamily: mono, marginBottom: 8, textTransform: "uppercase" }}>Phase 0 · Context Funnel · Step {step} of 3</div>;
  const rollBox = (val) => <div style={{ width: 140, height: 140, margin: "0 auto 20px", borderRadius: 12, background: `radial-gradient(circle at 30% 30%, #1e1e2a, ${C.bg})`, border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 24px ${C.accent}33` }}><span style={{ fontSize: 42, fontWeight: 800, fontFamily: mono, color: C.accent }}>{val}</span></div>;

  if (state.screen === "LANDING") {
    const keySet = apiKey.length > 10;
    return centered(
      <>
        <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: 6, fontFamily: mono, background: `linear-gradient(135deg, ${C.accent}, ${C.text})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, textAlign: "center" }}>WHEEL OF EXISTENCE</div>
        <div style={{ fontSize: 13, color: C.dim, letterSpacing: 4, fontFamily: mono, marginBottom: 6, textTransform: "uppercase" }}>Axiom Core</div>
        <div style={{ fontSize: 11, color: keySet ? C.accent : C.dim, letterSpacing: 2, fontFamily: mono, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: keySet ? C.green : C.red, display: "inline-block", boxShadow: keySet ? `0 0 6px ${C.green}` : `0 0 6px ${C.red}` }} />
          {keySet ? "API KEY SET — CLAUDE CONNECTED" : "NO API KEY — LOCAL FALLBACK ONLY"}
        </div>
        <div style={{ maxWidth: 520, textAlign: "center", marginBottom: 20, fontFamily: serif, fontSize: 15, color: C.dim, lineHeight: 1.7 }}>A probabilistic life-path instrument with strain semantics, year-aware place naming, and retrieval-shaped prompting via the Anthropic API. A parametric recall bridge forces the model to reconstruct place-year material texture before committing to prose. Culturally authentic names and grounded narrative generated by Claude, with local fallback on all paths.</div>
        <div style={{ width: "100%", maxWidth: 440, marginBottom: 24 }}>
          <label style={{ fontSize: 10, color: C.accentD, letterSpacing: 2, fontFamily: mono, textTransform: "uppercase", display: "block", marginBottom: 6 }}>Anthropic API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder="sk-ant-..."
            style={{ width: "100%", background: C.panel, border: `1px solid ${keySet ? C.green : C.pb}`, borderRadius: 6, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: mono, outline: "none", boxSizing: "border-box" }}
          />
          <div style={{ fontSize: 10, color: C.dim, fontFamily: mono, marginTop: 6, lineHeight: 1.5 }}>
            Stored in browser memory only — never logged, never persisted, never sent anywhere except api.anthropic.com. Without a key, all paths fall back to the local narrative engine.
          </div>
        </div>
        <button onClick={() => dispatch({ type: "START_GAME" })} style={{ background: "none", border: `1px solid ${C.accent}`, borderRadius: 8, padding: "16px 40px", color: C.accent, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 3, fontFamily: mono, textTransform: "uppercase" }}>Simulate a Probabilistic Human Life</button>
        <SelfTestPanel results={selfTests} />
        <div style={{ marginTop: 20, fontSize: 10, color: C.dim, fontFamily: mono, opacity: 0.6 }}>v4.11.0 · Axiom Core · RSP v2 · Entity Validation · Strain Crises · Epistemic Integrity</div>
      </>
    );
  }

  if (state.screen === "PHASE_0_CONTINENT") {
    return centered(
      <>
        {stepLabel("1")}
        <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: mono, marginBottom: 4 }}>Where in the World?</div>
        <div style={{ fontSize: 13, color: C.dim, fontFamily: serif, marginBottom: 30, maxWidth: 420, textAlign: "center", lineHeight: 1.6 }}>Representative weighted global distribution. Swap your full demographic tables back in later without touching the engine.</div>
        <DiceRoller sides={1000} onRoll={hContinent} label="D1000 → Continent" isRolling={state.isRolling} />
      </>
    );
  }

  if (state.screen === "PHASE_0_CONTINENT_RESULT") {
    return centered(
      <>
        {stepLabel("1")}
        {rollBox(state.lastRoll)}
        <div style={{ fontSize: 32, fontWeight: 800, color: C.accent, fontFamily: mono, marginBottom: 4 }}>{state.continent?.name}</div>
        <div style={{ fontSize: 12, color: C.dim, fontFamily: mono, marginBottom: 30 }}>D1000 → {state.lastRoll}</div>
        {btn(() => dispatch({ type: "ADVANCE_TO_COUNTRY" }), "CONTINUE → Country")}
      </>
    );
  }

  if (state.screen === "PHASE_0_COUNTRY") {
    return centered(
      <>
        {stepLabel("2")}
        <div style={{ fontSize: 14, color: C.dim, fontFamily: mono, marginBottom: 4 }}>Continent locked: <span style={{ color: C.accent }}>{state.continent?.name}</span></div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: mono, marginBottom: 4 }}>Which Country?</div>
        <div style={{ fontSize: 13, color: C.dim, fontFamily: serif, marginBottom: 30, maxWidth: 400, textAlign: "center", lineHeight: 1.6 }}>Population-weighted within {state.continent?.name}.</div>
        <DiceRoller sides={1000} onRoll={hCountry} label="D1000 → Country" isRolling={state.isRolling} />
      </>
    );
  }

  if (state.screen === "PHASE_0_COUNTRY_RESULT") {
    return centered(
      <>
        {stepLabel("2")}
        <div style={{ fontSize: 14, color: C.dim, fontFamily: mono, marginBottom: 8 }}>{state.continent?.name} →</div>
        {rollBox(state.lastRoll)}
        <div style={{ fontSize: 32, fontWeight: 800, color: C.accent, fontFamily: mono, marginBottom: 4 }}>{state.country?.name}</div>
        <div style={{ fontSize: 12, color: C.dim, fontFamily: mono, marginBottom: 30 }}>D1000 → {state.lastRoll}</div>
        {btn(() => dispatch({ type: "ADVANCE_TO_IDENTITY" }), "CONTINUE → Collapse Identity")}
      </>
    );
  }

  if (state.screen === "PHASE_0_IDENTITY") {
    return centered(
      <>
        {stepLabel("3")}
        <div style={{ fontSize: 14, color: C.dim, fontFamily: mono, marginBottom: 4 }}>{state.continent?.name} → <span style={{ color: C.accent }}>{state.country?.name}</span></div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.accent, fontFamily: mono, marginBottom: 4 }}>Collapse the Identity</div>
        <div style={{ fontSize: 13, color: C.dim, fontFamily: serif, marginBottom: 30, maxWidth: 420, textAlign: "center", lineHeight: 1.6 }}>Birth year resolves first, then settlement rerolls from year-valid cities, then the packet and era-display systems take over. Claude will derive a culturally authentic name.</div>
        {btn(hIdentity, "COLLAPSE IDENTITY")}
      </>
    );
  }

  if (state.screen === "PHASE_0_COMPLETE") {
    const cd = state.stateCard;
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", color: C.text, fontFamily: mono }}>
        <div style={{ flex: 1, padding: 30, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: 700, margin: "0 auto" }}>
          <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Phase 0 Complete — The Life Resolved</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.accent, marginBottom: 4, display: "flex", alignItems: "center", gap: 10 }}>
            {cd.name}
            {state.nameGenerating && <span style={{ fontSize: 10, color: C.dim, fontWeight: 400, animation: "pulse 1.5s ease infinite" }}>Claude is deriving an authentic name…</span>}
          </div>
          <div style={{ fontSize: 14, color: C.dim, marginBottom: 20 }}>{cd.dateOfBirth} · {cd.placeOfBirth}</div>
          <div style={{ background: C.panel, border: `1px solid ${C.pb}`, borderRadius: 8, padding: 16, marginBottom: 16, fontFamily: serif, fontSize: 14, lineHeight: 1.8, color: C.text, position: "relative" }}>
            {state.birthNarrativePending && <div style={{ fontSize: 10, color: C.dim, fontFamily: mono, marginBottom: 8, animation: "pulse 1.5s ease infinite" }}>Claude is rendering the arrival…</div>}
            {state.narrativeLog[0]?.text}
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.pb}`, borderRadius: 8, padding: 16, marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: C.accentD, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>Starting Strains</div>
            <PressureBar label="Resource Strain" value={cd.pressures.resourceStrain} icon="💰" />
            <PressureBar label="Care Strain" value={cd.pressures.careStrain} icon="🤲" />
            <PressureBar label="Institution Strain" value={cd.pressures.institutionStrain} icon="🏛️" />
            <PressureBar label="Health Strain" value={cd.pressures.healthStrain} icon="❤️" />
            <PressureBar label="Mobility Strain" value={cd.pressures.mobilityStrain} icon="🚶" />
          </div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 4 }}><span style={{ color: C.green }}>Household:</span> {cd.householdDesc}</div>
          <div style={{ fontSize: 11, color: C.dim, marginBottom: 20 }}><span style={{ color: C.green }}>Body:</span> {cd.bodyDesc} — {cd.bodyNote}</div>
          {btn(() => dispatch({ type: "BEGIN_SIMULATION" }), "BEGIN THE LIFE — PHASE I", { alignSelf: "center" })}
        </div>
      </div>
    );
  }

  if (state.screen === "TERMINAL") {
    const cd = state.stateCard;
    const dy = state.birthYear + state.currentAge;
    const topTwo = Object.entries(cd.pressures)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => STRAIN_LABELS[k])
      .join(" and ");
    return centered(
      <>
        <div style={{ fontSize: 10, color: C.red, letterSpacing: 4, fontFamily: mono, textTransform: "uppercase", marginBottom: 12 }}>System Failure — Health Strain 100</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: C.accent, fontFamily: mono }}>{cd.name}</div>
        <div style={{ fontSize: 14, color: C.dim, fontFamily: mono, marginTop: 4 }}>{state.birthYear} — {dy} · Lived {state.currentAge} years</div>
        <div style={{ maxWidth: 560, marginTop: 24, background: C.panel, border: `1px solid ${C.pb}`, borderRadius: 8, padding: 20 }}>
          <div style={{ fontSize: 13, lineHeight: 1.8, color: C.text, fontFamily: serif }}>
            The life of {cd.name}, born in {cd.placeOfBirth}, has reached its terminus. {state.currentAge < 40 ? "Cut short before its time." : state.currentAge < 65 ? "Ended in the working years, with much left undone." : "A full arc, completed."} The pressures that shaped this life — {topTwo} — told its truest story.
          </div>
          {cd.majorEvents.length > 0 && (
            <div style={{ marginTop: 16, borderTop: `1px solid ${C.pb}`, paddingTop: 12 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: 2, fontFamily: mono, marginBottom: 6 }}>DEFINING MOMENTS</div>
              {cd.majorEvents.map((e, i) => <div key={i} style={{ fontSize: 12, color: C.dim, fontFamily: mono }}>◆ {e}</div>)}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 30 }}>
          <button onClick={exportLog} style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accentD})`, border: "none", borderRadius: 6, padding: "12px 28px", color: C.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 2, fontFamily: mono }}>EXPORT LIFE RECORD</button>
          <button onClick={() => window.location.reload()} style={{ background: "none", border: `1px solid ${C.accent}`, borderRadius: 6, padding: "12px 28px", color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 2, fontFamily: mono }}>NEW RUN</button>
        </div>
      </>
    );
  }

  const phase = getPhase(state.currentAge);
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", color: C.text }}>
      <div style={{ width: 300, minWidth: 300, borderRight: `1px solid ${C.pb}`, padding: 12, overflowY: "auto", maxHeight: "100vh" }}>
        <StateCardPanel card={state.stateCard} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", maxHeight: "100vh" }}>
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.pb}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.panel }}>
          <div style={{ fontFamily: mono }}>
            <span style={{ fontSize: 10, color: C.accentD, letterSpacing: 2 }}>PHASE {phase.num}</span>
            <span style={{ fontSize: 10, color: C.dim, marginLeft: 12 }}>{phase.label} · {phase.tickYears}yr/tick</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: C.dim }}>Age <span style={{ color: C.accent, fontWeight: 700 }}>{state.currentAge}</span> · Year <span style={{ color: C.accent }}>{state.birthYear + state.currentAge}</span></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {state.narrativeLog.map((entry) => <NarrativeEntry key={entry.id} entry={entry} />)}
          <div ref={logEnd} />
        </div>
        <div style={{ padding: 20, borderTop: `1px solid ${C.pb}`, background: C.panel }}>
          {state.screen === "PRESSURE_BREAK" ? (
            <PostureSelector disabled={state.isGenerating} onSelect={(p) => !state.isGenerating && dispatch({ type: "RESOLVE_POSTURE", posture: p })} />
          ) : (
            <DiceRoller sides={1000} onRoll={hWeight} label={`D1000 Weight · Age ${state.currentAge} · Phase ${phase.num}`} isRolling={state.isRolling} disabled={state.isGenerating} />
          )}
        </div>
      </div>
    </div>
  );
}
