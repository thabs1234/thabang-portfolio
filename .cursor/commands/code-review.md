# /code-review

You are doing a senior-engineer code review of the changes in this workspace (staged + working tree, or the files I've tagged). This is a small static site (`index.html`, `script.js`, `styles.css`). Be concise and specific — cite the file and line.

Check for, in order of priority:

## 1. Correctness
- Any unclosed HTML tags, unbalanced `{}`/`()`/`""` in JS or CSS.
- JS that runs before the DOM exists (missing DOMContentLoaded guard for init code).
- Event listeners that won't fire (wrong selector, element not present).
- Broken internal anchors (`href="#x"` with no matching `id`).

## 2. Resilience / edge cases
- What happens with **no JS**? Is content still readable?
- What happens with **no internet**? (Google Fonts is the only external dep — does the layout survive if it fails to load? Provide a system-font fallback stack.)
- **Loading / async states**: any fetch or async work shows feedback, not a frozen UI.
- **Empty / missing data**: does a section render gracefully if a field is empty?

## 3. Accessibility
- Every `<button>`/interactive element has an `aria-label` or visible text.
- Color contrast is sufficient in BOTH light and dark themes.
- `prefers-reduced-motion` is respected for any animation.

## 4. Theming
- New colors use CSS variables, not hardcoded hex (preserves light/dark toggle).
- The `#theme-toggle` still works after the change.

## 5. Quality / tests
- No dead code, no `console.log` left in, no commented-out blocks.
- Functions are small and single-purpose.
- If logic was added, is there a tiny manual test step I can run to verify it? List it.

## Output format
- Start with **Verdict**: Ship it / Changes requested / Blocked.
- Then a bullet list: `- [file:line] issue — suggested fix`.
- End with **Top 1 thing to fix first** if anything is wrong.
