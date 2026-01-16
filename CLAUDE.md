# Milhouse Plugin - Instructions for Claude

**"Milhouse validates. Ralph iterates."**

Milhouse is a Visual QA plugin that compares implementation screenshots against Figma designs or previous versions using Claude Vision API.

## Purpose

Milhouse closes the visual feedback loop in the **Lisa-Ralph-Milhouse trilogy**:

```
┌─────────┐     ┌─────────┐     ┌──────────┐
│  LISA   │ ──► │  RALPH  │ ──► │ MILHOUSE │
│ (plan)  │     │ (build) │     │(validate)│
└─────────┘     └─────────┘     └──────────┘
                     ▲                │
                     │                │
                     └── feedback ────┘
```

## Available Commands

### `/milhouse:check`
Executes visual comparison between implementation and Figma reference.

**Common usage:**
```bash
/milhouse:check --url http://localhost:8000 --reference .claude/figma-refs/home.png
/milhouse:check  # Uses values from .claude/milhouse.config.json
```

**Arguments:**
- `--url` - URL to capture (default: from config)
- `--reference` - Path to reference image (default: from config)
- `--viewport` - Viewport size WxH (default: 1920x1080)
- `--selector` - CSS selector for specific element
- `--output` - Format: markdown, json, both (default: markdown)

### `/milhouse:compare`
Compares two screenshots directly, **no Figma required**.

**Common usage:**
```bash
# Regression testing
/milhouse:compare --current http://localhost:8000 --reference .claude/screenshots/golden/v1.0.png

# Branch comparison
/milhouse:compare --current .claude/screenshots/feature.png --reference .claude/screenshots/main.png
```

**Arguments:**
- `--current` - URL to capture or path to current screenshot
- `--reference` - Path to reference screenshot
- `--viewport` - Viewport size WxH (default: 1920x1080)
- `--selector` - CSS selector for specific element
- `--output` - Format: markdown, json, both (default: markdown)

**Use cases:**
- Regression testing (detect unintended changes)
- Branch comparison (compare before merge)
- Environment comparison (staging vs production)
- Validate against static mockups without Figma

### `/milhouse:configure`
Configure project settings.

**Usage:**
```bash
/milhouse:configure  # Create default config
/milhouse:configure --url http://localhost:3000
/milhouse:configure --figma-file ABC123
```

### `/milhouse:export-figma`
Export frames from Figma as reference images.

**Usage:**
```bash
/milhouse:export-figma --list  # List frames
/milhouse:export-figma --frame "Home Desktop"
```

### `/milhouse:help`
Show help documentation.

## Generated Files

When you execute `/milhouse:check`, the plugin generates:

- `.claude/milhouse-feedback.md` - Differences report in Markdown
- `.claude/milhouse-feedback.json` - Structured JSON data
- `.claude/milhouse-screenshot.png` - Latest screenshot captured

## Integration with Ralph Loop

Milhouse is designed to integrate with Ralph Loop. Typical flow:

1. **Ralph implements:**
   ```bash
   /ralph-loop "Implement landing page per spec" --max-iterations 20
   ```

2. **Milhouse validates:**
   ```bash
   /milhouse:check
   ```

3. **If differences, Ralph corrects:**
   ```bash
   /ralph-loop "Read .claude/milhouse-feedback.md and fix all differences. Output <promise>VISUAL_FIXED</promise> when done." --max-iterations 10
   ```

4. **Repeat steps 2-3 until APPROVED**

## Feedback Structure

The generated report includes:

- **Status:** APPROVED or DIFFERENCES_FOUND
- **Summary:** One-line summary
- **Differences:** List organized by severity (critical, major, minor)
  - Each difference includes:
    - Affected element
    - Category (spacing, color, typography, size, alignment, border, shadow, other)
    - Specific description
    - Current vs. expected value
    - CSS property to modify
    - Suggested CSS fix
- **Summary for Ralph:** Pre-formatted block to copy directly to Ralph

## Configuration

The `.claude/milhouse.config.json` file stores default settings:

```json
{
  "url": "http://localhost:8000",
  "reference": ".claude/figma-refs/design.png",
  "referenceDir": ".claude/figma-refs",
  "viewports": {
    "desktop": "1920x1080",
    "tablet": "768x1024",
    "mobile": "375x667"
  },
  "tolerance": "normal",
  "waitTime": 2000,
  "waitForSelector": null,
  "figma": {
    "fileId": null,
    "token": null
  }
}
```

## Environment Variables

**Required:**
```bash
export ANTHROPIC_API_KEY=sk-ant-...  # For Claude Vision API
```

**Optional:**
```bash
export FIGMA_ACCESS_TOKEN=figd_...  # For automatic Figma export
```

## Important Notes

1. **Non-invasive:** Milhouse only generates reports, never modifies code
2. **Actionable:** Feedback is specific with exact values (px, hex, CSS)
3. **Passive:** No active hooks, executes only when you call it
4. **Flexible:** Supports both Figma API and manual exports

## Complete Usage Example

```bash
# 1. Initial setup
/milhouse:configure --url http://localhost:8000

# 2. Export Figma design (or do manually)
/milhouse:export-figma --frame "Home Desktop"

# 3. Implement with Ralph
/ralph-loop "Implement landing per spec.md" --max-iterations 20

# 4. Validate with Milhouse
/milhouse:check

# 5. If diffs, fix with Ralph
/ralph-loop "Fix per milhouse feedback" --max-iterations 10

# 6. Validate again
/milhouse:check  # → APPROVED ✅
```

## Manual Alternative for Figma

If you don't have Figma API access:

1. Open your file in Figma
2. Select the frame
3. Right-click → Export → PNG @2x
4. Save to `.claude/figma-refs/descriptive-name.png`
5. Use that path in `/milhouse:check --reference .claude/figma-refs/descriptive-name.png`

## Troubleshooting

**Error: "ANTHROPIC_API_KEY not set"**
- Make sure to export the variable: `export ANTHROPIC_API_KEY=sk-ant-...`

**Error: "Screenshot not found"**
- Verify the URL is accessible: `curl http://localhost:8000`
- Verify the server is running

**Error: "Reference image not found"**
- Verify it exists: `ls -la .claude/figma-refs/`
- Verify the path in config

**Error: "Selector not found"**
- Verify the CSS selector exists on the page
- Try without selector to capture full page

## Workflow Patterns

### Pattern 1: Full Trilogy (Lisa → Ralph → Milhouse)

```bash
# 1. Lisa plans
/lisa "Create landing page with hero, features, footer"

# 2. Ralph implements
/ralph-loop "Implement per detailed-spec.md" --max-iterations 20

# 3. Milhouse validates
/milhouse:check --reference .claude/figma-refs/landing.png

# 4. Ralph fixes (if needed)
/ralph-loop "Fix per milhouse-feedback.md" --max-iterations 10

# 5. Iterate until approved
```

### Pattern 2: Regression Testing (No Figma)

```bash
# Capture golden
/milhouse:check --url http://localhost:8000
cp .claude/milhouse-screenshot.png .claude/screenshots/golden/v1.0.png

# After changes, compare
/milhouse:compare \
  --current http://localhost:8000 \
  --reference .claude/screenshots/golden/v1.0.png

# Fix if regressions detected
/ralph-loop "Fix regressions per milhouse-feedback.md" --max-iterations 5
```

---

**Part of the Lisa-Ralph-Milhouse trilogy**

- [Lisa](https://github.com/blencorp/lisa) - Planning
- [Ralph Loop](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/ralph-loop) - Implementation
- **Milhouse** - Visual Validation
