---
name: compare
description: Compare two screenshots (without Figma designs)
arguments:
  - name: current
    description: Path to current screenshot or URL to capture
    required: true
  - name: reference
    description: Path to reference screenshot (previous version, mockup, etc.)
    required: true
  - name: viewport
    description: Viewport size if capturing from URL (default: 1920x1080)
    required: false
  - name: selector
    description: CSS selector to capture specific element (default: full page)
    required: false
---

# Milhouse Screenshot Comparison

Compares two screenshots directly, without needing Figma designs, using Claude Vision (built into Claude Code).

**Use cases:**
- Regression testing (compare with previous version)
- Branch comparison (compare different branches)
- Environment comparison (staging vs production)
- Mockup validation (compare with static design files)

## Process

1. If `current` is a URL, capture screenshot with Puppeteer
2. If `current` is a path, use the image directly
3. Load reference screenshot from `reference` path
4. **Claude Code analyzes both images directly**
5. Generate detailed differences report

## Execution

```bash
FINAL_VIEWPORT="${viewport:-1920x1080}"
FINAL_SELECTOR="${selector:-}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Determine if current is URL or file
if [[ "$current" =~ ^https?:// ]]; then
  # It's a URL, capture screenshot
  echo "📸 Capturing screenshot from $current..."
  if [ -n "$FINAL_SELECTOR" ]; then
    node "$SCRIPT_DIR/scripts/screenshot.js" \
      --url "$current" \
      --output ".claude/milhouse-screenshot.png" \
      --viewport "$FINAL_VIEWPORT" \
      --selector "$FINAL_SELECTOR"
  else
    node "$SCRIPT_DIR/scripts/screenshot.js" \
      --url "$current" \
      --output ".claude/milhouse-screenshot.png" \
      --viewport "$FINAL_VIEWPORT"
  fi

  if [ $? -ne 0 ]; then
    echo "❌ Screenshot capture failed"
    exit 1
  fi

  CURRENT_IMAGE=".claude/milhouse-screenshot.png"
  echo "✓ Screenshot captured: $CURRENT_IMAGE"
else
  # It's a file path
  CURRENT_IMAGE="$current"
  echo "📄 Using existing screenshot: $CURRENT_IMAGE"

  if [ ! -f "$CURRENT_IMAGE" ]; then
    echo "❌ Current screenshot not found: $CURRENT_IMAGE"
    exit 1
  fi
fi

# Verify reference exists
if [ ! -f "$reference" ]; then
  echo "❌ Reference screenshot not found: $reference"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 MILHOUSE SCREENSHOT COMPARISON"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Current: $CURRENT_IMAGE"
echo "Reference: $reference"
echo ""
echo "I will now analyze both screenshots and generate a detailed comparison report."
echo ""
```

## Instructions for Claude

After the screenshots are ready, you should:

1. **Read both images:**
   - Current implementation: Path from `$CURRENT_IMAGE`
   - Reference: Path from `$reference`

2. **Analyze for differences:**
   - Compare every visual aspect between the two screenshots
   - Identify ALL visual changes (spacing, colors, typography, sizes, alignment, borders, shadows)
   - Be VERY SPECIFIC with values (exact px, hex colors)
   - Ignore expected differences in dynamic content (dates, user names, etc.)
   - Focus on structural and styling differences

3. **Generate structured report** and save to `.claude/milhouse-feedback.md`:

```markdown
# Milhouse Screenshot Comparison Report

**Generated:** [timestamp]
**Status:** APPROVED | DIFFERENCES_FOUND
**Summary:** [one-line summary]
**Comparison Type:** Screenshot vs Screenshot

---

[If APPROVED:]
## ✅ APPROVED

The screenshots are visually identical (or differences are insignificant).

### Verified elements:
- ✓ [element 1]
- ✓ [element 2]
...

[If DIFFERENCES_FOUND:]
## ❌ DIFFERENCES FOUND

Found [N] visual difference(s) between screenshots.

### 🔴 Critical (N)

**1. [Element Name]** (category)
- **Issue:** [clear description of the change]
- **Current:** `[value in current screenshot]`
- **Reference:** `[value in reference screenshot]`
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
[If differences are unintended regressions:]
Visual regression detected. Fix the following differences to match the reference:

- [Element]: [Description]. Change [property] from "[current]" to "[reference]"
- [Element]: [Description]. Change [property] from "[current]" to "[reference]"
...

After corrections, output <promise>REGRESSION_FIXED</promise>

[If differences are intentional changes:]
The following visual changes were detected (review if intentional):

- [Element]: [Description]
- [Element]: [Description]
...
```

### ✅ Unchanged elements:
- [element 1]
- [element 2]
...
```

4. **Also save JSON data** to `.claude/milhouse-feedback.json`:

```json
{
  "status": "APPROVED" | "DIFFERENCES_FOUND",
  "comparisonType": "screenshot",
  "summary": "...",
  "differences": [
    {
      "element": "...",
      "category": "spacing|color|typography|size|alignment|border|shadow|other",
      "description": "...",
      "current": "...",
      "reference": "...",
      "severity": "critical|major|minor",
      "cssProperty": "...",
      "suggestedFix": "..."
    }
  ],
  "approvedElements": [...]
}
```

5. **Display summary:**
   - If APPROVED: "🎉 Screenshots match! No visual differences detected."
   - If differences: "⚠️ Found [N] visual differences. Review .claude/milhouse-feedback.md"

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

- **critical** - Major changes that significantly alter the UI
- **major** - Noticeable changes that affect visual consistency
- **minor** - Small changes that are barely noticeable

## Usage Examples

### Regression Testing
```bash
/milhouse:compare --current http://localhost:8000 --reference .claude/screenshots/golden/v1.0.png
```

### Branch Comparison
```bash
/milhouse:compare --current .claude/screenshots/feature.png --reference .claude/screenshots/main.png
```

### Environment Comparison
```bash
/milhouse:compare --current https://staging.app.com --reference .claude/screenshots/production.png
```

### Component-Specific Comparison
```bash
/milhouse:compare --current http://localhost:8000 --reference .claude/screenshots/hero-approved.png --selector ".hero-section"
```
