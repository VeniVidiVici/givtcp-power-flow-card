# AGENTS.md

Guidance for coding agents working in `givtcp-power-flow-card`.

## Project Snapshot

- Stack: TypeScript, Lit, Vite, ESLint, Prettier.
- Output: browser-side Home Assistant Lovelace custom card.
- Main entry: `src/givtcp-power-flow-card.ts`.
- Supporting custom elements: `src/editor.ts`, `src/entity.ts`, `src/details.ts`, and `src/layout/*.ts`.
- Engine expectations from `package.json`: Node `>=24.0.0`, npm `>=11.0.0`.

## Repo-Specific Instruction Files

- `AGENTS.md`: this file.
- `.cursor/rules/`: not present at the time of writing.
- `.cursorrules`: not present at the time of writing.
- `.github/copilot-instructions.md`: not present at the time of writing.
- If any of those files are added later, treat them as higher-priority repo guidance and merge their rules into your plan.

## Install And Core Commands

- Install dependencies: `npm install`
- Start Vite dev server: `npm run dev`
- Rebuild on file changes: `npm run dev:watch`
- Production build: `npm run build`
- Lint and auto-fix `src/**/*.ts`: `npm run lint`
- Format entire repo: `npm run format`
- Start local Home Assistant container: `npm run ha:start`
- Stop local Home Assistant container: `npm run ha:stop`
- Follow Home Assistant logs: `npm run ha:logs`

## Test Status

- There is currently no automated unit or integration test runner configured in `package.json`.
- There are no `*.test.*` or `*.spec.*` files in the repository at the time of writing.
- There is no single-test command because no test framework is installed.
- Do not invent `npm test` in documentation or automation unless you also add a real test setup.

## Single-Test Guidance

- Current state: not available.
- If the user asks to run a single test, explain that no test harness exists yet.
- Closest existing targeted verification options are:
- `npm run build` for type generation plus bundling.
- `npm run lint` for static analysis and autofixes.
- `npm run dev:watch` together with the local Home Assistant setup for manual UI validation.

## CI And Validation

- GitHub Actions runs `npm install` and `npm run build` in `.github/workflows/build.yml`.
- GitHub Actions also runs HACS validation from `.github/workflows/validate.yaml`.
- There is no dedicated CI lint job and no dedicated CI test job.
- Before finishing substantial changes, prefer running at least `npm run build`.
- Run `npm run lint` when you touched TypeScript logic or imports.
- For UI-facing changes, use the Home Assistant dev environment when practical.

## Working Style For Agents

- Keep edits focused and minimal; preserve existing architecture.
- Check for local uncommitted changes before making broad edits and avoid overwriting user work.
- Prefer updating existing patterns over introducing new abstractions.
- When behavior changes are non-trivial, update `README.md` if user-facing setup or config changed.

## Architecture Notes

- `src/givtcp-power-flow-card.ts` contains the main card, most computed state, and shared CSS.
- `src/editor.ts` defines the Lovelace editor and schema-driven config UI.
- `src/schemas.ts` centralizes `superstruct` config validation and editor schema builders.
- `src/const.ts` holds defaults and shared config constants.
- `src/layout/layout.ts` is the abstract base for layout renderers.
- `src/utils/config-utils.ts` contains config defaulting and migration helpers.
- `src/utils/svg-utils.ts` contains path-generation helpers; prefer reusing it over inline SVG math.

## Formatting Rules

- Prettier is the source of truth for formatting.
- Prettier config: tabs enabled, single quotes enabled, print width `120`.
- Use tabs for indentation in TypeScript, JSON, YAML, and Markdown to match the repo where applicable.
- Do not manually reformat generated `types/` output unless the build produced it.

## Lint Rules

- ESLint flat config targets `src/**/*.ts`.
- The ruleset is `@typescript-eslint` recommended with no major custom overrides.
- The legacy `.eslintrc.json` mirrors that intent; treat the flat config as current.
- `npm run lint` uses `--fix`, so expect import/order or whitespace changes to be applied automatically.
- The main card currently disables `@typescript-eslint/no-explicit-any` at file scope for Home Assistant window interop; avoid extending that pattern unless necessary.

## TypeScript Rules

- `tsconfig.json` uses `strict: true`.
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch` are enabled.
- Preserve explicit return types on public methods where the codebase already uses them.
- Prefer precise interfaces, enums, and union-friendly shapes over `any`.
- Favor narrow helper methods such as `parseNumericState(...)` and config getters over repeated inline coercion.

## Imports

- Use ES module imports only.
- Keep external imports before local imports.
- Group local side-effect element registrations (`import './editor';`) near the top of the file where required for custom element registration.
- Prefer named imports over namespace imports.
- If a type is already coming from an existing module import, reuse it instead of redefining local aliases.

## Naming Conventions

- Classes use PascalCase, for example `GivTCPPowerFlowCardLayoutCross`.
- Enums and interfaces use PascalCase.
- Constants use UPPER_SNAKE_CASE and are centralized in `src/const.ts` when shared.
- Custom element tag names are kebab-case and registered with `@customElement(...)`.
- Getter names should stay descriptive and often mirror config keys.
- Preserve the existing spelling of `invertor` in config keys and UI fields; it is intentionally established across the codebase.

## Component Patterns

- Components usually extend `LitElement`.
- Several components override `createRenderRoot()` to return `this`; preserve that behavior unless you intentionally want Shadow DOM.
- Reactive fields use `@property()` or `@state()` decorators.
- Rendering returns `TemplateResult` and uses `html`/`svg` tagged templates.
- Reuse existing layout and SVG helper abstractions before adding new rendering math.

## Error Handling And Defensive Code

- The editor uses `try/catch` around Home Assistant state lookups that may be absent or malformed.
- Follow the existing pattern: fail soft, log when useful, and return an empty array or `undefined` rather than throwing for missing entities.
- Validate config shapes with `superstruct` in editor-facing code.
- Prefer guards for optional Home Assistant entities before reading `state` or `attributes`.

## Data And Config Conventions

- Config defaults belong in `src/const.ts` and `ConfigUtils.getDefaults(...)`.
- When adding a new config field, update all relevant places together:
- `src/types.ts` if new shared types are needed.
- `src/const.ts` for defaults.
- `src/schemas.ts` for validation and editor controls.
- `src/utils/config-utils.ts` for defaulting or migration.
- `src/givtcp-power-flow-card.ts` for runtime behavior.
- `README.md` if the option is user-facing.

## Verification Checklist For Typical Changes

- Logic-only change: run `npm run lint` and `npm run build`.
- Rendering or layout change: run `npm run build`, then validate in local Home Assistant if possible.
- Config/editor change: verify schema, defaults, migration, and rendered editor controls stay in sync.
- Dependency or build-tool change: verify both `npm run build` and the Home Assistant workflow still work.

## Things To Avoid

- Do not add a fake test command when none exists.
- Do not replace tabs with spaces repo-wide.
- Do not rename established config keys like `single_invertor` unless you also provide a migration and deliberately accept the compatibility impact.
- Do not move logic into Shadow DOM styles/components without checking current global-style assumptions.
- Do not break Home Assistant custom element registration side effects.

## If You Need To Add Tests Later

- Add a real test framework first, then document install, all-tests, and single-test commands here.
- Prefer a setup that can exercise Lit components without requiring a full Home Assistant instance for every test.
- Until then, treat build + lint + local Home Assistant validation as the project's effective test strategy.
