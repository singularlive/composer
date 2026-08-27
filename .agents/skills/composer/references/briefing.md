# Composer Build Brief

Use this reference when the user's request is too sparse to directly plan a complete, polished graphic. The brief is an internal semantic handoff from interpretation to Composer authoring. It is not a separate service, CLI command, user-facing research report, executable template, or graphics manifest.

## When to compile a brief

Compile one before live schema or font discovery when the request names a familiar graphic category but omits content, control, lifecycle, resilience, or visual-direction details. First select exactly one card from [archetypes/archetypes.md](archetypes/archetypes.md). Do not load every card.

For a detailed request, reference image, or existing composition with an already explicit contract, use the same headings only as a short planning check; do not restate information the user already supplied.

Make safe, reversible assumptions and continue. Ask the user only when a missing answer materially changes:

- overlay versus full-frame output or another composition boundary;
- which values must be public controls or require runtime logic;
- the intended lifecycle of persistent versus transient content;
- official branding or assets that the user requires but has not supplied.

An inspect-dependent choice such as the safest open corner should remain provisional until `inspect` establishes the existing composition context. Never use an archetype default to overwrite or reorganize unrelated content.

## Composer Build Brief v1

Keep the brief compact and self-contained. Use exactly these eight sections:

### 1. Intent

State the selected archetype, the interpretation of the request, safe assumptions, explicit exclusions, and confidence. Prefer the narrowest recognizable graphic; do not expand one requested module into a package.

### 2. Output context

State transparent overlay versus full-frame output, intended placement, safe-area intent, known canvas context, and coexistence with existing graphics. Mark placement or resolution decisions that must be resolved from Composer inspection.

### 3. Module plan

List only independently cued compositions and their lifecycle boundaries. Use one module unless another part genuinely needs separate take-in/out, positioning, reuse, or control. Describe sibling and nesting intent without inventing composition IDs.

### 4. Content and control contract

For every visible semantic item, record:

- supported primitive: `text`, `rectangle`, `circle`, `image`, `aisvg`, or `table`;
- realistic initial sample value;
- data mode: `Static`, `Configurable`, `Live`, `Operator-controlled`, or `Derived`;
- public Control Node type when needed: `text`, `number`, `color`, `image`, or `checkbox`;
- whether formatting, coordination, timing, or other persisted runtime logic is required.

Expose externally meaningful values, not decorative internals. Use direct controls for one-to-one values. Mark a script only when Composer structure, links, Timeline, Update, and Behavior cannot express the required behavior.

### 5. Visual thesis

Choose three or four specific art-direction adjectives, a clear reading order, layout grammar, role-based palette, typography roles, spacing character, and one restrained signature motif. Avoid a thesis that says only “modern,” “clean,” or “professional.” Treat the thesis as a direction to interpret, not a fixed template.

### 6. Behavior and states

Define the visible result for In, Live, Update, and Out where applicable. Identify persistence rules, precedence between states, and script-owned behavior. Omit continuous or autonomous behavior unless the request needs it.

### 7. Resilience cases

List realistic stress values and expected outcomes for long or empty text, missing assets, extreme numbers, repeated data, and relevant output resolutions. Require graceful fallback rather than silently dropping a requested semantic slot.

### 8. Acceptance contract

State what must be proved by:

- Composer readback for structure, ownership, names, links, controls, and motion assignments;
- capture for hierarchy, bounds, alignment, typography, contrast, asset treatment, and settled states;
- dynamic-value exercises for the listed resilience cases;
- Singular Player verification for scripts and other Player-owned runtime behavior.

Require a rendered review and at least one evidence-based refinement pass when the first render exposes a concrete discrepancy. Do not recapture unchanged output or manufacture verification for an inapplicable behavior.

## Semantic boundary

The build brief must not contain guessed widget IDs, Composer IDs, property paths, widget payload shapes, catalog values, CLI commands, JSON manifests, code, or ready-to-apply geometry. Discover those from the live editor after the brief exists. Reference measurements may be recorded as evidence, but label them as reference measurements rather than Composer values.

Archetype cards define completeness and sensible defaults. Technique cards define reusable construction and motion choices. Primitive and composition references define supported mechanics. Composer readback and catalogs remain authoritative for the loaded scene. Capture and Player verification decide whether this particular result works.

## Pre-authoring check

Before mutating, confirm that the brief:

- selects one archetype and includes all of its required semantic slots;
- excludes adjacent package modules the user did not request;
- gives every live or operator-facing value one public control contract;
- assigns coherent lifecycle boundaries and identifies runtime logic explicitly;
- contains a specific visual thesis and realistic stress values;
- leaves live IDs, schemas, fonts, value shapes, and geometry to Composer discovery;
- defines observable acceptance evidence, including missing-asset behavior when assets are in scope.

If any item fails, repair the brief before authoring rather than compensating with ad hoc Composer mutations.
