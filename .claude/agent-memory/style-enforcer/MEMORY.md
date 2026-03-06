# Style Enforcer Memory — Portfolio App

## Project Style Baseline

**Language:** Spanish for comments (code names stay English)
**Dog Tag Format:** Standard pattern with `=====` borders (not `-----`)
**Logging Style:** Brutalist + structured key:value pairs
**Status:** Project fully compliant after initial audit

---

## Dog Tag Header Pattern (CONFIRMED)

All `.ts` and `.ts`-like files must start with:

```typescript
/**
 * ========================================================================
 * [TYPE] :: COMPONENT_NAME
 * ========================================================================
 * DESC:   One-line telegraphic description.
 * STATUS: STABLE | WIP | DEPRECATED
 * ========================================================================
 */
```

### Valid Types Used in This Project
- `[INGEST]` - Data ingestion pipelines
- `[AI]` - IA/ML services
- `[CACHE]` - Cache management
- `[UTIL]` - Logging utilities
- `[SERVICE]` - Webhook & verification
- `[CONFIG]` - Site config constants
- `[STORE]` - Pinia stores
- `[COMPOSABLE]` - Vue 3 composables
- `[PLUGIN]` - Nuxt plugins
- `[API]` - API endpoints
- `[VALIDATOR]` - Schema validators
- `[TYPES]` - TypeScript definitions
- `[DB]` - Database client
- `[SCHEMA]` - Database schema
- `[WEBHOOK]` - Webhook handlers

---

## Logging Format Patterns

All console.log() statements must follow:

```
[TAG]    >> ACTION       :: key: value | key: value
[TAG]    :: ACTION       :: key: value
[TAG]    ++ ACTION       :: key: value
[TAG]    !! ACTION       :: key: value
```

### Active Logging Tags in Backend
- `[INGEST]` - Ingestion pipeline logs
- `[AI]` - DeepSeek API calls
- `[API]` - API endpoint entry/exit
- `[DB]` - Database operations
- `[CACHE]` - Cache hits/misses

### Separators
- `>>` Start/async operations
- `::` General info
- `++` Success/completion
- `!!` Errors/warnings

---

## Composables Documentation Pattern

All `.ts` composables start with function signature block:

```typescript
/**
 * ◼️ COMPOSABLE_NAME
 * ---------------------------------------------------------
 * Short description of behavior.
 * Additional critical notes [CRITICAL] or [NOTE] tags.
 */
```

Inline comments use `[NOTE]`, `[FIX]`, `[HACK]`, `[TODO]` tags.

---

## Files Audited & Corrected (Session 1)

✅ server/utils/ingest.ts — Added function headers, improved logging
✅ server/utils/ai.ts — Added function headers, structured logs
✅ server/utils/webhook-verify.ts — Full Dog Tag header + TODO note
✅ server/utils/cache.ts — Already compliant
✅ server/utils/logger.ts — Already compliant
✅ server/db/index.ts — Already compliant
✅ server/db/schema.ts — Already compliant
✅ server/api/projects/index.get.ts — Added inline comments
✅ server/api/projects/[id].get.ts — Updated logs to structured format
✅ server/api/projects/[slug].get.ts — WIP placeholder, already marked
✅ server/api/webhooks/github.post.ts — Already compliant
✅ server/validators/project.schema.ts — Already compliant
✅ shared/types.ts — Already compliant
✅ app/stores/projects.ts — Header format fixed, action docs added
✅ app/config/site.ts — Dog Tag header + STATUS added
✅ app/utils/matter.ts — Full documentation + [CRITICAL] note
✅ app/composables/useGSAP.ts — Already compliant
✅ app/composables/useLenis.ts — Already compliant
✅ app/composables/useMagneticHover.ts — Already compliant
✅ app/composables/useParallax.ts — Already compliant
✅ app/composables/usePinnedScroll.ts — Already compliant
✅ app/composables/useHorizontalScroll.ts — Added function docs + logging
✅ app/composables/useDragScroll.ts — Header standardized + function docs
✅ app/composables/useCursorLabel.ts — Already compliant
✅ app/composables/useDoodleDraw.ts — Already compliant
✅ app/composables/useErrorPhysics.ts — Dog Tag header added + function docs
✅ app/composables/usePhysicsLetters.ts — Header format fixed, function docs
✅ app/plugins/lenis.client.ts — Header + inline flow documentation
✅ app/types/doodle.ts — Dog Tag header added

---

## Recurring Issues Fixed

1. **Dog Tag header format** — Some files used `█` icon + `-----` (old style)
   - Fix: Standardize to `========` borders with proper format

2. **Missing function documentation** — Physics & composables needed ◼️ blocks
   - Fix: Added for all non-trivial functions

3. **Loose console.log() calls** — No structured format
   - Fix: Converted to `[TAG] >> ACTION :: key: value` pattern

4. **Prose comments** — Some files had verbose explanations
   - Fix: Converted to telegraphic, industrial style

---

## Notes for Next Sessions

- **Validation schema comments** are not needed (self-documenting)
- **Vue template comments** should be minimal (use HTML comments only)
- **Component-specific comments** go in `<script setup>` Dog Tag
- **Import section** doesn't need comments (imports are clear)
- When adding new files, **always** start with Dog Tag header

---

## Project-Specific Patterns

- **Error Physics (404)**: Matter.js physics, settle detection with SETTLE_FRAMES_REQUIRED
- **Physics Letters**: Separate mobile (2-row) and desktop (1-row) rendering
- **Lenis Integration**: GSAP ticker + ScrollTrigger sync required
- **Strict Mode**: Env var `NUXT_STRICT_MODE` gates field validation in ingestion
- **Hidden Metadata**: Parsed from HTML comments in README (post_url, blog_url, images_url)

---

## Team Preferences (From Observation)

- ✅ Spanish comments preferred (code names stay English)
- ✅ Brutalist/industrial tone (no prose, no emojis, ever)
- ✅ Structured logging with key:value format
- ✅ Function headers only for non-obvious logic
- ✅ Constant dictionaries for all magic numbers
