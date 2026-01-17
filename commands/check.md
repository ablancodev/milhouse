---
name: check
description: Compare implementation screenshot against Figma reference
arguments:
  - name: url
    description: URL to screenshot (default: from config)
    required: false
  - name: reference
    description: Path to Figma reference image (default: from config)
    required: false
  - name: viewport
    description: Viewport size (default: 1920x1080)
    required: false
  - name: selector
    description: CSS selector to capture specific element (default: full page)
    required: false
---

# Milhouse Visual Check

Compares your implementation against a Figma design reference using Claude Vision (built into Claude Code).

## Process

1. Read configuration from `.claude/milhouse.config.json` if exists
2. Launch Puppeteer and navigate to specified URL
3. Wait for page to load completely (networkidle0)
4. Capture screenshot (full page or specific selector)
5. **Claude Code analyzes both images directly**
6. Generate detailed feedback report

## Execution

```bash
# Read config if exists
CONFIG_FILE=".claude/milhouse.config.json"
if [ -f "$CONFIG_FILE" ]; then
  DEFAULT_URL=$(jq -r '.url // "http://localhost:8000"' "$CONFIG_FILE" 2>/dev/null || echo "http://localhost:8000")
  DEFAULT_REF=$(jq -r '.reference // ".claude/figma-refs/design.png"' "$CONFIG_FILE" 2>/dev/null || echo ".claude/figma-refs/design.png")
else
  DEFAULT_URL="http://localhost:8000"
  DEFAULT_REF=".claude/figma-refs/design.png"
fi

FINAL_URL="${url:-$DEFAULT_URL}"
FINAL_REF="${reference:-$DEFAULT_REF}"
FINAL_VIEWPORT="${viewport:-1920x1080}"
FINAL_SELECTOR="${selector:-}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Capture screenshot
echo "📸 Capturing screenshot from $FINAL_URL..."
if [ -n "$FINAL_SELECTOR" ]; then
  node "$SCRIPT_DIR/scripts/screenshot.js" \
    --url "$FINAL_URL" \
    --output ".claude/milhouse-screenshot.png" \
    --viewport "$FINAL_VIEWPORT" \
    --selector "$FINAL_SELECTOR"
else
  node "$SCRIPT_DIR/scripts/screenshot.js" \
    --url "$FINAL_URL" \
    --output ".claude/milhouse-screenshot.png" \
    --viewport "$FINAL_VIEWPORT"
fi

if [ $? -ne 0 ]; then
  echo "❌ Screenshot capture failed"
  exit 1
fi

echo "✓ Screenshot captured: .claude/milhouse-screenshot.png"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 MILHOUSE VISUAL QA ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Current implementation: .claude/milhouse-screenshot.png"
echo "Figma reference: $FINAL_REF"
echo ""
echo "I will now analyze both images and generate a detailed visual QA report."
echo ""
```

## Instructions for Claude

After the screenshot is captured, you should:

1. **Read both images:**
   - Current implementation: `.claude/milhouse-screenshot.png`
   - Figma reference: Path specified in `$FINAL_REF`

2. **Analyze meticulously:**
   - Compare every visual aspect
   - Identify ALL differences (spacing, colors, typography, sizes, alignment, borders, shadows)
   - Be VERY SPECIFIC with values (exact px, hex colors)
   - Ignore dynamic content differences (lorem ipsum text, placeholder images)

3. **Generate structured report** and save to `.claude/milhouse-feedback.md`:

```markdown
# Milhouse Visual QA Report

**Generated:** [timestamp]
**Status:** APPROVED | DIFFERENCES_FOUND
**Summary:** [one-line summary]

---

[If APPROVED:]
## ✅ APPROVED

The implementation matches the Figma design.

### Verified elements:
- ✓ [element 1]
- ✓ [element 2]
...

[If DIFFERENCES_FOUND:]
## ❌ DIFFERENCES FOUND

Found [N] difference(s) requiring correction.

### 🔴 Critical (N)

**1. [Element Name]** (category)
- **Issue:** [clear description]
- **Current:** `[actual value]`
- **Expected:** `[expected value from Figma]`
- **CSS Property:** `[property]`
- **Suggested Fix:**
  ```css
  [selector] {
    [property]: [value];
  }
  ```

### 🟠 Major (N)
[same format]

### 🟡 Minor (N)
[same format]

---

## 📋 Summary for Ralph

```
Fix the following visual differences:

- [Element]: [Description]. Change [property] from "[current]" to "[expected]"
- [Element]: [Description]. Change [property] from "[current]" to "[expected]"
...

After corrections, output <promise>VISUAL_FIXED</promise>
```

### ✅ Correct elements:
- [element 1]
- [element 2]
...
```

4. **Also save JSON data** to `.claude/milhouse-feedback.json`:

```json
{
  "status": "APPROVED" | "DIFFERENCES_FOUND",
  "summary": "...",
  "differences": [
    {
      "element": "...",
      "category": "spacing|color|typography|size|alignment|border|shadow|other",
      "description": "...",
      "current": "...",
      "expected": "...",
      "severity": "critical|major|minor",
      "cssProperty": "...",
      "suggestedFix": "..."
    }
  ],
  "approvedElements": [...]
}
```

5. **Display summary:**
   - If APPROVED: "🎉 Visual QA PASSED! Implementation matches design."
   - If differences: "⚠️ Found [N] differences. Review .claude/milhouse-feedback.md"

## Categories for differences:

- **spacing** - margins, paddings, gaps
- **color** - background, text, border colors
- **typography** - font-size, font-weight, font-family, line-height, letter-spacing
- **size** - width, height, dimensions
- **alignment** - text-align, justify-content, align-items
- **border** - border-width, border-radius, border-style
- **shadow** - box-shadow, text-shadow
- **other** - any other visual difference

## Severity levels:

- **critical** - Obvious, user-facing differences that break design
- **major** - Noticeable differences that affect UX
- **minor** - Small differences that are barely noticeable
